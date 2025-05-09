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
import { AuthProvider } from './contexts/AuthContext.tsx';
import { AuthContext } from './contexts/AuthContextDefinition';
import { useContext } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import InstitutionsPage from './components/InstitutionsPage';
import VenuesPage from './components/VenuesPage';
import { Layout } from './components/Layout';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Create a custom theme with light mode colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#646cff',
    },
    secondary: {
      main: '#535bf2',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#213547',
      secondary: 'rgba(33, 53, 71, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<QRCodeDisplay />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Protected Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/selfies" 
                element={
                  <ProtectedRoute>
                    <StudentSelfiesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/attendance" 
                element={
                  <ProtectedRoute>
                    <AttendanceRecordsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/flagged-logs" 
                element={
                  <ProtectedRoute>
                    <FlaggedLogsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/statistics" 
                element={
                  <ProtectedRoute>
                    <StatisticsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/institutions" 
                element={
                  <ProtectedRoute>
                    <InstitutionsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/venues" 
                element={
                  <ProtectedRoute>
                    <VenuesPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            {/* Routes outside the layout */}
            <Route path="/attendance/:sessionId" element={<AttendanceMarking />} />
            <Route path="/mark-attendance/:sessionId" element={<AttendanceMarking />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
















