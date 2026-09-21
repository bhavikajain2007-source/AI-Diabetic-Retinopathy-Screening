from PIL import Image
import numpy as np
import cv2


def check_image_quality(
    image,
    min_width=100,
    min_height=100,
    blur_threshold=10
):
    """
    Performs basic technical image-quality checks.

    Returns:
        (True, message)  -> image can proceed
        (False, message) -> image should be rejected
    """

    if image is None:
        return False, "Image could not be loaded."

    if not isinstance(image, Image.Image):
        return False, "Invalid image format."

    width, height = image.size

    if width < min_width or height < min_height:
        return False, "Image resolution is too low."

    try:
        rgb_image = image.convert("RGB")
    except Exception:
        return False, "Image could not be converted to RGB."

    image_array = np.array(rgb_image)

    if image_array.size == 0:
        return False, "Image contains no data."

    gray = cv2.cvtColor(
        image_array,
        cv2.COLOR_RGB2GRAY
    )

    mean_brightness = np.mean(gray)

    if mean_brightness < 10:
        return False, "Image is too dark."

    if mean_brightness > 245:
        return False, "Image is too bright."

    laplacian_variance = cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()

    # (removed: debug print() and the raw Laplacian variance number in the
    # user-facing message — a camp technician doesn't need that number,
    # and it read as a bug the one time someone actually saw it live)
    if laplacian_variance < blur_threshold:
        return False, "Image is too blurry."

    return True, "Image quality acceptable."
