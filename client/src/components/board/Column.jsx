import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

export default function Column({ column = {}, tasks = [], projectId }) {
  if (!column || !column.id) {
    console.error('Column is missing required data:', column);
    return null;
  }

  const columnName = column.name || 'Untitled';

  return (
    <div 
      className="flex flex-col w-72 bg-gray-100 rounded-lg h-full"
      data-testid={`column-${columnName.toLowerCase().replace(' ', '-')}`}
      role="region"
      aria-label={`${columnName} column`}
    >
      {/* Column header */}
      <div className="p-2 font-medium text-gray-700">
        <h3 
          className="text-sm font-medium text-gray-900 py-1 px-2"
          data-testid={`column-title-${columnName.toLowerCase().replace(' ', '-')}`}
        >
          {columnName} ({tasks.length})
        </h3>
      </div>

      {/* Column content */}
      <Droppable droppableId={column.id} type="TASK">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 space-y-2 min-h-[200px] ${
              snapshot.isDraggingOver ? 'bg-gray-200' : ''
            }`}
            data-testid={`column-droppable-${columnName.toLowerCase().replace(' ', '-')}`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                columnId={column.id}
                projectId={projectId}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}