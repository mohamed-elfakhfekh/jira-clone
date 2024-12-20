import { useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
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
      const token = localStorage.getItem('yajouraToken');
      const { data } = await axios.patch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
        columnId,
        order
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return data;
    },
    onError: (error) => {
      console.error('Error updating task position:', error.response?.data || error);
      toast.error('Failed to update task position');
      queryClient.invalidateQueries(['board', projectId]);
    }
  });

  if (!board || !board.columns) {
    return (
      <div 
        className="flex items-center justify-center h-full"
        data-testid="empty-board-state"
      >
        <div className="text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No board found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new board.
          </p>
        </div>
      </div>
    );
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceColumn = board.columns.find(col => col.id === result.source.droppableId);
    const destColumn = board.columns.find(col => col.id === result.destination.droppableId);
    
    if (!sourceColumn || !destColumn) {
      console.error('Source or destination column not found:', { result, columns: board.columns });
      return;
    }

    try {
      // Get the task being moved
      const taskToMove = sourceColumn.tasks[result.source.index];
      
      // Update task position in the UI optimistically
      const newBoard = {
        ...board,
        columns: board.columns.map(col => {
          if (col.id === sourceColumn.id) {
            return {
              ...col,
              tasks: col.tasks.filter((_, index) => index !== result.source.index)
            };
          }
          if (col.id === destColumn.id) {
            const newTasks = [...col.tasks];
            newTasks.splice(result.destination.index, 0, taskToMove);
            return {
              ...col,
              tasks: newTasks
            };
          }
          return col;
        })
      };

      queryClient.setQueryData(['board', projectId], newBoard);

      // Make API call to update task position
      await updateTaskPosition.mutateAsync({
        taskId: taskToMove.id, // Already in the correct format from mock data
        columnId: destColumn.id,
        order: result.destination.index
      });
    } catch (error) {
      console.error('Error updating task position:', error);
      toast.error('Failed to update task position');
      queryClient.invalidateQueries(['board', projectId]);
    }
  };

  return (
    <div 
      className="h-full flex flex-col"
      data-testid="board-container"
      role="main"
      aria-label="Project Board"
    >
      {/* Header section - no horizontal scroll */}
      <div className="flex-none px-4 sm:px-6 lg:px-8 pb-4">
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
              data-testid="create-task-button"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline-block" aria-hidden="true" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Board content with horizontal scroll */}
      <div className="flex-1 min-h-0 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div 
            className="inline-flex gap-4 h-full p-4"
            style={{ minWidth: 'min-content' }}
            data-testid="columns-container"
          >
            {board.columns.map((column) => (
              <div key={column.id} style={{ width: '280px' }} className="flex-none">
                <Column
                  column={column}
                  tasks={column.tasks || []}
                  projectId={projectId}
                />
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      <CreateTaskModal
        open={isCreateModalOpen}
        setOpen={setIsCreateModalOpen}
        projectId={projectId}
        columns={board.columns}
        board={board}
      />
    </div>
  );
}