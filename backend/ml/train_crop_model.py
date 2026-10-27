import os
import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, 'data', 'crop_recommendation.csv')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    if not os.path.exists(data_path):
        import generate_synthetic_data
        generate_synthetic_data.generate_crop_recommendation(data_path)
        
    df = pd.read_csv(data_path)
    X = df.drop('label', axis=1)
    y = df['label']
    
    classes = list(y.unique())
    classes.sort()
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    models = {
        'Logistic Regression': Pipeline([('scaler', StandardScaler()), ('clf', LogisticRegression(max_iter=1000, random_state=42))]),
        'Decision Tree': Pipeline([('scaler', StandardScaler()), ('clf', DecisionTreeClassifier(random_state=42))]),
        'Random Forest': Pipeline([('scaler', StandardScaler()), ('clf', RandomForestClassifier(n_estimators=100, random_state=42))]),
        'KNN': Pipeline([('scaler', StandardScaler()), ('clf', KNeighborsClassifier(n_neighbors=5))]),
        'SVM': Pipeline([('scaler', StandardScaler()), ('clf', SVC(probability=True, random_state=42))])
    }
    
    results = {}
    best_model_name = None
    best_f1 = -1
    best_pipeline = None
    
    for name, pipeline in models.items():
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_pred, labels=classes)
        
        results[name] = {
            'accuracy': acc,
            'precision': prec,
            'recall': rec,
            'f1_score': f1,
            'confusion_matrix': cm.tolist()
        }
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_pipeline = pipeline
            
    model_path = os.path.join(models_dir, 'crop_pipeline.joblib')
    joblib.dump(best_pipeline, model_path)
    
    metrics = {
        'best_model': best_model_name,
        'classes': classes,
        'comparisons': results,
        'best_metrics': results[best_model_name]
    }
    
    metrics_path = os.path.join(models_dir, 'crop_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=4)
        
    print(f"Crop model training complete. Best model: {best_model_name}")

if __name__ == "__main__":
    train_and_evaluate()
