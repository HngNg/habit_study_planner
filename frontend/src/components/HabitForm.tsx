import React, { useState } from 'react';
import { Eye, Zap, Sparkles } from 'lucide-react';
import { db } from '../db/db';
import { Tooltip } from './Tooltip';

interface HabitFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [tinyVersion, setTinyVersion] = useState('');
  const [cue, setCue] = useState('');
  const [temptationBundle, setTemptationBundle] = useState('');
  const [pinned, setPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tinyVersion || !cue) return;

    setIsSubmitting(true);
    try {
      await db.habits.add({
        title,
        tinyVersion,
        cue,
        temptationBundle,
        pinned,
        frequency: 'daily',
        createdAt: new Date(),
        archived: false
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to add habit:', error);
      alert('Failed to save habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', margin: 0, padding: 0 }}>
      {/* Habit Name - Prominent */}
      <div style={{ margin: 0, marginBottom: '1.5rem', padding: 0 }}>
        <label 
          htmlFor="habit-title" 
          style={{ 
            display: 'block', 
            fontSize: '1rem', 
            fontWeight: '600',
            color: 'var(--text-primary)', 
            margin: 0,
            marginBottom: '0.75rem',
            padding: 0,
          }}
        >
          Habit Name
        </label>
        <input
          id="habit-title"
          className="input"
          placeholder="e.g., Read Books"
          value={title}
          onChange={(e) => setTitle(e.target.value.trimStart())}
          required
          aria-required="true"
          style={{
            fontSize: '1.25rem',
            padding: '0.875rem 1rem',
            margin: 0,
            fontWeight: '500',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Atomic Laws Group */}
      <div style={{
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        margin: 0,
        marginBottom: '1.5rem',
        border: '1px solid rgba(59, 130, 246, 0.15)',
      }}>
        <h3 style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: 'var(--text-accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0,
          marginBottom: '1.25rem',
          padding: 0,
        }}>
          Atomic Laws of Behavior Change
        </h3>

        {/* Make it Obvious - Cue */}
        <div style={{ margin: 0, marginBottom: '1.25rem', padding: 0 }}>
          <label 
            htmlFor="habit-cue" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)', 
              margin: 0,
              marginBottom: '0.5rem',
              padding: 0,
            }}
          >
            <Eye size={16} style={{ color: 'var(--text-accent)', margin: 0, padding: 0 }} />
            <span>Make it Obvious</span>
            <Tooltip content='Habit Stacking: "After [CURRENT HABIT], I will [NEW HABIT]."' />
          </label>
          <input
            id="habit-cue"
            className="input"
            placeholder="e.g., After I brush my teeth"
            value={cue}
            onChange={(e) => setCue(e.target.value)}
            required
            aria-required="true"
            style={{
              margin: 0,
              padding: '0.75rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Make it Easy - Tiny Version */}
        <div style={{ margin: 0, marginBottom: '1.25rem', padding: 0 }}>
          <label 
            htmlFor="habit-tiny" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)', 
              margin: 0,
              marginBottom: '0.5rem',
              padding: 0,
            }}
          >
            <Zap size={16} style={{ color: 'var(--text-accent)', margin: 0, padding: 0 }} />
            <span>Make it Easy</span>
            <Tooltip content="The two-minute rule: Scale it down until it's impossible to say no." />
          </label>
          <input
            id="habit-tiny"
            className="input"
            placeholder="e.g., Read 1 page"
            value={tinyVersion}
            onChange={(e) => setTinyVersion(e.target.value)}
            required
            aria-required="true"
            style={{
              margin: 0,
              padding: '0.75rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Make it Attractive - Optional */}
        <div style={{ margin: 0, padding: 0 }}>
          <label 
            htmlFor="habit-temptation" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem', 
              color: 'var(--text-secondary)', 
              margin: 0,
              marginBottom: '0.5rem',
              padding: 0,
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--text-accent)', margin: 0, padding: 0 }} />
            <span>Make it Attractive</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.7, margin: 0, padding: 0 }}>
              (Optional)
            </span>
          </label>
          <input
            id="habit-temptation"
            className="input"
            placeholder="e.g., While drinking my morning coffee"
            value={temptationBundle}
            onChange={(e) => setTemptationBundle(e.target.value)}
            style={{
              margin: 0,
              padding: '0.75rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Pin Option - Subtle */}
      <div style={{ margin: 0, marginBottom: '1.5rem', padding: 0 }}>
        <label 
          htmlFor="habit-pinned"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            margin: 0,
            padding: 0,
          }}
        >
          <input
            id="habit-pinned"
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              margin: 0,
              padding: 0,
              cursor: 'pointer',
              accentColor: 'var(--primary)'
            }}
          />
          <span style={{ margin: 0, padding: 0 }}>Pin this habit</span>
          <Tooltip content="Pinned habits appear first and are visually highlighted" />
        </label>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        justifyContent: 'flex-end',
        margin: 0,
        padding: 0,
        paddingTop: '0.5rem',
        borderTop: '1px solid var(--bg-card)',
      }}>
        <button 
          type="button" 
          onClick={onCancel}
          className="btn"
          style={{ 
            backgroundColor: 'transparent', 
            color: 'var(--text-secondary)',
            margin: 0,
            padding: '0.75rem 1.25rem',
            border: '1px solid var(--bg-card)',
          }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{
            margin: 0,
            padding: '0.75rem 1.5rem',
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create Habit'}
        </button>
      </div>
    </form>
  );
};
