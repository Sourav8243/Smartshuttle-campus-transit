import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/hooks/useToast';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoader } from '@/components/ui/LoadingState';
import { LoginPage } from '@/pages/auth/LoginPage';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { BookShuttlePage } from '@/pages/student/BookShuttlePage';
import { StudentBookingsPage } from '@/pages/student/StudentBookingsPage';
import { TripHistoryPage } from '@/pages/student/TripHistoryPage';
import { StudentProfilePage } from '@/pages/student/StudentProfilePage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage';
import { AdminDriversPage } from '@/pages/admin/AdminDriversPage';
import { AdminRoutesPage } from '@/pages/admin/AdminRoutesPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Student routes */}
      <Route
        element={
          <ProtectedRoute role="student">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/book-shuttle" element={<BookShuttlePage />} />
        <Route path="/student/bookings" element={<StudentBookingsPage />} />
        <Route path="/student/trip-history" element={<TripHistoryPage />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />
      </Route>

      {/* Admin routes */}
      <Route
        element={
          <ProtectedRoute role="admin">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/drivers" element={<AdminDriversPage />} />
        <Route path="/admin/routes" element={<AdminRoutesPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
