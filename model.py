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

    if device is None:
        device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

    model = models.densenet121(weights=None)

    num_features = model.classifier.in_features

    model.classifier = nn.Sequential(
        nn.Dropout(0.4),
        nn.Linear(num_features, NUM_CLASSES)
    )

    checkpoint = torch.load(
        model_path,
        map_location=device
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model = model.to(device)
    model.eval()

    return model, device
