from PIL import Image

from inference import DRPredictor


# --------------------------------------------------
# Configuration
# --------------------------------------------------

MODEL_PATH = "densenet121_dr_best.pth"

IMAGE_PATH = "test_image.png"


# --------------------------------------------------
# Load predictor
# --------------------------------------------------

predictor = DRPredictor(
    MODEL_PATH
)


# --------------------------------------------------
# Load image
# --------------------------------------------------

image = Image.open(
    IMAGE_PATH
)


# --------------------------------------------------
# Run prediction
# --------------------------------------------------

result = predictor.predict(
    image
)


# --------------------------------------------------
# Print result
# --------------------------------------------------

print("\nPrediction Result")
print("------------------------")

print(
    "Success:",
    result["success"]
)

if result["success"]:

    print(
        "Prediction:",
        result["prediction"]
    )

    print(
        "Confidence:",
        result["confidence"]
    )

    print(
        "\nClass probabilities:"
    )

    for class_name, probability in result[
        "probabilities"
    ].items():

        print(
            f"{class_name}: {probability}"
        )

else:

    print(
        "Error:",
        result["error"]
    )