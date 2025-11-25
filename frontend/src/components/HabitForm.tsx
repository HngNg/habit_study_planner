import React, { useState } from 'react';
import { db } from '../db/db';

interface HabitFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [tinyVersion, setTinyVersion] = useState('');
  const [cue, setCue] = useState('');
  const [temptationBundle, setTemptationBundle] = useState('');
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
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <label className="block text-sm text-gray-400 mb-1">Habit Name</label>
        <input
          className="input"
          placeholder="e.g., Read Books"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label className="block text-sm text-gray-400 mb-1">Make it Obvious (Cue)</label>
        <input
          className="input"
          placeholder="e.g., After I brush my teeth"
          value={cue}
          onChange={(e) => setCue(e.target.value)}
          required
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Habit Stacking: "After [CURRENT HABIT], I will [NEW HABIT]."
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label className="block text-sm text-gray-400 mb-1">Make it Easy (Tiny Version)</label>
        <input
          className="input"
          placeholder="e.g., Read 1 page"
          value={tinyVersion}
          onChange={(e) => setTinyVersion(e.target.value)}
          required
        />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          The two-minute rule: Scale it down until it's impossible to say no.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="block text-sm text-gray-400 mb-1">Make it Attractive (Optional)</label>
        <input
          className="input"
          placeholder="e.g., While drinking my morning coffee"
          value={temptationBundle}
          onChange={(e) => setTemptationBundle(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button 
          type="button" 
          onClick={onCancel}
          className="btn"
          style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Habit'}
        </button>
      </div>
    </form>
  );
};
