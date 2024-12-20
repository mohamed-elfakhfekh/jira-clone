import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import Board from '../components/board/Board';

export default function ProjectBoard() {
  const { projectId } = useParams();

  const { data: board, isLoading } = useQuery(['board', projectId], async () => {
    const token = localStorage.getItem('yajouraToken');
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/projects/${projectId}/board`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return data;
  }, {
    onError: () => {
      toast.error('Failed to load board');
    }
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <Board board={board} projectId={projectId} />
    </div>
  );
}