import { Draggable } from 'react-beautiful-dnd';

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const typeIcons = {
  TASK: '📋',
  BUG: '🐞',
  STORY: '📖',
  EPIC: '🚀',
};

export default function TaskCard({ task, index }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow p-3 ${
            snapshot.isDragging ? 'shadow-lg' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span role="img" aria-label={task.type}>
              {typeIcons[task.type]}
            </span>
            <span className="text-xs text-gray-500">
              {task.number}
            </span>
          </div>
          
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {task.title}
          </h4>

          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>

            {task.assignee && (
              <div className="flex items-center">
                {task.assignee.avatar ? (
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {task.assignee.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}