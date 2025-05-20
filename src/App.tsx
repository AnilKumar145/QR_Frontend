
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AttendanceMarking } from './components/AttendanceMarking';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import StudentSelfiesPage from './components/StudentSelfiesPage';
import AttendanceRecordsPage from './components/AttendanceRecordsPage';
import FlaggedLogsPage from './components/FlaggedLogsPage';
import StatisticsPage from './components/StatisticsPage';
import NotFound from './components/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { AuthContext } from './contexts/AuthContext';
import { useContext } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import InstitutionsPage from './components/InstitutionsPage';
import VenuesPage from './components/VenuesPage';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import theme from './theme';
import VenueAttendancePage from './components/VenueAttendancePage';
import AdminLayout from './components/AdminLayout';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="/qr-generator" element={<QRCodeDisplay />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Route>
            
            {/* Admin routes - wrap these in AdminLayout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="selfies" element={
                <ProtectedRoute>
                  <StudentSelfiesPage />
                </ProtectedRoute>
              } />
              <Route path="attendance" element={
                <ProtectedRoute>
                  <AttendanceRecordsPage />
                </ProtectedRoute>
              } />
              <Route path="flagged-logs" element={
                <ProtectedRoute>
                  <FlaggedLogsPage />
                </ProtectedRoute>
              } />
              <Route path="statistics" element={
                <ProtectedRoute>
                  <StatisticsPage />
                </ProtectedRoute>
              } />
              <Route path="institutions" element={
                <ProtectedRoute>
                  <InstitutionsPage />
                </ProtectedRoute>
              } />
              <Route path="venues" element={
                <ProtectedRoute>
                  <VenuesPage />
                </ProtectedRoute>
              } />
              <Route path="venue-attendance" element={
                <ProtectedRoute>
                  <VenueAttendancePage />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Routes outside the layout */}
            <Route path="/mark-attendance/:sessionId" element={<AttendanceMarking />} />
            <Route path="/attendance/:sessionId" element={<AttendanceMarking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;




