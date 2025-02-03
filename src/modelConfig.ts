let detectionInterval: number | null = null

const statusText = document.createElement("p")
statusText.textContent = "Processing......"

export const initiateModel = async (): Promise<cocoSsd.ObjectDetection> => {
  const model = await cocoSsd.load()
  return model 
}

export const detectObjects = async (model: cocoSsd.ObjectDetection, video: HTMLVideoElement, resultCont: HTMLDivElement, currentStream: MediaStream | null) => {
  const detect = async () => {
    if(resultCont && !resultCont.contains(statusText)) {
      resultCont.innerHTML = ""
      resultCont.appendChild(statusText)
    }
   
    const results = await model.detect(video)
    resultCont.innerHTML = ""
    
    if(results.length === 0){
      const noResult = document.createElement("p")
      noResult.textContent = "No Recognizable Object Detected"
      resultCont.appendChild(noResult)
    }else{
    results.forEach((r) => {
      const resultEl = document.createElement("p")
      resultEl.textContent = `${r?.class} - ${(r?.score * 100).toFixed(2)}%`
      resultCont?.appendChild(resultEl)
    })}
  }
  
  await detect()
  detectionInterval = setInterval(detect, 200)
  
  const startDetection = () => {
    if(!detectionInterval){
      detectionInterval = setInterval(detect, 200)
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
       setTimeout(startDetection, 200)
      }
    })
   return stopDetection
}