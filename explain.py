import io
import base64

import torch
from PIL import Image

from inference import DRPredictor
from preprocessing import val_test_transform
from quality_check import check_image_quality
from gradcam import GradCAM
from heatmap_utils import overlay_heatmap, get_affected_region, describe_location, generate_explanation


class DRExplainer:

    def __init__(self, model_path):
        self.predictor = DRPredictor(model_path)
        self.gradcam = GradCAM(self.predictor.model)

    def explain(self, image, return_base64=False):

        if not isinstance(image, Image.Image):
            return {"success": False, "error": "Invalid image format."}

        is_valid, quality_message = check_image_quality(image)
        if not is_valid:
            return {"success": False, "error": quality_message}

        original_rgb = image.convert("RGB")

        image_tensor = val_test_transform(original_rgb).unsqueeze(0)
        image_tensor = image_tensor.to(self.predictor.device)

        cam, predicted_index, probabilities = self.gradcam.generate(image_tensor)

        from model import CLASS_NAMES
        predicted_class = CLASS_NAMES[predicted_index]
        confidence = probabilities[predicted_index].item()

        all_probabilities = {
            CLASS_NAMES[i]: round(probabilities[i].item(), 4)
            for i in range(len(CLASS_NAMES))
        }

        overlay_image, cam_resized = overlay_heatmap(original_rgb, cam)

        region = get_affected_region(cam_resized)
        region_found = region["bbox"] is not None

        location_description = describe_location(
            region["centroid"], original_rgb.size
        )

        explanation_text = generate_explanation(
            predicted_class, confidence, location_description, region_found
        )

        result = {
            "success": True,
            "prediction": predicted_class,
            "confidence": round(confidence, 4),
            "probabilities": all_probabilities,
            "affected_region": {
                "bbox": region["bbox"],
                "centroid": region["centroid"],
                "description": location_description
            },
            "explanation": explanation_text,
            "heatmap_overlay_image": overlay_image
        }

        if return_base64:
            buf = io.BytesIO()
            overlay_image.save(buf, format="PNG")
            result["heatmap_overlay_base64"] = base64.b64encode(buf.getvalue()).decode("utf-8")

        return result
