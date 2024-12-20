import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function TimeEntryEditModal({ isOpen, setIsOpen, entries, date, task }) {
  const queryClient = useQueryClient();
  
  const [editedEntries, setEditedEntries] = useState(
    entries.map(entry => ({
      ...entry,
      hours: Math.floor(entry.timeSpent.total / 60),
      minutes: entry.timeSpent.total % 60
    }))
  );

  const [newEntries, setNewEntries] = useState([]);

  const createTimeEntryMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('yajouraToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/time-entries`,
        {
          ...data,
          taskId: task.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['timeEntries']);
      toast.success('Time entry created');
      setEditedEntries(prev => [...prev, {
        ...data,
        hours: Math.floor(data.timeSpent.total / 60),
        minutes: data.timeSpent.total % 60
      }]);
      setNewEntries(prev => prev.filter(entry => entry.tempId !== data.tempId));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create time entry');
    },
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('yajouraToken');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/time-entries/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['timeEntries']);
      toast.success('Time entry updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update time entry');
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('yajouraToken');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/time-entries/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['timeEntries']);
      toast.success('Time entry deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete time entry');
    },
  });

  const handleTimeChange = (entryIndex, field, value, isNew = false) => {
    if (isNew) {
      const newEntriesCopy = [...newEntries];
      newEntriesCopy[entryIndex] = {
        ...newEntriesCopy[entryIndex],
        [field]: parseInt(value) || 0
      };
      setNewEntries(newEntriesCopy);
    } else {
      const newEntries = [...editedEntries];
      newEntries[entryIndex] = {
        ...newEntries[entryIndex],
        [field]: parseInt(value) || 0
      };
      setEditedEntries(newEntries);
    }
  };

  const handleDescriptionChange = (entryIndex, value, isNew = false) => {
    if (isNew) {
      const newEntriesCopy = [...newEntries];
      newEntriesCopy[entryIndex] = {
        ...newEntriesCopy[entryIndex],
        description: value
      };
      setNewEntries(newEntriesCopy);
    } else {
      const newEntries = [...editedEntries];
      newEntries[entryIndex] = {
        ...newEntries[entryIndex],
        description: value
      };
      setEditedEntries(newEntries);
    }
  };

  const handleSave = async (entry) => {
    const totalMinutes = (entry.hours * 60) + entry.minutes;
    if (totalMinutes === 0) {
      toast.error('Time must be greater than 0');
      return;
    }

    await updateTimeEntryMutation.mutateAsync({
      id: entry.id,
      data: {
        description: entry.description,
        hours: entry.hours,
        minutes: entry.minutes,
        date: format(new Date(date), 'yyyy-MM-dd'),
      }
    });
  };

  const handleSaveNew = async (entry) => {
    const totalMinutes = (entry.hours * 60) + entry.minutes;
    if (totalMinutes === 0) {
      toast.error('Time must be greater than 0');
      return;
    }

    await createTimeEntryMutation.mutateAsync({
      description: entry.description,
      hours: entry.hours,
      minutes: entry.minutes,
      date: format(new Date(date), 'yyyy-MM-dd'),
      tempId: entry.tempId,
    });
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      await deleteTimeEntryMutation.mutateAsync(entryId);
      setEditedEntries(prev => prev.filter(entry => entry.id !== entryId));
      if (editedEntries.length === 1) {
        setIsOpen(false);
      }
    }
  };

  const handleRemoveNewEntry = (tempId) => {
    setNewEntries(prev => prev.filter(entry => entry.tempId !== tempId));
  };

  const handleAddEntry = () => {
    setNewEntries(prev => [...prev, {
      tempId: Date.now(),
      description: '',
      hours: 0,
      minutes: 0
    }]);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
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
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Edit Time Entries - {format(new Date(date), 'MMM dd, yyyy')}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {task.key} - {task.title}
                      </p>
                    </div>

                    <div className="mt-4 space-y-4">
                      {editedEntries.map((entry, index) => (
                        <div key={entry.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Time Spent
                                </label>
                                <div className="mt-1 flex gap-2">
                                  <div>
                                    <input
                                      type="number"
                                      value={entry.hours}
                                      onChange={(e) => handleTimeChange(index, 'hours', e.target.value)}
                                      className="block w-20 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                      min="0"
                                    />
                                    <span className="text-sm text-gray-500">hours</span>
                                  </div>
                                  <div>
                                    <input
                                      type="number"
                                      value={entry.minutes}
                                      onChange={(e) => handleTimeChange(index, 'minutes', e.target.value)}
                                      className="block w-20 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                      min="0"
                                      max="59"
                                    />
                                    <span className="text-sm text-gray-500">minutes</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Description
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="text"
                                    value={entry.description || ''}
                                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleSave(entry)}
                                  className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="inline-flex justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {newEntries.map((entry, index) => (
                        <div key={entry.tempId} className="border-2 border-dashed border-primary-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Time Spent
                                </label>
                                <div className="mt-1 flex gap-2">
                                  <div>
                                    <input
                                      type="number"
                                      value={entry.hours}
                                      onChange={(e) => handleTimeChange(index, 'hours', e.target.value, true)}
                                      className="block w-20 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                      min="0"
                                    />
                                    <span className="text-sm text-gray-500">hours</span>
                                  </div>
                                  <div>
                                    <input
                                      type="number"
                                      value={entry.minutes}
                                      onChange={(e) => handleTimeChange(index, 'minutes', e.target.value, true)}
                                      className="block w-20 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                      min="0"
                                      max="59"
                                    />
                                    <span className="text-sm text-gray-500">minutes</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Description
                                </label>
                                <div className="mt-1">
                                  <input
                                    type="text"
                                    value={entry.description || ''}
                                    onChange={(e) => handleDescriptionChange(index, e.target.value, true)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleSaveNew(entry)}
                                  className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => handleRemoveNewEntry(entry.tempId)}
                                  className="inline-flex justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={handleAddEntry}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <PlusIcon className="h-5 w-5" />
                        Add New Entry
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setIsOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
