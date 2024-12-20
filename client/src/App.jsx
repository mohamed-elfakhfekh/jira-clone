import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import ProjectLayout from './components/project/ProjectLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import ProjectKPIs from './pages/ProjectKPIs';
import TimeSheets from './pages/TimeSheets';
import Welcome from './pages/Welcome';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/timesheets" element={<TimeSheets />} />
              
              {/* Project routes */}
              <Route path="/projects/:projectId" element={<ProjectLayout />}>
                <Route index element={<Navigate to="board" replace />} />
                <Route path="board" element={<ProjectBoard />} />
                <Route path="kpis" element={<ProjectKPIs />} />
              </Route>
            </Route>

            {/* Redirect all other routes to login if not authenticated */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;