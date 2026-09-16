from fastapi import HTTPException, UploadFile


ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/jpg"
}


async def validate_image(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG and PNG images are allowed."
        )

    return True 
