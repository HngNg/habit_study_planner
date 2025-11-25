import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

interface TimerProps {
  initialMinutes?: number;
  onComplete: (minutes: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ initialMinutes = 25, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(initialMinutes * 60);
  };

  const handleFinish = () => {
    onComplete(initialMinutes);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <CheckCircle size={64} className="text-success" style={{ margin: '0 auto 1rem', color: 'var(--success)' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Session Complete!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You focused for {initialMinutes} minutes.
        </p>
        <button className="btn btn-primary" onClick={handleFinish}>
          Log Progress
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <div style={{ 
        fontSize: '4rem', 
        fontWeight: 'bold', 
        fontVariantNumeric: 'tabular-nums',
        marginBottom: '2rem',
        color: isActive ? 'var(--primary)' : 'var(--text-primary)'
      }}>
        {formatTime(timeLeft)}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          className="btn"
          style={{ 
            backgroundColor: isActive ? 'var(--bg-card)' : 'var(--primary)',
            color: isActive ? 'var(--text-primary)' : 'white',
            minWidth: '120px'
          }}
          onClick={toggleTimer}
        >
          {isActive ? (
            <>
              <Pause size={20} style={{ marginRight: '0.5rem' }} /> Pause
            </>
          ) : (
            <>
              <Play size={20} style={{ marginRight: '0.5rem' }} /> Start
            </>
          )}
        </button>

        <button 
          className="btn"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}
          onClick={resetTimer}
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};
