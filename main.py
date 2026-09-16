from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from routes.prediction import router as prediction_router


app = FastAPI()

app.include_router(
    prediction_router,
    prefix="/api"
)

app.mount(
    "/heatmaps",
    StaticFiles(directory="generated/heatmaps"),
    name="heatmaps"
)


@app.get("/")
def home():
    return {
        "message": "SIH DR Screening Backend is running!"
    }