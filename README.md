# AI-Powered Diabetic Retinopathy Screening

An AI-powered system for detecting and grading **Diabetic Retinopathy (DR)** from retinal fundus images using deep learning and Explainable AI, designed with an **offline-first architecture for rural screening**.

## 🚀 Overview

Diabetic Retinopathy is a diabetes-related eye disease that can lead to vision loss if not detected and treated early.

This project develops an AI-assisted screening system that analyzes retinal fundus images and classifies them into five stages of diabetic retinopathy:

| Class | Severity                           |
| ----- | ---------------------------------- |
| 0     | No Diabetic Retinopathy            |
| 1     | Mild Diabetic Retinopathy          |
| 2     | Moderate Diabetic Retinopathy      |
| 3     | Severe Diabetic Retinopathy        |
| 4     | Proliferative Diabetic Retinopathy |

The system combines **image quality assessment, deep-learning-based DR grading, Explainable AI and an integrated web application** into a complete screening workflow.

The current application supports local AI inference through a **FastAPI backend and React frontend**, with Grad-CAM providing visual explanations for model predictions.

The architecture is designed with an **offline-first approach**, allowing the core AI inference workflow to operate locally without requiring continuous internet connectivity.

---

## 🎯 Objectives

* Automatically classify diabetic retinopathy severity from fundus images.
* Assess retinal image quality before AI analysis.
* Support early screening and referral prioritization.
* Compare multiple deep-learning architectures for DR classification.
* Provide interpretable AI predictions using Grad-CAM.
* Generate prediction heatmaps highlighting regions contributing to model predictions.
* Provide model confidence and class probabilities.
* Enable local AI inference without continuous internet connectivity.
* Provide a web-based interface for uploading fundus images and viewing screening results.
* Maintain a modular architecture that can be extended for future telemedicine and clinical workflows.

---

## 🧠 System Pipeline

```text
Retinal Fundus Image
        ↓
Image Quality Assessment
        ↓
Image Preprocessing
        ↓
DenseNet121 Inference
        ↓
5-Class DR Prediction
        ↓
Grad-CAM Explainability
        ↓
Prediction + Confidence + Heatmap
        ↓
React Frontend
```

The current implementation consists of an integrated **React frontend and FastAPI backend**.

The backend handles image validation, quality assessment, preprocessing, model inference and communication with the Explainable AI module.

---

# 🔬 Machine Learning

The project evaluates deep-learning models for five-class diabetic retinopathy severity classification.

## Models Trained

Three transfer-learning-based architectures were trained and evaluated:

* **ResNet50** — trained by **Bhavika Jain**
* **DenseNet121** — trained by **Bhavika Jain**
* **EfficientNet** — trained by **Disha Pokhariyal**

The models were evaluated using the same APTOS-based train, validation and held-out test setup to allow comparison of their classification performance.

### Model Selection

After experimentation and evaluation, **DenseNet121 was selected as the model for the integrated application**.

The selected model is currently used for:

* Local inference
* Five-class DR classification
* Prediction confidence generation
* Grad-CAM explainability
* Frontend-integrated screening

The deployed model is:

```text
ml/models/densenet121_dr_best.pth
```

---

## 🧪 ML Pipeline

The machine-learning workflow includes:

1. Dataset loading
2. Dataset inspection
3. Image quality checks
4. Image preprocessing
5. Stratified train/validation/test splitting
6. Data augmentation
7. Transfer learning
8. Model fine-tuning
9. Class-imbalance handling
10. Model evaluation
11. Model comparison
12. Held-out test evaluation
13. Local inference
14. Explainability integration

---

# 📊 Evaluation Metrics

The models are evaluated using:

* Accuracy
* Precision
* Recall / Sensitivity
* Specificity
* Macro F1-score
* ROC-AUC
* Confusion Matrix

Particular emphasis is placed on sensitivity for detecting **any diabetic retinopathy** and evaluating **referable diabetic retinopathy (Levels 2–4)**.

---

# 📈 Current Model Results

## DenseNet121

The currently selected DenseNet121 model achieved the following performance on the held-out test set:

| Metric             | Result |
| ------------------ | -----: |
| Accuracy           | 82.18% |
| Macro Precision    | 68.18% |
| Macro Recall       | 65.75% |
| Macro F1           | 66.52% |
| Any-DR Sensitivity | 96.77% |
| No-DR Specificity  | 97.79% |

### Per-Class Recall

| Class | Severity      | Recall |
| ----- | ------------- | -----: |
| 0     | No DR         |    98% |
| 1     | Mild          |    52% |
| 2     | Moderate      |    82% |
| 3     | Severe        |    52% |
| 4     | Proliferative |    45% |

