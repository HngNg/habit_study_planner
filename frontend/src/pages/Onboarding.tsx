// frontend/src/pages/Onboarding.tsx
import React, { useState } from 'react';
import { HabitForm } from '../components/HabitForm';
import { useHabitLog } from '../hooks/useHabitLog';

interface OnboardingProps {
  onComplete?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { createHabit } = useHabitLog();

  const handleCreateFirstHabit = async (habitData: any) => {
    await createHabit(habitData);
    onComplete?.();
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <HabitForm 
          onSubmit={handleCreateFirstHabit}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8dcc8] via-[#f0e6d6] to-[#f5ebe0] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex flex-col md:flex-row items-center">
              {/* Left Side - Image */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex justify-center">
                <div className="relative">
                  {/* Decorative circles */}
                  <div className="absolute -top-8 -left-8 w-24 h-24 bg-[#d4a574] rounded-full opacity-70"></div>
                  <div className="absolute top-0 -right-8 w-16 h-16 bg-[#d4a574] rounded-full opacity-60"></div>
                  <div className="absolute -bottom-6 left-12 w-20 h-20 bg-[#d4a574] rounded-full opacity-50"></div>
                  <div className="absolute bottom-12 -right-12 w-28 h-28 bg-[#d4a574] rounded-full opacity-40"></div>
                  <div className="absolute -top-4 right-16 w-12 h-12 bg-[#d4a574] rounded-full opacity-80"></div>
                  
                  {/* Main image circle */}
                  <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden bg-white shadow-xl border-8 border-[#d4a574]">
                    <img 
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop" 
                      alt="Study"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-blue-50 to-purple-50';
                        placeholder.textContent = '📚';
                        e.currentTarget.parentElement?.appendChild(placeholder);
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right Side - Content */}
              <div className="w-full md:w-1/2 p-8 md:p-12">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#c48d4f] mb-6 leading-tight tracking-tight">
                  HABIT &<br />
                  STUDY<br />
                  PLANNER
                </h1>
                
                <p className="text-base md:text-lg text-gray-700 font-semibold mb-8 leading-relaxed">
                  SMART STRATEGIES TO BOOST<br />
                  FOCUS, PRODUCTIVITY, AND<br />
                  ACADEMIC SUCCESS
                </p>
                
                <button
                  onClick={() => setStep(2)}
                  className="bg-[#c48d4f] hover:bg-[#b37d3f] text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-3"
                >
                  Get Started
                  <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-fade-in">
            <div className="text-center mb-10">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-4xl font-bold text-[#c48d4f] mb-4">
                The Atomic Habits Framework
              </h2>
              <p className="text-gray-600 text-xl">
                We use proven science to help you build lasting habits
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <AtomicLaw
                number="1"
                title="Make it Obvious"
                icon="🎯"
                description="Set clear cues and triggers for your habits"
                example="After breakfast, I will study for 30 minutes"
              />
              <AtomicLaw
                number="2"
                title="Make it Attractive"
                icon="💭"
                description="Link your habits to positive outcomes"
                example="I want to ace my exams and feel confident"
              />
              <AtomicLaw
                number="3"
                title="Make it Easy"
                icon="⚡"
                description="Start small and build momentum"
                example="Just 10 minutes of practice per day"
              />
              <AtomicLaw
                number="4"
                title="Make it Satisfying"
                icon="🎁"
                description="Reward yourself and track progress"
                example="Earn points, build streaks, unlock badges"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-[#c48d4f] hover:bg-[#b37d3f] text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-fade-in">
            <div className="text-center mb-10">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-4xl font-bold text-[#c48d4f] mb-4">
                Key Features
              </h2>
              <p className="text-gray-600 text-xl">
                Everything you need to succeed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <FeatureCard
                icon="📊"
                title="Smart Tracking"
                description="Visual progress tracking with heatmaps and analytics"
              />
              <FeatureCard
                icon="🔥"
                title="Streak System"
                description="Build momentum with daily streaks and milestones"
              />
              <FeatureCard
                icon="🏆"
                title="Gamification"
                description="Earn points, level up, and unlock achievements"
              />
              <FeatureCard
                icon="💾"
                title="Offline First"
                description="Works perfectly offline, syncs when online"
              />
              <FeatureCard
                icon="🎨"
                title="Customizable"
                description="Personalize with colors, icons, and schedules"
              />
              <FeatureCard
                icon="📱"
                title="PWA Ready"
                description="Install on mobile and desktop for quick access"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105"
              >
                ← Back
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 bg-gradient-to-r from-[#c48d4f] to-[#d4a574] hover:from-[#b37d3f] hover:to-[#c48d4f] text-white font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Create Your First Habit 🎯
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AtomicLaw: React.FC<{
  number: string;
  title: string;
  icon: string;
  description: string;
  example: string;
}> = ({ number, title, icon, description, example }) => (
  <div className="bg-gradient-to-br from-[#f9f3eb] to-[#f5ebe0] p-6 rounded-xl border-2 border-[#d4a574] hover:shadow-lg transition-all">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-[#c48d4f] text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <span className="text-3xl">{icon}</span>
      <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
    </div>
    <p className="text-gray-700 mb-3">{description}</p>
    <div className="bg-white p-3 rounded-lg border border-[#d4a574]">
      <p className="text-sm text-gray-600 italic">"{example}"</p>
    </div>
  </div>
);

const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-gradient-to-br from-[#f9f3eb] to-[#f5ebe0] p-6 rounded-xl border-2 border-[#d4a574] hover:shadow-lg transition-all hover:scale-105">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="font-bold text-[#c48d4f] text-lg mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);