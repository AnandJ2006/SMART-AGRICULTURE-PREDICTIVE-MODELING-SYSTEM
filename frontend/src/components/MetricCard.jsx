import React from 'react';

export default function MetricCard({ title, value, icon, subtitle }) {
  return (
    <div className="card flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">{title}</div>
        <div className="text-3xl font-bold text-main mb-1">
          {value}
        </div>
        {subtitle && <div className="text-sm text-muted">{subtitle}</div>}
      </div>
      <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '50%', color: 'var(--primary)' }}>
        {icon}
      </div>
    </div>
  );
}
