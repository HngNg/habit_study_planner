
import { db } from '../db/db';

export const useStreaks = () => {
  const calculateStreak = async (habitId: number) => {
    const logs = await db.logs
      .where('habitId')
      .equals(habitId)
      .reverse()
      .sortBy('date');

    if (!logs || logs.length === 0) return 0;

    // Get unique dates
    const dates = Array.from(new Set(logs.map(log => log.date))).sort((a, b) => b.localeCompare(a));
    
    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If the most recent log is not today or yesterday, streak is broken (unless it's 0)
    if (dates[0] !== today && dates[0] !== yesterday) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date(dates[0]);

    // Check consecutive days
    for (let i = 0; i < dates.length; i++) {
      const logDate = new Date(dates[i]);
      
      // If this is the first iteration (most recent log)
      if (i === 0) {
        streak++;
        continue;
      }

      // Check if this log is exactly 1 day before the previous one processed
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(currentDate.getDate() - 1);
      
      if (logDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
        currentDate = logDate;
      } else {
        break;
      }
    }

    return streak;
  };

  return { calculateStreak };
};
