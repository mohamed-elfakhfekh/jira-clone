import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TimeEntryModal({ open, onClose, selectedDate, initialData }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      date: format(selectedDate, 'yyyy-MM-dd'),
      timeSpent: '',
      description: '',
      taskId: '',
    },
  });

  // Fetch assigned tasks
  const { data: tasks } = useQuery(['assignedTasks'], async () => {
    const { data } = await axios.get('/tasks/assigned');
    return data;
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post('/time-entries', {
        ...data,
        timeSpent: parseFloat(data.timeSpent) * 60, // Convert hours to minutes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['timeEntries']);
      toast.success('Time entry created successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error creating time entry');
    },
  });

  const onSubmit = (data) => {
    createTimeEntryMutation.mutate(data);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Log Time
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="task" className="block text-sm font-medium text-gray-700">
                          Task
                        </label>
                        <select
                          {...register('taskId', { required: 'Task is required' })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                          <option value="">Select a task</option>
                          {tasks?.map((task) => (
                            <option key={task.id} value={task.id}>
                              {task.key} - {task.title}
                            </option>
                          ))}
                        </select>
                        {errors.taskId && (
                          <p className="mt-1 text-sm text-red-600">{errors.taskId.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Date
                        </label>
                        <input
                          type="date"
                          {...register('date', { required: 'Date is required' })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                        {errors.date && (
                          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="timeSpent" className="block text-sm font-medium text-gray-700">
                          Time Spent (hours)
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          {...register('timeSpent', {
                            required: 'Time spent is required',
                            min: { value: 0.25, message: 'Minimum time is 0.25 hours' },
                            max: { value: 24, message: 'Maximum time is 24 hours' }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                        {errors.timeSpent && (
                          <p className="mt-1 text-sm text-red-600">{errors.timeSpent.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          {...register('description')}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          placeholder="What did you work on?"
                        />
                      </div>

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                          type="submit"
                          disabled={createTimeEntryMutation.isLoading}
                          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:col-start-2"
                        >
                          {createTimeEntryMutation.isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}