from PIL import Image
import numpy as np
import cv2


def _central_crop_gray(image_array, crop_fraction=0.6):
    """
    Crops to the central crop_fraction of the image (both dimensions)
    before computing sharpness, to avoid the black fundus border
    dominating the variance calculation.
    """
    h, w = image_array.shape[:2]
    ch, cw = int(h * crop_fraction), int(w * crop_fraction)
    y0 = (h - ch) // 2
    x0 = (w - cw) // 2
    cropped = image_array[y0:y0 + ch, x0:x0 + cw]
    return cv2.cvtColor(cropped, cv2.COLOR_RGB2GRAY)


def check_image_quality(
    image,
    min_width=100,
    min_height=100,
    blur_threshold=8
):
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

    gray_full = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    mean_brightness = np.mean(gray_full)

    if mean_brightness < 10:
        return False, "Image is too dark."

    if mean_brightness > 245:
        return False, "Image is too bright."

    # Measure blur only on the central region (excludes black border)
    gray_center = _central_crop_gray(image_array)
    laplacian_variance = cv2.Laplacian(gray_center, cv2.CV_64F).var()

    if laplacian_variance < blur_threshold:
        return False, "Image is too blurry."

    return True, "Image quality acceptable."
