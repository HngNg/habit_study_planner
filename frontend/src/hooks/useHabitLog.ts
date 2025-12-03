import { useCallback } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useHabitLog = () => {
  const today = new Date().toISOString().split('T')[0];

  const logHabit = useCallback(async (habitId: number, type: 'full' | 'tiny', value?: number) => {
    await db.logs.add({
      habitId,
      date: today,
      type,
      value,
      createdAt: new Date()
    });
  }, [today]);



  // Live query to get all logs for today (for UI updates)
  const todayLogs = useLiveQuery(
    () => db.logs.where('date').equals(today).toArray(),
    [today]
  );

  const isHabitCompletedToday = (habitId: number) => {
    // A habit is "done" for Today only if there is at least one FULL log.
    // Tiny logs represent partial progress and should not flip the main check state.
    return todayLogs?.some(log => log.habitId === habitId && log.type === 'full');
  };

  return {
    logHabit,
    isHabitCompletedToday,
    todayLogs
  };
};
