from fastapi import APIRouter, HTTPException
import pandas as pd
import numpy as np
import os
import json

router = APIRouter()

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_dir = os.path.join(base_dir, 'data')
models_dir = os.path.join(base_dir, 'models')

def load_crop_dataset():
    filepath = os.path.join(data_dir, 'crop_recommendation.csv')
    if not os.path.exists(filepath):
        raise HTTPException(status_code=503, detail="Crop dataset file not yet created.")
    return pd.read_csv(filepath)

def load_yield_dataset():
    filepath = os.path.join(data_dir, 'crop_yield.csv')
    if not os.path.exists(filepath):
        raise HTTPException(status_code=503, detail="Yield dataset file not yet created.")
    return pd.read_csv(filepath)

@router.get("/eda/crop-distribution")
async def get_crop_distribution():
    df = load_crop_dataset()
    if 'label' not in df.columns:
        raise HTTPException(status_code=400, detail="Label column missing in dataset.")
    dist = df['label'].value_counts().to_dict()
    return {"crop_distribution": dist}

@router.get("/eda/correlation")
async def get_eda_correlation():
    df = load_crop_dataset()
    numeric_df = df.select_dtypes(include=[np.number])
    corr_matrix = numeric_df.corr(method='pearson').fillna(0)
    return {
        "features": list(corr_matrix.columns),
        "correlation_matrix": corr_matrix.values.tolist()
    }

@router.get("/eda/yield")
async def get_yield_eda():
    df = load_yield_dataset()
    numeric_df = df.select_dtypes(include=[np.number])
    
    # Correlation for yield
    corr_matrix = numeric_df.corr(method='pearson').fillna(0)
    
    # Feature Importance (from yield_metrics.json if exists)
    feature_importance = {}
    metrics_path = os.path.join(models_dir, 'yield_metrics.json')
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, 'r') as f:
                metrics = json.load(f)
                feature_importance = metrics.get('feature_importance', {})
        except Exception:
            pass

    # Basic stats for scatter plots (take a sample to prevent massive payloads)
    sample_size = min(len(df), 200)
    sampled_df = df.sample(sample_size, random_state=42)
    
    scatter_data = []
    for _, row in sampled_df.iterrows():
        scatter_data.append({
            'Yield': row['Yield'],
            'Rainfall': row.get('Rainfall', 0),
            'Temperature': row.get('Temperature', 0),
            'Fertilizer_Usage': row.get('Fertilizer_Usage', 0),
            'Pesticide_Usage': row.get('Pesticide_Usage', 0)
        })

    return {
        "correlation": {
            "features": list(corr_matrix.columns),
            "correlation_matrix": corr_matrix.values.tolist()
        },
        "feature_importance": feature_importance,
        "scatter_data": scatter_data
    }
