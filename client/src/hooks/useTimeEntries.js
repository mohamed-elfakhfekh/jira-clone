import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function useTimeEntries(startDate, endDate) {
  return useQuery(
    ['timeEntries', format(startDate, 'yyyy-MM-dd')],
    async () => {
      const { data } = await axios.get('/time-entries', {
        params: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        },
      });
      return data;
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['timeEntries']);
      toast.success('Time entry deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error deleting time entry');
    },
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axios.put(`/time-entries/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['timeEntries']);
      toast.success('Time entry updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error updating time entry');
    },
  });
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.post('/time-entries', {
        ...data,
        timeSpent: parseFloat(data.timeSpent) * 60, // Convert hours to minutes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['timeEntries']);
      toast.success('Time entry created');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error creating time entry');
    },
  });
}