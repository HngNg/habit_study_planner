// frontend/src/hooks/useStreaks.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Streak } from '../db/db';

export const useStreaks = () => {
  const streaks = useLiveQuery(() => db.streaks.toArray());

  const getStreakByHabit = async (habitId: number): Promise<Streak | undefined> => {
    return await db.streaks.where('habitId').equals(habitId).first();
  };

  const getAllStreaksWithHabits = useLiveQuery(async () => {
    const allStreaks = await db.streaks.toArray();
    const streaksWithHabits = await Promise.all(
      allStreaks.map(async (streak) => {
        const habit = await db.habits.get(streak.habitId);
        return {
          ...streak,
          habitName: habit?.name || 'Unknown',
          habitColor: habit?.color || '#gray'
        };
      })
    );
    return streaksWithHabits;
  });

  const getTopStreaks = useLiveQuery(async () => {
    const allStreaks = await db.streaks.orderBy('currentStreak').reverse().limit(5).toArray();
    return Promise.all(
      allStreaks.map(async (streak) => {
        const habit = await db.habits.get(streak.habitId);
        return {
          ...streak,
          habitName: habit?.name || 'Unknown',
          habitIcon: habit?.icon || '📝'
        };
      })
    );
  });

  const getStreakStatus = (streak: Streak): 'active' | 'at-risk' | 'broken' => {
    if (!streak.lastCompletedDate) return 'broken';
    
    const lastDate = new Date(streak.lastCompletedDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return 'active';
    if (daysDiff === 1) return 'at-risk';
    return 'broken';
  };

  return {
    streaks,
    getAllStreaksWithHabits,
    getTopStreaks,
    getStreakByHabit,
    getStreakStatus
  };
};