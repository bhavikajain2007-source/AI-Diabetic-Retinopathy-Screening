from fastapi import APIRouter, UploadFile, File, HTTPException

from utils.image_validation import validate_image
from services.ml_service import prepare_image, predict_image
from xai.xai_service import generate_heatmap


router = APIRouter()


@router.post("/predict")
async def predict(file: UploadFile = File(...)):

    # 1. Validate uploaded image
    await validate_image(file)

    # 2. Convert uploaded file to PIL Image
    image = await prepare_image(file)

    # 3. Run DR prediction
    result = predict_image(image)

    # 4. Stop if ML quality check/prediction failed
    if not result.get("success", False):
        raise HTTPException(
            status_code=400,
            detail=result.get(
                "error",
                "Prediction failed."
            )
        )

    # 5. Generate Grad-CAM heatmap
    heatmap = generate_heatmap(image)

    # 6. Add heatmap location to response
    result["heatmap_url"] = (
        f"/heatmaps/{heatmap['filename']}"
    )

    return result