import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchUser = async () => {
  const token = localStorage.getItem('yajouraToken');
  
  if (!token) {
    return null;
  }

  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    localStorage.removeItem('yajouraToken');
    return null;
  }
};

export function useAuth() {
  const { data: user, isLoading } = useQuery(['auth'], fetchUser, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user,
    isLoading,
  };
}