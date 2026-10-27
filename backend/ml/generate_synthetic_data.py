import os
# pyrefly: ignore [missing-import]
import numpy as np
import pandas as pd

def generate_crop_recommendation(filepath: str, n_samples: int = 2200):
    np.random.seed(42)
    
    crops = ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas',
             'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate',
             'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple',
             'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee']
    
    data = []
    samples_per_crop = n_samples // len(crops)
    
    for crop in crops:
        for _ in range(samples_per_crop):
            n = np.random.randint(0, 141)
            p = np.random.randint(5, 146)
            k = np.random.randint(5, 206)
            temperature = np.random.uniform(8.0, 45.0)
            humidity = np.random.uniform(10.0, 100.0)
            ph = np.random.uniform(3.5, 10.0)
            rainfall = np.random.uniform(20.0, 300.0)
            
            data.append([n, p, k, temperature, humidity, ph, rainfall, crop])
            
    df = pd.DataFrame(data, columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label'])
    
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    print(f"Generated {filepath} with {len(df)} rows.")

def generate_crop_yield(filepath: str, n_samples: int = 1500):
    np.random.seed(42)
    
    crops = ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas',
             'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate',
             'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple',
             'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee']
    
    data = {
        'Crop': np.random.choice(crops, n_samples),
        'Area': np.random.uniform(1.0, 500.0, n_samples),
        'Rainfall': np.random.uniform(200.0, 2500.0, n_samples),
        'Temperature': np.random.uniform(15.0, 35.0, n_samples),
        'Fertilizer_Usage': np.random.uniform(50.0, 300.0, n_samples),
        'Pesticide_Usage': np.random.uniform(5.0, 50.0, n_samples),
        'Year': np.random.randint(2010, 2025, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    base_yield = df['Area'] * 1.5 + (df['Fertilizer_Usage'] * 0.01) + (df['Rainfall'] * 0.001)
    noise = np.random.normal(0, 0.5, n_samples)
    df['Yield'] = np.clip(base_yield + noise, a_min=0.1, a_max=None)
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    print(f"Generated {filepath} with {len(df)} rows.")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, 'data')
    
    crop_path = os.path.join(data_dir, 'crop_recommendation.csv')
    yield_path = os.path.join(data_dir, 'crop_yield.csv')
    
    if not os.path.exists(crop_path):
        generate_crop_recommendation(crop_path)
    else:
        print(f"{crop_path} already exists.")
        
    if not os.path.exists(yield_path):
        generate_crop_yield(yield_path)
    else:
        print(f"{yield_path} already exists.")
