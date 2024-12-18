import { format } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function TimeEntryRow({ entry, days, onDelete }) {
  const getTimeForDay = (day) => {
    if (format(new Date(entry.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')) {
      return entry.timeSpent / 60; // Convert minutes to hours
    }
    return null;
  };

  return (
    <div className="grid grid-cols-9 gap-2 px-6 py-3 text-sm text-gray-900 items-center hover:bg-gray-50">
      <div className="col-span-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">
              {entry.task.key} - {entry.task.title}
            </div>
            {entry.description && (
              <div className="text-gray-500 text-xs mt-1">
                {entry.description}
              </div>
            )}
          </div>
          <button
            onClick={() => onDelete(entry.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {days.map((day) => {
        const time = getTimeForDay(day);
        return (
          <div key={day.toString()} className="text-center">
            {time && (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary-50 text-primary-700">
                {time}h
              </span>
            )}
          </div>
        );
      })}
      
      <div className="text-center font-medium">
        {entry.timeSpent / 60}h
      </div>
    </div>
  );
}