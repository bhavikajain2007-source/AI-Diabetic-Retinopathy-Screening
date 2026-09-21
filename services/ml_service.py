from io import BytesIO
from pathlib import Path

from PIL import Image
from fastapi import UploadFile

from ml.inference import DRPredictor


MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "ml"
    / "models"
    / "densenet121_dr_best.pth"
)

_predictor = None


def get_predictor():
    global _predictor

    if _predictor is None:
        _predictor = DRPredictor(str(MODEL_PATH))

    return _predictor


async def prepare_image(file: UploadFile) -> Image.Image:
    image_bytes = await file.read()
    image = Image.open(BytesIO(image_bytes))
    return image


def predict_image(image: Image.Image):
    predictor = get_predictor()
    return predictor.predict(image)
