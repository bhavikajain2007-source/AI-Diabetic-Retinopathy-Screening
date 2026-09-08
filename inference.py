import torch
from PIL import Image

from model import load_model, CLASS_NAMES
from preprocessing import val_test_transform
from quality_check import check_image_quality


class DRPredictor:

    def __init__(self, model_path):

        # Load trained model
        self.model, self.device = load_model(
            model_path
        )

    # --------------------------------------------------
    # Predict one image
    # --------------------------------------------------

    def predict(self, image):

        # ----------------------------------------------
        # Make sure image is a PIL Image
        # ----------------------------------------------

        if not isinstance(image, Image.Image):
            return {
                "success": False,
                "error": "Invalid image format."
            }

        # ----------------------------------------------
        # Quality check
        # ----------------------------------------------

        is_valid, quality_message = check_image_quality(
            image
        )

        if not is_valid:
            return {
                "success": False,
                "error": quality_message
            }

        # ----------------------------------------------
        # Convert image to RGB
        # ----------------------------------------------

        image = image.convert("RGB")

        # ----------------------------------------------
        # Apply inference preprocessing
        # ----------------------------------------------

        image_tensor = val_test_transform(image)

        # Add batch dimension
        #
        # Before:
        # [3, 224, 224]
        #
        # After:
        # [1, 3, 224, 224]

        image_tensor = image_tensor.unsqueeze(0)

        # Move image to same device as model
        image_tensor = image_tensor.to(self.device)

        # ----------------------------------------------
        # Model inference
        # ----------------------------------------------

        with torch.no_grad():

            outputs = self.model(image_tensor)

            # Convert raw model outputs into
            # normalized values
            probabilities = torch.softmax(
                outputs,
                dim=1
            )

            # Find class with highest probability
            predicted_index = torch.argmax(
                probabilities,
                dim=1
            ).item()

        # ----------------------------------------------
        # Get prediction information
        # ----------------------------------------------

        predicted_class = CLASS_NAMES[
            predicted_index
        ]

        confidence = probabilities[
            0,
            predicted_index
        ].item()

        # ----------------------------------------------
        # Get probability for every class
        # ----------------------------------------------

        all_probabilities = {}

        for i, class_name in enumerate(CLASS_NAMES):

            all_probabilities[class_name] = round(
                probabilities[0, i].item(),
                4
            )

        # ----------------------------------------------
        # Return result
        # ----------------------------------------------

        return {
            "success": True,
            "prediction": predicted_class,
            "confidence": round(
                confidence,
                4
            ),
            "probabilities": all_probabilities
        }