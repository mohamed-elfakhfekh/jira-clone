import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import KPICard from './KPICard';
import KPIForm from './KPIForm';
import api from '../../services/api';

export default function KPIList({ projectId }) {
  const [kpis, setKpis] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKPIs();
  }, [projectId]);

  const fetchKPIs = async () => {
    try {
      const response = await api.get(`/kpis/project/${projectId}`);
      setKpis(response.data);
    } catch (err) {
      setError('Failed to fetch KPIs');
      console.error('Error fetching KPIs:', err);
    }
  };

  const handleCreateKPI = async (formData) => {
    try {
      await api.post(`/kpis/project/${projectId}`, formData);
      await fetchKPIs();
      setIsFormOpen(false);
    } catch (err) {
      setError('Failed to create KPI');
      console.error('Error creating KPI:', err);
    }
  };

  const handleUpdateKPI = async (formData) => {
    try {
      await api.patch(`/kpis/${selectedKPI.id}`, formData);
      await fetchKPIs();
      setIsFormOpen(false);
      setSelectedKPI(null);
    } catch (err) {
      setError('Failed to update KPI');
      console.error('Error updating KPI:', err);
    }
  };

  const handleDeleteKPI = async (kpiId) => {
    if (!window.confirm('Are you sure you want to delete this KPI?')) {
      return;
    }

    try {
      await api.delete(`/kpis/${kpiId}`);
      await fetchKPIs();
    } catch (err) {
      setError('Failed to delete KPI');
      console.error('Error deleting KPI:', err);
    }
  };

  const openEditForm = (kpi) => {
    setSelectedKPI(kpi);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Project KPIs</h2>
        <button
          onClick={() => {
            setSelectedKPI(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
          Add KPI
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="relative">
            <KPICard kpi={kpi} />
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={() => openEditForm(kpi)}
                className="p-1 text-gray-400 hover:text-gray-500"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDeleteKPI(kpi.id)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <KPIForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedKPI(null);
        }}
        onSubmit={selectedKPI ? handleUpdateKPI : handleCreateKPI}
        initialData={selectedKPI}
      />
    </div>
  );
}
