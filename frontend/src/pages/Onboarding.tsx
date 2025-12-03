import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const [identityInput, setIdentityInput] = useState('');
  const { setIdentity, completeOnboarding } = useUserStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = identityInput.trim();
    if (trimmed) {
      setIdentity(trimmed);
    }
    completeOnboarding();
    navigate('/');
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-base-light">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">
              Who do you want to become?
            </h1>
            <p className="text-base text-text-secondary leading-relaxed">
              Atomic Habits starts with identity. Define the person you are building habits for.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="identity" 
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Complete the sentence:
              </label>
              <input
                id="identity"
                type="text"
                className="input text-base"
                placeholder="I am a consistent learner..."
                value={identityInput}
                onChange={(e) => setIdentityInput(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <button 
                type="submit" 
                className="btn btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base font-semibold shadow-sm hover:shadow-md transition-shadow"
                aria-label="Start my journey and complete onboarding"
              >
                Start My Journey
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="w-full py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                onClick={handleSkip}
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
