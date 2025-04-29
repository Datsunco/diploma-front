import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import Layout from '@/components/Layout';
// import LoadingSpinner from '@/components/ui/loading-spinner';
import LoadingSpinner from "@/components/ui/loading-spinner"

// Ленивая загрузка страниц для оптимизации
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const TasksPage = lazy(() => import('@/pages/tasks/TasksPage'));
const TaskDetailsPage = lazy(() => import('@/pages/tasks/TaskDetailsPage'));
const CreateTaskPage = lazy(() => import('@/pages/tasks/CreateTaskPage'));
const TeamsPage = lazy(() => import('@/pages/teams/TeamsPage'));
const TeamDetailsPage = lazy(() => import('@/pages/teams/TeamDetailsPage'));
const CreateTeamPage = lazy(() => import('@/pages/teams/CreateTeamPage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const CreateReportPage = lazy(() => import('@/pages/reports/CreateReportPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Компонент для защищенных маршрутов
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Защищенные маршруты */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/create" element={<CreateTaskPage />} />
          <Route path="tasks/:id" element={<TaskDetailsPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="teams/create" element={<CreateTeamPage />} />
          <Route path="teams/:id" element={<TeamDetailsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/create" element={<CreateReportPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Маршрут "Страница не найдена" */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;