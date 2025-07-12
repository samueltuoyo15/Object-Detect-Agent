import { initiateModel, detectObjects } from "./model.config"

const resultCont = document.getElementById("result-container") as HTMLDivElement
const video = document.getElementById("video-element") as HTMLVideoElement
const canvasEl = document.getElementById("canva-overlay") as HTMLCanvasElement

let currentStream: MediaStream | null = null

const startCamera = async () => {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      window.location.reload()
    }, 4000)

    try {
      const userVideo = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      video.srcObject = userVideo
      currentStream = userVideo

      video.onloadedmetadata = () => {
        clearTimeout(timeout)
        canvasEl.width = video.videoWidth
        canvasEl.height = video.videoHeight
        resolve(null)
      }
    } catch (error) {
      clearTimeout(timeout)
      window.location.reload()
      reject(error)
    }
  })
}

const statusText = document.createElement("p")
statusText.textContent = "Initializing camera..."
resultCont.appendChild(statusText)

setTimeout(() => {
  statusText.textContent = "Camera failed. Reloading..."
}, 3000)

Promise.all([startCamera(), initiateModel()]).then(([_, model]) => {
  resultCont.innerHTML = ""
  detectObjects(model, video, resultCont, currentStream, canvasEl)
})
