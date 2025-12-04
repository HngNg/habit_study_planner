import React, { useState } from 'react';
import type { Habit } from '../db/db';
import { Check, Zap, Timer, Pin, Pencil, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreakBadge } from './StreakBadge';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { cn } from '../lib/utils';
import { triggerConfetti } from '../utils/celebration';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: (habit: Habit) => void;
  onTiny: (habit: Habit) => void;
  onFocus: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  isCompleted, 
  onComplete, 
  onTiny, 
  onFocus, 
  onEdit, 
  onDelete 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's logs for this habit to calculate total minutes
  const todayLogs = useLiveQuery(
    async () => {
      if (!habit.id) return [];
      return await db.logs.where('habitId').equals(habit.id).and(log => log.date === today).toArray();
    },
    [habit.id, today]
  ) || [];

  // Calculate total minutes logged today from timer sessions
  const totalMinutesToday = todayLogs
    .filter(log => log.value && log.value > 0)
    .reduce((sum, log) => sum + (log.value || 0), 0);

  const handleCompleteClick = () => {
    if (!isCompleted) {
      setIsAnimating(true);
      triggerConfetti('medium');
      onComplete(habit);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const handleTinyClick = () => {
    triggerConfetti('light');
    onTiny(habit);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1,
        scale: isAnimating ? 0.95 : 1,
      }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={cn(
        "relative bg-white dark:bg-slate-900 rounded-lg p-4 mb-4 shadow-sm border transition-all duration-300",
        habit.pinned && !isCompleted && "border-l-4 border-primary bg-amber-50/50 dark:bg-amber-900/10",
        isCompleted && "bg-[#10b981]/10 dark:bg-[#10b981]/20 border-2 border-[#10b981]/30"
      )}
    >
      {/* Law 1: Make it Obvious - Pinned indicator */}
      {habit.pinned && (
        <div className="absolute top-3 right-3">
          <Pin 
            size={14} 
            className="text-primary fill-primary"
            aria-label="Pinned habit"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-3 pr-8">
        {/* Left: Content */}
        <div className="flex-1 min-w-0">
          {/* Title with Streak */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <motion.h3
              animate={{ 
                opacity: isCompleted ? 0.7 : 1
              }}
              className={cn(
                "text-base font-semibold tracking-tight transition-all",
                isCompleted ? "text-[#10b981]" : "text-text-primary"
              )}
            >
              {habit.title.trim()}
            </motion.h3>
            {habit.id && <StreakBadge habitId={habit.id} />}
          </div>

          {/* Law 1: Cue - Secondary, italic */}
          <p className={cn(
            "text-sm italic mb-2 transition-colors",
            isCompleted ? "text-[#10b981]/70" : "text-text-secondary"
          )}>
            {habit.cue.trim()}
          </p>

          {/* Law 2: Temptation Bundle */}
          {habit.temptationBundle && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center gap-1.5 text-xs mb-2",
                isCompleted ? "text-[#10b981]/60" : "text-amber-600 dark:text-amber-400"
              )}
            >
              <Sparkles size={12} />
              <span>{habit.temptationBundle}</span>
            </motion.div>
          )}

          {/* Timer info - only show when not completed and has minutes */}
          {!isCompleted && totalMinutesToday > 0 && (
            <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
              <span className="flex items-center gap-1 text-primary font-medium">
                <Timer size={12} />
                {totalMinutesToday} min
              </span>
            </div>
          )}

          {/* Completion message */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mt-3 px-3 py-2 bg-[#10b981]/10 dark:bg-[#10b981]/20 rounded-lg border border-[#10b981]/20"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Sparkles size={16} className="text-[#10b981]" />
                </motion.div>
                <span className="text-sm font-semibold text-[#10b981]">
                  Completed for today!
                </span>
                {totalMinutesToday > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-[#10b981]/70 font-medium">
                    <Timer size={12} />
                    {totalMinutesToday} min focused
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Edit/Delete - Secondary */}
          {!isCompleted && (
            <div className="flex flex-col gap-1.5">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(148, 163, 184, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(habit)}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary transition-all touch-target relative group"
                aria-label="Edit habit"
              >
                <Pencil size={14} className="relative z-10" />
                <span className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out tooltip-enter">
                  Edit habit
                  <div className="absolute top-full left-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-slate-900 dark:border-t-slate-800" style={{ transform: 'translateX(-50%)' }} />
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(habit)}
                className="p-2 rounded-full text-red-500 hover:text-red-600 transition-all touch-target relative group"
                aria-label="Delete habit"
              >
                <Trash2 size={14} className="relative z-10" />
                <span className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out tooltip-enter">
                  Delete habit
                  <div className="absolute top-full left-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-slate-900 dark:border-t-slate-800" style={{ transform: 'translateX(-50%)' }} />
                </span>
              </motion.button>
            </div>
          )}

          {/* Law 3: Do Tiny Button - Distinct, easy to hit */}
          {!isCompleted && (
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTinyClick}
              className="p-2.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700 transition-all touch-target relative group"
              aria-label="Do tiny version"
            >
              <Zap size={18} className="fill-current relative z-10" />
              <span className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out tooltip-enter">
                Do Tiny Version
                <div className="absolute top-full left-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-slate-900 dark:border-t-slate-800" style={{ transform: 'translateX(-50%)' }} />
              </span>
            </motion.button>
          )}

          {/* Law 4: Main Check Button - Satisfying animation */}
          <motion.button
            whileHover={!isCompleted ? { scale: 1.15, boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)' } : { scale: 1.05 }}
            whileTap={!isCompleted ? { scale: 0.9 } : {}}
            onClick={handleCompleteClick}
            disabled={isCompleted}
            className={cn(
              "relative p-4 rounded-full touch-target transition-all duration-300 group",
              isCompleted
                ? "bg-[#10b981] text-white shadow-xl shadow-[#10b981]/50 ring-4 ring-[#10b981]/30"
                : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-text-secondary hover:border-primary hover:text-primary hover:shadow-lg hover:bg-primary/5"
            )}
            aria-label={isCompleted ? "Completed" : "Mark as Done"}
          >
            <motion.div
              animate={{
                rotate: isAnimating ? 360 : 0,
                scale: isAnimating ? 1.2 : 1,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Check 
                size={24} 
                strokeWidth={3.5} 
                className={cn(
                  isCompleted 
                    ? "text-white" 
                    : "text-text-secondary group-hover:text-primary"
                )} 
              />
            </motion.div>
            {!isCompleted && (
              <span className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out tooltip-enter">
                Mark as Done
                <div className="absolute top-full left-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-slate-900 dark:border-t-slate-800" style={{ transform: 'translateX(-50%)' }} />
              </span>
            )}
            
            {/* Ripple effect on completion */}
            {isAnimating && (
              <motion.div
                className="absolute inset-0 rounded-full bg-[#10b981]"
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
            
            {/* Pulse animation for completed state */}
            {isCompleted && (
              <motion.div
                className="absolute inset-0 rounded-full bg-[#10b981]/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Law 3: Action buttons row */}
      {!isCompleted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700"
        >
          <span className="text-xs text-text-secondary">
            Tiny: {habit.tinyVersion}
          </span>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFocus(habit)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all touch-target relative group"
              aria-label="Start focus timer"
            >
              <Timer size={14} />
              Focus
              <span className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out tooltip-enter">
                Start focus timer
                <div className="absolute top-full left-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-slate-900 dark:border-t-slate-800" style={{ transform: 'translateX(-50%)' }} />
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTinyClick}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all touch-target relative group"
              aria-label="Do tiny version"
            >
              <Zap size={14} />
              Do Tiny
              <span className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out tooltip-enter">
                Do Tiny Version
                <div className="absolute top-full left-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-slate-900 dark:border-t-slate-800" style={{ transform: 'translateX(-50%)' }} />
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
