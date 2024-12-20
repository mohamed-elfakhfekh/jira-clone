import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { ChartBarIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ProjectLayout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabs = [
    { 
      name: 'Board', 
      href: `/projects/${projectId}/board`,
      icon: ViewColumnsIcon
    },
    { 
      name: 'KPIs', 
      href: `/projects/${projectId}/kpis`,
      icon: ChartBarIcon
    }
  ];

  // Update selected tab based on current route
  useEffect(() => {
    const index = tabs.findIndex(tab => location.pathname === tab.href);
    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [location.pathname]);

  const handleTabChange = (index) => {
    navigate(tabs[index].href);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Project header with tabs */}
      <div className="border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <Tab.Group 
            selectedIndex={selectedIndex}
            onChange={handleTabChange}
          >
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
                  {({ selected }) => (
                    <>
                      <tab.icon
                        className={classNames(
                          selected ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                          '-ml-0.5 mr-2 h-5 w-5'
                        )}
                        aria-hidden="true"
                      />
                      <span>{tab.name}</span>
                    </>
                  )}
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group>
        </div>
      </div>

      {/* Project content */}
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
