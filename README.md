# 🦺 PPE-WATCHER

PPE-WATCHER is an AI-based Personal Protective Equipment (PPE) detection and monitoring system built with YOLOv8, Fastify, Prisma, React, and SQLite.  
It detects helmets, masks, vests, goggles, boots and gloves in real time using an edge device such as NVIDIA Jetson or Raspberry Pi, then uploads violation data to a Fastify backend for visualization on a React dashboard.
## Directory Structure

```
├── frontend/                          # Frontend project (React + TypeScript + MUI)
├── backend/                           # Backend service (Node.js + Fastify + Prisma)
├── documents/                         # Project documentation
│   ├── ai-edge/                       # Edge device scripts and AI models
│   ├── video_links.txt                # This file contains cloud links to demo and presentation
│   ├── PPE-WATCHER Frontend Functional Manual.docx
│   └── PPE-WATCHER_User_Deployment_Manual_v1.1.docx
```

For more detailed information, please refer to the deployment manual inside the **documents** folder.


---

Clone the repository:

```bash
git clone https://tamakojyan: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@github.com/tamakojyan/PPE-Watcher.git
cd PPE-WATCHER
```

This project contains three components:  
**frontend** (React dashboard), **backend** (Fastify API + SQLite), and **ai-edge** (YOLOv8 detection script for Jetson).

---

Install and run the frontend:

```bash
cd frontend
npm install
npm run start
```

The frontend runs on `http://localhost:3000`.  
If your backend uses a different IP or port, update the API base URL in:

```
frontend/src/api/client.ts
```

Example:

```js
const BASE_URL = "http://192.168.1.100:8080";
```

---

Install and run the backend:

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```
PORT=8080
JWT_SECRET=your-secure-random-string
DATABASE_URL="file:./dev.db"
```

Initialize and start the backend:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

The backend will start at `http://localhost:8080`.  
Once both servers are running, the frontend will connect automatically.

---

Deploy the edge device (Jetson Orin / Raspberry Pi):  
Follow the installation guide in `ai-edge/setup.txt` to prepare the environment.  
Install Python 3.10 (recommended virtual environment: `yoloenv`), Ultralytics YOLOv8, TensorRT, Jetson PyTorch wheels, and GStreamer.  
Activate the CSI camera:

```bash
sudo systemctl restart nvargus-daemon
```

Convert YOLOv8 `.pt` models to TensorRT `.engine` files and save them in your home directory:

```
~/yolov8m.engine   # Stage-A: Person detector
~/best.engine      # Stage-B: PPE detector
```

Ensure the Jetson and backend server are connected to the same Wi-Fi network (non-enterprise).  
Open `ai-edge/jetson_run.py` and set the backend upload URL:

```python
BACKEND_URL = "http://<backend-ip>:8080/violations"
```

Example:

```python
BACKEND_URL = "http://192.168.1.50:8080/violations"
```

Run the detector:

```bash
source ~/yoloenv/bin/activate
sudo systemctl restart nvargus-daemon
python ~/jetson_run.py
```

Once started, the Jetson captures camera frames, performs PPE detection with YOLOv8, and uploads JSON + image data to the backend.  
The backend stores violations in SQLite and notifies the frontend, which updates the dashboard in real time.

---

Check network connections:  

- Frontend → `http://localhost:3000`  
- Backend → `http://<your-ip>:8080`  
- Edge device → sends data to `http://<backend-ip>:8080/violations`

When everything is connected, you can see live detections and history updates instantly.

---

Backup and maintenance:

```bash
# Backup database
cp backend/prisma/dev.db backups/dev-$(date +%F).db

# Restore database
cp backups/dev-xxxx.db backend/prisma/dev.db
```

If the camera is busy:

```bash
sudo systemctl restart nvargus-daemon
```

If uploads fail, confirm that Jetson and backend are on the same Wi-Fi network.
💡 To modify runtime parameters, please refer to Section 4.3.6 of the Deployment Manual.

---

Security notes:  
All API routes require JWT authentication.  
Sensitive keys (database, SMTP, Twilio) are stored in `.env` and must never be committed.  
Use HTTPS for production and rotate credentials periodically.

---

License:  
This project is for academic and research use only.  
© 2025 Hui Sun — University of Canberra  
Contact: `u3276283@uni.canberra.edu.au`
