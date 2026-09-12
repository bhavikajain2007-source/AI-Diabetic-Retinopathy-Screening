# Diabetic Retinopathy Detection + Grad-CAM Explainability

## What this does
Takes a fundus/retina scan image, runs a quality check, predicts DR severity
(5 classes), and generates a Grad-CAM heatmap highlighting the most affected
retinal region with a plain-language explanation.

## Usage

```python
from explain import DRExplainer
from PIL import Image

explainer = DRExplainer("densenet121_dr_best.pth")
image = Image.open("path/to/scan.png")
result = explainer.explain(image)
```

## Output format
- `success` (bool)
- `error` (str) — present only if success is False
- `prediction` (str) — "No DR" / "Mild" / "Moderate" / "Severe" / "Proliferative DR"
- `confidence` (float) — 0 to 1
- `probabilities` (dict) — per-class probabilities
- `affected_region` (dict) — `bbox`, `centroid`, `description`
- `explanation` (str) — human-readable explanation
- `heatmap_overlay_image` (PIL.Image) — heatmap over original scan

## Model weights
`densenet121_dr_best.pth` is included directly in this repo (~80MB).

## Files
- `model.py`, `inference.py`, `preprocessing.py`, `quality_check.py` — base ML pipeline
- `gradcam.py`, `heatmap_utils.py`, `explain.py` — explainability layer
- `requirements.txt` — dependencies
