import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Welcome() {
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate();

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    try {
      setIsCreating(true);
      const response = await api.post('/projects', {
        name: projectName,
        key: projectName.substring(0, 4).toUpperCase(),
        description: 'My first project'
      });

      navigate(`/projects/${response.data.id}`);
      toast.success('Project created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto h-12 w-auto"
              src="/logo.svg"
              alt="Yajoura"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome to Yajoura!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Let's get started by creating your first project
            </p>
          </div>

          <form className="space-y-6 mt-8" onSubmit={handleCreateProject}>
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="My Awesome Project"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
