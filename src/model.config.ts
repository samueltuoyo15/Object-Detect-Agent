import * as tf from "@tensorflow/tfjs"
import * as cocoSsd from "@tensorflow-models/coco-ssd"
let detectionInterval: number | null = null
let hasReloaded = false

export const initiateModel = async (): Promise<cocoSsd.ObjectDetection> => {
  await tf.ready()
  const model = await cocoSsd.load()
  return model 
}

export const detectObjects = async (model: cocoSsd.ObjectDetection, video: HTMLVideoElement, resultCont: HTMLDivElement, currentStream: MediaStream | null, canvasEl: HTMLCanvasElement) => {
  const detect = async () => {
    const results = await model.detect(video)
    
    const context = canvasEl.getContext("2d")
    if(context){
      context.clearRect(0, 0, canvasEl.width, canvasEl.height)
    }
    
    if(results.length === 0){
      const noResult = document.createElement("p")
      noResult.textContent = "No Recognizable Object Detected"
      resultCont.innerHTML = ""
      resultCont.appendChild(noResult)
    }else{
    resultCont.innerHTML = ""
    results.forEach((r) => {
      const resultEl = document.createElement("p")
      resultEl.textContent = `${r?.class} - ${(r?.score * 100).toFixed(2)}%`
      resultCont?.appendChild(resultEl)
      
      if(context){
        context.beginPath()
        context.rect(r.bbox[0], r.bbox[1], r.bbox[2], r.bbox[3])
        context.lineWidth = 4
        context.strokeStyle = "green"
        context.stroke()
      }
    })}
  }
  
  await detect()
  detectionInterval = setInterval(detect, 200) as unknown as number
  
  const startDetection = () => {
    if(!detectionInterval){
      detectionInterval = setInterval(detect, 200) as unknown as number
    }
  }
  
  const stopDetection = () => {
    if(detectionInterval){
      clearInterval(detectionInterval)
      detectionInterval = null
    }
  }
  
  const stopVideoStream = () => {
    if(currentStream){
      currentStream.getTracks().forEach(track => track.stop())
      currentStream = null
    }
  }
  
  document.addEventListener("visibilitychange", () => {
    if(document.hidden){
      stopDetection()
      stopVideoStream()
      hasReloaded = false
    }else{
      if(!hasReloaded){
        hasReloaded = true
        window.location.reload()
      }
    }
  })

  return stopDetection
}
