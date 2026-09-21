from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

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

    # 4. Stop if ML quality check/prediction failed.
    # Return the exact shape the frontend expects: {"success": false, "error": "..."}.
    # (Previously this raised HTTPException, which FastAPI serializes as
    # {"detail": "..."} instead — a different shape than what was agreed.)
    if not result.get("success", False):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": result.get("error", "Prediction failed.")
            }
        )

    # 5. Generate Grad-CAM heatmap
    heatmap = generate_heatmap(image)

    # 6. Add heatmap location to response
    result["heatmap_url"] = (
        f"/heatmaps/{heatmap['filename']}"
    )

    return result
