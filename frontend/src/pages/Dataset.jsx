import React, { useState, useEffect } from 'react';
import { getDatasetSummary, getYieldDatasetSummary } from '../services/api';

export default function Dataset() {
  const [cropSummary, setCropSummary] = useState(null);
  const [yieldSummary, setYieldSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDatasetSummary(),
      getYieldDatasetSummary()
    ]).then(([cropRes, yieldRes]) => {
      setCropSummary(cropRes.data);
      setYieldSummary(yieldRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full">Loading dataset information...</div>;
  if (!cropSummary || !yieldSummary) return <div className="flex justify-center items-center h-full text-error">Failed to load dataset summary.</div>;

  return (
    <div>
      <h1 className="page-title">Dataset Summary</h1>
      
      <h2 className="text-xl font-bold mb-4">Crop Recommendation Dataset (Classification)</h2>
      <div className="grid-cols-4 mb-6">
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Total Rows</div>
          <div className="text-4xl font-bold text-primary">{cropSummary.row_count}</div>
        </div>
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Total Features</div>
          <div className="text-4xl font-bold text-primary">{cropSummary.feature_count}</div>
        </div>
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Missing Values</div>
          <div className={`text-4xl font-bold ${cropSummary.missing_values > 0 ? 'text-[#ef4444]' : 'text-primary'}`}>
            {cropSummary.missing_values}
          </div>
        </div>
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Duplicate Rows</div>
          <div className={`text-4xl font-bold ${cropSummary.duplicate_count > 0 ? 'text-[#ef4444]' : 'text-primary'}`}>
            {cropSummary.duplicate_count}
          </div>
        </div>
      </div>

      <div className="grid-cols-2 mb-8">
        <div className="card">
          <h2 className="card-title">Feature Datatypes</h2>
          <div className="data-table-container max-h-60 overflow-y-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Data Type</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cropSummary.column_datatypes).map(([col, dtype]) => (
                  <tr key={col}>
                    <td className="font-semibold">{col}</td>
                    <td className="text-muted">{dtype}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Unique Classes Target (label)</h2>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
            {cropSummary.class_labels.map(label => (
              <span key={label} className="badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 mt-8 pt-4 border-t border-gray-200">Crop Yield Dataset (Regression)</h2>
      <div className="grid-cols-4 mb-6">
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Total Rows</div>
          <div className="text-4xl font-bold text-primary">{yieldSummary.row_count}</div>
        </div>
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Total Features</div>
          <div className="text-4xl font-bold text-primary">{yieldSummary.feature_count}</div>
        </div>
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Missing Values</div>
          <div className={`text-4xl font-bold ${yieldSummary.missing_values > 0 ? 'text-[#ef4444]' : 'text-primary'}`}>
            {yieldSummary.missing_values}
          </div>
        </div>
        <div className="card text-center hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Target Variable</div>
          <div className="text-4xl font-bold text-primary tracking-tighter">
            {yieldSummary.target_variable}
          </div>
        </div>
      </div>

      <div className="card mb-8 w-1/2">
        <h2 className="card-title">Feature Datatypes</h2>
        <div className="data-table-container max-h-60 overflow-y-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature Name</th>
                <th>Data Type</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(yieldSummary.column_datatypes).map(([col, dtype]) => (
                <tr key={col}>
                  <td className="font-semibold">{col}</td>
                  <td className="text-muted">{dtype}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
