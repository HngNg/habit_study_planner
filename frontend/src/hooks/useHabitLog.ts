// frontend/src/hooks/useHabitLog.ts
import { useState, useEffect } from 'react';
import { db, type Habit, type HabitLog, type Streak } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useHabitLog = () => {
  const [loading, setLoading] = useState(false);

  // Real-time queries
  const habits = useLiveQuery(() => db.habits.toArray());
  const todayLogs = useLiveQuery(() => {
    const today = new Date().toISOString().split('T')[0];
    return db.habitLogs.where('date').equals(today).toArray();
  });

  // Create new habit with Atomic Habits framework
  const createHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'points'>) => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      const habitId = await db.habits.add({
        ...habitData,
        points: 0,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending'
      });

      // Initialize streak for this habit
      await db.streaks.add({
        habitId: Number(habitId),
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: '',
        updatedAt: now
      });

      return habitId;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Log habit completion
  const logHabit = async (
    habitId: number, 
    completed: boolean, 
    notes?: string, 
    duration?: number,
    mood?: 'excellent' | 'good' | 'okay' | 'bad'
  ) => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already logged today
      const existingLog = await db.habitLogs
        .where(['habitId', 'date'])
        .equals([habitId, today])
        .first();

      if (existingLog) {
        // Update existing log
        await db.habitLogs.update(existingLog.id!, {
          completed,
          notes,
          duration,
          mood,
          syncStatus: 'pending'
        });
      } else {
        // Create new log
        await db.habitLogs.add({
          habitId,
          date: today,
          completed,
          notes,
          duration,
          mood,
          createdAt: new Date().toISOString(),
          syncStatus: 'pending'
        });
      }

      // Update streak
      if (completed) {
        await updateStreak(habitId, today);
        await awardPoints(habitId, 10); // Base points for completion
      }

      return true;
    } catch (error) {
      console.error('Error logging habit:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update streak logic
  const updateStreak = async (habitId: number, completedDate: string) => {
    const streak = await db.streaks.where('habitId').equals(habitId).first();
    if (!streak) return;

    const lastDate = new Date(streak.lastCompletedDate);
    const currentDate = new Date(completedDate);
    const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = streak.currentStreak;

    if (daysDiff === 1) {
      // Consecutive day
      newStreak += 1;
    } else if (daysDiff === 0) {
      // Same day, no change
      newStreak = streak.currentStreak;
    } else {
      // Streak broken
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, streak.longestStreak);

    await db.streaks.update(streak.id!, {
      currentStreak: newStreak,
      longestStreak,
      lastCompletedDate: completedDate,
      updatedAt: new Date().toISOString()
    });

    // Award bonus points for streak milestones
    if (newStreak % 7 === 0) {
      await awardPoints(habitId, 50); // Weekly streak bonus
    }
    if (newStreak % 30 === 0) {
      await awardPoints(habitId, 200); // Monthly streak bonus
    }
  };

  // Award points and update level
  const awardPoints = async (habitId: number, points: number) => {
    // Update habit points
    const habit = await db.habits.get(habitId);
    if (habit) {
      await db.habits.update(habitId, {
        points: habit.points + points,
        updatedAt: new Date().toISOString()
      });
    }

    // Update user progress
    const progress = await db.userProgress.toCollection().first();
    if (progress) {
      const newTotal = progress.totalPoints + points;
      const newLevel = Math.floor(newTotal / 100) + 1; // Level up every 100 points

      await db.userProgress.update(progress.id!, {
        totalPoints: newTotal,
        level: newLevel,
        updatedAt: new Date().toISOString()
      });

      // Check for new badges
      await checkBadges(newTotal, newLevel);
    }
  };

  // Badge system
  const checkBadges = async (totalPoints: number, level: number) => {
    const progress = await db.userProgress.toCollection().first();
    if (!progress) return;

    const badges = [...progress.badges];
    const allStreaks = await db.streaks.toArray();

    // Badge conditions
    const badgeConditions = [
      { id: 'first_habit', condition: (await db.habits.count()) >= 1, name: 'First Step' },
      { id: 'week_warrior', condition: allStreaks.some(s => s.currentStreak >= 7), name: 'Week Warrior' },
      { id: 'month_master', condition: allStreaks.some(s => s.currentStreak >= 30), name: 'Month Master' },
      { id: 'level_5', condition: level >= 5, name: 'Rising Star' },
      { id: 'level_10', condition: level >= 10, name: 'Habit Hero' },
      { id: 'points_500', condition: totalPoints >= 500, name: 'Point Collector' },
      { id: 'points_1000', condition: totalPoints >= 1000, name: 'Point Master' }
    ];

    let newBadges = false;
    for (const badge of badgeConditions) {
      if (badge.condition && !badges.includes(badge.id)) {
        badges.push(badge.id);
        newBadges = true;
      }
    }

    if (newBadges) {
      await db.userProgress.update(progress.id!, { badges });
    }
  };

  // Delete habit
  const deleteHabit = async (habitId: number) => {
    try {
      setLoading(true);
      await db.habits.delete(habitId);
      await db.habitLogs.where('habitId').equals(habitId).delete();
      await db.streaks.where('habitId').equals(habitId).delete();
      await db.reminders.where('habitId').equals(habitId).delete();
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get habit statistics
  const getHabitStats = async (habitId: number, days: number = 30) => {
    const logs = await db.habitLogs
      .where('habitId')
      .equals(habitId)
      .reverse()
      .limit(days)
      .toArray();

    const completed = logs.filter(l => l.completed).length;
    const completionRate = logs.length > 0 ? (completed / logs.length) * 100 : 0;
    const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);

    return {
      totalLogs: logs.length,
      completed,
      completionRate,
      totalDuration,
      averageDuration: logs.length > 0 ? totalDuration / logs.length : 0
    };
  };

  return {
    habits,
    todayLogs,
    loading,
    createHabit,
    logHabit,
    deleteHabit,
    getHabitStats
  };
};