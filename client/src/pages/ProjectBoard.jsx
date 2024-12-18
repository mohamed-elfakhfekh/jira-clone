import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Board from '../components/board/Board';

export default function ProjectBoard() {
  const { projectId } = useParams();

  const { data: board, isLoading, error } = useQuery(
    ['board', projectId],
    async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/boards/project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jiraCloneToken')}`,
          },
        }
      );
      return data;
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading board: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-lg font-semibold leading-6 text-gray-900">
              {board?.project?.name}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full py-4">
          <Board board={board} projectId={projectId} />
        </div>
      </main>
    </div>
  );
}