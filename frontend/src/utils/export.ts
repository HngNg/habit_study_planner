import { db } from '../db/db';

export const exportData = async () => {
  try {
    const habits = await db.habits.toArray();
    const logs = await db.logs.toArray();

    const habitsCsv = [
      ['ID', 'Title', 'Cue', 'Tiny Version', 'Temptation Bundle', 'Created At'],
      ...habits.map(h => [
        h.id,
        `"${h.title}"`,
        `"${h.cue}"`,
        `"${h.tinyVersion}"`,
        `"${h.temptationBundle || ''}"`,
        h.createdAt
      ])
    ].map(row => row.join(',')).join('\n');

    const logsCsv = [
      ['ID', 'Habit ID', 'Date', 'Type', 'Value', 'Created At'],
      ...logs.map(l => [
        l.id,
        l.habitId,
        l.date,
        l.type,
        l.value || '',
        l.createdAt
      ])
    ].map(row => row.join(',')).join('\n');

    const download = (content: string, filename: string) => {
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    download(habitsCsv, `habits_export_${new Date().toISOString().split('T')[0]}.csv`);
    // Small delay to ensure both download
    setTimeout(() => {
      download(logsCsv, `logs_export_${new Date().toISOString().split('T')[0]}.csv`);
    }, 500);

  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export data.');
  }
};
