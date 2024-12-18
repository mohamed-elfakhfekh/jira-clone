import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import TimeEntryModal from '../components/timesheet/TimeEntryModal';
import TimeEntryRow from '../components/timesheet/TimeEntryRow';
import toast from 'react-hot-toast';

export default function TimeSheets() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: timeEntries, isLoading } = useQuery(
    ['timeEntries', format(weekStart, 'yyyy-MM-dd')],
    async () => {
      const { data } = await axios.get(`/time-entries`, {
        params: {
          startDate: format(weekStart, 'yyyy-MM-dd'),
          endDate: format(weekEnd, 'yyyy-MM-dd'),
        },
      });
      return data;
    }
  );

  const deleteTimeEntryMutation = useMutation(
    async (id) => {
      await axios.delete(`/time-entries/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['timeEntries']);
        toast.success('Time entry deleted');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error deleting time entry');
      },
    }
  );

  const navigateWeek = (direction) => {
    setSelectedDate(direction === 'next' 
      ? addWeeks(selectedDate, 1)
      : subWeeks(selectedDate, 1)
    );
  };

  const getDayTotal = (date) => {
    if (!timeEntries) return 0;
    return timeEntries
      .filter(entry => format(new Date(entry.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      .reduce((sum, entry) => sum + entry.timeSpent, 0);
  };

  const getWeekTotal = () => {
    if (!timeEntries) return 0;
    return timeEntries.reduce((sum, entry) => sum + entry.timeSpent, 0);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Time Sheets
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Log Time
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              Week of {format(weekStart, 'MMM d, yyyy')}
            </h3>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="min-w-full divide-y divide-gray-200">
              <div className="bg-gray-50">
                <div className="grid grid-cols-9 gap-2 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-3">Task</div>
                  {days.map((day) => (
                    <div key={day.toString()} className="text-center">
                      {format(day, 'EEE dd')}
                    </div>
                  ))}
                  <div className="text-center">Total</div>
                </div>
              </div>

              <div className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <div className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading time entries...
                  </div>
                ) : timeEntries?.length > 0 ? (
                  timeEntries.map((entry) => (
                    <TimeEntryRow
                      key={entry.id}
                      entry={entry}
                      days={days}
                      onDelete={() => deleteTimeEntryMutation.mutate(entry.id)}
                    />
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-sm text-gray-500">
                    No time entries for this week
                  </div>
                )}
              </div>

              {/* Totals row */}
              <div className="bg-gray-50">
                <div className="grid grid-cols-9 gap-2 px-6 py-3 text-sm font-medium text-gray-900">
                  <div className="col-span-3">Daily Total</div>
                  {days.map((day) => (
                    <div key={day.toString()} className="text-center">
                      {getDayTotal(day) / 60}h
                    </div>
                  ))}
                  <div className="text-center font-bold">
                    {getWeekTotal() / 60}h
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TimeEntryModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}