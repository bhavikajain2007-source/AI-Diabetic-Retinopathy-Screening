from PIL import Image
import numpy as np
import cv2


# --------------------------------------------------
# Basic image quality checking
# --------------------------------------------------

def check_image_quality(
    image,
    min_width=100,
    min_height=100,
    blur_threshold=50
):
    """
    Performs basic technical image-quality checks.

    Returns:
        (True, message)  -> image can proceed
        (False, message) -> image should be rejected
    """

    # ----------------------------------------------
    # Check whether image is readable
    # ----------------------------------------------

    if image is None:
        return False, "Image could not be loaded."

    # Make sure image is a PIL Image
    if not isinstance(image, Image.Image):
        return False, "Invalid image format."

    # ----------------------------------------------
    # Check image dimensions
    # ----------------------------------------------

    width, height = image.size

    if width < min_width or height < min_height:
        return False, "Image resolution is too low."

    # ----------------------------------------------
    # Convert to RGB
    # ----------------------------------------------

    try:
        rgb_image = image.convert("RGB")
    except Exception:
        return False, "Image could not be converted to RGB."

    # ----------------------------------------------
    # Convert to NumPy array
    # ----------------------------------------------

    image_array = np.array(rgb_image)

    if image_array.size == 0:
        return False, "Image contains no data."

    # ----------------------------------------------
    # Check for extremely dark images
    # ----------------------------------------------

    gray = cv2.cvtColor(
        image_array,
        cv2.COLOR_RGB2GRAY
    )

    mean_brightness = np.mean(gray)

    if mean_brightness < 10:
        return False, "Image is too dark."

    # ----------------------------------------------
    # Check for extremely bright images
    # ----------------------------------------------

    if mean_brightness > 245:
        return False, "Image is too bright."

    # ----------------------------------------------
    # Basic blur detection
    # ----------------------------------------------

    laplacian_variance = cv2.Laplacian(
        gray,
        cv2.CV_64F
    ).var()

    if laplacian_variance < blur_threshold:
        return False, "Image is too blurry."

    # ----------------------------------------------
    # Image passed basic checks
    # ----------------------------------------------

    return True, "Image quality acceptable."