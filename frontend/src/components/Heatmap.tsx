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

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-200 dark:bg-slate-700';
    if (count === 1) return 'bg-indigo-300 dark:bg-indigo-800';
    if (count <= 2) return 'bg-indigo-400 dark:bg-indigo-700';
    if (count <= 4) return 'bg-indigo-500 dark:bg-indigo-600';
    return 'bg-indigo-600 dark:bg-indigo-500'; // Perfect day - deep indigo
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mt-6 shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
      <h3 className="text-base font-semibold text-text-primary mb-1 tracking-tight">
        Consistency Map
      </h3>
      <p className="text-xs text-text-secondary mb-4">
        Each block is a day you cast a vote for your identity. Gaps show where the chain broke.
      </p>
      <div className="flex gap-1 flex-wrap">
        {days.map(date => (
          <div
            key={date}
            title={`${date}: ${counts[date] || 0} habits`}
            className={`w-3 h-3 rounded-sm transition-colors ${getColorClass(counts[date] || 0)}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-text-secondary mt-3">
        <span>Less</span>
        <div className="flex gap-0.5 items-center">
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-300 dark:bg-indigo-800" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400 dark:bg-indigo-700" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 dark:bg-indigo-600" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 dark:bg-indigo-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
