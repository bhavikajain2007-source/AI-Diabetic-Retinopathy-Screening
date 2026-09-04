# AI-Powered Diabetic Retinopathy Screening

An AI-powered system for detecting and grading **Diabetic Retinopathy (DR)** from retinal fundus images using deep learning and Explainable AI.

## 🚀 Overview

Diabetic Retinopathy is a diabetes-related eye disease that can lead to vision loss if not detected and treated early.

This project aims to develop an AI-assisted screening system that analyzes retinal fundus images and classifies them into five stages of diabetic retinopathy:

| Class | Severity                           |
| ----- | ---------------------------------- |
| 0     | No Diabetic Retinopathy            |
| 1     | Mild Diabetic Retinopathy          |
| 2     | Moderate Diabetic Retinopathy      |
| 3     | Severe Diabetic Retinopathy        |
| 4     | Proliferative Diabetic Retinopathy |

The system combines deep learning-based classification with Explainable AI to provide visual explanations for model predictions.

## 🎯 Objectives

* Automatically classify diabetic retinopathy severity from fundus images.
* Support early-stage screening and referral prioritization.
* Reduce the time required for preliminary screening.
* Provide interpretable AI predictions using Grad-CAM.
* Generate prediction confidence and screening results.
* Develop a modular system that can be integrated into a web-based screening application.

## 🧠 Proposed Pipeline

```text
Retinal Fundus Image
        ↓
Image Quality Check
        ↓
Preprocessing
        ↓
Deep Learning Model
(ResNet / EfficientNet / DenseNet)
        ↓
5-Class DR Classification
        ↓
Prediction + Confidence
        ↓
Grad-CAM Explanation
        ↓
Screening Result
```

## 🔬 Machine Learning

The system uses deep learning models for five-class diabetic retinopathy severity classification from retinal fundus images.

### Candidate Architectures

Multiple architectures are currently being experimented with and evaluated:

* ResNet
* EfficientNet
* DenseNet

The final architecture will be selected based on experimental performance, computational efficiency, and suitability for the screening task.

### Current ML Pipeline

* Retinal image preprocessing
* Image resizing and normalization
* Data augmentation
* Stratified train/validation/test split
* Transfer learning
* Class-imbalance handling
* Model fine-tuning
* Validation and test evaluation

### Evaluation Metrics

Models will be evaluated using:

* Accuracy
* Precision
* Recall / Sensitivity
* Specificity
* F1-score
* ROC-AUC
* Confusion Matrix

Particular attention will be given to recall/sensitivity for higher-severity diabetic retinopathy classes.

## 👁️ Explainable AI

Grad-CAM will be used to visualize regions of the retinal image that contribute to the model's prediction.

This helps make model predictions more interpretable by highlighting areas that influenced the classification.

## 📊 Dataset

The initial model development uses the **APTOS 2019 Blindness Detection** dataset.

The dataset contains retinal fundus images labeled according to five diabetic retinopathy severity levels.

Additional datasets may be explored for external validation and lesion-level analysis.

### Dataset Sources

* APTOS 2019 Blindness Detection
* EyePACS
* IDRiD
* Messidor-2

> Dataset files are not included in this repository. Refer to `data/README.md` for dataset setup instructions.

## 🛠️ Technology Stack

### Machine Learning

* Python
* PyTorch
* Torchvision
* ResNet
* EfficientNet
* DenseNet
* Scikit-learn

### Image Processing

* OpenCV
* PIL
* NumPy
* Albumentations

### Explainable AI

* Grad-CAM

### Backend

* FastAPI

### Frontend

* React
* TypeScript
* Tailwind CSS

### Development

* Google Colab
* Git
* GitHub

## 📁 Project Structure

```text
AI-Diabetic-Retinopathy-Screening/
│
├── README.md
├── .gitignore
├── requirements.txt
│
├── notebooks/
│   └── DR_Model_Experiments.ipynb
│
├── data/
│   └── README.md
│
├── model/
│   ├── model.py
│   ├── preprocessing.py
│   ├── train.py
│   ├── evaluate.py
│   └── predict.py
│
├── explainability/
│   └── gradcam.py
│
├── backend/
│   └── ...
│
├── frontend/
│   └── ...
│
├── results/
│   ├── confusion_matrix.png
│   ├── training_curves.png
│   └── sample_predictions/
│
└── docs/
    ├── research.md
    └── datasets.md
```

## ⚙️ Installation

Clone the repository:

```bash
git clone <repository-url>
cd AI-Diabetic-Retinopathy-Screening
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## 🧪 Model Development

Model experimentation is currently being performed in Google Colab using GPU acceleration.

The ML workflow includes:

1. Dataset loading
2. Dataset inspection
3. Image quality checks
4. Image preprocessing
5. Train/validation/test splitting
6. Model training
7. Hyperparameter tuning
8. Validation
9. Test evaluation
10. Model comparison
11. Explainability analysis

The candidate architectures will be compared using consistent datasets, preprocessing, and evaluation metrics before selecting the final model.

## 📈 Model Comparison

Results will be added after completing experiments.

| Model        | Accuracy | Precision | Recall | F1 | AUC |
| ------------ | -------: | --------: | -----: | -: | --: |
| ResNet       |        — |         — |      — |  — |   — |
| EfficientNet |        — |         — |      — |  — |   — |
| DenseNet     |        — |         — |      — |  — |   — |

> Performance metrics will only be reported after running the models on a held-out test set.

## 🔮 Future Scope

* Improved retinal image quality assessment
* Higher-resolution model training
* Lesion-level detection
* External dataset validation
* Advanced deep learning architectures
* Clinical referral prioritization
* Web-based screening dashboard
* Deployment and scalability improvements

## ⚠️ Disclaimer

This project is an academic/prototype system developed for research and educational purposes. It is not intended to replace professional ophthalmological diagnosis or clinical decision-making.

## 👥 Team

Developed as part of the **Smart India Hackathon 2026** project.

### Contributors

* Bhavika Jain — Team Leader / ML
* Disha Pokhariyal — Data Engineering
* Harmehar Kaur Suri — Explainable AI / Computer Vision
* Anushree — Backend Development
* Afreen Amber — Frontend Development
* Akshita Jain — Research & Documentation

## 📌 Project Status

🚧 **Currently in development**

### Current Progress

* [x] Repository setup
* [x] APTOS dataset selection
* [x] Initial preprocessing pipeline
* [ ] ResNet experimentation
* [ ] EfficientNet experimentation
* [ ] DenseNet experimentation
* [ ] Model comparison
* [ ] Final model selection
* [ ] Grad-CAM
* [ ] Backend integration
* [ ] Frontend integration
* [ ] End-to-end prototype
* [ ] Final evaluation
