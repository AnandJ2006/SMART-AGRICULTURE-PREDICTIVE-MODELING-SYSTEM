import React, { useState, useEffect } from 'react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { getCropDistribution, getCorrelation, getYieldEDA } from '../services/api';

export default function EDA() {
  const [distribution, setDistribution] = useState([]);
  const [correlation, setCorrelation] = useState(null);
  const [yieldEDA, setYieldEDA] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCropDistribution(),
      getCorrelation(),
      getYieldEDA()
    ]).then(([distRes, corrRes, yieldRes]) => {
      // Format distribution for Recharts
      const distData = Object.entries(distRes.data.crop_distribution).map(([name, value]) => ({
        name,
        value
      }));
      setDistribution(distData);
      setCorrelation(corrRes.data);
      setYieldEDA(yieldRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full">Loading Exploratory Data Analysis...</div>;
  if (!correlation || !yieldEDA) return <div className="flex justify-center items-center h-full text-error">Error loading EDA data.</div>;

  const yieldImportanceData = yieldEDA.feature_importance 
    ? Object.entries(yieldEDA.feature_importance).map(([name, value]) => ({ name, value: value * 100 })).sort((a,b) => b.value - a.value).slice(0, 8)
    : [];

  return (
    <div>
      <h1 className="page-title">Exploratory Data Analysis</h1>
      
      <h2 className="text-2xl font-bold mb-4 mt-6">Crop Recommendation</h2>
      <div className="card mb-6">
        <h2 className="card-title">Crop Class Distribution</h2>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={distribution} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} tick={{fontSize: 11}} tickLine={false} axisLine={false} style={{ textTransform: 'capitalize' }} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mb-10">
        <h2 className="card-title">Pearson Feature Correlation Matrix (Crop Dataset)</h2>
        <div className="data-table-container pb-4">
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: '#f1f5f9' }}></th>
                {correlation.features.map(f => (
                  <th key={f} style={{ textAlign: 'center', backgroundColor: '#f1f5f9', padding: '0.5rem' }}>{f.substring(0, 4)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlation.features.map((f1, i) => (
                <tr key={f1}>
                  <td style={{ fontWeight: 600, backgroundColor: '#f1f5f9', padding: '0.5rem', borderRight: '1px solid var(--border-color)' }}>{f1}</td>
                  {correlation.correlation_matrix[i].map((val, j) => {
                    const f2 = correlation.features[j];
                    const getBg = (v) => {
                      if (v === 1) return `rgba(22, 163, 74, 1)`;
                      if (v > 0) return `rgba(22, 163, 74, ${Math.max(0.1, v)})`;
                      if (v < 0) return `rgba(239, 68, 68, ${Math.max(0.1, Math.abs(v))})`;
                      return '#ffffff';
                    };
                    return (
                      <td key={f2} style={{ textAlign: 'center', backgroundColor: getBg(val), color: Math.abs(val) > 0.5 ? 'white' : 'var(--text-main)', padding: '0.5rem', minWidth: '40px' }} title={`${f1} vs ${f2}: ${val.toFixed(4)}`}>
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 pt-4 border-t border-gray-200">Yield Prediction</h2>
      
      <div className="grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <h2 className="card-title">Yield vs Rainfall</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="Rainfall" name="Rainfall" unit="mm" tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="Yield" name="Yield" unit="t/ha" tickLine={false} axisLine={false} />
                <ZAxis type="number" range={[20]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Yield vs Rainfall" data={yieldEDA.scatter_data} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Yield vs Temperature</h2>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="Temperature" name="Temperature" unit="°C" tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="Yield" name="Yield" unit="t/ha" tickLine={false} axisLine={false} />
                <ZAxis type="number" range={[20]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Yield vs Temperature" data={yieldEDA.scatter_data} fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <h2 className="card-title">Feature Importance (Top 8)</h2>
          <div style={{ height: '300px', width: '100%' }}>
            {yieldImportanceData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={yieldImportanceData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-muted">Feature importance not available.</div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Pearson Feature Correlation Matrix (Yield Dataset)</h2>
          <div className="data-table-container pb-4 max-h-80 overflow-y-auto">
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#f1f5f9' }}></th>
                  {yieldEDA.correlation.features.map(f => (
                    <th key={f} style={{ textAlign: 'center', backgroundColor: '#f1f5f9', padding: '0.5rem' }}>{f.substring(0, 4)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yieldEDA.correlation.features.map((f1, i) => (
                  <tr key={f1}>
                    <td style={{ fontWeight: 600, backgroundColor: '#f1f5f9', padding: '0.5rem', borderRight: '1px solid var(--border-color)' }}>{f1}</td>
                    {yieldEDA.correlation.correlation_matrix[i].map((val, j) => {
                      const f2 = yieldEDA.correlation.features[j];
                      const getBg = (v) => {
                        if (v === 1) return `rgba(22, 163, 74, 1)`;
                        if (v > 0) return `rgba(22, 163, 74, ${Math.max(0.1, v)})`;
                        if (v < 0) return `rgba(239, 68, 68, ${Math.max(0.1, Math.abs(v))})`;
                        return '#ffffff';
                      };
                      return (
                        <td key={f2} style={{ textAlign: 'center', backgroundColor: getBg(val), color: Math.abs(val) > 0.5 ? 'white' : 'var(--text-main)', padding: '0.5rem', minWidth: '40px' }} title={`${f1} vs ${f2}: ${val.toFixed(4)}`}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
