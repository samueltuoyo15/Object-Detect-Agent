import {initiateModel, detectObjects} from "./modelConfig"

const statusText = document.createElement("p")
statusText.textContent = "Loading Model..."

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
    
    return new Promise((resolve) => {
      video.onloadedmetadata = () => resolve(null)
    })
    
  }catch(error){
    console.error("Error accessing user camera", error)
  }
}

resultCont.appendChild(statusText);


Promise.all([startCamera(), initiateModel()]).then(([_, model]) => {
  resultCont.innerHTML = ""
  detectObjects(model, video, resultCont, currentStream)
})