import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'crop_yield.csv')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    if not os.path.exists(data_path):
        import generate_synthetic_data
        generate_synthetic_data.generate_crop_yield(data_path)
        
    df = pd.read_csv(data_path)
    
    X = df.drop('Yield', axis=1)
    y = df['Yield']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    categorical_features = ['Crop']
    numeric_features = ['Area', 'Rainfall', 'Temperature', 'Fertilizer_Usage', 'Pesticide_Usage', 'Year']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
        
    models = {
        'Linear Regression': LinearRegression(),
        'Decision Tree': DecisionTreeRegressor(random_state=42),
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingRegressor(random_state=42)
    }
    
    results = {}
    best_model_name = None
    best_rmse = float('inf')
    best_pipeline = None
    
    for name, regressor in models.items():
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', regressor)
        ])
        
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='neg_root_mean_squared_error')
        cv_rmse = -cv_scores.mean()
        
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        results[name] = {
            'mae': mae,
            'mse': mse,
            'rmse': rmse,
            'r2_score': r2,
            'cv_rmse': cv_rmse
        }
        
        if rmse < best_rmse:
            best_rmse = rmse
            best_model_name = name
            best_pipeline = pipeline
            
    model_path = os.path.join(models_dir, 'yield_pipeline.joblib')
    joblib.dump(best_pipeline, model_path)
    
    feature_importances = None
    if hasattr(best_pipeline.named_steps['regressor'], 'feature_importances_'):
        importances = best_pipeline.named_steps['regressor'].feature_importances_
        try:
            cat_encoder = best_pipeline.named_steps['preprocessor'].named_transformers_['cat']
            cat_feature_names = cat_encoder.get_feature_names_out(categorical_features)
            feature_names = numeric_features + list(cat_feature_names)
            feature_importances = {name: float(imp) for name, imp in zip(feature_names, importances)}
        except Exception:
            pass
            
    metrics = {
        'best_model': best_model_name,
        'mae': results[best_model_name]['mae'],
        'mse': results[best_model_name]['mse'],
        'rmse': results[best_model_name]['rmse'],
        'r2': results[best_model_name]['r2_score'],
        'cross_validation_rmse': results[best_model_name]['cv_rmse'],
        'training_samples': len(X_train),
        'testing_samples': len(X_test),
        'features': numeric_features + categorical_features,
        'feature_importance': feature_importances,
        'comparisons': results
    }
    
    metrics_path = os.path.join(models_dir, 'yield_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=4)
        
    print(f"Yield model training complete. Best model: {best_model_name} with RMSE: {best_rmse:.4f}")

if __name__ == "__main__":
    train_and_evaluate()
