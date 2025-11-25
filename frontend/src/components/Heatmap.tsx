import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';


export const Heatmap: React.FC = () => {
  const logs = useLiveQuery(() => db.logs.toArray());

  if (!logs) return null;

  // Generate last 90 days
  const days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    return d.toISOString().split('T')[0];
  });

  // Count logs per day
  const counts = days.reduce((acc, date) => {
    acc[date] = logs.filter(log => log.date === date).length;
    return acc;
  }, {} as Record<string, number>);

  const getColor = (count: number) => {
    if (count === 0) return 'var(--bg-card)';
    if (count <= 2) return 'rgba(59, 130, 246, 0.4)';
    if (count <= 4) return 'rgba(59, 130, 246, 0.7)';
    return 'var(--primary)';
  };

  return (
    <div className="card" style={{ marginTop: '2rem', overflowX: 'auto' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Consistency Map</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(10px, 1fr))', 
        gap: '4px',
        height: '100px',
        width: '100%',
        minWidth: '300px'
      }}>
        {/* Simplified view: just a row of blocks for mobile MVP, or a grid if we want rows */}
        {/* For a true GitHub style, we need columns = weeks, rows = days. Let's do a simple linear strip for mobile first */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {days.map(date => (
            <div
              key={date}
              title={`${date}: ${counts[date]} habits`}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: getColor(counts[date]),
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        <span>Less</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--bg-card)' }} />
          <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(59, 130, 246, 0.4)' }} />
          <div style={{ width: '10px', height: '10px', backgroundColor: 'rgba(59, 130, 246, 0.7)' }} />
          <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--primary)' }} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
