import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useUserStore } from '../stores/userStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Habit } from '../db/db';
import { HabitCard } from '../components/HabitCard';
import { Modal } from '../components/Modal';
import { HabitForm } from '../components/HabitForm';
import { Timer } from '../components/Timer';
import { Heatmap } from '../components/Heatmap';
import { Plus, Download, Smartphone, Upload } from 'lucide-react';
import { useHabitLog } from '../hooks/useHabitLog';
import { useStreaks } from '../hooks/useStreaks';
import { exportData } from '../utils/export';
import { importDataFromFiles } from '../utils/import';
import { triggerConfetti, celebrateStreakMilestone, getCompletionMessage } from '../utils/celebration';
import { seedMockData } from '../utils/seedData';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const Dashboard: React.FC = () => {
  const { identity, setIdentity } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [identityDraft, setIdentityDraft] = useState(identity ?? '');
  
  const { logHabit, isHabitCompletedToday } = useHabitLog();
  const { calculateStreak } = useStreaks();
  const { isInstallable, isInstalled, isIOS, isAndroid, promptInstall } = usePWAInstall();

  // Seed mock data on first load if database is empty
  useEffect(() => {
    const checkAndSeed = async () => {
      const habitCount = await db.habits.count();
      const logCount = await db.logs.count();
      
      if (habitCount === 0 && logCount === 0) {
        await seedMockData();
      }
    };
    
    checkAndSeed();
  }, []);

  const habits = useLiveQuery(async () => {
    const all = await db.habits.filter(h => !h.archived).toArray();
    // Sort: pinned habits first, then by creation date
    return all.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
  });

  const handleComplete = async (habit: Habit) => {
    if (habit.id) {
      // Optimistic UI: Fire celebrations immediately for instant feedback
      triggerConfetti('medium');
      toast.success(getCompletionMessage(habit.title, 'full'), {
        duration: 3000,
      });
      
      // Then update database (fire-and-forget for instant feel)
      logHabit(habit.id, 'full').catch((error) => {
        console.error('Failed to log habit:', error);
        toast.error('Failed to save. Please try again.');
      });
      
      // Check for streak milestone after a short delay
      setTimeout(async () => {
        const streak = await calculateStreak(habit.id!);
        const milestoneMessage = celebrateStreakMilestone(streak);
        if (milestoneMessage) {
          toast.success(milestoneMessage, {
            duration: 4000,
          });
        }
      }, 500);
    }
  };

  const handleTiny = async (habit: Habit) => {
    if (habit.id) {
      // Optimistic UI: Fire celebrations immediately
      triggerConfetti('light');
      toast.success(getCompletionMessage(habit.title, 'tiny'), {
        duration: 3000,
      });
      
      // Then update database (fire-and-forget for instant feel)
      logHabit(habit.id, 'tiny').catch((error) => {
        console.error('Failed to log habit:', error);
        toast.error('Failed to save. Please try again.');
      });
      
      // Check for streak milestone
      setTimeout(async () => {
        const streak = await calculateStreak(habit.id!);
        const milestoneMessage = celebrateStreakMilestone(streak);
        if (milestoneMessage) {
          toast.success(milestoneMessage, {
            duration: 4000,
          });
        }
      }, 500);
    }
  };

  const handleFocus = (habit: Habit) => {
    setActiveHabit(habit);
    setIsTimerOpen(true);
  };

  const handleTimerComplete = async (minutes: number) => {
    if (activeHabit?.id) {
      await logHabit(activeHabit.id, 'full', minutes);
      
      // Celebration for timer completion
      triggerConfetti('heavy');
      toast.success(`🎯 Focus session complete! ${minutes} minutes logged for "${activeHabit.title}"`, {
        duration: 4000,
      });
      
      // Check for streak milestone
      setTimeout(async () => {
        const streak = await calculateStreak(activeHabit.id!);
        const milestoneMessage = celebrateStreakMilestone(streak);
        if (milestoneMessage) {
          toast.success(milestoneMessage, {
            duration: 4000,
          });
        }
      }, 500);
      
      setIsTimerOpen(false);
      setActiveHabit(null);
    }
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      toast.success('App installed! You can now access it from your home screen.', {
        duration: 4000,
      });
    }
  };

  const handleImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const result = await importDataFromFiles(files);
      toast.success(`Imported ${result.habits} habits and ${result.logs} logs.`, {
        duration: 4000,
      });
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import data. Please check the CSV format.');
    }
  };

  const handleIdentitySave = () => {
    const trimmed = identityDraft.trim();
    if (trimmed) {
      setIdentity(trimmed);
      toast.success('Identity updated.', { duration: 2500 });
    } else {
      setIdentity('');
      toast.success('Identity cleared.', { duration: 2500 });
    }
    setIsEditingIdentity(false);
  };

  const handleIdentityCancel = () => {
    setIdentityDraft(identity ?? '');
    setIsEditingIdentity(false);
  };

  return (
    <div className="container" style={{ paddingBottom: '6rem' }}>
      <header style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Today</h1>
            {!isEditingIdentity && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                {identity
                  ? (identity.toLowerCase().startsWith('i am ') ? identity : `I am ${identity}`)
                  : 'Define your identity to frame your habits.'}
              </p>
            )}
            {isEditingIdentity && (
              <div style={{ marginTop: '0.25rem' }}>
                <label
                  htmlFor="identity-inline"
                  style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                >
                  Identity statement (e.g., "I am a consistent learner")
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    id="identity-inline"
                    type="text"
                    className="input"
                    style={{ maxWidth: '320px' }}
                    value={identityDraft}
                    onChange={(e) => setIdentityDraft(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                    onClick={handleIdentitySave}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                    onClick={handleIdentityCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {!isEditingIdentity && (
            <button
              type="button"
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                whiteSpace: 'nowrap',
                alignSelf: 'flex-start',
              }}
              onClick={() => {
                setIdentityDraft(identity ?? '');
                setIsEditingIdentity(true);
              }}
            >
              {identity ? 'Edit identity' : 'Set identity'}
            </button>
          )}
        </div>
      </header>

      {/* Install App Section - Always visible if not installed */}
      {!isInstalled && (
        <div className="card" style={{ 
          marginBottom: '2rem', 
          backgroundColor: 'var(--primary)', 
          color: 'white',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Smartphone size={20} />
              <strong style={{ fontSize: '1rem' }}>Install App</strong>
            </div>
            {isInstallable ? (
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                Install this app on your device for quick access
              </p>
            ) : isIOS ? (
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
              </p>
            ) : isAndroid ? (
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                Tap menu (⋮) → <strong>Install app</strong> or <strong>Add to Home screen</strong>
              </p>
            ) : (
              <div style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                <p style={{ margin: 0, marginBottom: '0.25rem' }}>
                  <strong>Chrome/Edge:</strong> Click the install icon (⊕) in the address bar
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.85 }}>
                  Or go to Menu (⋮) → <strong>Install HabitBuilder</strong>
                </p>
              </div>
            )}
          </div>
          {isInstallable && (
            <button
              onClick={handleInstall}
              style={{
                backgroundColor: 'white',
                color: 'var(--primary)',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Install app"
            >
              <Smartphone size={16} />
              Install Now
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {habits?.map(habit => (
          <HabitCard 
            key={habit.id} 
            habit={habit} 
            isCompleted={!!isHabitCompletedToday(habit.id!)}
            onComplete={handleComplete}
            onTiny={handleTiny}
            onFocus={handleFocus}
          />
        ))}

        {habits?.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              No habits yet. Start small.
            </p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              Create First Habit
            </button>
          </div>
        )}
      </div>

      <Heatmap />

      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            className="btn" 
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}
            onClick={exportData}
          >
            <Download size={16} style={{ marginRight: '0.5rem' }} /> Export Data (CSV)
          </button>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <input
              type="file"
              accept=".csv,text/csv"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                void handleImport(e.target.files);
                e.target.value = '';
              }}
            />
            <Upload size={14} />
            <span>Import backup (habits + logs CSV)</span>
          </label>
        </div>
      </footer>

      {/* Floating Action Button */}
      {habits && habits.length > 0 && (
        <button
          className="btn btn-primary"
          aria-label="Create new habit"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            borderRadius: '50%',
            width: '3.5rem',
            height: '3.5rem',
            minWidth: '56px',
            minHeight: '56px',
            padding: 0,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={24} aria-hidden="true" />
        </button>
      )}

      {/* Create Habit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Habit"
        subtitle={identity ? `Building a habit for ${identity}` : undefined}
      >
        <HabitForm 
          onSuccess={() => setIsModalOpen(false)} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      {/* Timer Modal */}
      <Modal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        title={activeHabit ? `Focus: ${activeHabit.title}` : 'Focus Timer'}
      >
        <Timer onComplete={handleTimerComplete} />
      </Modal>
    </div>
  );
};
