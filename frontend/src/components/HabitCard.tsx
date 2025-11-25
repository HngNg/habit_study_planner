import React from 'react';
import type { Habit } from '../db/db';
import { Check, Zap, Timer } from 'lucide-react';
import clsx from 'clsx';
import { StreakBadge } from './StreakBadge';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: (habit: Habit) => void;
  onTiny: (habit: Habit) => void;
  onFocus: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, isCompleted, onComplete, onTiny, onFocus }) => {
  return (
    <div 
      className={clsx(
        "card transition-all duration-300",
        isCompleted ? "border-l-4 border-green-500 bg-opacity-50" : ""
      )}
      style={{ 
        marginBottom: '1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem',
        opacity: isCompleted ? 0.8 : 1,
        borderLeft: isCompleted ? '4px solid var(--success)' : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', textDecoration: isCompleted ? 'line-through' : 'none' }}>
              {habit.title}
            </h3>
            {habit.id && <StreakBadge habitId={habit.id} />}
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-accent)' }}>Cue:</span> {habit.cue}
          </p>
        </div>
        <button 
          className={clsx("btn", isCompleted && "bg-green-500 text-white")}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '50%', 
            border: isCompleted ? 'none' : '2px solid var(--bg-card)',
            backgroundColor: isCompleted ? 'var(--success)' : 'transparent',
            color: isCompleted ? 'white' : 'var(--text-secondary)',
            cursor: isCompleted ? 'default' : 'pointer'
          }}
          onClick={() => !isCompleted && onComplete(habit)}
          disabled={isCompleted}
          title="Mark as Done"
        >
          <Check size={20} />
        </button>
      </div>

      {habit.temptationBundle && (
        <div style={{ fontSize: '0.875rem', color: 'var(--text-accent)', fontStyle: 'italic' }}>
          ✨ {habit.temptationBundle}
        </div>
      )}

      {!isCompleted && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--bg-primary)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Tiny: {habit.tinyVersion}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn" 
              style={{ 
                padding: '0.25rem 0.75rem', 
                fontSize: '0.75rem', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                color: 'var(--primary)' 
              }}
              onClick={() => onFocus(habit)}
              title="Start Focus Timer"
            >
              <Timer size={12} style={{ marginRight: '0.25rem' }} /> Focus
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '0.25rem 0.75rem', 
                fontSize: '0.75rem', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                color: 'var(--primary)' 
              }}
              onClick={() => onTiny(habit)}
            >
              <Zap size={12} style={{ marginRight: '0.25rem' }} /> Do Tiny
            </button>
          </div>
        </div>
      )}
      
      {isCompleted && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--success)', fontWeight: 'bold' }}>
          Completed for today!
        </div>
      )}
    </div>
  );
};
