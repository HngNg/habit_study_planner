import React, { useState, useEffect } from 'react';
import { Eye, Zap, Sparkles } from 'lucide-react';
import { db, type Habit } from '../db/db';
import { Tooltip } from './Tooltip';

interface HabitFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  habit?: Habit | null;
}

export const HabitForm: React.FC<HabitFormProps> = ({ onSuccess, onCancel, habit }) => {
  const [title, setTitle] = useState(habit?.title ?? '');
  const [tinyVersion, setTinyVersion] = useState(habit?.tinyVersion ?? '');
  const [cue, setCue] = useState(habit?.cue ?? '');
  const [temptationBundle, setTemptationBundle] = useState(habit?.temptationBundle ?? '');
  const [pinned, setPinned] = useState<boolean>(habit?.pinned ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Keep form state in sync if a different habit is passed in (edit mode switching)
  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setTinyVersion(habit.tinyVersion);
      setCue(habit.cue);
      setTemptationBundle(habit.temptationBundle ?? '');
      setPinned(habit.pinned ?? false);
    } else {
      setTitle('');
      setTinyVersion('');
      setCue('');
      setTemptationBundle('');
      setPinned(false);
    }
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tinyVersion || !cue) return;

    setPinError(null);
    setIsSubmitting(true);
    try {
      // Enforce max 3 pinned habits (only when creating or pinning newly)
      if (pinned) {
        const existing = await db.habits.toArray();
        const currentlyPinned = existing.filter(h => h.pinned === true && !h.archived);
        const wasPinnedBefore = habit?.pinned === true;
        const pinnedCount = currentlyPinned.length;

        // If this habit was not pinned before and we already have 3 pinned, block pinning
        if (!wasPinnedBefore && pinnedCount >= 3) {
          setPinError('You can pin up to three focus habits.');
          setIsSubmitting(false);
          return;
        }
      }

      if (habit?.id) {
        await db.habits.update(habit.id, {
          title,
          tinyVersion,
          cue,
          temptationBundle,
          pinned,
        });
      } else {
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
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to add habit:', error);
      alert('Failed to save habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
      {/* Habit Name - Prominent */}
      <div>
        <label 
          htmlFor="habit-title" 
          className="block text-base font-semibold text-text-primary mb-2"
        >
          Habit Name
        </label>
        <input
          id="habit-title"
          className="input text-xl font-medium py-3.5"
          placeholder="e.g., Read Books"
          value={title}
          onChange={(e) => setTitle(e.target.value.trimStart())}
          required
          aria-required="true"
        />
      </div>

      {/* Atomic Laws Group */}
      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5 border border-amber-200 dark:border-amber-800/30">
        <h3 className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-5">
          Atomic Laws of Behavior Change
        </h3>

        {/* Make it Obvious - Cue */}
        <div className="mb-5 last:mb-0">
          <label 
            htmlFor="habit-cue" 
            className="flex items-center gap-2 text-sm text-text-secondary mb-2"
          >
            <Eye size={16} className="text-amber-600 dark:text-amber-400" />
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
          />
        </div>

        {/* Make it Easy - Tiny Version */}
        <div className="mb-5 last:mb-0">
          <label 
            htmlFor="habit-tiny" 
            className="flex items-center gap-2 text-sm text-text-secondary mb-2"
          >
            <Zap size={16} className="text-amber-600 dark:text-amber-400" />
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
          />
        </div>

        {/* Make it Attractive - Optional */}
        <div>
          <label 
            htmlFor="habit-temptation" 
            className="flex items-center gap-2 text-sm text-text-secondary mb-2"
          >
            <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
            <span>Make it Attractive</span>
            <span className="text-xs opacity-70">(Optional)</span>
          </label>
          <input
            id="habit-temptation"
            className="input"
            placeholder="e.g., While drinking my morning coffee"
            value={temptationBundle}
            onChange={(e) => setTemptationBundle(e.target.value)}
          />
        </div>
      </div>

      {/* Pin Option */}
      <div>
        <label 
          htmlFor="habit-pinned"
          className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary"
        >
          <input
            id="habit-pinned"
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="w-4 h-4 cursor-pointer accent-primary"
          />
          <span>Pin this habit</span>
          <Tooltip content="Pinned habits appear first and are visually highlighted" />
        </label>
        <p className="mt-1 text-xs text-text-secondary">
          Pin up to 3 focus habits to keep them at the top of Today.
        </p>
        {pinError && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {pinError}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button 
          type="button" 
          onClick={onCancel}
          className="btn bg-transparent text-text-secondary border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (habit ? 'Save Changes' : 'Create Habit')}
        </button>
      </div>
    </form>
  );
};
