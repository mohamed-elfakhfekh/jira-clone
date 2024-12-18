import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import CreateProjectModal from '../components/projects/CreateProjectModal';

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: projects, isLoading } = useQuery(['projects'], async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/projects`);
    return data;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Projects
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Project
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
            {projects?.length > 0 ? (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-600">
                        {project.key}
                      </p>
                      <Link to={`/projects/${project.id}/board`} className="block mt-2">
                        <p className="text-xl font-semibold text-gray-900">
                          {project.name}
                        </p>
                        <p className="mt-3 text-base text-gray-500">
                          {project.description}
                        </p>
                      </Link>
                      <div className="mt-6 flex items-center">
                        <div className="flex-shrink-0">
                          <span className="sr-only">{project.owner.name}</span>
                          <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {project.owner.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {project.owner.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Project Owner
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center lg:col-span-3">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <PlusIcon className="h-8 w-8 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new project.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}