# Real-time Object Detection Agent 📸

Dive into the world of AI with the **Object Detection Agent**, a minimalist yet powerful web application designed to identify objects in real-time using your device's camera. Built with TypeScript and leveraging the robust capabilities of TensorFlow.js and the COCO-SSD model, this project offers a dynamic and interactive experience for recognizing common objects right in your browser.

## 🚀 Getting Started

Ready to see AI in action? Follow these steps to get the Object Detection Agent running locally on your machine.

### Prerequisites

Before you begin, make sure you have Node.js and npm (Node Package Manager) installed.

### Installation

Clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/samueltuoyo15/Object-Detect-Agent.git
cd Object-Detect-Agent
```

Once inside the project directory, install the dependencies:

```bash
npm install
```

### Running the Application

To start the development server and launch the application:

```bash
npm run dev
```

Your browser should automatically open the application, usually at `http://localhost:5173/`. If it doesn't, navigate there manually.

## 💡 Usage

Upon launching the application, you'll be prompted to grant camera access. Allow access to begin real-time object detection.

*   **Camera Feed**: You'll see a live video feed from your camera.
*   **Object Detection**: The AI model continuously analyzes the video stream for recognizable objects.
*   **Bounding Boxes**: Detected objects will be highlighted with green bounding boxes drawn directly on the video feed.
*   **Results Display**: A list of detected objects, along with their confidence scores (e.g., "person - 98.50%"), will be displayed next to the video.
*   **No Detection Message**: If no recognizable objects are found, a "No Recognizable Object Detected" message will appear.
*   **Background Handling**: The application intelligently pauses detection and the camera stream when the browser tab is not active, reloading upon focus to ensure optimal performance and resource management.

## ✨ Features

*   **Real-time Object Detection**: Instantly identifies objects from your live camera feed.
*   **Browser-based Interface**: Runs entirely in the browser, requiring no complex server-side setup.
*   **AI-Powered**: Utilizes the pre-trained COCO-SSD model via TensorFlow.js for accurate object recognition.
*   **Visual Feedback**: Draws bounding boxes around detected objects for clear visualization.
*   **Confidence Scores**: Displays the probability of detection for each identified object.
*   **Responsive Camera Management**: Automatically handles camera stream and detection based on tab visibility, optimizing performance.
*   **Modern Web Stack**: Built with TypeScript and Vite for a robust and efficient development experience.

## 🛠️ Technologies Used

| Technology         | Description                                                                                             |
| :----------------- | :------------------------------------------------------------------------------------------------------ |
| **TypeScript**     | A strongly typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality.      |
| **Vite**           | A next-generation frontend tooling that provides an extremely fast development experience.               |
| **TensorFlow.js**  | An open-source machine learning library for JavaScript, enabling on-device ML in the browser.           |
| **COCO-SSD Model** | A pre-trained object detection model (part of TensorFlow.js) capable of detecting 90 common objects. |

## 🤝 Contributing

Contributions are always welcome! If you have ideas for improvements or new features, feel free to contribute.

1.  **Fork** the repository.
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name`.
3.  **Make your changes** and ensure the code adheres to the project's style.
4.  **Commit your changes**: `git commit -m 'feat: Add new awesome feature'`.
5.  **Push** to your branch: `git push origin feature/your-feature-name`.
6.  **Open a Pull Request** to the `main` branch of this repository.

## 📄 License

This project is currently under development, and the license information will be provided shortly.

## 👤 Author

Developed with ❤️ by OritseWeyinmi Samuel Tuoyo.

*   **LinkedIn**: [samuel_tuoyo](https://www.linkedin.com/in/samuel-tuoyo-8568b62b6)
*   **X**: [@TuoyoS26091](https://x.com/TuoyoS26091)

---

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![License: MIT (Pending)](https://img.shields.io/badge/License-MIT%20(Pending)-yellow.svg)](https://opensource.org/licenses/MIT)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)