> Any-DR sensitivity refers to detection of classes 1–4. Referable DR performance (Levels 2–4) is evaluated separately.

These results are from the current selected DenseNet121 experiment and are intended to describe the research prototype rather than clinical performance.

---

# 👁️ Explainable AI

**Grad-CAM (Gradient-weighted Class Activation Mapping)** is integrated into the prediction workflow to visualize regions of the retinal image that contribute to the model's prediction.

The XAI module provides:

* Prediction heatmaps
* Visual evidence supporting model predictions
* Model confidence
* Heatmap generation
* Integration with the prediction workflow
* Frontend visualization of generated heatmaps

The XAI implementation is organized separately from the core ML code:

```text
xai/
├── gradcam.py
└── heatmap_utils.py
```

Generated heatmaps are handled by the backend and returned to the frontend as part of the prediction workflow.

> Grad-CAM is intended to improve model interpretability. A heatmap should not be interpreted as independent proof of a lesion or diagnosis.

---

# 🩺 Image Quality Assessment

The system performs basic technical image-quality checks before model inference.

The quality assessment checks factors including:

* Image readability
* Image dimensions
* Brightness
* Blur / focus
* RGB compatibility
* Image data validity

Images that fail the required quality checks can be rejected before AI inference.

The quality assessment module is located in:

```text
ml/quality_check.py
```

---

# 🖥️ Web Application

The project currently includes an integrated **frontend and backend application**.

## Frontend

The frontend is built using:

* React
* TypeScript
* Vite
* Tailwind CSS

The frontend provides the interface for interacting with the screening system and displaying AI-generated results.

## Backend

The backend is built using:

* FastAPI
* Python
* Pydantic
* Uvicorn

The backend handles:

* Image upload
* Image validation
* Image quality assessment
* ML preprocessing
* DenseNet121 inference
* DR classification
* Grad-CAM integration
* Prediction responses
* Heatmap generation and serving

---

## 🔗 Frontend–Backend Integration

The current application follows this workflow:

```text
User
 ↓
React Frontend
 ↓
Fundus Image Upload
 ↓
FastAPI Backend
 ↓
Image Validation
 ↓
Quality Assessment
 ↓
ML Preprocessing
 ↓
DenseNet121
 ↓
DR Prediction
 ↓
Grad-CAM
 ↓
Heatmap Generation
 ↓
Prediction Response
 ↓
React Results Interface
```

This provides an end-to-end local screening workflow from **image upload to AI prediction and visual explanation**.

---

# 📡 Offline-First Architecture

The system is designed around local inference to support screening environments with limited or unreliable internet connectivity.

## Offline Screening Workflow

```text
Fundus Image
      ↓
Local React Application
      ↓
FastAPI Backend
      ↓
Quality Assessment
      ↓
DenseNet121
      ↓
Grad-CAM
      ↓
Prediction Result
      ↓
Heatmap + Confidence
```

The trained model is stored locally and inference is performed through the backend.

Continuous internet connectivity is therefore not required for the core image-analysis workflow.

## Future Online Workflow

The architecture can be extended to support:

```text
Local Screening
      ↓
Local Records
      ↓
Cloud Synchronization
      ↓
Remote Specialist Review
```

Cloud synchronization and telemedicine functionality are planned extensions and are not part of the current core implementation.

---

# 📚 Dataset

Initial model development uses the **APTOS 2019 Blindness Detection** dataset.

The dataset contains retinal fundus images labeled according to five diabetic retinopathy severity levels.

## Dataset Distribution

| Class     | Severity         |    Images |
| --------- | ---------------- | --------: |
| 0         | No DR            |     1,805 |
| 1         | Mild             |       370 |
| 2         | Moderate         |       999 |
| 3         | Severe           |       193 |
| 4         | Proliferative DR |       295 |
| **Total** |                  | **3,662** |

The dataset was divided into stratified training, validation and held-out test sets.

> Dataset files are not included in this repository. Refer to `data/README.md` for dataset setup instructions.

### Additional Datasets

The following datasets may be used for future external validation and specialized retinal analysis:

* EyePACS
* IDRiD
* Messidor-2
* DRIVE

---

# 🛠️ Technology Stack

## Machine Learning

* Python
* PyTorch
* Torchvision
* DenseNet121
* ResNet50
* EfficientNet
* Scikit-learn

## Image Processing

* OpenCV
* PIL / Pillow
* NumPy
* Albumentations
* CLAHE
* Image normalization and enhancement

## Explainable AI

* Grad-CAM

## Backend

* FastAPI
* Uvicorn
* Pydantic

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

## Storage

