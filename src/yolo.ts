import * as ort from "onnxruntime-web"
import { COCO80_CLASSES } from "./yolo.labels"

export type YoloModelId = "yolov8n" | "yolov8s"

export type YoloDetection = {
  classId: number
  label: string
  score: number
  // pixel coords in video space
  x: number
  y: number
  w: number
  h: number
}

export type YoloSession = {
  session: ort.InferenceSession
  inputName: string
  size: number
}

const DEFAULT_MODEL_URLS: Record<YoloModelId, string> = {
  // HuggingFace "resolve" URLs generally allow CORS in browsers.
  yolov8n: "https://huggingface.co/cabelo/yolov8/resolve/main/yolov8n.onnx",
  yolov8s: "https://huggingface.co/cabelo/yolov8/resolve/main/yolov8s.onnx"
}

export async function loadYolo(model: YoloModelId, opts?: { modelUrl?: string; size?: number }) {
  const size = opts?.size ?? 640
  const modelUrl = opts?.modelUrl ?? DEFAULT_MODEL_URLS[model]

  // Best-effort: use WebGPU if available; fall back automatically.
  const session = await ort.InferenceSession.create(modelUrl, {
    executionProviders: ["webgpu", "wasm"],
    graphOptimizationLevel: "all"
  })

  const inputName = session.inputNames[0]
  return { session, inputName, size } satisfies YoloSession
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function iou(a: YoloDetection, b: YoloDetection) {
  const ax2 = a.x + a.w
  const ay2 = a.y + a.h
  const bx2 = b.x + b.w
  const by2 = b.y + b.h
  const ix1 = Math.max(a.x, b.x)
  const iy1 = Math.max(a.y, b.y)
  const ix2 = Math.min(ax2, bx2)
  const iy2 = Math.min(ay2, by2)
  const iw = Math.max(0, ix2 - ix1)
  const ih = Math.max(0, iy2 - iy1)
  const inter = iw * ih
  const union = a.w * a.h + b.w * b.h - inter
  return union <= 0 ? 0 : inter / union
}

function nms(dets: YoloDetection[], iouThresh: number) {
  const out: YoloDetection[] = []
  const sorted = [...dets].sort((a, b) => b.score - a.score)
  while (sorted.length) {
    const best = sorted.shift()!
    out.push(best)
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].classId !== best.classId) continue
      if (iou(sorted[i], best) > iouThresh) sorted.splice(i, 1)
    }
  }
  return out
}

export function createLetterboxCanvas(size: number) {
  const c = document.createElement("canvas")
  c.width = size
  c.height = size
  return c
}

export function preprocessToTensor(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  size: number
): { tensor: ort.Tensor; scale: number; padX: number; padY: number; srcW: number; srcH: number } {
  const srcW = video.videoWidth
  const srcH = video.videoHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("No 2D context")

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, size, size)

  const scale = Math.min(size / srcW, size / srcH)
  const newW = Math.round(srcW * scale)
  const newH = Math.round(srcH * scale)
  const padX = Math.floor((size - newW) / 2)
  const padY = Math.floor((size - newH) / 2)

  ctx.drawImage(video, 0, 0, srcW, srcH, padX, padY, newW, newH)

  const imageData = ctx.getImageData(0, 0, size, size).data
  const chw = new Float32Array(1 * 3 * size * size)
  const area = size * size
  for (let i = 0; i < area; i++) {
    const r = imageData[i * 4] / 255
    const g = imageData[i * 4 + 1] / 255
    const b = imageData[i * 4 + 2] / 255
    chw[i] = r
    chw[area + i] = g
    chw[area * 2 + i] = b
  }

  const tensor = new ort.Tensor("float32", chw, [1, 3, size, size])
  return { tensor, scale, padX, padY, srcW, srcH }
}

export function postprocessYolov8(
  output: ort.Tensor,
  meta: { size: number; scale: number; padX: number; padY: number; srcW: number; srcH: number },
  confThresh: number,
  iouThresh = 0.45,
  maxDet = 50
): YoloDetection[] {
  const data = output.data as Float32Array

  const dims = output.dims
  if (dims.length !== 3) return []

  let num
  let channels
  let getVal: (c: number, i: number) => number

  if (dims[1] === 84) {
    num = dims[2]
    channels = dims[1]
    const stride = num
    getVal = (c, i) => data[c * stride + i]
  } else if (dims[2] === 84) {
    num = dims[1]
    channels = dims[2]
    const stride = channels
    getVal = (c, i) => data[i * stride + c]
  } else {
    return []
  }

  const { scale, padX, padY, srcW, srcH } = meta

  const dets: YoloDetection[] = []

  for (let i = 0; i < num; i++) {
    const cx = getVal(0, i)
    const cy = getVal(1, i)
    const w = getVal(2, i)
    const h = getVal(3, i)

    let bestClass = -1
    let bestScore = 0
    for (let c = 4; c < channels; c++) {
      const s = getVal(c, i)
      if (s > bestScore) {
        bestScore = s
        bestClass = c - 4
      }
    }
    if (bestScore < confThresh || bestClass < 0 || bestClass >= COCO80_CLASSES.length) continue

    // boxes are in letterboxed input space (size x size) as center-x/y width/height
    const x1 = cx - w / 2
    const y1 = cy - h / 2
    const x2 = cx + w / 2
    const y2 = cy + h / 2

    // undo letterbox
    const vx1 = (x1 - padX) / scale
    const vy1 = (y1 - padY) / scale
    const vx2 = (x2 - padX) / scale
    const vy2 = (y2 - padY) / scale

    const px1 = clamp(vx1, 0, srcW)
    const py1 = clamp(vy1, 0, srcH)
    const px2 = clamp(vx2, 0, srcW)
    const py2 = clamp(vy2, 0, srcH)

    const bw = Math.max(0, px2 - px1)
    const bh = Math.max(0, py2 - py1)
    if (bw < 2 || bh < 2) continue

    dets.push({
      classId: bestClass,
      label: COCO80_CLASSES[bestClass],
      score: bestScore,
      x: px1,
      y: py1,
      w: bw,
      h: bh
    })
  }

  const suppressed = nms(dets, iouThresh).slice(0, maxDet)
  return suppressed
}

