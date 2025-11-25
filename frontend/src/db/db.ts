import Dexie, { type Table } from 'dexie';

export interface Habit {
  id?: number;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly'; // Simplified for MVP
  tinyVersion: string;
  cue: string; // Habit Stacking
  temptationBundle?: string;
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
  }
}

export const db = new HabitDatabase();
