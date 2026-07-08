import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MyReportsPage from './pages/MyReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProjectsPage from './pages/ProjectsPage';
import RegisterPage from './pages/RegisterPage';
import ReportFormPage from './pages/ReportFormPage';
import TasksPage from './pages/TasksPage';
import TeamMembersPage from './pages/TeamMembersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute allowedRoles={['TEAM_MEMBER', 'MANAGER']} />}>
        <Route element={<Layout />}>
          <Route path="/tasks" element={<TasksPage />} />


          <Route element={<ProtectedRoute allowedRoles={['TEAM_MEMBER']} />}>
            <Route path="/reports" element={<MyReportsPage />} />
            <Route path="/reports/new" element={<ReportFormPage />} />
            <Route path="/reports/:id/edit" element={<ReportFormPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/team" element={<TeamMembersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
