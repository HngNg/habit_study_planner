// frontend/src/components/StreakBadge.tsx
import React from 'react';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  status: 'active' | 'at-risk' | 'broken';
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ 
  currentStreak, 
  longestStreak,
  status 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300';
      case 'at-risk': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'broken': return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusEmoji = () => {
    switch (status) {
      case 'active': return '🔥';
      case 'at-risk': return '⚠️';
      case 'broken': return '💤';
    }
  };

  const getStreakLevel = (streak: number) => {
    if (streak >= 100) return { emoji: '👑', label: 'Legendary' };
    if (streak >= 50) return { emoji: '💎', label: 'Diamond' };
    if (streak >= 30) return { emoji: '🌟', label: 'Champion' };
    if (streak >= 14) return { emoji: '⭐', label: 'Rising Star' };
    if (streak >= 7) return { emoji: '✨', label: 'Week Warrior' };
    if (streak >= 3) return { emoji: '🔥', label: 'On Fire' };
    return { emoji: '🌱', label: 'Getting Started' };
  };

  const level = getStreakLevel(currentStreak);

  return (
    <div className="space-y-2">
      {/* Current Streak */}
      <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${getStatusColor()}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getStatusEmoji()}</span>
          <div>
            <p className="text-xs font-medium opacity-75">Current Streak</p>
            <p className="text-lg font-bold">{currentStreak} days</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium opacity-75">Level</p>
          <p className="text-sm font-semibold flex items-center gap-1">
            {level.emoji} {level.label}
          </p>
        </div>
      </div>

      {/* Longest Streak */}
      {longestStreak > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
          <span className="text-xs text-purple-700 font-medium">🏆 Best Streak</span>
          <span className="text-sm font-bold text-purple-900">{longestStreak} days</span>
        </div>
      )}

      {/* Progress to Next Milestone */}
      {currentStreak < 100 && (
        <StreakProgress currentStreak={currentStreak} />
      )}
    </div>
  );
};

const StreakProgress: React.FC<{ currentStreak: number }> = ({ currentStreak }) => {
  const milestones = [3, 7, 14, 30, 50, 100];
  const nextMilestone = milestones.find(m => m > currentStreak) || 100;
  const progress = (currentStreak / nextMilestone) * 100;

  return (
    <div className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-blue-700 font-medium">Next Milestone</span>
        <span className="text-xs text-blue-900 font-bold">{nextMilestone} days</span>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="text-xs text-blue-600 mt-1 text-center">
        {nextMilestone - currentStreak} days to go!
      </p>
    </div>
  );
};