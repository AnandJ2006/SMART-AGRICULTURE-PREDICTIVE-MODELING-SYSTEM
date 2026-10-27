from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import joblib
import os
import numpy as np
import pandas as pd

router = APIRouter()

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
models_dir = os.path.join(base_dir, 'models')
crop_model_path = os.path.join(models_dir, 'crop_pipeline.joblib')
yield_model_path = os.path.join(models_dir, 'yield_pipeline.joblib')

crop_pipeline = None
yield_pipeline = None

def get_crop_pipeline():
    global crop_pipeline
    if crop_pipeline is None:
        if os.path.exists(crop_model_path):
            crop_pipeline = joblib.load(crop_model_path)
        else:
            raise HTTPException(status_code=503, detail="Crop model files not yet created.")
    return crop_pipeline

def get_yield_pipeline():
    global yield_pipeline
    if yield_pipeline is None:
        if os.path.exists(yield_model_path):
            yield_pipeline = joblib.load(yield_model_path)
        else:
            raise HTTPException(status_code=503, detail="Yield model files not yet created.")
    return yield_pipeline

class CropPredictRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, description="Nitrogen ratio")
    phosphorus: float = Field(..., ge=0, description="Phosphorous ratio")
    potassium: float = Field(..., ge=0, description="Potassium ratio")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity in %")
    ph: float = Field(..., ge=0, le=14, description="pH value of the soil")
    rainfall: float = Field(..., ge=0, description="Rainfall in mm")

class YieldPredictRequest(BaseModel):
    crop: str = Field(..., description="Crop type")
    area: float = Field(..., gt=0, description="Area of land in hectares")
    rainfall: float = Field(..., ge=0, description="Rainfall in mm")
    temperature: float = Field(..., description="Temperature in Celsius")
    fertilizer: float = Field(..., ge=0, description="Fertilizer usage in kg")
    pesticide: float = Field(..., ge=0, description="Pesticide usage in kg")
    year: int = Field(..., ge=1990, description="Year of harvest")

@router.post("/predict/crop")
async def predict_crop(request: CropPredictRequest):
    pipeline = get_crop_pipeline()
    
    # Map to model's expected features: ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    data = pd.DataFrame([[
        request.nitrogen, request.phosphorus, request.potassium,
        request.temperature, request.humidity, request.ph, request.rainfall
    ]], columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])
    
    prediction = pipeline.predict(data)[0]
    probabilities = pipeline.predict_proba(data)[0]
    classes = pipeline.classes_
    
    # Sort indices by probability descending
    top_indices = np.argsort(probabilities)[::-1]
    
    top_predictions = []
    for i in top_indices[:3]: # Let's get top 3 or top 5, standard top 3 usually
        top_predictions.append({
            "crop": str(classes[i]),
            "probability": round(float(probabilities[i]), 4)
        })
        
    return {
        "predicted_crop": str(prediction),
        "confidence": round(float(np.max(probabilities)), 4),
        "top_predictions": top_predictions
    }

import json

def get_yield_metrics():
    metrics_path = os.path.join(models_dir, 'yield_metrics.json')
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            return json.load(f)
    return {}

@router.post("/predict/yield")
async def predict_yield(request: YieldPredictRequest):
    try:
        pipeline = get_yield_pipeline()
        metrics = get_yield_metrics()
        
        # Map to model's expected features
        data = pd.DataFrame([[
            request.crop, request.area, request.rainfall, request.temperature,
            request.fertilizer, request.pesticide, request.year
        ]], columns=['Crop', 'Area', 'Rainfall', 'Temperature', 'Fertilizer_Usage', 'Pesticide_Usage', 'Year'])
        
        prediction = pipeline.predict(data)[0]
        
        return {
            "success": True,
            "prediction_type": "crop_yield",
            "predicted_yield": round(float(prediction), 2),
            "unit": "tons/hectare",
            "model": metrics.get("best_model", "Unknown Model"),
            "rmse": round(metrics.get("rmse", 0), 2),
            "r2": round(metrics.get("r2", 0), 2),
            "mae": round(metrics.get("mae", 0), 2),
            "confidence": None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
