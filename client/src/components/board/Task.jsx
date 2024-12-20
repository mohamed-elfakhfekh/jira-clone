export default function Task({ task }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
        </div>
        <div className="ml-2 flex-shrink-0">
          {task.priority === 'high' && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
              High
            </span>
          )}
          {task.priority === 'medium' && (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
              Medium
            </span>
          )}
          {task.priority === 'low' && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              Low
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
