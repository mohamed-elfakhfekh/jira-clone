import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
} from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function getStatusColor(current, target) {
  const percentage = (current / target) * 100;
  if (percentage >= 100) return 'text-green-500';
  if (percentage >= 80) return 'text-yellow-500';
  return 'text-red-500';
}

function getStatusIcon(current, target) {
  const percentage = (current / target) * 100;
  if (percentage >= 100) {
    return <ArrowUpIcon className="h-5 w-5 text-green-500" aria-hidden="true" />;
  }
  if (percentage >= 80) {
    return <MinusIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />;
  }
  return <ArrowDownIcon className="h-5 w-5 text-red-500" aria-hidden="true" />;
}

export default function ProjectKPIs() {
  const { projectId } = useParams();

  const { data: kpis, isLoading } = useQuery(['kpis', projectId], async () => {
    const token = localStorage.getItem('yajouraToken');
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/projects/${projectId}/kpis`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return data;
  }, {
    onError: () => {
      toast.error('Failed to load KPIs');
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
    <div className="h-full overflow-y-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-base font-semibold leading-6 text-gray-900">Project KPIs</h2>
            <p className="mt-2 text-sm text-gray-700">
              Track and monitor key performance indicators for your project
            </p>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Current
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Target
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {kpis?.map((kpi) => (
                      <tr key={kpi.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {kpi.name}
                        </td>
                        <td className={classNames(
                          "whitespace-nowrap px-3 py-4 text-sm",
                          getStatusColor(kpi.current, kpi.target)
                        )}>
                          {kpi.current} {kpi.unit}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {kpi.target} {kpi.unit}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(kpi.current, kpi.target)}
                            <span className={getStatusColor(kpi.current, kpi.target)}>
                              {((kpi.current / kpi.target) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {kpi.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
