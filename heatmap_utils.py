import numpy as np
import cv2
from PIL import Image


# --------------------------------------------------
# 1. Upsample + overlay heatmap on the ORIGINAL image
# --------------------------------------------------

def overlay_heatmap(original_image, cam, alpha=0.45, colormap=cv2.COLORMAP_JET):
    """
    Args:
        original_image: PIL.Image (RGB), the UNPREPROCESSED image
                         (before resize/normalize) so the overlay is
                         shown at native resolution.
        cam: numpy array [h, w], values in [0, 1] (output of GradCAM.generate)
        alpha: blend strength of the heatmap over the original image
        colormap: OpenCV colormap to use

    Returns:
        overlay_image: PIL.Image (RGB) — original image with heatmap overlaid
        cam_resized: numpy array [H, W] (float, 0-1), CAM resized to
                     original_image's resolution — reused for region detection
    """

    orig_np = np.array(original_image.convert("RGB"))
    H, W = orig_np.shape[:2]

    # Upsample CAM (e.g. 7x7) to original resolution with bicubic interpolation
    cam_resized = cv2.resize(cam, (W, H), interpolation=cv2.INTER_CUBIC)
    cam_resized = np.clip(cam_resized, 0, 1)

    # Apply colormap (expects uint8 0-255)
    heatmap_color = cv2.applyColorMap(
        (cam_resized * 255).astype(np.uint8),
        colormap
    )
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)

    # Blend
    blended = (orig_np.astype(np.float32) * (1 - alpha)
               + heatmap_color.astype(np.float32) * alpha)
    blended = np.clip(blended, 0, 255).astype(np.uint8)

    overlay_image = Image.fromarray(blended)

    return overlay_image, cam_resized


# --------------------------------------------------
# 2. Locate the most-affected region
# --------------------------------------------------

def get_affected_region(cam_resized, percentile_threshold=85, min_area_fraction=0.001):
    """
    Args:
        cam_resized: numpy array [H, W], float 0-1 (already resized to
                     original image resolution)
        percentile_threshold: keep only the top (100 - percentile_threshold)%
                               most activated pixels
        min_area_fraction: ignore contours smaller than this fraction of
                            total image area (removes noise
