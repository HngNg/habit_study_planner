import { db } from '../db/db';

// Format dates to an Excel-friendly, locale-agnostic string.
// Example: 2025-09-04 17:02:23
const formatDateTime = (value: unknown): string => {
  if (!value) return '';
  const date =
    value instanceof Date
      ? value
      : typeof value === 'string' || typeof value === 'number'
        ? new Date(value)
        : null;

  if (!date || Number.isNaN(date.getTime())) return '';

  const pad = (n: number) => n.toString().padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());

  return `${y}-${m}-${d} ${h}:${mi}:${s}`;
};

export const exportData = async () => {
  try {
    const habits = await db.habits.toArray();
    const logs = await db.logs.toArray();

    const habitsCsvBody = [
      ['ID', 'Title', 'Cue', 'Tiny Version', 'Temptation Bundle', 'Created At'],
      ...habits.map(h => [
        h.id,
        `"${h.title}"`,
        `"${h.cue}"`,
        `"${h.tinyVersion}"`,
        `"${h.temptationBundle || ''}"`,
        `"${formatDateTime(h.createdAt)}"`
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const logsCsvBody = [
      ['ID', 'Habit ID', 'Date', 'Type', 'Value', 'Created At'],
      ...logs.map(l => [
        l.id,
        l.habitId,
        l.date,
        l.type,
        l.value ?? '',
        `"${formatDateTime(l.createdAt)}"`
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    // Prepend UTF-8 BOM so Excel interprets Vietnamese characters correctly
    const addBom = (csv: string) => `\uFEFF${csv}`;

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

    const today = new Date().toISOString().split('T')[0];

    download(addBom(habitsCsvBody), `habits_export_${today}.csv`);
    // Small delay to ensure both downloads start
    setTimeout(() => {
      download(addBom(logsCsvBody), `logs_export_${today}.csv`);
    }, 500);
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export data.');
  }
};
