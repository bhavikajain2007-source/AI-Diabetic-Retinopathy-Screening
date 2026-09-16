from pydantic import BaseModel
from typing import Dict, Optional


class PredictionResponse(BaseModel):
    success: bool
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    probabilities: Optional[Dict[str, float]] = None
    heatmap_url: Optional[str] = None
    error: Optional[str] = None