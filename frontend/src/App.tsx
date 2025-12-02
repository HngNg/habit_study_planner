// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { HabitForm } from './components/HabitForm';
import { useHabitLog } from './hooks/useHabitLog';
import { db } from './db/db';

type Page = 'onboarding' | 'dashboard' | 'habits' | 'analytics';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('onboarding');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { createHabit, habits } = useHabitLog();

  useEffect(() => {
    checkOnboardingStatus();
    registerServiceWorker();
  }, []);

  const checkOnboardingStatus = async () => {
    const habitCount = await db.habits.count();
    if (habitCount > 0) {
      setHasCompletedOnboarding(true);
      setCurrentPage('dashboard');
    }
  };

  const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('SW registration failed:', err));
    }
  };

  const handleCreateHabit = async (habitData: any) => {
    await createHabit(habitData);
    setShowHabitForm(false);
    if (!hasCompletedOnboarding) {
      setHasCompletedOnboarding(true);
      setCurrentPage('dashboard');
    }
  };

  if (!hasCompletedOnboarding && currentPage === 'onboarding') {
    return <Onboarding onComplete={() => {
      setHasCompletedOnboarding(true);
      setCurrentPage('dashboard');
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8dcc8] via-[#f0e6d6] to-[#f5ebe0]">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-[#d4a574]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-[#c48d4f]">
                Habit Planner
              </h1>
              <div className="hidden md:flex gap-4">
                <NavButton
                  active={currentPage === 'dashboard'}
                  onClick={() => setCurrentPage('dashboard')}
                  icon="🏠"
                  label="Dashboard"
                />
                <NavButton
                  active={currentPage === 'habits'}
                  onClick={() => setCurrentPage('habits')}
                  icon="📝"
                  label="My Habits"
                />
                <NavButton
                  active={currentPage === 'analytics'}
                  onClick={() => setCurrentPage('analytics')}
                  icon="📊"
                  label="Analytics"
                />
              </div>
            </div>

            <button
              onClick={() => setShowHabitForm(true)}
              className="bg-gradient-to-r from-[#c48d4f] to-[#d4a574] hover:from-[#b37d3f] hover:to-[#c48d4f] text-white font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span className="hidden sm:inline">New Habit</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {showHabitForm ? (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 overflow-y-auto backdrop-blur-sm">
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-2xl my-8">
                <HabitForm
                  onSubmit={handleCreateHabit}
                  onCancel={() => setShowHabitForm(false)}
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'habits' && <HabitsPage />}
            {currentPage === 'analytics' && <AnalyticsPage />}
          </>
        )}
      </main>
    </div>
  );
}

const NavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
      active
        ? 'bg-gradient-to-r from-[#c48d4f] to-[#d4a574] text-white shadow-md'
        : 'text-gray-600 hover:bg-[#f9f3eb] hover:text-[#c48d4f]'
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

const HabitsPage: React.FC = () => {
  const { habits, deleteHabit, logHabit } = useHabitLog();
  const [editingHabit, setEditingHabit] = useState<any>(null);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-[#d4a574]">
          <h1 className="text-3xl font-bold text-[#c48d4f]">📝 My Habits</h1>
          <p className="text-gray-600 mt-2 font-medium">Manage all your habits in one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits && habits.map(habit => (
            <div key={habit.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    {habit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#c48d4f]">{habit.name}</h3>
                    <p className="text-sm text-gray-500">{habit.category}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{habit.description}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingHabit(habit)}
                  className="flex-1 bg-gradient-to-r from-[#c48d4f] to-[#d4a574] hover:from-[#b37d3f] hover:to-[#c48d4f] text-white py-2 px-4 rounded-lg font-bold transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this habit?')) {
                      deleteHabit(habit.id!);
                    }
                  }}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg font-bold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  const { habits } = useHabitLog();
  const [selectedHabit, setSelectedHabit] = useState<number | null>(null);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-[#d4a574]">
          <h1 className="text-3xl font-bold text-[#c48d4f]">📊 Analytics</h1>
          <p className="text-gray-600 mt-2 font-medium">Track your progress and insights</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-[#d4a574]">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Filter by Habit
          </label>
          <select
            value={selectedHabit || ''}
            onChange={(e) => setSelectedHabit(e.target.value ? Number(e.target.value) : null)}
            className="w-full md:w-64 px-4 py-2 border-2 border-[#d4a574] rounded-lg font-medium text-gray-700 focus:ring-2 focus:ring-[#c48d4f] focus:border-[#c48d4f]"
          >
            <option value="">All Habits</option>
            {habits && habits.map(habit => (
              <option key={habit.id} value={habit.id}>
                {habit.icon} {habit.name}
              </option>
            ))}
          </select>
        </div>

        {/* Heatmap will be imported from component */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#d4a574]">
          <p className="text-gray-600 text-center py-8 font-medium">
            Analytics dashboard coming soon! 📈
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;