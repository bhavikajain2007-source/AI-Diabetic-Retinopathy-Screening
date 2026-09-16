from pathlib import Path
from uuid import uuid4

import cv2
import numpy as np
from PIL import Image

from ml.preprocessing import val_test_transform
from services.ml_service import get_predictor
from xai.gradcam import GradCAM


HEATMAP_DIR = (
    Path(__file__).resolve().parent.parent
    / "generated"
    / "heatmaps"
)

HEATMAP_DIR.mkdir(parents=True, exist_ok=True)


def generate_heatmap(image: Image.Image):
    predictor = get_predictor()

    model = predictor.model
    device = predictor.device

    image_rgb = image.convert("RGB")

    image_tensor = val_test_transform(image_rgb)
    image_tensor = image_tensor.unsqueeze(0).to(device)

    cam_generator = GradCAM(model)

    cam, target_class, probabilities = cam_generator.generate(
        image_tensor
    )

    original_np = np.array(image_rgb)

    height, width = original_np.shape[:2]

    cam_resized = cv2.resize(
        cam,
        (width, height),
        interpolation=cv2.INTER_CUBIC
    )

    cam_resized = np.clip(cam_resized, 0, 1)

    heatmap_color = cv2.applyColorMap(
        (cam_resized * 255).astype(np.uint8),
        cv2.COLORMAP_JET
    )

    heatmap_color = cv2.cvtColor(
        heatmap_color,
        cv2.COLOR_BGR2RGB
    )

    blended = (
        original_np.astype(np.float32) * 0.55
        + heatmap_color.astype(np.float32) * 0.45
    )

    blended = np.clip(
        blended,
        0,
        255
    ).astype(np.uint8)

    overlay_image = Image.fromarray(blended)

    filename = f"{uuid4().hex}.png"

    output_path = HEATMAP_DIR / filename

    overlay_image.save(output_path)

    return {
        "filename": filename,
        "path": str(output_path),
        "target_class": target_class
    }