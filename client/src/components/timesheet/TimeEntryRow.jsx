import { format } from 'date-fns';
import { useState } from 'react';
import TimeEntryEditModal from './TimeEntryEditModal';

export default function TimeEntryRow({ groupedEntry, days }) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const formatTime = (totalMinutes) => {
    if (!totalMinutes && totalMinutes !== 0) return '';
    
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 8;
    
    const days = Math.floor(totalMinutes / (MINUTES_PER_HOUR * HOURS_PER_DAY));
    const remainingMinutesAfterDays = totalMinutes % (MINUTES_PER_HOUR * HOURS_PER_DAY);
    const hours = Math.floor(remainingMinutesAfterDays / MINUTES_PER_HOUR);
    const minutes = remainingMinutesAfterDays % MINUTES_PER_HOUR;
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.length > 0 ? parts.join(' ') : '0m';
  };

  const getTimeForDay = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const entries = groupedEntry.entries[dateKey] || [];
    const totalMinutes = entries.reduce((sum, entry) => sum + entry.timeSpent.total, 0);
    return { time: formatTime(totalMinutes), entries };
  };

  const handleTimeClick = (day) => {
    setSelectedDate(day);
    setEditModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-9 gap-2 px-6 py-3 text-sm text-gray-900 items-center hover:bg-gray-50">
        <div className="col-span-3">
          <div>
            <div className="font-medium">
              {groupedEntry.task.key} - {groupedEntry.task.title}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {Object.values(groupedEntry.entries)
                .flat()
                .map(entry => entry.description)
                .filter(Boolean)
                .map((desc, i) => (
                  <div key={i} className="mt-0.5">{desc}</div>
                ))}
            </div>
          </div>
        </div>
        
        {days.map((day) => {
          const timeData = getTimeForDay(day);
          return (
            <div key={day.toString()} className="text-center">
              <button
                onClick={() => handleTimeClick(day)}
                className={`inline-flex items-center px-2 py-1 rounded-md ${
                  timeData.entries.length > 0
                    ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                {timeData.time}
              </button>
            </div>
          );
        })}
        
        <div className="text-center font-medium">
          {formatTime(groupedEntry.totalTime)}
        </div>
      </div>

      {editModalOpen && selectedDate && (
        <TimeEntryEditModal
          isOpen={editModalOpen}
          setIsOpen={setEditModalOpen}
          entries={groupedEntry.entries[format(selectedDate, 'yyyy-MM-dd')] || []}
          date={selectedDate}
          task={groupedEntry.task}
        />
      )}
    </>
  );
}