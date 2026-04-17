# 🚀 AI Sports Media Guardian

An AI-powered web application that analyzes uploaded media (images/videos) to detect objects, identify sports activity, and assess risk using real-time computer vision.

---

## 🔥 Features

* 🧠 **YOLOv8 Object Detection (Offline)**
* 🏏 **Automatic Sports Detection (Cricket, Football, etc.)**
* 📊 **Confidence Scoring & Analytics**
* 🔐 **Duplicate Detection using Hashing**
* 🖼️ **Automatic Watermarking**
* 📈 **Dashboard with Charts**
* ⚡ **Real-time Analysis**

---

## 🧠 Tech Stack

### Frontend

* React.js
* TensorFlow.js (MobileNet)
* Recharts
* Framer Motion

### Backend

* Node.js
* Express.js
* Multer (file upload)
* Sharp (image processing)

### AI / ML

* YOLOv8 (Ultralytics, Python)

---

## 📂 Project Structure

```
AI-Sports-Guardian/
│
├── frontend/        # React App
├── backend/
│   ├── uploads/    # Uploaded files
│   ├── detect.py   # YOLO detection script
│   └── server.js   # Backend server
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 🔹 1. Clone the repository

```
git clone https://github.com/your-username/AI-Sports-Guardian.git
cd AI-Sports-Guardian
```

---

### 🔹 2. Backend Setup

```
cd backend
npm install
pip install ultralytics
```

Run backend:

```
node server.js
```

---

### 🔹 3. Frontend Setup

```
cd frontend
npm install
npm start
```

---

## 🚀 How It Works

1. User uploads an image/video
2. Backend processes file and adds watermark
3. Image is converted to `.jpg` format
4. YOLOv8 detects objects (person, ball, bat, etc.)
5. System identifies sport based on detected objects
6. Risk score is calculated
7. Results displayed with charts and insights

---

## 📊 Example Output

```
Detected Sport: 🏏 Cricket / Baseball

Objects:
person (85.9%)
baseball bat (26.5%)

Average Confidence: 35.2%
```

---

## ⚠️ Limitations

* Requires Python for YOLO execution
* Works best with clear images
* Video support is basic

---

## 🔮 Future Improvements

* 🎯 Bounding box visualization
* 🎥 Advanced video analysis
* ☁️ Cloud deployment support
* 📄 Export reports (PDF)

---

## 👨‍💻 Author

**Saurabh Giri**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
