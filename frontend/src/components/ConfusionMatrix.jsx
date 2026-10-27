import React from 'react';

export default function ConfusionMatrix({ matrix, classes }) {
  if (!matrix || !classes || matrix.length === 0) return <div>No data available</div>;

  let maxVal = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] > maxVal) {
        maxVal = matrix[i][j];
      }
    }
  }

  const getColor = (value) => {
    if (value === 0) return '#ffffff';
    const intensity = Math.min(1, Math.max(0.1, value / maxVal));
    return `rgba(22, 163, 74, ${intensity})`; // Primary green based
  };

  return (
    <div className="data-table-container pb-4">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ backgroundColor: '#f1f5f9', whiteSpace: 'nowrap', zIndex: 10 }}>
              True \ Pred
            </th>
            {classes.map((c) => (
              <th key={`h-${c}`} style={{ textAlign: 'center', backgroundColor: '#f1f5f9', padding: '0.25rem', minWidth: '40px' }} title={c}>
                {c.substring(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={`r-${i}`}>
              <td style={{ fontWeight: 600, backgroundColor: '#f1f5f9', padding: '0.5rem', whiteSpace: 'nowrap', borderRight: '1px solid var(--border-color)' }}>
                {classes[i]}
              </td>
              {row.map((cell, j) => (
                <td
                  key={`c-${i}-${j}`}
                  style={{
                    textAlign: 'center',
                    backgroundColor: getColor(cell),
                    color: (cell / maxVal) > 0.5 ? '#ffffff' : 'var(--text-main)',
                    padding: '0.25rem',
                    minWidth: '40px'
                  }}
                  title={`True: ${classes[i]}, Pred: ${classes[j]}, Count: ${cell}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-center text-sm text-muted">
        Hover over cells to see full class names and exact counts. Columns are abbreviated.
      </div>
    </div>
  );
}
