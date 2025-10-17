#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# PPE windowed-vote, two-stage (person + PPE) pipeline for Jetson (JP6.x).
# -----------------------------------------------------------------------------

import os, sys, time, csv, signal
from collections import deque
from pathlib import Path
from typing import Dict, Tuple, List, Set

import numpy as np
import cv2

# === Upload dependencies ===
import json
import requests
import socket

# --- System-level global silence (cooldown) ---
GLOBAL_SILENCE_SEC = 10.0  # seconds of system-wide silence after any violation
_global_silence_until = 0.0
_global_silence_active = False

# GStreamer
import gi
gi.require_version('Gst', '1.0')
from gi.repository import Gst, GLib

from ultralytics import YOLO

# ----------------------- Config ------------------------
STAGE_A_PATH = str(Path.home() / "yolov8s.engine")   # person detector
STAGE_B_PATH = str(Path.home() / "best.engine")      # PPE detector

CAM_W, CAM_H, CAM_FPS = 1280, 720, 30
IMGSZ_A, IMGSZ_B = 640, 640
CONF_A, CONF_B = 0.35, 0.25

RUN_PPE_EVERY = 2
VOTE_WINDOW_SEC = 1.5
ENTER_RATIO = 0.70
EXIT_RATIO  = 0.40
EVENT_COOLDOWN_SEC = 3.0

REQUIRED_ITEMS = ["boots","gloves","goggles","helmet","mask","vest"]

OUT_DIR  = Path.home() / "ppe_events_window"
IMG_DIR  = OUT_DIR / "images"
CSV_PATH = OUT_DIR / "events.csv"

HEARTBEAT_SEC = 5.0

# ----------------------- Backend IP ------------------------
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    finally:
        s.close()
    return ip

LOCAL_IP = get_local_ip()
BACKEND_URL = f"http://172.20.10.2:8080/violations"
print("[INIT] Backend URL =", BACKEND_URL)

# ----------------------------------------------------------------------------
def iou_xyxy(a, b):
    x1 = max(a[0], b[0]); y1 = max(a[1], b[1])
    x2 = min(a[2], b[2]); y2 = min(a[3], b[3])
    inter = max(0, x2-x1) * max(0, y2-y1)
    area_a = max(0, a[2]-a[0]) * max(0, a[3]-a[1])
    area_b = max(0, b[2]-b[0]) * max(0, b[3]-b[1])
    union = area_a + area_b - inter + 1e-6
    return inter / union

def build_pipeline() -> str:
    has_nvvideoconvert = bool(Gst.ElementFactory.find("nvvideoconvert"))
    conv = "nvvideoconvert" if has_nvvideoconvert else "nvvidconv"
    pipe = (
        "nvarguscamerasrc ! "
        f"video/x-raw(memory:NVMM),width={CAM_W},height={CAM_H},framerate={CAM_FPS}/1,format=NV12 ! "
        f"{conv} ! "
        "video/x-raw,format=BGRx ! "
        "videoconvert ! "
        "video/x-raw,format=BGR ! "
        "appsink name=sink sync=false max-buffers=1 drop=true"
    )
    print(f"[GST] Using converter: {conv}")
    print(f"[GST] Pipeline = {pipe}")
    return pipe

def save_event(img_bgr: np.ndarray, missing: List[str], person_box: Tuple[int,int,int,int]) -> str:
    tstr = time.strftime("%Y%m%d_%H%M%S")
    miss_tag = "-".join(missing) if missing else "ok"
    fname = f"ev_{tstr}_{miss_tag}.jpg"
    fpath = IMG_DIR / fname
    x1,y1,x2,y2 = person_box
    cv2.rectangle(img_bgr, (x1,y1), (x2,y2), (0,0,255), 2)
    cv2.putText(img_bgr, f"MISS:{miss_tag}", (x1, max(0,y1-6)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,255), 2, cv2.LINE_AA)
    cv2.imwrite(str(fpath), img_bgr)
    print(f"[EVENT] saved -> {fpath}")
    return str(fpath)

def append_csv(ts: str, track_id: int, missing: List[str], box: Tuple[int,int,int,int], path: str):
    newfile = not CSV_PATH.exists()
    with open(CSV_PATH, "a", newline="") as f:
        w = csv.writer(f)
        if newfile:
            w.writerow(["timestamp","track_id","missing","person_box","image_path"])
        w.writerow([ts, track_id, "|".join(missing), ",".join(map(str, box)), path])

