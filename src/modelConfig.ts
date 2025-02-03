let detectionInterval: number | null = null

export const initiateModel = async (): Promise<cocoSsd.ObjectDetection> => {
  const model = await cocoSsd.load()
  return model 
}

export const detectObjects = async (model: cocoSsd.ObjectDetection, video: HTMLVideoElement, resultCont: HTMLDivElement, currentStream: MediaStream | null) => {
  const detect = async () => {
    const results = await model.detect(video)
    if(resultCont) resultCont.innerHTML = ""
    results.forEach((r) => {
      const resultEl = document.createElement("p")
      resultEl.textContent = `${r?.class} - ${(r?.score * 100).toFixed(2)}%`
      resultCont?.appendChild(resultEl)
    })
  }
  detectionInterval = setInterval(detect, 500)
  
  const startDetection = () => {
    if(!detectionInterval){
      detectionInterval = setInterval(detect, 500)
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
     }else{
       startDetection()
      }
    })
   return stopDetection
}