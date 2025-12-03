import { db, type Habit, type HabitLog } from '../db/db';

type CsvRow = string[];

const parseCsv = (text: string): CsvRow[] => {
  const rows: CsvRow[] = [];
  let current: string[] = [];
  let cell = '';
  let inQuotes = false;

  const pushCell = () => {
    current.push(cell);
    cell = '';
  };

  const pushRow = () => {
    // Ignore completely empty rows
    if (current.length > 0 && current.some(v => v.trim() !== '')) {
      rows.push(current);
    }
    current = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        // Escaped quote
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      pushCell();
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // Handle CRLF / LF
      if (ch === '\r' && text[i + 1] === '\n') {
        i++;
      }
      pushCell();
      pushRow();
    } else {
      cell += ch;
    }
  }

  // Flush last cell/row
  if (cell !== '' || current.length > 0) {
    pushCell();
    pushRow();
  }

  return rows;
};

const stripQuotes = (value: string): string =>
  value.startsWith('"') && value.endsWith('"')
    ? value.slice(1, -1).replace(/""/g, '"')
    : value;

const parseDateTime = (value: string | undefined): Date => {
  if (!value) return new Date();
  const trimmed = stripQuotes(value).trim();
  if (!trimmed) return new Date();

  // Try ISO-like "YYYY-MM-DD HH:mm:ss"
  const isoLike = trimmed.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})$/);
  if (isoLike) {
    const [, d, t] = isoLike;
    const iso = `${d}T${t}`;
    const date = new Date(iso);
    if (!Number.isNaN(date.getTime())) return date;
  }

  // Fallback to native parser (handles "Thu Sep 04 2025 01:30:47 GMT+0700 (...)" etc.)
  const native = new Date(trimmed);
  if (!Number.isNaN(native.getTime())) return native;

  return new Date();
};

interface ImportResult {
  habits: number;
  logs: number;
}

export const importDataFromFiles = async (
  files: FileList | File[]
): Promise<ImportResult> => {
  const fileArray = Array.from(files as FileList | File[]);
  if (fileArray.length === 0) {
    return { habits: 0, logs: 0 };
  }

  const contents = await Promise.all(fileArray.map(f => f.text()));

  let habitRows: CsvRow[] | null = null;
  let logRows: CsvRow[] | null = null;

  contents.forEach(text => {
    const rows = parseCsv(text.replace(/^\uFEFF/, '')); // strip BOM if present
    if (rows.length === 0) return;
    const header = rows[0].map(h => h.trim().toLowerCase());

    if (header.includes('title') && header.includes('cue')) {
      habitRows = rows;
    } else if (header.includes('habit id') && header.includes('date')) {
      logRows = rows;
    }
  });

  const habitRecords: Habit[] = [];
  const logRecords: HabitLog[] = [];

  // Use explicit casting here to keep TypeScript satisfied in the build,
  // since these variables are populated dynamically from parsed CSV content.
  if (habitRows && (habitRows as CsvRow[]).length > 1) {
    const [, ...dataRows] = habitRows as CsvRow[];
    for (const row of dataRows) {
      if (!row || row.length === 0) continue;
      const [id, title, cue, tinyVersion, temptationBundle, createdAt] = row;
      if (!title) continue;

      const record: Habit = {
        id: id ? Number(id) : undefined,
        title: stripQuotes(title),
        cue: stripQuotes(cue ?? ''),
        tinyVersion: stripQuotes(tinyVersion ?? ''),
        temptationBundle: stripQuotes(temptationBundle ?? '') || undefined,
        frequency: 'daily',
        pinned: false,
        archived: false,
        createdAt: parseDateTime(createdAt),
      };
      habitRecords.push(record);
    }
  }

  if (logRows && (logRows as CsvRow[]).length > 1) {
    const [, ...dataRows] = logRows as CsvRow[];
    for (const row of dataRows) {
      if (!row || row.length === 0) continue;
      const [id, habitId, date, type, value, createdAt] = row;
      if (!habitId || !date) continue;

      const logRecord: HabitLog = {
        id: id ? Number(id) : undefined,
        habitId: Number(habitId),
        date: stripQuotes(date),
        type: stripQuotes(type) as HabitLog['type'],
        value: value ? Number(value) : undefined,
        createdAt: parseDateTime(createdAt),
      };
      logRecords.push(logRecord);
    }
  }

  await db.transaction('rw', db.habits, db.logs, async () => {
    // Replace current data with imported backup
    await db.logs.clear();
    await db.habits.clear();
    if (habitRecords.length) {
      await db.habits.bulkAdd(habitRecords);
    }
    if (logRecords.length) {
      await db.logs.bulkAdd(logRecords);
    }
  });

  return {
    habits: habitRecords.length,
    logs: logRecords.length,
  };
};


