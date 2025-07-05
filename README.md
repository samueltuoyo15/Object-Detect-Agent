# **Real-time Object Detection Agent 📸**

Dive into the world of AI with this powerful, browser-based object detection application. Utilizing cutting-edge machine learning capabilities, this project transforms your webcam feed into a dynamic visual scanner, identifying objects in real-time. It's a practical demonstration of integrating advanced AI models directly into a responsive web environment.

---

## 🚀 Installation

Getting this project up and running on your local machine is straightforward. Follow these steps to set up your development environment:

*   **Clone the Repository:**
    Start by cloning the project to your local machine using Git:

    ```bash
    git clone https://github.com/samueltuoyo15/Object-Detect-Agent.git
    cd Object-Detect-Agent
    ```

*   **Install Dependencies:**
    Navigate into the project directory and install all necessary packages using npm:

    ```bash
    npm install
    ```

*   **Run Development Server:**
    Once dependencies are installed, you can launch the development server to view the application in your browser. This command will typically open the app at `http://localhost:5173/` (or a similar port).

    ```bash
    npm run dev
    ```

*   **Build for Production:**
    To create an optimized production build of the application, run the following command. The compiled files will be located in the `dist` directory.

    ```bash
    npm run build
    ```

---

## 💡 Usage

Once the application is running, it will automatically attempt to access your device's camera.

1.  **Grant Camera Permission:** Upon loading, your browser will prompt you to grant camera access. Please allow this for the application to function correctly.
2.  **Live Detection:** The application will display your live camera feed. In real-time, it will draw bounding boxes around detected objects and label them with their predicted class and confidence score.
3.  **Result Display:** A panel next to the video feed will list all currently detected objects, along with their confidence percentages, providing a clear overview of what the model is identifying.
4.  **Visibility Management:** The application intelligently pauses object detection and camera stream when the browser tab is not active, conserving resources. Detection automatically resumes when the tab is brought back into focus.

---

## ✨ Features

*   **Real-time Object Detection:** Leverages the COCO-SSD model via TensorFlow.js to perform live object detection directly in the browser.
*   **Webcam Integration:** Seamlessly integrates with your device's webcam to capture live video streams for analysis.
*   **Dynamic Bounding Boxes:** Draws precise bounding boxes and labels around detected objects on a canvas overlay for clear visual feedback.
*   **Confidence Scoring:** Displays the confidence percentage for each detected object, providing insight into the model's certainty.
*   **Resource Management:** Automatically pauses the camera stream and detection process when the tab is hidden, optimizing performance and battery life.
*   **Type-Safe Development:** Built with TypeScript for enhanced code quality, maintainability, and early error detection.

---

## 🛠️ Technologies Used

| Technology         | Description                                                          | Link                                              |
| :----------------- | :------------------------------------------------------------------- | :------------------------------------------------ |
| **TypeScript**     | A superset of JavaScript that adds static types to the language.     | [Official Website](https://www.typescriptlang.org/) |
| **Vite**           | A fast build tool and development server for modern web projects.    | [Official Website](https://vitejs.dev/)           |
| **TensorFlow.js**  | An open-source machine learning library for JavaScript.              | [Official Website](https://www.tensorflow.org/js) |
| **COCO-SSD Model** | A pre-trained object detection model trained on the COCO dataset.    | [GitHub Repo](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) |

---

## 🤝 Contributing

Contributions are always welcome! If you have suggestions for improvements, new features, or bug fixes, please feel free to contribute to this project.

*   **Fork the repository.**
*   **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name`.
*   **Make your changes** and commit them with clear, concise messages.
*   **Push your branch** to your forked repository.
*   **Open a pull request** describing your changes in detail.

---

## 📄 License

This project is open-source.

---

## ✍️ Author

This project was developed by:

**Samuel Tuoyo**
*   **GitHub**: [https://github.com/samueltuoyo15](https://github.com/samueltuoyo15/Ai-Object-Detector)
*   **LinkedIn**: [Your LinkedIn Profile](https://www.linkedin.com/in/your-profile)
*   **Portfolio**: [Your Portfolio Website](https://your-portfolio.com)

---

## 🏆 Badges

[![Built with Vite](https://img.shields.io/badge/Built%20with-Vite-blueviolet?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TensorFlow.js](https://img.shields.io/badge/Powered%20by-TensorFlow.js-orange?style=flat&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![GitHub Repo Size](https://img.shields.io/github/repo-size/samueltuoyo15/Ai-Object-Detector?color=lightgreen)](https://github.com/samueltuoyo15/Ai-Object-Detector)

---

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)