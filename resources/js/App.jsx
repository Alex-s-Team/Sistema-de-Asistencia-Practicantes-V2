import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { LoadingSpinner } from './Components/Common/LoadingSpinner';
import { ChatProvider } from './Context/ChatContext';

// Pages
import Login from './Pages/Auth/Login';

// Admin Pages
import AdminDashboard from './Pages/Admin/Dashboard';
import ValidateAttendance from './Pages/Admin/ValidateAttendance';
import UserManagement from './Pages/Admin/UserManagement';
import Reports from './Pages/Admin/Reports';

// Staff Pages
import StaffDashboard from './Pages/Staff/Dashboard';
import TaskManagement from './Pages/Staff/TaskManagement';

// Intern Pages
import InternDashboard from './Pages/Intern/Dashboard';
import MarkAttendance from './Pages/Intern/MarkAttendance';
import MyTasks from './Pages/Intern/MyTasks';

// Common Pages (para todos los roles)
import Profile from './Pages/Common/Profile';
import Justifications from './Pages/Common/Justifications';
import ChatPage from './Pages/Chat/ChatPage';

// Layout
import Layout from './Components/Layout/Layout';

// Hooks
import AttendanceRegister from './Pages/Intern/AttendanceRegister';

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
        {/* Dashboard según rol */}
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

        {/* Admin Routes */}
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

        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reports />
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

        {/* Common Routes - Para todos los roles autenticados */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="justifications"
          element={
            <ProtectedRoute>
              <Justifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/attendance-register" element={<AttendanceRegister />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ChatProvider>  
        <Router>
          <AppRoutes />
        </Router>
      </ChatProvider>  
    </AuthProvider>
  );
}

export default App;