def names_to_required_ids(model) -> Dict[str,int]:
    ids = {}
    names = getattr(model, "names", None)
    if isinstance(names, dict):
        inv = {v:i for i,v in names.items()}
        for k in REQUIRED_ITEMS:
            if k in inv: ids[k] = inv[k]
    elif isinstance(names, list):
        for i,n in enumerate(names):
            if n in REQUIRED_ITEMS:
                ids[n] = i
    if len(ids) != len(REQUIRED_ITEMS):
        print("[WARN] Could not auto-map all PPE class names from engine; falling back to index order 0..5")
        ids = {k:i for i,k in enumerate(REQUIRED_ITEMS)}
    return ids

def crop_safe(img, box, pad=4):
    h,w = img.shape[:2]
    x1,y1,x2,y2 = map(int, box)
    x1 = max(0, x1-pad); y1 = max(0, y1-pad)
    x2 = min(w, x2+pad); y2 = min(h, y2+pad)
    return img[y1:y2, x1:x2].copy()

# ----------------------- upload violation ------------------------
def upload_violation(img_path: str, kinds: List[str]):
    try:
        # match Prisma ViolationType
        enum_map = {
            "helmet": "no_helmet",
            "mask": "no_mask",
            "vest": "no_vest",
            "gloves": "no_gloves",
            "boots": "no_boots",
            "goggles": "no_goggles",
        }
        mapped = [enum_map[k] for k in kinds if k in enum_map]

        with open(img_path, "rb") as f:
            files = {"file": f}
            data = {"kinds": json.dumps(mapped)}  # dump → dumps
            res = requests.post(BACKEND_URL, files=files, data=data, timeout=10)
        print(f"[UPLOAD] {img_path} -> {res.status_code}")
    except Exception as e:
        print(f"[ERR] upload failed: {e}")

