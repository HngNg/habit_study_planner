// frontend/src/components/HabitCard.tsx
import React, { useState, useEffect } from 'react';
import { type Habit, type HabitLog } from '../db/db';
import { useStreaks } from '../hooks/useStreaks';
import { StreakBadge } from './StreakBadge';
import { db } from '../db/db';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: number, completed: boolean) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: number) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  onComplete, 
  onEdit, 
  onDelete 
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [streak, setStreak] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { getStreakByHabit, getStreakStatus } = useStreaks();

  useEffect(() => {
    checkTodayCompletion();
    loadStreak();
  }, [habit.id]);

  const checkTodayCompletion = async () => {
    const today = new Date().toISOString().split('T')[0];
    const log = await db.habitLogs
      .where(['habitId', 'date'])
      .equals([habit.id!, today])
      .first();
    setIsCompleted(log?.completed || false);
  };

  const loadStreak = async () => {
    const streakData = await getStreakByHabit(habit.id!);
    setStreak(streakData);
  };

  const handleToggle = () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    onComplete(habit.id!, newStatus);
  };

  const streakStatus = streak ? getStreakStatus(streak) : 'broken';

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4"
      style={{ borderLeftColor: habit.color }}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${habit.color}20` }}
            >
              {habit.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-800">{habit.name}</h3>
              <p className="text-sm text-gray-500">{habit.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {habit.frequency === 'daily' ? '📅 Daily' : '📆 Weekly'}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {habit.category}
                </span>
              </div>
            </div>
          </div>

          {/* Completion Checkbox */}
          <button
            onClick={handleToggle}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
              isCompleted 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {isCompleted && '✓'}
          </button>
        </div>

        {/* Streak Display */}
        {streak && (
          <div className="mt-3">
            <StreakBadge 
              currentStreak={streak.currentStreak} 
              longestStreak={streak.longestStreak}
              status={streakStatus}
            />
          </div>
        )}

        {/* Atomic Habits Framework Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          {showDetails ? '▼' : '▶'} Atomic Habits Framework
        </button>

        {/* Atomic Habits Details */}
        {showDetails && (
          <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg text-sm">
            <div>
              <span className="font-semibold text-gray-700">🎯 Cue:</span>
              <p className="text-gray-600 ml-5">{habit.atomicCue}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">💭 Craving:</span>
              <p className="text-gray-600 ml-5">{habit.atomicCraving}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">⚡ Response:</span>
              <p className="text-gray-600 ml-5">{habit.atomicResponse}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">🎁 Reward:</span>
              <p className="text-gray-600 ml-5">{habit.atomicReward}</p>
            </div>
          </div>
        )}

        {/* Points Display */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="text-sm font-semibold text-gray-700">{habit.points} points</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(habit)}
                className="text-gray-500 hover:text-blue-600 p-1"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(habit.id!)}
                className="text-gray-500 hover:text-red-600 p-1"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};