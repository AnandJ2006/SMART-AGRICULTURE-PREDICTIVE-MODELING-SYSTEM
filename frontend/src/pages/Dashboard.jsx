import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import { Sprout, Tractor, Database, Activity } from 'lucide-react';
import { getDatasetSummary, getModelPerformance } from '../services/api';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [datasetSummary, setDatasetSummary] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDatasetSummary(),
      getModelPerformance()
    ]).then(([datasetRes, metricsRes]) => {
      setDatasetSummary(datasetRes.data);
      setModelMetrics(metricsRes.data);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading dashboard data:", err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full">Loading Dashboard...</div>;

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      <div className="grid-cols-4 mb-6">
        <MetricCard 
          title="Total Records" 
          value={datasetSummary ? datasetSummary.row_count : '-'} 
          icon={<Database size={28} />} 
          subtitle={`${datasetSummary?.feature_count || '-'} features`} 
        />
        <MetricCard 
          title="Total Classes" 
          value={datasetSummary ? datasetSummary.class_labels.length : '-'} 
          icon={<Sprout size={28} />} 
          subtitle="Unique crops supported" 
        />
        <MetricCard 
          title="Best Crop Model" 
          value={modelMetrics ? modelMetrics.crop_model.best_model : '-'} 
          icon={<Activity size={28} />} 
          subtitle="Top performer" 
        />
        <MetricCard 
          title="Yield Model R²" 
          value={modelMetrics ? parseFloat(modelMetrics.yield_model.r2_score).toFixed(4) : '-'} 
          icon={<Tractor size={28} />} 
          subtitle="Random Forest Regressor" 
        />
      </div>

      <div className="grid-cols-2">
        <div className="card flex" style={{ flexDirection: 'column' }}>
          <h2 className="card-title">Crop Recommendation System</h2>
          <p className="text-muted flex-1 mb-4">
            Predicts the most suitable crop based on soil and weather conditions (N, P, K, Temperature, Humidity, pH, Rainfall).
            The current best performing model is <strong className="text-main">{modelMetrics?.crop_model.best_model || '...'}</strong> with an accuracy of <strong className="text-primary">{modelMetrics ? (modelMetrics.crop_model.metrics.accuracy * 100).toFixed(2) : '...'}%</strong>.
          </p>
          <Link to="/predict/crop" className="btn-primary w-full">Try Crop Prediction</Link>
        </div>
        
        <div className="card flex" style={{ flexDirection: 'column' }}>
          <h2 className="card-title">Yield Prediction System</h2>
          <p className="text-muted flex-1 mb-4">
            Estimates the yield (in tonnes/hectare) of various crops based on Area, Rainfall, Temperature, Fertilizer, and Pesticide usage.
            The model achieves a Mean Absolute Error (MAE) of <strong className="text-main">{modelMetrics ? parseFloat(modelMetrics.yield_model.mae).toFixed(2) : '...'}</strong>.
          </p>
          <Link to="/predict/yield" className="btn-primary w-full">Try Yield Prediction</Link>
        </div>
      </div>
    </div>
  );
}
