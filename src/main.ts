import { createLetterboxCanvas, loadYolo, postprocessYolov8, preprocessToTensor, type YoloDetection, type YoloModelId, type YoloSession } from "./yolo"

const video = document.getElementById("video-element") as HTMLVideoElement
const canvasEl = document.getElementById("canva-overlay") as HTMLCanvasElement

const baseSelect = document.getElementById("model-base") as HTMLSelectElement
const minScoreRange = document.getElementById("min-score") as HTMLInputElement
const cameraSelect = document.getElementById("camera-select") as HTMLSelectElement
const btnStart = document.getElementById("btn-start") as HTMLButtonElement
const btnStop = document.getElementById("btn-stop") as HTMLButtonElement
const hudStatus = document.getElementById("hud-status") as HTMLElement
const hudFps = document.getElementById("hud-fps") as HTMLElement

let currentStream: MediaStream | null = null
let running = false
let busy = false
let yolo: YoloSession | null = null
let currentBase: YoloModelId = "yolov8s"
let currentMinScore = Number(minScoreRange.value)
const letterboxCanvas = createLetterboxCanvas(640)

const stopCamera = () => {
  if (currentStream) {
    currentStream.getTracks().forEach((t) => t.stop())
    currentStream = null
  }
  video.srcObject = null
}

const fitCanvasToVideo = () => {
  const dpr = window.devicePixelRatio || 1
  const w = Math.max(1, video.videoWidth)
  const h = Math.max(1, video.videoHeight)
  canvasEl.width = Math.round(w * dpr)
  canvasEl.height = Math.round(h * dpr)
  const ctx = canvasEl.getContext("2d")
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

const startCamera = async (deviceId?: string) => {
  try {
    hudStatus.textContent = "Requesting camera…"
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        facingMode: deviceId ? undefined : "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 60 }
      },
      audio: false
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    currentStream = stream
    video.srcObject = stream
    await video.play()

    await new Promise<void>((resolve) => {
      if (video.readyState >= 2 && video.videoWidth > 0) return resolve()
      video.onloadedmetadata = () => resolve()
    })
    fitCanvasToVideo()
  } catch (error) {
    console.error("Camera access failed", error);
    hudStatus.textContent = "Camera Error"
    throw error
  }
}

const listCameras = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  const cams = devices.filter((d) => d.kind === "videoinput")
  cameraSelect.innerHTML = ""
  if (cams.length === 0) {
    const opt = document.createElement("option")
    opt.value = ""
    opt.textContent = "No cameras found"
    cameraSelect.appendChild(opt)
    cameraSelect.disabled = true
    return
  }
  cameraSelect.disabled = false
  for (const cam of cams) {
    const opt = document.createElement("option")
    opt.value = cam.deviceId
    opt.textContent = cam.label || `Camera ${cameraSelect.length + 1}`
    cameraSelect.appendChild(opt)
  }
}

const stopAll = () => {
  running = false
  stopCamera()
  
  if (btnStart) {
    btnStart.classList.remove("active-scan")
    btnStart.disabled = false
  }
  if (btnStop) {
    btnStop.disabled = true
    btnStop.classList.remove("active-scan")
  }

  hudStatus.textContent = "Stopped"
  hudStatus.classList.remove("active")
  hudFps.textContent = "-- fps"
}

const startAll = async () => {
  stopAll()
  
  if (btnStart) {
    btnStart.classList.add("active-scan")
    btnStart.disabled = true
  }
  if (btnStop) {
    btnStop.disabled = false
  }

  currentBase = baseSelect.value as YoloModelId
  currentMinScore = Number(minScoreRange.value)

  await startCamera(cameraSelect.value || undefined)
  await listCameras()

  hudStatus.textContent = "Loading YOLO…"
  hudStatus.classList.add("active")
  yolo = await loadYolo(currentBase, { size: 640 })
  hudStatus.textContent = "Running…"
  running = true
  lastLoopTs = performance.now()
  fpsSmoothed = 0
  void loop()
}

btnStart?.addEventListener("click", () => void startAll())
btnStop?.addEventListener("click", () => stopAll())

minScoreRange?.addEventListener("input", () => {
  currentMinScore = Number(minScoreRange.value)
})

baseSelect?.addEventListener("change", () => {
  if (btnStop && !btnStop.disabled) void startAll()
})

cameraSelect?.addEventListener("change", () => {
  if (btnStop && !btnStop.disabled) void startAll()
})

window.addEventListener("resize", () => {
  if (currentStream) fitCanvasToVideo()
})

