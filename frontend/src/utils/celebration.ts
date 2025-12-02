import confetti from 'canvas-confetti';

/**
 * Triggers confetti celebration animation
 */
export const triggerConfetti = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
  const particleCount = intensity === 'light' ? 50 : intensity === 'medium' ? 100 : 200;

  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(particleCount * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#22c55e', '#3b82f6'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#22c55e', '#3b82f6', '#f59e0b'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ['#22c55e'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#3b82f6'],
  });
};

/**
 * Triggers a streak milestone celebration
 */
export const celebrateStreakMilestone = (streak: number) => {
  if (streak === 7) {
    triggerConfetti('heavy');
    return "🔥 7-Day Streak! You're building momentum!";
  } else if (streak === 30) {
    triggerConfetti('heavy');
    return "🎉 30-Day Streak! You're unstoppable!";
  } else if (streak === 100) {
    triggerConfetti('heavy');
    return "🏆 100-Day Streak! Legendary dedication!";
  } else if (streak > 0 && streak % 7 === 0) {
    triggerConfetti('medium');
    return `🔥 ${streak}-Day Streak! Keep it going!`;
  }
  return null;
};

/**
 * Gets a celebration message based on completion type
 */
export const getCompletionMessage = (habitTitle: string, type: 'full' | 'tiny'): string => {
  if (type === 'tiny') {
    return `✨ Great start! You did the tiny version of "${habitTitle}"`;
  }
  return `🎯 Well done! You completed "${habitTitle}"`;
};

