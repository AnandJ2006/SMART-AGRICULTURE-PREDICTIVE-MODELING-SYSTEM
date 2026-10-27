from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import prediction, models, dataset, eda

app = FastAPI(title="Smart Agriculture Predictive Modeling System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "running"}

app.include_router(prediction.router, prefix="/api", tags=["prediction"])
app.include_router(models.router, prefix="/api", tags=["models"])
app.include_router(dataset.router, prefix="/api", tags=["dataset"])
app.include_router(eda.router, prefix="/api", tags=["eda"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
