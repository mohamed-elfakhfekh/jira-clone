import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatTimeSpent } from '../../utils/timeUtils';
import { format } from 'date-fns';
import TimeEntryModal from '../timesheet/TimeEntryModal';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  TagIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const typeColors = {
  TASK: 'bg-blue-100 text-blue-800',
  BUG: 'bg-red-100 text-red-800',
  STORY: 'bg-purple-100 text-purple-800',
  EPIC: 'bg-indigo-100 text-indigo-800',
};

export default function TaskDetailsModal({ isOpen, setIsOpen, task }) {
  const [isTimeEntryModalOpen, setIsTimeEntryModalOpen] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [estimatedTime, setEstimatedTime] = useState(task?.estimatedTime || 0);
  const queryClient = useQueryClient();

  const { data: board } = useQuery({
    queryKey: ['board', task?.projectId],
    queryFn: async () => {
      if (!task?.projectId) return null;
      const token = localStorage.getItem('yajouraToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/projects/${task.projectId}/board`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!task?.projectId,
  });

  const { data: project } = useQuery({
    queryKey: ['project', task?.projectId],
    queryFn: async () => {
      if (!task?.projectId) return null;
      const token = localStorage.getItem('yajouraToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/projects/${task.projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!task?.projectId,
  });

  const formatEstimatedTime = (hours) => {
    if (!hours && hours !== 0) return 'Not estimated';
    const days = Math.floor(hours / 8);
    const remainingHours = hours % 8;
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (remainingHours > 0) parts.push(`${remainingHours}h`);
    return parts.join(' ') || '0h';
  };

  const updateTaskMutation = useMutation({
    mutationFn: async (updates) => {
      const token = localStorage.getItem('yajouraToken');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/tasks/${task.id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['board', task.projectId]);
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update task');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('yajouraToken');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/tasks/${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      setIsOpen(false);
      queryClient.invalidateQueries(['board', task.projectId]);
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    },
  });

  const handleTitleChange = () => {
    if (title.trim() === task.title) return;
    updateTaskMutation.mutate({ title: title.trim() });
  };

  const handleStatusChange = (columnId) => {
    updateTaskMutation.mutate({ columnId });
  };

  const handleAssigneeChange = (assigneeId) => {
    updateTaskMutation.mutate({ assigneeId });
  };

  const handleDescriptionChange = () => {
    updateTaskMutation.mutate({ description });
  };

  const handleEstimationChange = () => {
    updateTaskMutation.mutate({ estimatedTime: parseFloat(estimatedTime) });
  };

  if (!task) return null;

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this task?')) {
                          deleteTaskMutation.mutate();
                        }
                      }}
                    >
                      <span className="sr-only">Delete task</span>
                      <TrashIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      {/* Header */}
                      <div className="mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="font-mono">{task.number}</span>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              typeColors[task.type]
                            }`}
                          >
                            {task.type}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              priorityColors[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              onBlur={handleTitleChange}
                              className="text-base font-semibold leading-6 text-gray-900 border-0 focus:ring-0 p-0 focus:outline-none"
                            />
                            <p className="text-sm text-gray-500">
                              in list <span className="font-medium">{task.status}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Two-column layout */}
                      <div className="grid grid-cols-3 gap-6">
                        {/* Main content */}
                        <div className="col-span-2 space-y-6">
                          {/* Description */}
                          <div>
                            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <DocumentTextIcon className="h-5 w-5" />
                              Description
                            </h3>
                            <div className="mt-2">
                              <textarea
                                rows={3}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Time tracking */}
                          <div>
                            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <ClockIcon className="h-5 w-5" />
                              Time Tracking
                            </h3>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="min-w-32">Estimated:</span>
                                <input
                                  type="number"
                                  value={estimatedTime}
                                  onChange={(e) => setEstimatedTime(e.target.value)}
                                  className="w-20 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                                  min="0"
                                  step="0.5"
                                /> hours
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="min-w-32">Time spent:</span>
                                <span>{formatTimeSpent(task.timeSpent)}</span>
                                <button
                                  onClick={() => setIsTimeEntryModalOpen(true)}
                                  className="ml-2 rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
                                >
                                  Log time
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                          {/* Status */}
                          <div>
                            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <ArrowPathIcon className="h-5 w-5" />
                              Status
                            </h3>
                            {board && (
                              <select
                                value={task.columnId}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                              >
                                {board.columns.map((column) => (
                                  <option key={column.id} value={column.id}>
                                    {column.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>

                          {/* Assignee */}
                          <div>
                            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <UserIcon className="h-5 w-5" />
                              Assignee
                            </h3>
                            <select
                              value={task.assigneeId || ''}
                              onChange={(e) => handleAssigneeChange(e.target.value)}
                              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
                            >
                              <option value="">Unassigned</option>
                              {project?.members?.map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Dates */}
                          <div className="space-y-4">
                            {task.startedAt && (
                              <div>
                                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  Started
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {format(new Date(task.startedAt), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            )}

                            {task.completedAt && (
                              <div>
                                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  Completed
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {format(
                                    new Date(task.completedAt),
                                    "MMM d, yyyy 'at' h:mm a"
                                  )}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Other assignees */}
                          <div className="space-y-4">
                            {task.designer && (
                              <div>
                                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  Designer
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {task.designer.name}
                                </p>
                              </div>
                            )}

                            {task.tester && (
                              <div>
                                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                  Tester
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {task.tester.name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <TimeEntryModal
        open={isTimeEntryModalOpen}
        setOpen={setIsTimeEntryModalOpen}
        task={task}
      />
    </>
  );
}
