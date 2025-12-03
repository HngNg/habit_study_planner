import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  habitId: number;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ habitId }) => {
  const streak = useLiveQuery(async () => {
    const logs = await db.logs
      .where('habitId')
      .equals(habitId)
      .reverse()
      .sortBy('date');

    if (!logs || logs.length === 0) return 0;

    const dates = Array.from(new Set(logs.map(log => log.date))).sort((a, b) => b.localeCompare(a));
    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let currentStreak = 0;
    let currentDate = new Date(dates[0]);

    for (let i = 0; i < dates.length; i++) {
      const logDate = new Date(dates[i]);
      if (i === 0) {
        currentStreak++;
        continue;
      }
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - 1);
      
      if (logDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        currentStreak++;
        currentDate = logDate;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [habitId]);

  if (!streak || streak === 0) return null;

  return (
    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm font-bold">
      <Flame size={16} className="fill-current" />
      <span>{streak}</span>
    </div>
  );
};
