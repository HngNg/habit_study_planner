import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Habit } from '../db/db';
import { HabitCard } from '../components/HabitCard';
import { Modal } from '../components/Modal';
import { HabitForm } from '../components/HabitForm';
import { Timer } from '../components/Timer';
import { Heatmap } from '../components/Heatmap';
import { Plus, Download } from 'lucide-react';
import { useHabitLog } from '../hooks/useHabitLog';
import { exportData } from '../utils/export';

export const Dashboard: React.FC = () => {
  const { identity } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  
  const { logHabit, isHabitCompletedToday } = useHabitLog();

  const habits = useLiveQuery(() => db.habits.filter(h => !h.archived).toArray());

  const handleComplete = async (habit: Habit) => {
    if (habit.id) {
      await logHabit(habit.id, 'full');
    }
  };

  const handleTiny = async (habit: Habit) => {
    if (habit.id) {
      await logHabit(habit.id, 'tiny');
    }
  };

  const handleFocus = (habit: Habit) => {
    setActiveHabit(habit);
    setIsTimerOpen(true);
  };

  const handleTimerComplete = async (minutes: number) => {
    if (activeHabit?.id) {
      await logHabit(activeHabit.id, 'full', minutes);
      setIsTimerOpen(false);
      setActiveHabit(null);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '6rem' }}>
      <header style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Today</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {identity}
        </p>
      </header>

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
        <button 
          className="btn" 
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}
          onClick={exportData}
        >
          <Download size={16} style={{ marginRight: '0.5rem' }} /> Export Data (CSV)
        </button>
      </footer>

      {/* Floating Action Button */}
      {habits && habits.length > 0 && (
        <button
          className="btn btn-primary"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            borderRadius: '50%',
            width: '3.5rem',
            height: '3.5rem',
            padding: 0,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={24} />
        </button>
      )}

      {/* Create Habit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Habit"
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
