import { db } from '../db/db';

/**
 * Seeds the database with mock habits and logs for the last 90 days
 * This fills the heatmap with realistic activity data
 * 
 * @param force - If true, clears existing data and reseeds (for testing)
 */
export const seedMockData = async (force: boolean = false) => {
  try {
    console.log('Starting seedMockData...');
    // Check if data already exists
    const existingHabits = await db.habits.count();
    const existingLogs = await db.logs.count();
    console.log(`Existing data: ${existingHabits} habits, ${existingLogs} logs`);
    
    if (!force && (existingHabits > 0 || existingLogs > 0)) {
      console.log('Database already has data. Skipping seed. Use force=true to reseed.');
      return;
    }

    // Clear existing data if forcing
    if (force) {
      await db.habits.clear();
      await db.logs.clear();
      console.log('Cleared existing data before seeding...');
    }

    // Create sample habits
    const habits = [
      {
        title: 'Read for 30 minutes',
        tinyVersion: 'Read 1 page',
        cue: 'After I finish breakfast',
        temptationBundle: 'While drinking my morning coffee',
        pinned: true,
        frequency: 'daily' as const,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        archived: false,
      },
      {
        title: 'Practice coding',
        tinyVersion: 'Write 10 lines of code',
        cue: 'After I check my email',
        temptationBundle: 'With my favorite playlist',
        pinned: true,
        frequency: 'daily' as const,
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000), // 85 days ago
        archived: false,
      },
      {
        title: 'Exercise',
        tinyVersion: 'Do 5 push-ups',
        cue: 'After I wake up',
        pinned: false,
        frequency: 'daily' as const,
        createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000), // 80 days ago
        archived: false,
      },
      {
        title: 'Meditate',
        tinyVersion: 'Take 3 deep breaths',
        cue: 'Before I start studying',
        pinned: false,
        frequency: 'daily' as const,
        createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000), // 75 days ago
        archived: false,
      },
      {
        title: 'Review notes',
        tinyVersion: 'Read 1 page of notes',
        cue: 'After my last class',
        pinned: false,
        frequency: 'daily' as const,
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), // 70 days ago
        archived: false,
      },
    ];

    // Add habits to database
    const habitIds: number[] = [];
    for (const habit of habits) {
      const id = await db.habits.add(habit);
      habitIds.push(id);
    }

    // Generate logs for the last 90 days
    const today = new Date();
    const logs: Array<{
      habitId: number;
      date: string;
      type: 'full' | 'tiny';
      value?: number;
      createdAt: Date;
    }> = [];

    // Create realistic activity pattern
    for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      // Skip some days (weekends less active, some random days off)
      const skipDay = Math.random() < 0.15 || (dayOfWeek === 0 && Math.random() < 0.3); // 15% random skip, 30% Sunday skip
      
      if (!skipDay) {
        // Determine activity level for this day
        // More activity on weekdays, less on weekends
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const baseActivity = isWeekend ? 1 : 2;
        
        // Add some variation: 1-5 habits per day
        const numHabits = Math.min(
          habitIds.length,
          baseActivity + Math.floor(Math.random() * 3) + (Math.random() < 0.2 ? 2 : 0)
        );

        // Select random habits for this day
        const shuffled = [...habitIds].sort(() => Math.random() - 0.5);
        const selectedHabits = shuffled.slice(0, numHabits);

        // Create logs for selected habits
        for (const habitId of selectedHabits) {
          // 80% full completion, 20% tiny version
          const isTiny = Math.random() < 0.2;
          const type = isTiny ? 'tiny' : 'full';
          
          logs.push({
            habitId,
            date: dateString,
            type,
            value: type === 'full' && habitId === habitIds[1] ? 25 : undefined, // Add timer value for coding habit
            createdAt: new Date(date.getTime() + Math.random() * 86400000), // Random time during the day
          });
        }
      }
    }

    // Add logs to database in batches
    const batchSize = 50;
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      await db.logs.bulkAdd(batch);
    }

    console.log(`✅ Seeded ${habits.length} habits and ${logs.length} logs`);
  } catch (error) {
    console.error('Failed to seed mock data:', error);
  }
};

/**
 * Clears all data from the database (for testing/reset)
 */
export const clearAllData = async () => {
  try {
    await db.habits.clear();
    await db.logs.clear();
    console.log('✅ All data cleared');
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};

