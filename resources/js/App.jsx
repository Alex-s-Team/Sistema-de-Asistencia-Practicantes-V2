import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { LoadingSpinner } from './Components/Common/LoadingSpinner';

// Pages
import Login from './Pages/Auth/Login';
import AdminDashboard from './Pages/Admin/Dashboard';
import StaffDashboard from './Pages/Staff/Dashboard';
import InternDashboard from './Pages/Intern/Dashboard';
import MarkAttendance from './Pages/Intern/MarkAttendance';
import ValidateAttendance from './Pages/Admin/ValidateAttendance';
import UserManagement from './Pages/Admin/UserManagement';
import TaskManagement from './Pages/Staff/TaskManagement';
import MyTasks from './Pages/Intern/MyTasks';

// Layout
import Layout from './Components/Layout/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Cargando..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Cargando aplicación..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Admin Routes */}
        <Route
          index
          element={
            user?.role === 'admin' ? (
              <AdminDashboard />
            ) : user?.role === 'staff' ? (
              <StaffDashboard />
            ) : (
              <InternDashboard />
            )
          }
        />

        <Route
          path="validate-attendance"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ValidateAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="tasks"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <TaskManagement />
            </ProtectedRoute>
          }
        />

        {/* Intern Routes */}
        <Route
          path="mark-attendance"
          element={
            <ProtectedRoute allowedRoles={['intern']}>
              <MarkAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="my-tasks"
          element={
            <ProtectedRoute allowedRoles={['intern']}>
              <MyTasks />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

