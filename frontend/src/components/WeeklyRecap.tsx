import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Trophy, Target, Flame } from 'lucide-react';

export const WeeklyRecap: React.FC = () => {
  const logs = useLiveQuery(() => db.logs.toArray());
  const habits = useLiveQuery(() => db.habits.filter(h => !h.archived).toArray());

  if (!logs || !habits) return null;

  // Calculate week range (last 7 days including today)
  const today = new Date();
  const weekDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    weekDates.push(date.toISOString().split('T')[0]);
  }

  // Filter logs for this week
  const weekLogs = logs.filter(log => weekDates.includes(log.date));
  
  // Calculate totals: count full completions this week
  const totalCompletions = weekLogs.filter(log => log.type === 'full').length;

  // Calculate completion rate: days with at least one completion / 7
  const daysWithCompletions = new Set(
    weekLogs.filter(log => log.type === 'full').map(log => log.date)
  ).size;
  const completionRate = Math.round((daysWithCompletions / 7) * 100);

  // Calculate longest streak across all habits
  const calculateStreakForHabit = (habitId: number): number => {
    const habitLogs = logs
      .filter(log => log.habitId === habitId && log.type === 'full')
      .map(log => log.date);
    
    if (habitLogs.length === 0) return 0;

    // Get unique dates sorted descending
    const dates = Array.from(new Set(habitLogs)).sort((a, b) => b.localeCompare(a));
    
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If most recent log is not today or yesterday, streak is broken
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date(dates[0]);

    for (let i = 0; i < dates.length; i++) {
      const logDate = new Date(dates[i]);
      
      if (i === 0) {
        streak++;
        continue;
      }

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

  const longestStreak = habits.reduce((max, habit) => {
    if (!habit.id) return max;
    const streak = calculateStreakForHabit(habit.id);
    return Math.max(max, streak);
  }, 0);

  // Don't show if no data
  if (totalCompletions === 0 && longestStreak === 0) return null;

  return (
    <div className="card" style={{ 
      marginTop: '2rem', 
      marginBottom: '2rem',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: '1rem' 
      }}>
        <Trophy size={20} style={{ color: 'var(--primary)' }} />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
          Weekly Recap
        </h3>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '1rem' 
      }}>
        {/* Total Completions */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.25rem' 
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)', 
            fontWeight: 500 
          }}>
            Total Completions
          </div>
          <div style={{ 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Target size={20} style={{ color: 'var(--primary)' }} />
            {totalCompletions}
          </div>
        </div>

        {/* Completion Rate */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.25rem' 
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)', 
            fontWeight: 500 
          }}>
            Completion Rate
          </div>
          <div style={{ 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            color: completionRate >= 70 ? 'var(--success)' : completionRate >= 50 ? 'var(--primary)' : 'var(--text-secondary)'
          }}>
            {completionRate}%
          </div>
        </div>

        {/* Longest Streak */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.25rem' 
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)', 
            fontWeight: 500 
          }}>
            Longest Streak
          </div>
          <div style={{ 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            color: 'var(--text-accent)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Flame size={20} fill="currentColor" style={{ color: 'var(--text-accent)' }} />
            {longestStreak}
          </div>
        </div>
      </div>

      {completionRate >= 70 && (
        <div style={{ 
          marginTop: '1rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid rgba(59, 130, 246, 0.2)',
          fontSize: '0.875rem',
          color: 'var(--success)',
          fontWeight: 500,
          textAlign: 'center'
        }}>
          🎉 Excellent consistency this week!
        </div>
      )}
    </div>
  );
};

