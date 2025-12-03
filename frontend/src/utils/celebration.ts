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

const extractIdentityRole = (identity?: string | null): string | null => {
  if (!identity) return null;
  const trimmed = identity.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('i am ')) {
    return trimmed.slice(4).trim() || trimmed;
  }
  return trimmed;
};

/**
 * Gets a celebration message based on completion type, weaving in identity when available.
 */
export const getCompletionMessage = (
  habitTitle: string,
  type: 'full' | 'tiny',
  identity?: string | null
): string => {
  const role = extractIdentityRole(identity);

  if (type === 'tiny') {
    if (role) {
      return `✨ Small win for your identity as ${role}. You did the tiny version of "${habitTitle}".`;
    }
    return `✨ Great start! You did the tiny version of "${habitTitle}".`;
  }

  if (role) {
    return `🎯 You acted like ${role} today — you completed "${habitTitle}".`;
  }

  return `🎯 Well done! You completed "${habitTitle}".`;
};

/**
 * Gets a focus-session completion message, with a simple "tough session" rule.
 * A session is considered "tough" when minutes >= 30.
 */
export const getFocusCompletionMessage = (
  habitTitle: string,
  minutes: number,
  identity?: string | null
): string => {
  const role = extractIdentityRole(identity);
  const toughThreshold = 30;

  const base = minutes >= toughThreshold
    ? `Deep focus session complete! ${minutes} minutes for "${habitTitle}".`
    : `Focus session complete! ${minutes} minutes for "${habitTitle}".`;

  if (role) {
    const prefix =
      minutes >= toughThreshold
        ? `💪 That was a tough session — you showed up like ${role}.`
        : `🎯 You voted for your identity as ${role}.`;
    return `${prefix} ${base}`;
  }

  return `🎯 ${base}`;
};

