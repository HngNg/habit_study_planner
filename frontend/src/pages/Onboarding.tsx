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
    if (!identityInput.trim()) return;

    setIdentity(identityInput);
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Sparkles size={32} className="text-primary" style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Who do you want to become?</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Atomic Habits starts with identity. Define the person you are building habits for.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="identity" 
              style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}
            >
              Complete the sentence:
            </label>
            <input
              id="identity"
              type="text"
              className="input"
              placeholder="I am a consistent learner..."
              value={identityInput}
              onChange={(e) => setIdentityInput(e.target.value)}
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={!identityInput.trim()}
            aria-label="Start my journey and complete onboarding"
          >
            Start My Journey <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
};
