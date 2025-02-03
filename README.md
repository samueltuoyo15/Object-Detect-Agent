# 📌 Object Detection with COCO-SSD and TensorFlow.js

Real-time object detection web app using **TensorFlow.js** and the **COCO-SSD model**, supporting live video input from a user's device.

---

## 🚀 Features

✔️ Real-time object detection in video streams  
✔️ Uses **COCO-SSD**, a lightweight and fast pre-trained model  
✔️ Automatically stops detection when the tab is inactive  
✔️ Stops the camera when the user leaves the page  
✔️ Displays detection results dynamically  

---

## 📂 Project Structure

```
/project-root
│── /dist              # Compiled TypeScript files
│── /app
│   ├── app.ts         # Entry point, initializes video & model
│   ├── modelConfig.ts # Loads COCO-SSD & handles detection
│── /css
│   ├── style.css      # Styling for the app
│── index.html         # Main HTML file
│── tsconfig.json      # TypeScript configuration
│── package.json       # Dependencies (if using npm)
│── README.md          # Project documentation
```

---

## 📜 How It Works

1. **Initialize the Camera**  
   - Requests permission to access the user's camera  
   - Starts a video stream on the page  

2. **Load the COCO-SSD Model**  
   - Uses TensorFlow.js to load the pre-trained COCO-SSD model  

3. **Detect Objects in Real Time**  
   - Continuously analyzes video frames and logs detected objects  
   - Displays detected objects with **name** and **confidence score**  

4. **Optimize Performance**  
   - Stops detection when the tab is inactive  
   - Automatically turns off the camera when the user leaves  

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/samueltuoyo15/Ai-Object-Detection.git
cd object-detection
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Run the Project

compile and run code:

```sh
npm start
```

Then open `index.html` in your browser.

---

---

## 🎯 Key Technologies Used

| Tech               | Description                                      |
|--------------------|--------------------------------------------------|
| **TypeScript**     | Ensures type safety & better maintainability    |
| **TensorFlow.js**  | Runs machine learning models directly in the browser |
| **COCO-SSD**      | Lightweight object detection model optimized for real-time use |
| **HTML5 & CSS3**   | Simple, responsive UI                           |
| **MediaDevices API** | Accesses the user’s camera                    |

---

## 🛠 Possible Improvements

🔹 Add a UI overlay to highlight detected objects on video  
🔹 Support image uploads for static object detection  
🔹 Implement a **recording feature** to save detection results  

---

## 👨‍💻 Author

| Name          | Contact                                      |
|--------------|----------------------------------------------|
| **Your Name** | 📧 samueltuoyo9082@gmail.com |
| GitHub       | 🐙 [GitHub](https://github.com/samueluoyo15) |
| LinkedIn     | 🔗 [LinkedIn](https://www.linkedin.com/in/samuel-tuoyo-%F0%9F%93%A2-8568b62b6) |

---

### 📢 Like this project? Give it a ⭐ on GitHub!

```md
⭐ Star the repo to support development!
```
