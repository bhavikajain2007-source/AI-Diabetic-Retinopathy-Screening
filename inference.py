import torch
from PIL import Image

from model import load_model, CLASS_NAMES
from preprocessing import val_test_transform
from quality_check import check_image_quality


class DRPredictor:

    def __init__(self, model_path):
        self.model, self.device = load_model(model_path)

    def predict(self, image):

        if not isinstance(image, Image.Image):
            return {"success": False, "error": "Invalid image format."}

        is_valid, quality_message = check_image_quality(image)

        if not is_valid:
            return {"success": False, "error": quality_message}

        image = image.convert("RGB")

        image_tensor = val_test_transform(image)
        image_tensor = image_tensor.unsqueeze(0)
        image_tensor = image_tensor.to(self.device)

        with torch.no_grad():
            outputs = self.model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            predicted_index = torch.argmax(probabilities, dim=1).item()

        predicted_class = CLASS_NAMES[predicted_index]
        confidence = probabilities[0, predicted_index].item()

        all_probabilities = {}
        for i, class_name in enumerate(CLASS_NAMES):
            all_probabilities[class_name] = round(probabilities[0, i].item(), 4)

        return {
            "success": True,
            "prediction": predicted_class,
            "confidence": round(confidence, 4),
            "probabilities": all_probabilities
        }
