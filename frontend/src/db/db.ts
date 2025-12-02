// frontend/src/db/db.ts
import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface Habit {
  id?: number;
  name: string;
  description: string;
  category: 'study' | 'health' | 'personal' | 'other';
  frequency: 'daily' | 'weekly';
  targetDays?: number[]; // For weekly: [0,1,2,3,4,5,6] (Sun-Sat)
  startDate: string;
  icon: string;
  color: string;
  reminderTime?: string;
  atomicCue: string; // Atomic Habits: Cue
  atomicCraving: string; // Atomic Habits: Craving/Motivation
  atomicResponse: string; // Atomic Habits: Response/Action
  atomicReward: string; // Atomic Habits: Reward
  points: number;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
}

export interface HabitLog {
  id?: number;
  habitId: number;
  date: string;
  completed: boolean;
  notes?: string;
  duration?: number; // minutes
  mood?: 'excellent' | 'good' | 'okay' | 'bad';
  createdAt: string;
  syncStatus: 'pending' | 'synced';
}

export interface Streak {
  id?: number;
  habitId: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  updatedAt: string;
}

export interface UserProgress {
  id?: number;
  totalPoints: number;
  level: number;
  badges: string[]; // JSON array of badge IDs
  updatedAt: string;
}

export interface Reminder {
  id?: number;
  habitId: number;
  time: string;
  enabled: boolean;
  days: number[]; // [0-6] for days of week
  createdAt: string;
}

class HabitPlannerDB extends Dexie {
  habits!: Table<Habit>;
  habitLogs!: Table<HabitLog>;
  streaks!: Table<Streak>;
  userProgress!: Table<UserProgress>;
  reminders!: Table<Reminder>;

  constructor() {
    super('HabitPlannerDB');
    
    this.version(1).stores({
      habits: '++id, name, category, frequency, startDate, syncStatus',
      habitLogs: '++id, habitId, date, completed, syncStatus',
      streaks: '++id, habitId, currentStreak, longestStreak',
      userProgress: '++id',
      reminders: '++id, habitId, time, enabled'
    });
  }
}

export const db = new HabitPlannerDB();

// Initialize user progress if not exists
db.on('ready', async () => {
  const progress = await db.userProgress.toArray();
  if (progress.length === 0) {
    await db.userProgress.add({
      totalPoints: 0,
      level: 1,
      badges: [],
      updatedAt: new Date().toISOString()
    });
  }
});