const drawBoxes = (dets: YoloDetection[]) => {
  const ctx = canvasEl.getContext("2d")
  if (!ctx) return
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

  const dpr = window.devicePixelRatio || 1
  
  const primaryNavy = "#222831"
  const bgWhite = "#FFFFFF"
  const accentOrange = "#EDA97A"

  for (const d of dets) {
    const bracketLen = 20 * dpr;
    const bracketThickness = 3 * dpr;
    
    ctx.strokeStyle = bgWhite;
    ctx.lineWidth = bracketThickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    ctx.beginPath();
    ctx.moveTo(d.x, d.y + bracketLen);
    ctx.lineTo(d.x, d.y);
    ctx.lineTo(d.x + bracketLen, d.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(d.x + d.w - bracketLen, d.y);
    ctx.lineTo(d.x + d.w, d.y);
    ctx.lineTo(d.x + d.w, d.y + bracketLen);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(d.x + d.w, d.y + d.h - bracketLen);
    ctx.lineTo(d.x + d.w, d.y + d.h);
    ctx.lineTo(d.x + d.w - bracketLen, d.y + d.h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(d.x + bracketLen, d.y + d.h);
    ctx.lineTo(d.x, d.y + d.h);
    ctx.lineTo(d.x, d.y + d.h - bracketLen);
    ctx.stroke();

    const labelText = d.label;
    const subText = `${(d.score * 100).toFixed(0)}% Match`;
    
    ctx.font = `600 ${14 * dpr}px Outfit, sans-serif`;
    const labelW = ctx.measureText(labelText).width;
    
    ctx.font = `500 ${10 * dpr}px Outfit, sans-serif`;
    const subW = ctx.measureText(subText).width;
    
    const cardW = Math.max(labelW, subW) + (40 * dpr);
    const cardH = 46 * dpr;
    
    const cx = d.x + (d.w / 2) - (cardW / 2);
    const cy = d.y - cardH - (10 * dpr);

    ctx.shadowColor = "rgba(45, 49, 66, 0.15)";
    ctx.shadowBlur = 12 * dpr;
    ctx.shadowOffsetY = 4 * dpr;
    
    ctx.fillStyle = bgWhite;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW, cardH, 12 * dpr);
    ctx.fill();
    
    ctx.shadowColor = "transparent";
    
    ctx.fillStyle = accentOrange;
    ctx.beginPath();
    ctx.arc(cx + (14 * dpr), cy + (cardH / 2), 4 * dpr, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = primaryNavy;
    ctx.font = `700 ${13 * dpr}px Outfit, sans-serif`;
    ctx.fillText(labelText, cx + (26 * dpr), cy + (20 * dpr));

    ctx.fillStyle = "#8E919D";
    ctx.font = `500 ${10 * dpr}px Outfit, sans-serif`;
    ctx.fillText(subText, cx + (26 * dpr), cy + (36 * dpr));
  }
}

let lastLoopTs = performance.now()
let fpsSmoothed = 0

const loop = async () => {
  if (!running) return
  const session = yolo
  if (!session || video.readyState < 2) {
    if (hudStatus) hudStatus.textContent = "Waiting for video…"
    setTimeout(() => void loop(), 200)
    return
  }
  if (busy) {
    setTimeout(() => void loop(), document.hidden ? 250 : 0)
    return
  }

  busy = true
  try {
    const now = performance.now()
    const dt = now - lastLoopTs
    lastLoopTs = now
    const fpsNow = dt > 0 ? 1000 / dt : 0
    fpsSmoothed = fpsSmoothed === 0 ? fpsNow : fpsSmoothed * 0.9 + fpsNow * 0.1
    if (hudFps) hudFps.textContent = `${fpsSmoothed.toFixed(0)} fps`

    const size = session.size
    const meta = preprocessToTensor(video, letterboxCanvas, size)
    const feeds: Record<string, unknown> = { [session.inputName]: meta.tensor }
    const out = await session.session.run(feeds as any)
    const outputName = session.session.outputNames[0]
    const tensor = out[outputName]
    const dets = postprocessYolov8(tensor, { ...meta, size }, currentMinScore)
    drawBoxes(dets)
    
    if (hudStatus) {
      hudStatus.textContent = dets.length ? `Found ${dets.length} items` : "Scanning..."
    }
  } catch (err) {
    console.error(err)
    if (hudStatus) hudStatus.textContent = "Detection error"
  } finally {
    busy = false
    const delay = document.hidden ? 250 : 0
    setTimeout(() => void loop(), delay)
  }
}

const boot = async () => {
  if (hudStatus) hudStatus.textContent = "Initializing…"
  try {
    await startCamera()
    await listCameras()
  } catch {
  } finally {
    stopCamera()
    if (hudStatus) hudStatus.textContent = "Ready"
  }
}

void boot()
