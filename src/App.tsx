import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReferralProvider } from './context/ReferralContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './views/Login';

// Subviews
import { Overview as AdminOverview } from './views/admin/Overview';
import { ManageUsers as AdminManageUsers } from './views/admin/ManageUsers';
import { ReferralReview as AdminReferralReview } from './views/admin/ReferralReview';

import { Overview as StaffOverview } from './views/staff/Overview';
import { NewRequest as StaffNewRequest } from './views/staff/NewRequest';
import { MedicalHistory as StaffMedicalHistory } from './views/staff/MedicalHistory';

import { IncomingReferrals as HospitalIncoming } from './views/hospital/IncomingReferrals';
import { PatientTreatment as HospitalTreatment } from './views/hospital/PatientTreatment';

import './App.css';

const getDefaultPathForRole = (role: string) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin/overview';
    case 'RETIRED_STAFF':
      return '/staff/overview';
    case 'HOSPITAL':
      return '/hospital/incoming';
    default:
      return '/login';
  }
};

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: ('SUPER_ADMIN' | 'RETIRED_STAFF' | 'HOSPITAL')[] }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role as any)) {
    return <Navigate to={getDefaultPathForRole(currentUser.role)} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const RootRedirect = () => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDefaultPathForRole(currentUser.role)} replace />;
};

const LoginRoute = () => {
  const { currentUser } = useAuth();
  if (currentUser) {
    return <Navigate to={getDefaultPathForRole(currentUser.role)} replace />;
  }
  return <Login />;
};

function AppContent() {
  return (
    <Routes>
      {/* Root path redirects based on auth & role */}
      <Route path="/" element={<RootRedirect />} />

      {/* Login path */}
      <Route path="/login" element={<LoginRoute />} />

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/manage-users" element={<AdminManageUsers />} />
        <Route path="/admin/referrals" element={<AdminReferralReview />} />
      </Route>

      {/* Staff routes */}
      <Route element={<ProtectedRoute allowedRoles={['RETIRED_STAFF']} />}>
        <Route path="/staff/overview" element={<StaffOverview />} />
        <Route path="/staff/new-request" element={<StaffNewRequest />} />
        <Route path="/staff/history" element={<StaffMedicalHistory />} />
      </Route>

      {/* Hospital routes */}
      <Route element={<ProtectedRoute allowedRoles={['HOSPITAL']} />}>
        <Route path="/hospital/incoming" element={<HospitalIncoming />} />
        <Route path="/hospital/patient-care" element={<HospitalTreatment />} />
      </Route>

      {/* Catch-all redirects to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ReferralProvider>
          <BrowserRouter>
            <div className="app-container">
              <AppContent />
            </div>
          </BrowserRouter>
        </ReferralProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
