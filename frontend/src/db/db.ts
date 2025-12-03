import Dexie, { type Table } from 'dexie';

export interface Habit {
  id?: number;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly'; // Simplified for MVP
  tinyVersion: string;
  cue: string; // Habit Stacking
  temptationBundle?: string;
  pinned?: boolean; // Pinned/priority habits
  createdAt: Date;
  archived: boolean;
}

export interface HabitLog {
  id?: number;
  habitId: number;
  date: string; // ISO Date string YYYY-MM-DD
  type: 'full' | 'tiny';
  value?: number; // For timer minutes or pages
  createdAt: Date;
}

export class HabitDatabase extends Dexie {
  habits!: Table<Habit>;
  logs!: Table<HabitLog>;

  constructor() {
    super('HabitBuilderDB');
    this.version(1).stores({
      habits: '++id, title, frequency, archived',
      logs: '++id, habitId, date, type'
    });
    // Version 2: Add pinned field
    this.version(2).stores({
      habits: '++id, title, frequency, archived, pinned',
      logs: '++id, habitId, date, type'
    }).upgrade(async (tx) => {
      // Migrate existing habits to have pinned: false
      const habits = await tx.table('habits').toCollection().toArray();
      for (const habit of habits) {
        if ((habit as any).pinned === undefined) {
          await tx.table('habits').update(habit.id!, { pinned: false });
        }
      }
    });
  }
}

export const db = new HabitDatabase();

// Ensure database is opened
db.open().catch((err) => {
  console.error('Failed to open database:', err);
});
