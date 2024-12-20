import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function KPICard({ kpi }) {
  const progress = (kpi.current / kpi.target) * 100;
  const isPositive = kpi.current >= kpi.target;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">{kpi.name}</p>
            <div className="mt-1 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {kpi.current.toFixed(1)} {kpi.unit}
              </p>
              <p className="ml-2 text-sm text-gray-500">
                / {kpi.target.toFixed(1)} {kpi.unit}
              </p>
            </div>
          </div>
          <div className={`${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
              <ArrowUpIcon className="h-5 w-5" />
            ) : (
              <ArrowDownIcon className="h-5 w-5" />
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="relative w-full bg-gray-200 rounded-full h-2">
            <div
              className={`absolute h-2 rounded-full ${
                isPositive ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
        {kpi.description && (
          <p className="mt-2 text-sm text-gray-500">{kpi.description}</p>
        )}
      </div>
    </div>
  );
}
