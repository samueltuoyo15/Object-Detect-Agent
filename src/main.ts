import { createLetterboxCanvas, loadYolo, postprocessYolov8, preprocessToTensor, type YoloDetection, type YoloModelId, type YoloSession } from "./yolo"

const resultCont = document.getElementById("result-container") as HTMLElement
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
    resultCont.innerHTML = ""
    const p = document.createElement("p")
    p.textContent = "Camera access failed. Please allow permission and refresh."
    resultCont.appendChild(p)
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
  btnStart.disabled = false
  btnStop.disabled = true
  hudStatus.textContent = "Stopped"
  hudFps.textContent = "-- fps"
}

const startAll = async () => {
  stopAll()
  btnStart.disabled = true
  btnStop.disabled = false

  currentBase = baseSelect.value as YoloModelId
  currentMinScore = Number(minScoreRange.value)

  await startCamera(cameraSelect.value || undefined)
  await listCameras()

  hudStatus.textContent = "Loading YOLO…"
  yolo = await loadYolo(currentBase, { size: 640 })
  hudStatus.textContent = "Running…"
  resultCont.innerHTML = ""
  running = true
  lastLoopTs = performance.now()
  fpsSmoothed = 0
  void loop()
}

btnStart.addEventListener("click", () => void startAll())
btnStop.addEventListener("click", () => stopAll())

minScoreRange.addEventListener("input", () => {
  currentMinScore = Number(minScoreRange.value)
})

baseSelect.addEventListener("change", () => {
  if (!btnStop.disabled) void startAll()
})

cameraSelect.addEventListener("change", () => {
  if (!btnStop.disabled) void startAll()
})

window.addEventListener("resize", () => {
  if (currentStream) fitCanvasToVideo()
})

document.addEventListener("visibilitychange", () => {
  // Keep running when tab is hidden. Browsers will throttle timers, but we don't tear down the stream/model.
})

const renderResults = (dets: YoloDetection[]) => {
  resultCont.innerHTML = ""
  if (dets.length === 0) {
    const p = document.createElement("p")
    p.className = "muted"
    p.textContent = "No objects (lower confidence / improve lighting)"
    resultCont.appendChild(p)
    return
  }

  for (const d of dets) {
    const p = document.createElement("p")
    p.textContent = `${d.label} • ${(d.score * 100).toFixed(1)}%`
    resultCont.appendChild(p)
  }
}

const drawBoxes = (dets: YoloDetection[]) => {
  const ctx = canvasEl.getContext("2d")
  if (!ctx) return
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

  const dpr = window.devicePixelRatio || 1
  const displayW = canvasEl.width / dpr
  ctx.lineWidth = Math.max(2, Math.round(displayW / 320))
  ctx.strokeStyle = "rgba(240, 201, 161, 0.95)"
  ctx.fillStyle = "rgba(16, 10, 6, 0.55)"
  ctx.font = `${Math.max(12, Math.round(displayW / 48))}px Inter, Arial, sans-serif`

  for (const d of dets) {
    ctx.beginPath()
    ctx.rect(d.x, d.y, d.w, d.h)
    ctx.stroke()

    const label = `${d.label} ${(d.score * 100).toFixed(0)}%`
    const pad = 6
    const textW = ctx.measureText(label).width
    const boxH = Math.max(18, Math.round(displayW / 42))
    const bx = Math.max(0, d.x)
    const by = Math.max(0, d.y - boxH)
    ctx.fillRect(bx, by, textW + pad * 2, boxH)
    ctx.fillStyle = "rgba(255, 244, 235, 0.95)"
    ctx.fillText(label, bx + pad, by + boxH - pad)
    ctx.fillStyle = "rgba(16, 10, 6, 0.55)"
  }
}

let lastLoopTs = performance.now()
let fpsSmoothed = 0

const loop = async () => {
  if (!running) return
  const session = yolo
  if (!session || video.readyState < 2) {
    hudStatus.textContent = "Waiting for video…"
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
    hudFps.textContent = `${fpsSmoothed.toFixed(0)} fps`

    const size = session.size
    const meta = preprocessToTensor(video, letterboxCanvas, size)
    const feeds: Record<string, unknown> = { [session.inputName]: meta.tensor }
    const out = await session.session.run(feeds as any)
    const outputName = session.session.outputNames[0]
    const tensor = out[outputName]
    const dets = postprocessYolov8(tensor, { ...meta, size }, currentMinScore)
    drawBoxes(dets)
    renderResults(dets)
    hudStatus.textContent = dets.length ? `Detected ${dets.length}` : "No objects"
  } catch {
    hudStatus.textContent = "Detection error"
  } finally {
    busy = false
    const delay = document.hidden ? 250 : 0
    setTimeout(() => void loop(), delay)
  }
}

const boot = async () => {
  hudStatus.textContent = "Initializing…"
  try {
    await startCamera()
    await listCameras()
  } catch {
    // If permission is denied, keep UI usable; user can retry via Start.
  } finally {
    stopCamera()
    hudStatus.textContent = "Ready. Click Start."
  }
}

void boot()
