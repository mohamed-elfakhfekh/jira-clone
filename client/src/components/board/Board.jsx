import { useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Column from './Column';
import CreateTaskModal from './CreateTaskModal';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Board({ board, projectId }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateTaskPosition = useMutation({
    mutationFn: async ({ taskId, columnId, order }) => {
      const { data } = await axios.patch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
        columnId,
        order
      });
      return data;
    },
    onError: (error) => {
      toast.error('Failed to update task position');
      // Invalidate to refresh the board
      queryClient.invalidateQueries(['board', projectId]);
    }
  });

  const onDragEnd = async (result) => {
    const { destination, source, draggableId: taskId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Optimistically update the UI
    queryClient.setQueryData(['board', projectId], (oldData) => {
      if (!oldData) return oldData;

      const newColumns = {...oldData.columns};
      const sourceColumn = newColumns[source.droppableId];
      const destColumn = newColumns[destination.droppableId];
      const task = sourceColumn.tasks.find(t => t.id === taskId);

      if (source.droppableId === destination.droppableId) {
        // Moving within the same column
        const newTasks = Array.from(sourceColumn.tasks);
        newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, task);
        newColumns[source.droppableId].tasks = newTasks;
      } else {
        // Moving to a different column
        const sourceTasks = Array.from(sourceColumn.tasks);
        const destTasks = Array.from(destColumn.tasks);
        sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, task);
        newColumns[source.droppableId].tasks = sourceTasks;
        newColumns[destination.droppableId].tasks = destTasks;
      }

      return {
        ...oldData,
        columns: newColumns
      };
    });

    // Make the API call
    try {
      await updateTaskPosition.mutateAsync({
        taskId,
        columnId: destination.droppableId,
        order: destination.index
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No board found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new board.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 pb-4">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-base font-semibold leading-6 text-gray-900">Tasks</h2>
            <p className="mt-2 text-sm text-gray-700">
              Manage and track tasks across different stages
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline-block" aria-hidden="true" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="h-full px-4 sm:px-6 lg:px-8">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full pb-4">
              {board.columns?.map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80">
                  <Column column={column} />
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateTaskModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={projectId}
          boardId={board.id}
          columns={board.columns}
        />
      )}
    </>
  );
}