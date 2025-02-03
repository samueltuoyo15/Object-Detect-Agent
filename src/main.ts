import {initiateModel, detectObjects} from "./modelConfig"

const resultCont = document.getElementById("result-container") as HTMLDivElement
const video = document.getElementById("video-element") as HTMLVideoElement
const canvasEl = document.getElementById("canva-overlay") as HTMLCanvasElement

let currentStream: MediaStream | null = null

const startCamera = async () => {
  try{
    const userVideo = await navigator.mediaDevices.getUserMedia({
      video: {facingMode: "environment"},
    })
    video.srcObject = userVideo 
    currentStream = userVideo
    
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        canvasEl.width = video.videoWidth
        canvasEl.height = video.videoHeight
        resolve(null)
      }
    })
    
  }catch(error){
    console.error("Error accessing user camera", error)
  }
}

const statusText = document.createElement("p")
statusText.textContent = "Waiting For Device Camera..."
resultCont.appendChild(statusText)

Promise.all([startCamera(), initiateModel()]).then(([_, model]) => {
  resultCont.innerHTML = ""
  detectObjects(model, video, resultCont, currentStream, canvasEl)
})