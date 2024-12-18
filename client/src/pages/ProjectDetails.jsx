import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import {
  ChartBarSquareIcon,
  ClockIcon,
  Cog6ToothIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Board from '../components/board/Board';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const tabs = [
  { name: 'Board', icon: ChartBarSquareIcon },
  { name: 'Timeline', icon: ClockIcon },
  { name: 'Team', icon: UsersIcon },
  { name: 'Settings', icon: Cog6ToothIcon },
];

export default function ProjectDetails() {
  const { projectId } = useParams();

  const { data: project, isLoading: projectLoading } = useQuery(
    ['project', projectId],
    async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/projects/${projectId}`);
      return data;
    }
  );

  const { data: board, isLoading: boardLoading } = useQuery(
    ['board', projectId],
    async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/boards/project/${projectId}`);
      return data;
    }
  );

  if (projectLoading || boardLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
                <p className="mt-1 text-sm text-gray-500">{project?.key}</p>
              </div>
            </div>
            <Tab.Group>
              <div className="mt-4">
                <Tab.List className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        classNames(
                          selected
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium'
                        )
                      }
                    >
                      <tab.icon
                        className={classNames(
                          'text-gray-400 group-hover:text-gray-500',
                          '-ml-0.5 mr-2 h-5 w-5'
                        )}
                        aria-hidden="true"
                      />
                      <span>{tab.name}</span>
                    </Tab>
                  ))}
                </Tab.List>
              </div>
              <Tab.Panels className="flex-1">
                <Tab.Panel className="h-full py-4">
                  <Board board={board} projectId={projectId} />
                </Tab.Panel>
                <Tab.Panel>Timeline content goes here</Tab.Panel>
                <Tab.Panel>Team content goes here</Tab.Panel>
                <Tab.Panel>Settings content goes here</Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </div>
  );
}