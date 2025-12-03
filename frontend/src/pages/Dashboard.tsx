import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../stores/userStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Habit } from '../db/db';
import { HabitCard } from '../components/HabitCard';
import { Modal } from '../components/Modal';
import { HabitForm } from '../components/HabitForm';
import { Timer } from '../components/Timer';
import { Heatmap } from '../components/Heatmap';
import { WeeklyRecap } from '../components/WeeklyRecap';
import { IdentityBadge } from '../components/IdentityBadge';
import { Plus, Download, Smartphone, Upload } from 'lucide-react';
import { useHabitLog } from '../hooks/useHabitLog';
import { useStreaks } from '../hooks/useStreaks';
import { exportData } from '../utils/export';
import { importDataFromFiles } from '../utils/import';
import { celebrateStreakMilestone, getCompletionMessage, getFocusCompletionMessage } from '../utils/celebration';
import { seedMockData } from '../utils/seedData';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const Dashboard: React.FC = () => {
  const { identity, setIdentity, identityProgress, incrementIdentityProgress } = useUserStore();
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
      try {
        // Ensure database is open
        if (!db.isOpen()) {
          await db.open();
        }
        
        console.log('Checking database...');
        const habitCount = await db.habits.count();
        const logCount = await db.logs.count();
        console.log(`Database status: ${habitCount} habits, ${logCount} logs`);
        
        if (habitCount === 0 && logCount === 0) {
          console.log('Database is empty, seeding mock data...');
          await seedMockData();
          console.log('Seeding complete!');
        }
      } catch (error) {
        console.error('Error checking/seeding database:', error);
      }
    };
    
    checkAndSeed();
  }, []);

  const habits = useLiveQuery(async () => {
    try {
      const all = await db.habits.filter(h => !h.archived).toArray();
      console.log(`Loaded ${all.length} habits from database`);
      return all.sort((a, b) => {
        // Pinned first, then newest
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
      });
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  });

  // Calculate completed habits today
  const completedToday = useMemo(() => {
    if (!habits) return 0;
    return habits.filter(h => h.id && isHabitCompletedToday(h.id)).length;
  }, [habits, isHabitCompletedToday]);

  const handleComplete = async (habit: Habit) => {
    if (habit.id) {
      // Optimistic UI: Fire celebrations immediately for instant feedback
      toast.success(getCompletionMessage(habit.title, 'full', identity), {
        duration: 3000,
      });
      incrementIdentityProgress(1);
      
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
      toast.success(getCompletionMessage(habit.title, 'tiny', identity), {
        duration: 3000,
      });
      incrementIdentityProgress(1);
      
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

  const handleEditHabit = (habit: Habit) => {
    setActiveHabit(habit);
    setIsModalOpen(true);
  };

  const handleDeleteHabit = async (habit: Habit) => {
    if (!habit.id) return;
    const confirmed = window.confirm(`Delete habit "${habit.title}"? This will hide it from Today, but past logs remain.`);
    if (!confirmed) return;
    try {
      await db.habits.update(habit.id, { archived: true, pinned: false });
      toast.success('Habit deleted.', { duration: 2500 });
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast.error('Failed to delete habit. Please try again.');
    }
  };

  const handleTimerComplete = async (minutes: number) => {
    if (activeHabit?.id) {
      await logHabit(activeHabit.id, 'full', minutes);
      
      // Celebration for timer completion
      toast.success(getFocusCompletionMessage(activeHabit.title, minutes, identity), {
        duration: 4000,
      });
      incrementIdentityProgress(1);
      
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

  const pinnedHabits = habits?.filter(h => h.pinned === true) || [];
  const otherHabits = habits?.filter(h => h.pinned !== true) || [];

  return (
    <div className="min-h-screen bg-base-light dark:bg-base-dark pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Identity Badge Header */}
        <IdentityBadge
          identity={identity}
          progress={identityProgress}
          completedToday={completedToday}
          totalHabits={habits?.length || 0}
          isEditing={isEditingIdentity}
          onEditClick={() => {
            setIdentityDraft(identity ?? '');
            setIsEditingIdentity(true);
          }}
          onSave={handleIdentitySave}
          onCancel={handleIdentityCancel}
          draft={identityDraft}
          onDraftChange={setIdentityDraft}
        />

        {/* Install App Banner */}
        {!isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-2xl p-6 mb-6 shadow-2xl border border-amber-400/40 overflow-hidden relative"
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-[280px]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-white/25 rounded-xl backdrop-blur-md shadow-lg border border-white/30">
                      <Smartphone size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-0.5">Install App</h3>
                      <p className="text-sm text-white/90">Get quick access & offline support</p>
                    </div>
                  </div>
                  
                  {isInstallable ? (
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <p className="text-white font-medium leading-relaxed">
                        Install this app on your device for quick access and offline use
                      </p>
                    </div>
                  ) : isIOS ? (
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20 space-y-2">
                      <div className="flex items-center gap-2 text-white">
                        <span className="font-semibold">Step 1:</span>
                        <span>Tap the <strong className="font-bold">Share</strong> button</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <span className="font-semibold">Step 2:</span>
                        <span>Select <strong className="font-bold">Add to Home Screen</strong></span>
                      </div>
                    </div>
                  ) : isAndroid ? (
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <p className="text-white font-medium">
                        Tap the menu (⋮) → Select <strong className="font-bold">Install app</strong> or <strong className="font-bold">Add to Home screen</strong>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold mb-1">Chrome/Edge:</p>
                          <p className="text-white/95 text-sm">
                            Look for the install icon <span className="inline-flex items-center justify-center w-5 h-5 bg-white/20 rounded mx-1">⊕</span> in the address bar and click it
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold mb-1">Alternative:</p>
                          <p className="text-white/95 text-sm">
                            Go to Menu <span className="inline-flex items-center justify-center w-5 h-5 bg-white/20 rounded mx-1">⋮</span> → <strong className="font-bold">Install HabitBuilder</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {isInstallable && (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInstall}
                    className="flex items-center gap-2.5 px-7 py-4 bg-white text-amber-600 rounded-xl font-bold text-base whitespace-nowrap hover:bg-amber-50 shadow-2xl hover:shadow-amber-500/30 transition-all touch-target border-2 border-white/40 min-w-[140px] justify-center"
                  >
                    <Smartphone size={22} />
                    Install Now
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Habits List */}
        <div className="space-y-6">
          {/* Focus Habits (Pinned) */}
          <AnimatePresence>
            {pinnedHabits.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
                    Focus Habits (max 3)
                  </h2>
                  <span className="text-xs text-text-secondary">
                    These appear at the top of Today.
                  </span>
                </div>
                <motion.div
                  layout
                  className="space-y-3"
                >
                  <AnimatePresence>
                    {pinnedHabits.map(habit => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        isCompleted={!!(habit.id && isHabitCompletedToday(habit.id))}
                        onComplete={handleComplete}
                        onTiny={handleTiny}
                        onFocus={handleFocus}
                        onEdit={handleEditHabit}
                        onDelete={handleDeleteHabit}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Other Habits */}
          <AnimatePresence>
            {otherHabits.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {pinnedHabits.length > 0 && (
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-text-secondary mb-3">
                    Other Habits
                  </h2>
                )}
                <motion.div
                  layout
                  className="space-y-3"
                >
                  <AnimatePresence>
                    {otherHabits.map(habit => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        isCompleted={!!(habit.id && isHabitCompletedToday(habit.id))}
                        onComplete={handleComplete}
                        onTiny={handleTiny}
                        onFocus={handleFocus}
                        onEdit={handleEditHabit}
                        onDelete={handleDeleteHabit}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {habits && habits.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <p className="text-text-secondary mb-4">
                No habits yet. Start small.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-primary-DEFAULT text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors touch-target"
              >
                Create First Habit
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Weekly Recap */}
        <WeeklyRecap />

        {/* Heatmap */}
        <Heatmap />

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex flex-col gap-3 items-center">
            {/* Debug: Manual seed button (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  try {
                    await seedMockData(true);
                    toast.success('Data seeded! Refresh to see changes.');
                  } catch (error) {
                    console.error('Failed to seed:', error);
                    toast.error('Failed to seed data. Check console.');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium touch-target"
              >
                🔄 Seed Mock Data (Debug)
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-text-secondary rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium touch-target"
            >
              <Download size={16} />
              Export Data (CSV)
            </motion.button>

            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer hover:text-text-primary transition-colors touch-target">
              <input
                type="file"
                accept=".csv,text/csv"
                multiple
                className="hidden"
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
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary-DEFAULT text-white rounded-full shadow-lg hover:bg-primary-hover transition-colors flex items-center justify-center touch-target z-50"
            aria-label="Create new habit"
          >
            <Plus size={24} />
          </motion.button>
        )}

        {/* Create Habit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setActiveHabit(null);
          }}
          title={activeHabit ? 'Edit Habit' : 'New Habit'}
          subtitle={
            activeHabit
              ? undefined
              : identity
                ? `Building a habit for ${identity}`
                : undefined
          }
        >
          <HabitForm 
            habit={activeHabit}
            onSuccess={() => {
              setIsModalOpen(false);
              setActiveHabit(null);
            }} 
            onCancel={() => {
              setIsModalOpen(false);
              setActiveHabit(null);
            }} 
          />
        </Modal>

        {/* Timer Modal */}
        <Modal
          isOpen={isTimerOpen}
          onClose={() => {
            setIsTimerOpen(false);
            setActiveHabit(null);
          }}
          title={activeHabit ? `Focus: ${activeHabit.title}` : 'Focus Timer'}
        >
          <Timer onComplete={handleTimerComplete} />
        </Modal>
      </div>
    </div>
  );
};
