import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getModelComparison, getConfusionMatrix } from '../services/api';
import ConfusionMatrix from '../components/ConfusionMatrix';

export default function ModelPerformance() {
  const [comparison, setComparison] = useState(null);
  const [confusionData, setConfusionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getModelComparison(),
      getConfusionMatrix()
    ]).then(([compRes, confRes]) => {
      setComparison(compRes.data);
      setConfusionData(confRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full">Loading metrics...</div>;
  if (!comparison || !confusionData) return <div className="flex justify-center items-center h-full text-error">Error loading metrics.</div>;

  const cropComparisonData = Object.keys(comparison.crop || {}).map(modelName => ({
    name: modelName,
    Accuracy: comparison.crop[modelName].accuracy * 100,
    F1_Score: comparison.crop[modelName].f1_score * 100,
    Precision: comparison.crop[modelName].precision * 100,
    Recall: comparison.crop[modelName].recall * 100
  }));

  const yieldComparisonData = Object.keys(comparison.yield || {}).map(modelName => ({
    name: modelName,
    R2_Score: comparison.yield[modelName].r2_score,
    RMSE: comparison.yield[modelName].rmse,
    MAE: comparison.yield[modelName].mae
  }));

  return (
    <div>
      <h1 className="page-title">Model Performance</h1>

      <div className="grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        <div className="card w-full">
          <h2 className="card-title">Crop Recommendation (Classification)</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={cropComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="Accuracy" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1_Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card w-full">
          <h2 className="card-title">Yield Prediction (Regression)</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={yieldComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="R2_Score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RMSE" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MAE" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Winning Crop Model Confusion Matrix</h2>
        <ConfusionMatrix matrix={confusionData.confusion_matrix} classes={confusionData.classes} />
      </div>
    </div>
  );
}
