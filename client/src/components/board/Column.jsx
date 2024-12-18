import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

export default function Column({ column }) {
  return (
    <div className="flex flex-col bg-gray-100 rounded-lg h-full">
      <div className="p-2 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-900 py-1 px-2">
          {column.name}
        </h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-200 py-1 px-2 rounded-full">
          {column.tasks?.length || 0}
        </span>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-gray-200' : ''
            }`}
          >
            <div className="space-y-2">
              {column.tasks?.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}