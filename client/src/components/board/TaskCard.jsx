import { Draggable } from '@hello-pangea/dnd';
import { useState } from 'react';
import TaskDetailsModal from './TaskDetailsModal';

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export default function TaskCard({ task, index, columnId, projectId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!task?.id) {
    console.error('Task is missing required data:', task);
    return null;
  }

  const handleTaskClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const formatTime = (time) => {
    if (time === null || time === undefined || time === '') return null;
    const hours = Number(time);
    if (isNaN(hours)) return time; // If it's not a number, return as is
    return `${hours}h`;
  };

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={handleTaskClick}
            className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
              snapshot.isDragging ? 'shadow-lg' : ''
            }`}
            data-testid={`task-card-${task.id}`}
          >
            <div className="flex flex-col gap-2">
              {/* Title and Priority */}
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-medium text-gray-900">{task.title || 'Untitled Task'}</h4>
                <span 
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    priorityColors[task.priority] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Medium'}
                </span>
              </div>

              {/* Description */}
              {task.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
              )}

              {/* Time Estimates */}
              {(task.estimatedTime || task.timeSpent) && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="space-x-2">
                    {task.estimatedTime !== null && task.estimatedTime !== undefined && (
                      <span>Est: {formatTime(task.estimatedTime)}</span>
                    )}
                    {task.timeSpent !== null && task.timeSpent !== undefined && (
                      <span>Spent: {formatTime(task.timeSpent)}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Assignees */}
              <div className="flex flex-wrap gap-2 mt-1">
                {task.assignee && (
                  <div className="flex items-center" title={`Assignee: ${task.assignee.name}`}>
                    <span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600">
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {task.designer && (
                  <div className="flex items-center" title={`Designer: ${task.designer.name}`}>
                    <span className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-xs text-purple-600">
                      {task.designer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {task.tester && (
                  <div className="flex items-center" title={`Tester: ${task.tester.name}`}>
                    <span className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-xs text-green-600">
                      {task.tester.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Draggable>

      <TaskDetailsModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        task={task}
      />
    </>
  );
}