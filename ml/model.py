import torch
import torch.nn as nn
from torchvision import models


# --------------------------------------------------
# Configuration
# --------------------------------------------------

NUM_CLASSES = 5

CLASS_NAMES = [
    "No DR",
    "Mild",
    "Moderate",
    "Severe",
    "Proliferative DR"
]


# --------------------------------------------------
# Load trained DenseNet121 model
# --------------------------------------------------

def load_model(model_path, device=None):

    # Automatically use GPU if available
    if device is None:
        device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

    # Create DenseNet121 architecture
    # weights=None because our .pth already contains
    # the trained model weights.
    model = models.densenet121(weights=None)

    # Replace the original ImageNet classifier
    # with our 5-class DR classifier
    num_features = model.classifier.in_features

    model.classifier = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(num_features, NUM_CLASSES)
    )

    # Load trained checkpoint
    checkpoint = torch.load(
        model_path,
        map_location=device
    )

    # Your checkpoint contains "model_state_dict"
    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    # Move model to CPU/GPU
    model = model.to(device)

    # Set model to inference mode
    model.eval()

    return model, device