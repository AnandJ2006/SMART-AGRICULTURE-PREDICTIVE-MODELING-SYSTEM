from fastapi import APIRouter, HTTPException
import json
import os

router = APIRouter()

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
models_dir = os.path.join(base_dir, 'models')

def load_json_file(filepath: str):
    if not os.path.exists(filepath):
        raise HTTPException(status_code=503, detail="Model metrics file not yet created.")
    with open(filepath, 'r') as f:
        return json.load(f)

@router.get("/models/performance")
async def get_models_performance():
    crop_path = os.path.join(models_dir, 'crop_metrics.json')
    yield_path = os.path.join(models_dir, 'yield_metrics.json')
    
    crop_data = load_json_file(crop_path)
    yield_data = load_json_file(yield_path)
    
    return {
        "crop_model": {
            "best_model": crop_data.get("best_model"),
            "metrics": crop_data.get("best_metrics")
        },
        "yield_model": {
            "best_model": yield_data.get("best_model"),
            "r2_score": yield_data.get("r2"),
            "mae": yield_data.get("mae"),
            "mse": yield_data.get("mse"),
            "rmse": yield_data.get("rmse"),
            "cross_validation_rmse": yield_data.get("cross_validation_rmse"),
            "feature_importance": yield_data.get("feature_importance")
        }
    }

@router.get("/models/comparison")
async def get_models_comparison():
    crop_path = os.path.join(models_dir, 'crop_metrics.json')
    yield_path = os.path.join(models_dir, 'yield_metrics.json')
    
    crop_data = load_json_file(crop_path)
    
    try:
        yield_data = load_json_file(yield_path)
        yield_comparisons = yield_data.get("comparisons", {})
    except HTTPException:
        yield_comparisons = {}
        
    return {
        "crop": crop_data.get("comparisons", {}),
        "yield": yield_comparisons
    }

@router.get("/models/confusion-matrix")
async def get_confusion_matrix():
    crop_path = os.path.join(models_dir, 'crop_metrics.json')
    crop_data = load_json_file(crop_path)
    
    best_metrics = crop_data.get("best_metrics", {})
    return {
        "classes": crop_data.get("classes", []),
        "confusion_matrix": best_metrics.get("confusion_matrix", [])
    }
