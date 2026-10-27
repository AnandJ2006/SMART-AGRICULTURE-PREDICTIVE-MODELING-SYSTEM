import React, { useState } from 'react';
import { predictCrop } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CropPrediction() {
  const [formData, setFormData] = useState({
    nitrogen: 90, phosphorus: 42, potassium: 43, temperature: 20.8, humidity: 82.0, ph: 6.5, rainfall: 202.9
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await predictCrop(formData);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Error predicting crop. Ensure the backend is running.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="page-title">Crop Recommendation Prediction</h1>
      
      <div className="grid-cols-2">
        <div className="card">
          <h2 className="card-title">Input Parameters</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label>Nitrogen (N)</label>
                <input type="number" step="0.1" min="0" name="nitrogen" value={formData.nitrogen} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Phosphorous (P)</label>
                <input type="number" step="0.1" min="0" name="phosphorus" value={formData.phosphorus} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Potassium (K)</label>
                <input type="number" step="0.1" min="0" name="potassium" value={formData.potassium} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Humidity (%)</label>
                <input type="number" step="0.1" min="0" max="100" name="humidity" value={formData.humidity} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>pH Level</label>
                <input type="number" step="0.1" min="0" max="14" name="ph" value={formData.ph} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Rainfall (mm)</label>
                <input type="number" step="0.1" min="0" name="rainfall" value={formData.rainfall} onChange={handleChange} className="form-control" required />
              </div>
            </div>
            
            {error && <div className="text-sm badge-error p-2 rounded mb-4 w-full text-center">{error}</div>}
            
            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict Recommended Crop'}
            </button>
          </form>
        </div>

        <div>
          {result && (
            <div className="card h-full" style={{ borderTop: '4px solid var(--primary)' }}>
              <h2 className="card-title text-center">Prediction Result</h2>
              <div className="text-center my-6">
                <div className="text-muted text-lg mb-2">Recommended Crop</div>
                <div className="text-4xl font-bold text-primary capitalize mb-2">
                  {result.predicted_crop}
                </div>
                <div className="badge badge-success text-sm px-3 py-1 mt-2">
                  Confidence: {(result.confidence * 100).toFixed(2)}%
                </div>
              </div>

              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4 mt-8">Top Predictions Breakdown</h3>
              <div style={{ height: '200px', width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={result.top_predictions.map(item => ({ name: item.crop, Probability: item.probability * 100 }))} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} style={{ textTransform: 'capitalize' }} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => [`${value.toFixed(1)}%`, 'Probability']} contentStyle={{borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="Probability" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
