import numpy as np
import cv2
from PIL import Image


def overlay_heatmap(original_image, cam, alpha=0.45, colormap=cv2.COLORMAP_JET):

    orig_np = np.array(original_image.convert("RGB"))
    H, W = orig_np.shape[:2]

    cam_resized = cv2.resize(cam, (W, H), interpolation=cv2.INTER_CUBIC)
    cam_resized = np.clip(cam_resized, 0, 1)

    heatmap_color = cv2.applyColorMap(
        (cam_resized * 255).astype(np.uint8),
        colormap
    )
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)

    blended = (orig_np.astype(np.float32) * (1 - alpha)
               + heatmap_color.astype(np.float32) * alpha)
    blended = np.clip(blended, 0, 255).astype(np.uint8)

    overlay_image = Image.fromarray(blended)

    return overlay_image, cam_resized


def get_affected_region(cam_resized, percentile_threshold=85, min_area_fraction=0.001):

    H, W = cam_resized.shape

    thresh_value = np.percentile(cam_resized, percentile_threshold)
    thresh_value = max(thresh_value, 1e-6)

    mask = (cam_resized >= thresh_value).astype(np.uint8) * 255

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return {"bbox": None, "centroid": None, "mask": mask}

    min_area = min_area_fraction * H * W
    contours = [c for c in contours if cv2.contourArea(c) >= min_area]

    if not contours:
        return {"bbox": None, "centroid": None, "mask": mask}

    largest = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)

    M = cv2.moments(largest)
    if M["m00"] != 0:
        cx = int(M["m10"] / M["m00"])
        cy = int(M["m01"] / M["m00"])
    else:
        cx, cy = x + w // 2, y + h // 2

    return {"bbox": (x, y, w, h), "centroid": (cx, cy), "mask": mask}


def describe_location(centroid, image_size):

    if centroid is None:
        return "No sharply localized region was detected; activation was diffuse."

    cx, cy = centroid
    W, H = image_size

    col = "left" if cx < W / 3 else ("center" if cx < 2 * W / 3 else "right")
    row = "upper" if cy < H / 3 else ("middle" if cy < 2 * H / 3 else "lower")

    if row == "middle" and col == "center":
        zone = "the central region (near the macula)"
    else:
        zone = f"the {row}-{col} region"

    dx = (cx - W / 2) / (W / 2)
    dy = (cy - H / 2) / (H / 2)
    dist = min(1.0, (dx ** 2 + dy ** 2) ** 0.5)

    proximity = "close to the central retina" if dist < 0.35 else \
                "in the mid-periphery" if dist < 0.7 else \
                "toward the peripheral retina"

    return f"{zone}, {proximity}"


_SEVERITY_DESCRIPTIONS = {
    "No DR": "no visible signs of diabetic retinopathy",
    "Mild": "early microaneurysm-like features consistent with mild non-proliferative DR",
    "Moderate": "a moderate burden of retinal lesions (e.g. microaneurysms, hemorrhages) "
                "consistent with moderate non-proliferative DR",
    "Severe": "extensive hemorrhages/lesions consistent with severe non-proliferative DR",
    "Proliferative DR": "features suggestive of neovascularization, consistent with "
                         "proliferative DR"
}


def generate_explanation(predicted_class, confidence, location_description, region_found):

    severity_text = _SEVERITY_DESCRIPTIONS.get(
        predicted_class,
        f"features associated with '{predicted_class}'"
    )

    confidence_pct = round(confidence * 100, 1)

    if predicted_class == "No DR":
        explanation = (
            f"The model classified this image as '{predicted_class}' with "
            f"{confidence_pct}% confidence, detecting {severity_text}. "
        )
        if region_found:
            explanation += (
                f"The Grad-CAM heatmap shows mild residual activation in "
                f"{location_description}, but this did not meet the threshold "
                f"for a DR finding."
            )
        else:
            explanation += "No focal region of concern was highlighted by the heatmap."
        return explanation

    explanation = (
        f"The model predicted '{predicted_class}' with {confidence_pct}% confidence, "
        f"identifying {severity_text}. "
    )

    if region_found:
        explanation += (
            f"The Grad-CAM heatmap indicates the model's decision was most strongly "
            f"influenced by {location_description}. This is the area the model "
            f"considers most abnormal and worth clinical review."
        )
    else:
        explanation += (
            "However, activation was spread diffusely across the retina rather than "
            "concentrated in one clear region."
        )

    return explanation
