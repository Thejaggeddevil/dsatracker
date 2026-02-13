import { useMemo } from 'react';

interface StreakData {
  [dateKey: string]: {
    count: number; // number of questions submitted
    isActive: boolean;
  };
}

interface StreakGridProps {
  streakData: StreakData;
  currentStreak: number;
  maxStreak: number;
  totalActiveDays: number;
}

const StreakGrid = ({
  streakData,
  currentStreak,
  maxStreak,
  totalActiveDays
}: StreakGridProps) => {
  // Generate last 52 weeks of data
  const gridData = useMemo(() => {
    const today = new Date();
    const weeks: (Date | null)[][] = [];
    
    // Start from 52 weeks ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 365);
    
    // Get the day of week for start date (0 = Sunday)
    const firstDay = startDate.getDay();
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - firstDay);
    
    // Build weeks
    while (currentDate <= today) {
      const week: (Date | null)[] = [];
      
      for (let i = 0; i < 7; i++) {
        if (currentDate <= today && currentDate >= startDate) {
          week.push(new Date(currentDate));
        } else if (currentDate > today) {
          week.push(null);
        } else {
          week.push(null);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
    }
    
    return weeks;
  }, []);

  const getDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getActivityLevel = (date: Date | null): 'none' | 'low' | 'medium' | 'high' => {
    if (!date) return 'none';
    
    const key = getDateKey(date);
    const data = streakData[key];
    
    if (!data || !data.isActive) return 'none';
    if (data.count === 1) return 'low';
    if (data.count <= 2) return 'medium';
    return 'high';
  };

  const getTooltip = (date: Date | null): string => {
    if (!date) return '';
    
    const key = getDateKey(date);
    const data = streakData[key];
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    if (!data || !data.isActive) {
      return `${formatted} - No submissions`;
    }
    
    return `${formatted} - ${data.count} question${data.count !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
          <div className="text-sm text-[#999999] mb-1">Total Days</div>
          <div className="text-2xl font-bold text-white">{totalActiveDays}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
          <div className="text-sm text-[#999999] mb-1">Current Streak</div>
          <div className="text-2xl font-bold text-[#0092CC]">{currentStreak}</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
          <div className="text-sm text-[#999999] mb-1">Max Streak</div>
          <div className="text-2xl font-bold text-white">{maxStreak}</div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Day labels */}
            <div className="flex gap-1 mb-2">
              <div className="w-8" />
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="w-4 text-center text-xs text-[#666666]"
                >
                  {day.slice(0, 1)}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {gridData.map((week, weekIdx) => (
              <div key={weekIdx} className="flex gap-1 mb-1">
                {/* Week number */}
                {weekIdx % 4 === 0 && (
                  <div className="w-8 flex items-center justify-end text-xs text-[#666666] pr-2">
                    {weekIdx === 0 ? '' : `W${Math.floor(weekIdx / 4)}`}
                  </div>
                )}
                {weekIdx % 4 !== 0 && <div className="w-8" />}

                {/* Days */}
                {week.map((date, dayIdx) => {
                  const level = getActivityLevel(date);
                  const colors = {
                    none: 'bg-[#161616] border border-[#1a1a1a]',
                    low: 'bg-[#0d3d2d] border border-[#1a5f45]', // Dark green-tinted
                    medium: 'bg-[#0f5f40] border border-[#2a9d6f]', // Medium green
                    high: 'bg-[#0092CC] border border-[#00a8e8]' // Sky blue (most active)
                  };

                  return (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      title={getTooltip(date)}
                      className={`w-4 h-4 rounded cursor-help transition-opacity hover:opacity-80 ${colors[level]}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#1a1a1a] text-xs">
          <span className="text-[#666666]">Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-[#161616] border border-[#1a1a1a]" />
            <div className="w-3 h-3 rounded bg-[#0d3d2d] border border-[#1a5f45]" />
            <div className="w-3 h-3 rounded bg-[#0f5f40] border border-[#2a9d6f]" />
            <div className="w-3 h-3 rounded bg-[#0092CC] border border-[#00a8e8]" />
          </div>
          <span className="text-[#666666]">More</span>
        </div>
      </div>
    </div>
  );
};

export default StreakGrid;
