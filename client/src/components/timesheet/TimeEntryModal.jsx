import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TimeEntryModal({ open, setOpen, task }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      hours: '',
      minutes: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('yajouraToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/time-entries`,
        {
          ...data,
          taskId: task.id,
          hours: parseInt(data.hours) || 0,
          minutes: parseInt(data.minutes) || 0,
          date: new Date(data.date),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['board', task.projectId]);
      toast.success('Time entry added successfully');
      reset();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add time entry');
    },
  });

  const onSubmit = (data) => {
    createTimeEntryMutation.mutate(data);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
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
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Log Time
                    </Dialog.Title>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                      <div className="space-y-6">
                        {/* Task Info */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Task
                          </label>
                          <div className="mt-1 text-sm text-gray-500">
                            {task.title}
                          </div>
                        </div>

                        {/* Date */}
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date
                          </label>
                          <div className="mt-1">
                            <input
                              type="date"
                              id="date"
                              {...register('date', { required: 'Date is required' })}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                            />
                            {errors.date && (
                              <p className="mt-2 text-sm text-red-600">{errors.date.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Time spent */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                              Hours
                            </label>
                            <div className="mt-1">
                              <input
                                type="number"
                                id="hours"
                                min="0"
                                {...register('hours', {
                                  min: { value: 0, message: 'Hours cannot be negative' },
                                })}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                              />
                              {errors.hours && (
                                <p className="mt-2 text-sm text-red-600">{errors.hours.message}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label htmlFor="minutes" className="block text-sm font-medium text-gray-700">
                              Minutes
                            </label>
                            <div className="mt-1">
                              <input
                                type="number"
                                id="minutes"
                                min="0"
                                max="59"
                                {...register('minutes', {
                                  min: { value: 0, message: 'Minutes cannot be negative' },
                                  max: { value: 59, message: 'Minutes cannot exceed 59' },
                                })}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                              />
                              {errors.minutes && (
                                <p className="mt-2 text-sm text-red-600">{errors.minutes.message}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="description"
                              rows={3}
                              {...register('description')}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        {/* Submit button */}
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            disabled={createTimeEntryMutation.isLoading}
                            className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {createTimeEntryMutation.isLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setOpen(false)}
                          >
                            Cancel
                          </button>
                        </div>
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