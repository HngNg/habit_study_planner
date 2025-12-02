import React, { useState, useEffect } from 'react';
import type { Habit } from '../db/db';
import { Check, Zap, Timer, Pin } from 'lucide-react';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [wasJustCompleted, setWasJustCompleted] = useState(false);

  useEffect(() => {
    if (isCompleted && !wasJustCompleted) {
      setWasJustCompleted(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    } else if (!isCompleted) {
      setWasJustCompleted(false);
    }
  }, [isCompleted, wasJustCompleted]);

  const handleCompleteClick = () => {
    if (!isCompleted) {
      setIsAnimating(true);
      onComplete(habit);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

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
        borderLeft: isCompleted ? '4px solid var(--success)' : habit.pinned ? '4px solid var(--primary)' : 'none',
        borderTop: habit.pinned && !isCompleted ? '2px solid var(--primary)' : 'none',
        backgroundColor: habit.pinned && !isCompleted ? 'rgba(59, 130, 246, 0.05)' : undefined,
        transform: isAnimating && isCompleted ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {habit.pinned && (
              <Pin 
                size={16} 
                fill="var(--primary)" 
                color="var(--primary)"
                style={{ flexShrink: 0 }}
                aria-label="Pinned habit"
              />
            )}
            <h3 style={{ margin: 0, fontSize: '1.1rem', textDecoration: isCompleted ? 'line-through' : 'none' }}>
              {habit.title.trim()}
            </h3>
            {habit.id && <StreakBadge habitId={habit.id} />}
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-accent)' }}>Cue:</span> {habit.cue.trim()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Tiny Button - Secondary */}
          {!isCompleted && (
            <button
              className="btn"
              style={{
                padding: '0.5rem',
                minWidth: '36px',
                minHeight: '36px',
                borderRadius: '50%',
                border: '1px solid var(--bg-card)',
                backgroundColor: 'transparent',
                color: 'var(--text-accent)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onClick={() => onTiny(habit)}
              aria-label="Mark tiny version as done"
              title="Do Tiny Version"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Zap size={16} aria-hidden="true" />
            </button>
          )}
          {/* Main Check Button */}
          <button 
            className={clsx("btn", isCompleted && "bg-green-500 text-white")}
            style={{ 
              padding: '0.75rem', 
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '50%', 
              border: isCompleted ? 'none' : '2px solid var(--bg-card)',
              backgroundColor: isCompleted ? 'var(--success)' : 'transparent',
              color: isCompleted ? 'white' : 'var(--text-secondary)',
              cursor: isCompleted ? 'default' : 'pointer',
              transform: isAnimating ? 'scale(1.3)' : isCompleted ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: isCompleted ? '0 0 0 4px rgba(34, 197, 94, 0.2)' : 'none',
            }}
            onClick={handleCompleteClick}
            disabled={isCompleted}
            aria-label="Mark habit as done"
            title={isCompleted ? "Completed" : "Mark as Done"}
          >
            <Check 
              size={20} 
              aria-hidden="true"
              style={{
                transform: isAnimating ? 'rotate(360deg)' : 'rotate(0deg)',
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </button>
        </div>
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
                padding: '0.5rem 1rem', 
                minHeight: '44px',
                fontSize: '0.75rem', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                color: 'var(--primary)',
                transition: 'all 0.2s ease',
              }}
              onClick={() => onFocus(habit)}
              aria-label="Start focus timer"
              title="Start Focus Timer"
            >
              <Timer size={14} style={{ marginRight: '0.25rem' }} aria-hidden="true" /> Focus
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '0.5rem 1rem', 
                minHeight: '44px',
                fontSize: '0.75rem', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                color: 'var(--primary)',
                transition: 'all 0.2s ease',
              }}
              onClick={() => onTiny(habit)}
              aria-label="Do tiny version of habit"
              title="Do Tiny Version"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              }}
            >
              <Zap size={14} style={{ marginRight: '0.25rem' }} aria-hidden="true" /> Do Tiny
            </button>
          </div>
        </div>
      )}
      
      {isCompleted && (
        <div 
          style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.875rem', 
            color: 'var(--success)', 
            fontWeight: 'bold',
            animation: isAnimating ? 'fadeInScale 0.5s ease-out' : 'none',
          }}
        >
          ✨ Completed for today!
        </div>
      )}
      
      <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
