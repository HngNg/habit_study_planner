// frontend/src/components/Heatmap.tsx
import React, { useEffect, useState } from 'react';
import { db, type HabitLog } from '../db/db';

interface HeatmapProps {
  habitId?: number; // If undefined, shows all habits
}

export const Heatmap: React.FC<HeatmapProps> = ({ habitId }) => {
  const [heatmapData, setHeatmapData] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeatmapData();
  }, [habitId]);

  const loadHeatmapData = async () => {
    setLoading(true);
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Start from January 1st of current year
    const startDate = new Date(currentYear, 0, 1);
    // End at December 31st of current year
    const endDate = new Date(currentYear, 11, 31);

    let logs: HabitLog[];
    if (habitId) {
      logs = await db.habitLogs.where('habitId').equals(habitId).toArray();
    } else {
      logs = await db.habitLogs.toArray();
    }

    // Filter logs within date range
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });

    // Count completions per date
    const dataMap = new Map<string, number>();
    filteredLogs.forEach(log => {
      if (log.completed) {
        const count = dataMap.get(log.date) || 0;
        dataMap.set(log.date, count + 1);
      }
    });

    setHeatmapData(dataMap);
    setLoading(false);
  };

  const getDayColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100 border border-gray-200';
    if (count === 1) return 'bg-emerald-300';
    if (count === 2) return 'bg-emerald-500';
    if (count === 3) return 'bg-emerald-600';
    if (count >= 4) return 'bg-emerald-700';
    return 'bg-gray-100 border border-gray-200';
  };

  const generateCalendar = () => {
    const weeks: Date[][] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Start from January 1st of current year
    const startDate = new Date(currentYear, 0, 1);
    
    // Start from the beginning of the week (Sunday)
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    // End at December 31st of current year
    const endDate = new Date(currentYear, 11, 31);

    while (currentDate <= endDate) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const getMonthPositions = (weeks: Date[][]) => {
    const positions: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, idx) => {
      const firstDay = week[0];
      const month = firstDay.getMonth();
      const year = firstDay.getFullYear();
      const currentYear = new Date().getFullYear();
      
      // Only show month labels for dates within current year
      if (month !== lastMonth && year === currentYear) {
        positions.push({
          label: firstDay.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: idx
        });
        lastMonth = month;
      }
    });

    return positions;
  };

  const weeks = generateCalendar();
  const monthPositions = getMonthPositions(weeks);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading heatmap...</div>;
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📊 Activity Heatmap - {currentYear}
      </h3>
      
      <div className="overflow-x-auto pb-3 -mx-2 px-2">
        <div className="inline-block min-w-max">
          <div className="flex gap-1.5">
            {/* Day Labels Column */}
            <div className="flex flex-col justify-between pr-3 text-xs text-gray-600 pt-6">
              <div className="h-4 flex items-center">Sun</div>
              <div className="h-4 flex items-center">Mon</div>
              <div className="h-4 flex items-center">Tue</div>
              <div className="h-4 flex items-center">Wed</div>
              <div className="h-4 flex items-center">Thu</div>
              <div className="h-4 flex items-center">Fri</div>
              <div className="h-4 flex items-center">Sat</div>
            </div>

            <div className="flex-1">
              {/* Month Labels */}
              <div className="relative h-6 mb-1">
                {monthPositions.map((pos, idx) => (
                  <div
                    key={idx}
                    className="absolute text-xs font-semibold text-gray-700"
                    style={{ left: `${pos.weekIndex * 18}px` }}
                  >
                    {pos.label}
                  </div>
                ))}
              </div>

              {/* Heatmap Grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((date, dayIdx) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const count = heatmapData.get(dateStr) || 0;
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      const isFuture = date > new Date();

                      return (
                        <div
                          key={dayIdx}
                          className={`w-4 h-4 rounded transition-all hover:ring-2 hover:ring-blue-400 hover:scale-110 cursor-pointer ${
                            isFuture ? 'bg-transparent border border-gray-200' : getDayColor(count)
                          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                          title={`${date.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric' 
                          })}: ${count} habit${count !== 1 ? 's' : ''} completed`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-3 mt-5 text-xs text-gray-600">
            <span className="font-medium">Less</span>
            <div className="flex gap-1.5">
              <div className="w-4 h-4 bg-gray-100 rounded border border-gray-200" title="0 completions" />
              <div className="w-4 h-4 bg-emerald-300 rounded" title="1 completion" />
              <div className="w-4 h-4 bg-emerald-500 rounded" title="2 completions" />
              <div className="w-4 h-4 bg-emerald-600 rounded" title="3 completions" />
              <div className="w-4 h-4 bg-emerald-700 rounded" title="4+ completions" />
            </div>
            <span className="font-medium">More</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <StatCard 
          label="Total Days" 
          value={heatmapData.size} 
          icon="📅"
        />
        <StatCard 
          label="Total Completions" 
          value={Array.from(heatmapData.values()).reduce((a, b) => a + b, 0)} 
          icon="✅"
        />
        <StatCard 
          label="Avg per Day" 
          value={(Array.from(heatmapData.values()).reduce((a, b) => a + b, 0) / (heatmapData.size || 1)).toFixed(1)} 
          icon="📈"
        />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number | string; icon: string }> = ({ 
  label, 
  value, 
  icon 
}) => (
  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-md">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-2xl">{icon}</span>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);
