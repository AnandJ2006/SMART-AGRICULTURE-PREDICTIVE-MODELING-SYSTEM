from fastapi import APIRouter, HTTPException
import pandas as pd
import os

router = APIRouter()

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_dir = os.path.join(base_dir, 'data')

@router.get("/dataset/summary")
async def get_dataset_summary():
    filepath = os.path.join(data_dir, 'crop_recommendation.csv')
    if not os.path.exists(filepath):
        raise HTTPException(status_code=503, detail="Dataset file not yet created.")
        
    df = pd.read_csv(filepath)
    
    summary = {
        "row_count": int(df.shape[0]),
        "feature_count": int(df.shape[1]),
        "missing_values": int(df.isnull().sum().sum()),
        "duplicate_count": int(df.duplicated().sum()),
        "class_labels": df['label'].unique().tolist() if 'label' in df.columns else [],
        "column_datatypes": {col: str(dtype) for col, dtype in df.dtypes.items()}
    }
    
    return summary

@router.get("/dataset/yield/summary")
async def get_yield_dataset_summary():
    filepath = os.path.join(data_dir, 'crop_yield.csv')
    if not os.path.exists(filepath):
        raise HTTPException(status_code=503, detail="Yield dataset file not yet created.")
        
    df = pd.read_csv(filepath)
    
    summary = {
        "row_count": int(df.shape[0]),
        "feature_count": int(df.shape[1]),
        "missing_values": int(df.isnull().sum().sum()),
        "duplicate_count": int(df.duplicated().sum()),
        "target_variable": "Yield",
        "column_datatypes": {col: str(dtype) for col, dtype in df.dtypes.items()}
    }
    
    return summary