# ----------------------- Main ------------------------
def main():
    global _global_silence_until, _global_silence_active
    print("[INIT] Ensuring output folders...")
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    print("[INIT] Loading models...")
    model_a = YOLO(STAGE_A_PATH)
    print("[LOAD]", STAGE_A_PATH)
    model_b = YOLO(STAGE_B_PATH)
    print("[LOAD]", STAGE_B_PATH)

    ppe_ids = names_to_required_ids(model_b)
    print("[INFO] PPE class map:", ppe_ids)

    Gst.init(None)
    gst = build_pipeline()
    pipeline = Gst.parse_launch(gst)
    sink = pipeline.get_by_name("sink")
    pipeline.set_state(Gst.State.PLAYING)
    print("[GST] Pipeline set to PLAYING. Warming up...")

    next_id = 1
    tracks: Dict[int, dict] = {}
    last_hb = time.time()
    frame_id = 0

    try:
        while True:
            sample = sink.emit("try-pull-sample", 1_000_000)
            if sample is None:
                if GLib.MainContext.default().iteration(False):
                    pass
                continue
            buf = sample.get_buffer()
            caps = sample.get_caps().get_structure(0)
            w = caps.get_value("width"); h = caps.get_value("height")
            ok, mapinfo = buf.map(Gst.MapFlags.READ)
            if not ok:
                continue
            arr = np.frombuffer(mapinfo.data, dtype=np.uint8).reshape(h, w, 3)
            frame_bgr = arr
            buf.unmap(mapinfo)

            now_ts = time.time()
            if now_ts < _global_silence_until:
                try:
                    cv2.putText(frame_bgr, f"SYSTEM SILENT ({int(_global_silence_until-now_ts)}s)",
                                (24, 48), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
                except Exception:
                    pass
                if GLib.MainContext.default().iteration(False):
                    pass
                continue
            else:
                if _global_silence_active:
                    _global_silence_active = False
                    tracks.clear()
                    print("[GLOBAL] Silence ended. Resuming detection (tracks reset).")
            frame_id += 1

            res_a = model_a.predict(source=frame_bgr, device=0, imgsz=IMGSZ_A, conf=CONF_A, verbose=False)[0]
            boxes = []
            if res_a.boxes is not None and len(res_a.boxes) > 0:
                for b, c in zip(res_a.boxes.xyxy.cpu().numpy(), res_a.boxes.cls.cpu().numpy()):
                    if int(c) == 0:
                        x1,y1,x2,y2 = [int(v) for v in b]
                        x1 = max(0, x1); y1 = max(0, y1); x2 = min(CAM_W-1, x2); y2 = min(CAM_H-1, y2)
                        if x2>x1 and y2>y1:
                            boxes.append([x1,y1,x2,y2])

            assigned = set()
            now = time.time()
            for tid in list(tracks.keys()):
                tracks[tid]["matched"] = False
            for b in boxes:
                best_iou, best_id = 0.0, None
                for tid, t in tracks.items():
                    iou = iou_xyxy(b, t["box"])
                    if iou > best_iou:
                        best_iou, best_id = iou, tid
                if best_iou >= 0.3:
                    tracks[best_id]["box"] = b
                    tracks[best_id]["last"] = now
                    tracks[best_id]["matched"] = True
                    assigned.add(best_id)
                else:
                    tid = next_id; next_id += 1
                    tracks[tid] = {"box": b, "last": now, "hist": deque(), "state": "OK", "last_event": 0.0, "matched": True}
                    assigned.add(tid)
            for tid in list(tracks.keys()):
                if now - tracks[tid]["last"] > 2.0:
                    del tracks[tid]

            do_ppe = (frame_id % RUN_PPE_EVERY == 0)
            total_persons = len(assigned)
            begin_t = time.perf_counter()
            miss_count = 0

            if do_ppe and total_persons > 0:
                for tid in assigned:
                    box = tracks[tid]["box"]
                    crop = crop_safe(frame_bgr, box)
                    if crop.size == 0:
                        continue
                    res_b = model_b.predict(source=crop, device=0, imgsz=IMGSZ_B, conf=CONF_B, verbose=False)[0]
                    present: Set[str] = set()
                    if res_b.boxes is not None and len(res_b.boxes) > 0:
                        cls = res_b.boxes.cls.cpu().numpy().astype(int).tolist()
                        for cid in cls:
                            for name, idx in ppe_ids.items():
                                if cid == idx:
                                    present.add(name)
                    missing = [k for k in REQUIRED_ITEMS if k not in present]
                    miss_flag = 1 if missing else 0
                    miss_count += miss_flag

                    hist: deque = tracks[tid]["hist"]
                    hist.append((now, miss_flag))
                    while hist and (now - hist[0][0]) > VOTE_WINDOW_SEC:
                        hist.popleft()
                    ratio = (sum(v for _,v in hist) / max(1,len(hist)))

                    state = tracks[tid]["state"]
                    if state == "OK" and ratio >= ENTER_RATIO and (now - tracks[tid]["last_event"]) >= EVENT_COOLDOWN_SEC:
                        img_path = save_event(frame_bgr.copy(), missing, tuple(box))
                        append_csv(time.strftime("%Y-%m-%dT%H:%M:%S"), tid, missing, tuple(box), img_path)

                        upload_violation(img_path, missing)

                        tracks[tid]["state"] = "VIOLATION"
                        tracks[tid]["last_event"] = now
                        prev_until = _global_silence_until
                        _global_silence_until = max(_global_silence_until, time.time()) + GLOBAL_SILENCE_SEC
                        if time.time() >= prev_until:
                            print(f"[GLOBAL] Entering silence for {GLOBAL_SILENCE_SEC:.0f}s (triggered by track {tid}).")
                        _global_silence_active = True
                    elif state == "VIOLATION" and ratio <= EXIT_RATIO:
                        tracks[tid]["state"] = "OK"

            end_t = time.perf_counter()
            if (time.time() - last_hb) >= HEARTBEAT_SEC:
                print(f"[INF] A:{(end_t-begin_t)*1000:.1f}ms persons={total_persons} missing_count={miss_count}")
                last_hb = time.time()

    except KeyboardInterrupt:
        print("\n[SHUTDOWN] signal received, stopping pipeline...")
    finally:
        pipeline.set_state(Gst.State.NULL)
        print("[GST] Pipeline set to NULL. Bye.")

if __name__ == "__main__":
    main()
