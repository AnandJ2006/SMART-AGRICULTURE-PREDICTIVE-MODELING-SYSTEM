import React, { useState } from 'react';
import { predictYield } from '../services/api';

export default function YieldPrediction() {
  const [formData, setFormData] = useState({
    crop: 'rice', area: 2.5, rainfall: 1200, temperature: 25, fertilizer: 150, pesticide: 15, year: 2023
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const crops = [
    'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas',
    'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate',
    'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple',
    'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee'
  ];

  const handleChange = (e) => {
    const value = e.target.name === 'crop' ? e.target.value : (e.target.name === 'year' ? parseInt(e.target.value) : parseFloat(e.target.value) || 0);
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await predictYield(formData);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error predicting yield. Ensure the backend is running.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="page-title">Yield Prediction</h1>
      
      <div className="grid-cols-2">
        <div className="card">
          <h2 className="card-title">Input Parameters</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label>Crop Type</label>
                <select name="crop" value={formData.crop} onChange={handleChange} className="form-control capitalize" required>
                  {crops.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Area (hectares)</label>
                <input type="number" step="0.01" min="0.01" name="area" value={formData.area} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Rainfall (mm)</label>
                <input type="number" step="0.1" min="0" name="rainfall" value={formData.rainfall} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Fertilizer Usage (kg)</label>
                <input type="number" step="0.1" min="0" name="fertilizer" value={formData.fertilizer} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Pesticide Usage (kg)</label>
                <input type="number" step="0.1" min="0" name="pesticide" value={formData.pesticide} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="number" min="1990" name="year" value={formData.year} onChange={handleChange} className="form-control" required />
              </div>
            </div>
            
            {error && <div className="text-sm badge-error p-2 rounded mb-4 w-full text-center">{error}</div>}
            
            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict Yield'}
            </button>
          </form>
        </div>

        <div>
          {result && (
            <div className="card h-full flex flex-col justify-center items-center" style={{ borderTop: '4px solid var(--primary)', minHeight: '300px' }}>
              <div className="text-muted text-lg mb-2">Prediction Summary</div>
              <div className="text-xl font-bold mb-4 capitalize">Crop: {formData.crop}</div>
              
              <div className="text-5xl font-bold text-primary mb-2">
                {result.predicted_yield}
              </div>
              <div className="text-xl text-muted font-semibold mb-6">
                {result.unit}
              </div>
              
              <div className="w-full bg-gray-100 p-4 rounded-lg mt-2 text-sm text-center">
                <p className="font-bold mb-2">Model: {result.model}</p>
                <div className="flex justify-around mt-2">
                  <span><strong>R²:</strong> {result.r2}</span>
                  <span><strong>RMSE:</strong> {result.rmse}</span>
                  <span><strong>MAE:</strong> {result.mae}</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-center text-muted px-8">
                Based on the entered soil, weather and farm-management conditions, the model estimates a yield of {result.predicted_yield} {result.unit}.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
