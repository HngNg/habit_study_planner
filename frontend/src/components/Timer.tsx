import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimerProps {
  initialMinutes?: number;
  onComplete: (minutes: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ initialMinutes = 25, onComplete }) => {
  const [sessionMinutes, setSessionMinutes] = useState(initialMinutes);
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
    setTimeLeft(sessionMinutes * 60);
  };

  const handleFinish = () => {
    onComplete(sessionMinutes);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="text-center py-8 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle size={80} className="text-success-DEFAULT mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Session Complete!</h2>
        <p className="text-text-secondary mb-6">
          You focused for {initialMinutes} minutes.
        </p>
        <button className="btn btn-primary px-6 py-3" onClick={handleFinish}>
          Log Progress
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-6 px-4">
      {/* Time Presets */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {[5, 15, 25].map((m) => (
          <motion.button
            key={m}
            type="button"
            whileHover={{ scale: isActive ? 1 : 1.05 }}
            whileTap={{ scale: isActive ? 1 : 0.95 }}
            disabled={isActive}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${sessionMinutes === m
                ? 'bg-primary text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700'
              }
              ${isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onClick={() => {
              if (isActive) return;
              setSessionMinutes(m);
              setTimeLeft(m * 60);
              setIsFinished(false);
            }}
          >
            {m} min
          </motion.button>
        ))}
        <motion.button
          type="button"
          whileHover={{ scale: isActive ? 1 : 1.05 }}
          whileTap={{ scale: isActive ? 1 : 0.95 }}
          disabled={isActive}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm transition-all
            bg-slate-100 dark:bg-slate-800 text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700
            ${isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={() => {
            if (isActive) return;
            const input = window.prompt('Custom session length (minutes, 1–180):', String(sessionMinutes));
            if (!input) return;
            const minutes = parseInt(input, 10);
            if (Number.isNaN(minutes) || minutes < 1 || minutes > 180) return;
            setSessionMinutes(minutes);
            setTimeLeft(minutes * 60);
            setIsFinished(false);
          }}
        >
          Custom
        </motion.button>
      </div>

      {/* Timer Display */}
      <motion.div
        key={timeLeft}
        initial={{ scale: 1 }}
        animate={isActive ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
        className={`
          text-6xl md:text-7xl font-bold mb-8 font-mono tabular-nums
          ${isActive ? 'text-primary' : 'text-text-primary'}
          transition-colors duration-300
        `}
      >
        {formatTime(timeLeft)}
      </motion.div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            btn flex items-center gap-2 px-6 py-3 min-w-[140px] justify-center font-semibold
            ${isActive
              ? 'bg-slate-200 dark:bg-slate-700 text-text-primary hover:bg-slate-300 dark:hover:bg-slate-600'
              : 'btn-primary'
            }
          `}
          onClick={toggleTimer}
        >
          {isActive ? (
            <>
              <Pause size={20} />
              Pause
            </>
          ) : (
            <>
              <Play size={20} />
              Start
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors touch-target"
          onClick={resetTimer}
          aria-label="Reset timer"
        >
          <RotateCcw size={20} />
        </motion.button>
      </div>
    </div>
  );
};
