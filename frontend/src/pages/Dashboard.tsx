// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useHabitLog } from '../hooks/useHabitLog';
import { useStreaks } from '../hooks/useStreaks';
import { HabitCard } from '../components/HabitCard';
import { Heatmap } from '../components/Heatmap';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const Dashboard: React.FC = () => {
  const { habits, todayLogs, logHabit } = useHabitLog();
  const { getTopStreaks } = useStreaks();
  const topStreaks = getTopStreaks;
  
  const userProgress = useLiveQuery(() => db.userProgress.toCollection().first());
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    calculateTodayStats();
  }, [habits, todayLogs]);

  const calculateTodayStats = () => {
    if (!habits || !todayLogs) return;
    
    const total = habits.filter(h => h.frequency === 'daily').length;
    const completed = todayLogs.filter(log => log.completed).length;
    
    setTodayStats({ completed, total });
  };

  const handleHabitComplete = async (habitId: number, completed: boolean) => {
    await logHabit(habitId, completed);
  };

  const completionPercentage = todayStats.total > 0 
    ? Math.round((todayStats.completed / todayStats.total) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8dcc8] via-[#f0e6d6] to-[#f5ebe0] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#d4a574]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#c48d4f]">
                🎯 Dashboard
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {userProgress && (
              <div className="text-left md:text-right">
                <div className="flex items-center gap-2 md:justify-end">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Level {userProgress.level}</p>
                    <p className="text-xl font-bold text-[#c48d4f]">{userProgress.totalPoints} pts</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-48 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#c48d4f] to-[#d4a574] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(userProgress.totalPoints % 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    {100 - (userProgress.totalPoints % 100)} pts to Level {userProgress.level + 1}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Today's Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressCard
            title="Today's Progress"
            value={`${todayStats.completed}/${todayStats.total}`}
            percentage={completionPercentage}
            icon="📊"
            color="blue"
          />
          
          <ProgressCard
            title="Active Streaks"
            value={topStreaks?.filter(s => s.currentStreak > 0).length || 0}
            icon="🔥"
            color="orange"
          />
          
          <ProgressCard
            title="Badges Earned"
            value={userProgress?.badges.length || 0}
            icon="🏆"
            color="purple"
          />
        </div>

        {/* Daily Habits */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#d4a574]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <h2 className="text-2xl font-bold text-[#c48d4f]">📅 Today's Habits</h2>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#c48d4f] to-[#d4a574] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-sm font-bold text-[#c48d4f]">{completionPercentage}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits && habits.length > 0 ? (
              habits
                .filter(h => h.frequency === 'daily')
                .map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onComplete={handleHabitComplete}
                  />
                ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No habits yet!</p>
                <p className="text-gray-400 mt-2">Create your first habit to get started 🚀</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Streaks */}
        {topStreaks && topStreaks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#d4a574]">
            <h2 className="text-2xl font-bold text-[#c48d4f] mb-6">🔥 Top Streaks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topStreaks.map((streak, idx) => (
                <div 
                  key={streak.id}
                  className="bg-gradient-to-br from-[#f9f3eb] to-[#f5ebe0] p-4 rounded-xl border-2 border-[#d4a574] hover:shadow-lg transition-all hover:scale-105"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🔥'}</span>
                    <span className="text-lg">{streak.habitIcon}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm truncate">{streak.habitName}</p>
                  <p className="text-2xl font-bold text-[#c48d4f] mt-1">{streak.currentStreak} days</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heatmap */}
        <Heatmap />

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-[#c48d4f] to-[#d4a574] rounded-2xl shadow-lg p-8 text-white text-center border-2 border-[#b37d3f]">
          <p className="text-2xl font-bold mb-3">
            "You do not rise to the level of your goals. You fall to the level of your systems."
          </p>
          <p className="text-[#f9f3eb] font-medium">— James Clear, Atomic Habits</p>
        </div>
      </div>
    </div>
  );
};

const ProgressCard: React.FC<{
  title: string;
  value: number | string;
  percentage?: number;
  icon: string;
  color: 'blue' | 'orange' | 'purple';
}> = ({ title, value, percentage, icon, color }) => {
  const colorClasses = {
    blue: 'from-[#e8f3f9] to-[#d1e7f5]',
    orange: 'from-[#f9f3eb] to-[#f5ebe0]',
    purple: 'from-[#f3e8f9] to-[#e5d1f5]'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-md p-6 border-2 border-[#d4a574] hover:shadow-lg transition-all hover:scale-105`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-700 font-bold text-sm">{title}</p>
        <span className="text-4xl">{icon}</span>
      </div>
      <p className="text-4xl font-bold text-[#c48d4f]">{value}</p>
      {percentage !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#c48d4f] to-[#d4a574] h-3 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};