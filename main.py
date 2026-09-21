from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from routes.prediction import router as prediction_router


app = FastAPI()

# Without this, the browser blocks every request from the frontend's
# origin (Codespaces preview URL / localhost:5173) before it even
# reaches this server. Tighten allow_origins to the real frontend
# URL(s) once you know them for the demo — "*" is fine for now.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
