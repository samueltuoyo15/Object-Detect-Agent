import {initiateModel, detectObjects} from "./modelConfig"
const resultCont = document.getElementById("result-container") as HTMLDivElement
const video = document.getElementById("video-element") as HTMLVideoElement
let currentStream: MediaStream | null = null

const startCamera = async () => {
  try{
    const userVideo = await navigator.mediaDevices.getUserMedia({
      video: {facingMode: "environment"},
    })
    video.srcObject = userVideo 
    currentStream = userVideo
  }catch(error){
    console.error("Error accessing user camera", error)
  }
}



startCamera().then(async () => {
  const model = await initiateModel()
  detectObjects(model, video, resultCont, currentStream)
})