* Local model storage
* Local generated heatmaps
* Temporary/local application files

## Development

* Google Colab
* Git
* GitHub

---

# 📁 Project Structure

```text
AI-Diabetic-Retinopathy-Screening/
│
├── README.md
├── .gitignore
│
├── ml/
│   ├── __init__.py
│   ├── inference.py
│   ├── model.py
│   ├── preprocessing.py
│   ├── quality_check.py
│   ├── requirements.txt
│   └── models/
│       └── densenet121_dr_best.pth
│
├── xai/
│   ├── gradcam.py
│   └── heatmap_utils.py
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .gitignore
│   ├── README.md
│   │
│   ├── routes/
│   │   └── prediction.py
│   │
│   ├── schemas/
│   │   └── prediction.py
│   │
│   ├── services/
│   │   └── ml_service.py
│   │
│   ├── utils/
│   │   └── image_validation.py
│   │
│   └── generated/
│       └── heatmaps/
│           └── .gitkeep
│
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .gitignore
│
├── notebooks/
│   └── DR_Model_Experiments.ipynb
│
└── data/
    └── README.md
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Diabetic-Retinopathy-Screening
```

## 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

---

## 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file using `.env.example` as the template:

```text
.env
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at the local development URL provided by Vite.

---

# 🧪 Model Development

Model experimentation was performed using GPU-accelerated environments.

The development process included:

1. Dataset loading
2. Dataset inspection
3. Image quality assessment
4. Image preprocessing
5. Stratified dataset splitting
6. Data augmentation
7. Transfer learning
8. Model training
9. Hyperparameter tuning
10. Validation
11. Held-out test evaluation
12. Model comparison
13. DenseNet121 selection
14. Local inference integration
15. Grad-CAM integration
16. Frontend-backend integration

Three model architectures were trained during development:

| Model        | Trained By       | Status                    |
| ------------ | ---------------- | ------------------------- |
| ResNet50     | Bhavika Jain     | Evaluated                 |
| DenseNet121  | Bhavika Jain     | **Selected / Integrated** |
| EfficientNet | Disha Pokhariyal | Evaluated                 |

---

# 🔮 Future Extensions

The current integrated prototype can be extended with:

* Advanced retinal image-quality assessment
* Retinal structure segmentation
* Lesion-level detection and localization
* External dataset validation
* More extensive model benchmarking
* Automated PDF screening reports
* Local persistent screening records
* Cloud synchronization
* Telemedicine integration
* Remote specialist review
* MATLAB/Simulink workflow simulation
* Scalable district-level screening workflows
* Additional model architectures and ensemble approaches

---

# ⚠️ Disclaimer

This project is an academic research prototype developed for educational and research purposes.

It is **not a certified medical device** and is not intended to replace professional ophthalmological diagnosis or clinical decision-making.

AI-generated results should be reviewed by a qualified healthcare professional.

---

# 👥 Team

Developed as part of the **Smart India Hackathon 2026** project.

### Contributors

* **Bhavika Jain** — Team Leader / Machine Learning
* **Disha Pokhariyal** — Data Engineering / Machine Learning
* **Harmehar Kaur Suri** — Explainable AI / Computer Vision
* **Anushree** — Backend Development
* **Afreen Amber** — Frontend Development

---

# 📌 Project Status

🚧 **In Development — End-to-End Prototype Implemented**

## Completed

* Repository setup
* APTOS dataset selection
* Dataset inspection
* Stratified dataset split
* Image preprocessing
* Image quality assessment
* ResNet50 training and evaluation
* DenseNet121 training and evaluation
* EfficientNet training and evaluation
* Model comparison
* DenseNet121 model selection
* Held-out test evaluation
* Local model inference
* Grad-CAM integration
* Heatmap generation
* FastAPI backend
* Prediction API
* React frontend
* Frontend–backend integration
* ML–backend integration
* XAI integration
* End-to-end local prediction workflow

## Planned

* Advanced image-quality assessment
* Referable DR-specific evaluation
* Retinal structure analysis
* Lesion-level detection and localization
* Automated PDF reports
* External dataset validation
* Cloud synchronization
* Telemedicine integration
* MATLAB/Simulink workflow simulation
* Field deployment and scalability testing

---

# 🔬 Research Prototype

This repository represents an evolving research and engineering prototype combining **deep learning, computer vision, Explainable AI and full-stack development** for accessible diabetic retinopathy screening.

The current implementation demonstrates the complete workflow:

**Fundus Image → Quality Assessment → DenseNet121 Prediction → Grad-CAM Explanation → Frontend Visualization**

The project is intended to serve as a foundation for further experimentation, validation and development toward accessible AI-assisted retinal screening.
