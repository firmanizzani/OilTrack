import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Toaster } from '@/components/ui/Toaster';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import VehiclesPage from '@/pages/VehiclesPage';
import VehicleDetailPage from '@/pages/VehicleDetailPage';
import OilHistoryPage from '@/pages/OilHistoryPage';
import ProfilePage from '@/pages/ProfilePage';

// Layout
import AppLayout from '@/components/layout/AppLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Guest routes */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"          element={<DashboardPage />} />
          <Route path="/vehicles"           element={<VehiclesPage />} />
          <Route path="/vehicles/:id"       element={<VehicleDetailPage />} />
          <Route path="/oil-history"        element={<OilHistoryPage />} />
          <Route path="/profile"            element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
