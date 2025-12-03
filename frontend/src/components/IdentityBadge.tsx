import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, User } from 'lucide-react';

interface IdentityBadgeProps {
  identity: string | null;
  progress: number;
  completedToday: number;
  totalHabits: number;
  isEditing: boolean;
  onEditClick: () => void;
  onSave: () => void;
  onCancel: () => void;
  draft: string;
  onDraftChange: (value: string) => void;
}

export const IdentityBadge: React.FC<IdentityBadgeProps> = ({
  identity,
  progress,
  completedToday,
  totalHabits,
  isEditing,
  onEditClick,
  onSave,
  onCancel,
  draft,
  onDraftChange,
}) => {
  const completionPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
  const circumference = 2 * Math.PI * 20; // radius = 20
  const offset = circumference - (completionPercentage / 100) * circumference;

  const identityText = identity
    ? identity.toLowerCase().startsWith('i am ')
      ? identity
      : `I am ${identity}`
    : 'Define your identity to frame your habits.';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6"
    >
      {!isEditing ? (
        <div className="flex items-start gap-4">
          {/* Circular Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
              {/* Background circle */}
              <circle
                cx="22"
                cy="22"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-slate-200 dark:text-slate-700"
              />
              {/* Progress circle */}
              <motion.circle
                cx="22"
                cy="22"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                className="text-success-DEFAULT"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                strokeDasharray={circumference}
              />
            </svg>
            {/* Center icon/text */}
            <div className="absolute inset-0 flex items-center justify-center">
              {completedToday > 0 ? (
                <span className="text-xs font-bold text-success-DEFAULT">
                  {completedToday}/{totalHabits}
                </span>
              ) : (
                <User size={16} className="text-slate-400" />
              )}
            </div>
          </div>

          {/* Identity Text */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-text-primary tracking-tight mb-1">
              Today
            </h2>
            <p className="text-sm text-text-secondary mb-2">
              {identityText}
            </p>
            {identity && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-success-light dark:bg-success-DEFAULT/20 text-success-DEFAULT text-xs font-medium">
                  Identity progress: {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <button
            onClick={onEditClick}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary hover:text-text-primary transition-colors touch-target"
            aria-label={identity ? 'Edit identity' : 'Set identity'}
          >
            <Edit2 size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <label
            htmlFor="identity-input"
            className="block text-xs font-medium text-text-secondary"
          >
            Identity statement (e.g., "I am a consistent learner")
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              id="identity-input"
              type="text"
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
              placeholder="I am..."
              autoFocus
            />
            <button
              onClick={onSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-DEFAULT rounded-lg hover:bg-primary-hover transition-colors touch-target"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-text-secondary bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors touch-target"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

