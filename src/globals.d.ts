declare namespace cocoSsd {
  function load(): Promise<cocoSsd.ObjectDetection>;
  
  interface ObjectDetection {
    detect: (video: HTMLVideoElement) => Promise<any[]>;
  }
}
