import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';

type Mode = 'webcam' | 'file' | 'loopback';

function assertStream(s: MediaStream | null): asserts s is MediaStream {
  if (!s) throw new Error('MediaStream is null (source not ready).');
}
function assertPC(pc: RTCPeerConnection | null): asserts pc is RTCPeerConnection {
  if (!pc) throw new Error('PeerConnection is null (pc not ready).');
}

export default function LiveFeed(): React.ReactElement {
  const [mode, setMode] = React.useState<Mode>('webcam');
  const [status, setStatus] = React.useState('idle');

  // 可见视频（渲染本地/远端）
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  // 隐藏视频（file/loopback captureStream 源）
  const hiddenFileVideoRef = React.useRef<HTMLVideoElement | null>(null);

  // WebRTC 资源
  const pc1Ref = React.useRef<RTCPeerConnection | null>(null);
  const pc2Ref = React.useRef<RTCPeerConnection | null>(null);
  const sourceStreamRef = React.useRef<MediaStream | null>(null);

  const onModeChange = (e: SelectChangeEvent) => setMode(e.target.value as Mode);

  /** 统一清理资源 */
  const stop = React.useCallback(async () => {
    try {
      pc1Ref.current?.getSenders().forEach((s) => s.track?.stop());
      pc2Ref.current?.getSenders().forEach((s) => s.track?.stop());
      pc1Ref.current?.close();
      pc2Ref.current?.close();
      pc1Ref.current = null;
      pc2Ref.current = null;

      sourceStreamRef.current?.getTracks().forEach((t) => t.stop());
      sourceStreamRef.current = null;

      if (videoRef.current) {
        videoRef.current.pause();
        (videoRef.current as any).srcObject = null;
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
      if (hiddenFileVideoRef.current) {
        hiddenFileVideoRef.current.pause();
        hiddenFileVideoRef.current.removeAttribute('src');
        hiddenFileVideoRef.current.load();
      }
    } finally {
      setStatus('idle');
    }
  }, []);

  /** 启动当前模式 */
  const start = React.useCallback(async () => {
    setStatus('starting...');
    await stop();

    try {
      if (mode === 'webcam') {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        sourceStreamRef.current = media;

        if (videoRef.current) {
          (videoRef.current as any).srcObject = media;
          try {
            await videoRef.current.play();
          } catch (err) {
            console.debug('preview play prevented', err);
          }
        }
        setStatus('playing (webcam)');
        return;
      }

      if (mode === 'file') {
        const hv = hiddenFileVideoRef.current!;
        hv.src = '/sample.mp4'; // 请在 public/ 放置一个小 mp4
        hv.muted = true;
        hv.loop = true;
        try {
          await hv.play();
        } catch (err) {
          console.debug('hidden video play prevented', err);
        }

        const captured: MediaStream | undefined =
          (hv as any).captureStream?.() ?? (hv as any).mozCaptureStream?.();
        if (!captured) throw new Error('captureStream() not supported');
        sourceStreamRef.current = captured;

        if (videoRef.current) {
          (videoRef.current as any).srcObject = captured;
          try {
            await videoRef.current.play();
          } catch (err) {
            console.debug('preview play prevented', err);
          }
        }
        setStatus('playing (file via captureStream)');
        return;
      }

      if (mode === 'loopback') {
        // 以文件作为源（也可改成 getUserMedia）
        const hv = hiddenFileVideoRef.current!;
        hv.src = '/sample.mp4';
        hv.muted = true;
        hv.loop = true;
        try {
          await hv.play();
        } catch (err) {
          console.debug('hidden video play prevented', err);
        }
        const source: MediaStream | undefined =
          (hv as any).captureStream?.() ?? (hv as any).mozCaptureStream?.();
        if (!source) throw new Error('captureStream() not supported');
        sourceStreamRef.current = source;

        // 建立两个 PeerConnection（同页互连）
        pc1Ref.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        pc2Ref.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        pc1Ref.current.onicecandidate = (e) => {
          if (e.candidate) pc2Ref.current?.addIceCandidate(e.candidate);
        };
        pc2Ref.current.onicecandidate = (e) => {
          if (e.candidate) pc1Ref.current?.addIceCandidate(e.candidate);
        };

        pc2Ref.current.ontrack = (e) => {
          if (videoRef.current) {
            (videoRef.current as any).srcObject = e.streams[0];
            videoRef.current.play().catch((err) => {
              console.debug('remote play prevented', err);
            });
          }
        };

        const stream = sourceStreamRef.current;
        const pc1 = pc1Ref.current;
        const pc2 = pc2Ref.current;
        assertStream(stream);
        assertPC(pc1);
        assertPC(pc2);

        stream.getTracks().forEach((t) => pc1.addTrack(t, stream));

        const offer = await pc1.createOffer();
        await pc1.setLocalDescription(offer);
        await pc2.setRemoteDescription(offer);

        const answer = await pc2.createAnswer();
        await pc2.setLocalDescription(answer);
        await pc1.setRemoteDescription(answer);

        setStatus('playing (webrtc loopback)');
        return;
      }
    } catch (err: any) {
      console.error(err);
      setStatus(`error: ${err?.message ?? String(err)}`);
    }
  }, [mode, stop]);

  React.useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return (
    // 让 Card 贴合父容器（Outlet）：flex:1 + minHeight:0
    <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <CardHeader
        title="Live Feed (Simulated)"
        subheader={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Mode:
            </Typography>
            <Chip size="small" label={mode} color="primary" variant="outlined" />
            <Typography variant="body2" color="text.secondary">
              Status:
            </Typography>
            <Chip size="small" label={status} />
          </Stack>
        }
      />

      <Divider />

      {/* 控件区 */}
      <CardActions sx={{ px: 2, pt: 1, gap: 1, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="mode-label">Mode</InputLabel>
          <Select labelId="mode-label" value={mode} label="Mode" onChange={onModeChange}>
            <MenuItem value="webcam">Webcam (getUserMedia)</MenuItem>
            <MenuItem value="file">Sample File (captureStream)</MenuItem>
            <MenuItem value="loopback">WebRTC Loopback</MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
          <Button variant="contained" onClick={start}>
            Start
          </Button>
          <Button variant="outlined" onClick={stop}>
            Stop
          </Button>
        </Stack>
      </CardActions>

      {/* 视频内容：让 CardContent 填满剩余空间 */}
      <CardContent sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Box
          sx={{
            flex: 1,
            bgcolor: 'black',
            borderRadius: 1,
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        {/* 隐藏视频元素：file/loopback 模式的源 */}
        <video ref={hiddenFileVideoRef} style={{ display: 'none' }} playsInline />
      </CardContent>
    </Card>
  );
}
