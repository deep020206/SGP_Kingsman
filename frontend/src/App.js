import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './components/LandingPage/DarkModeContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Menu from './components/Menu/Menu';
import Tracking from './components/Orders/Tracking';
import Dashboard from './components/Dashboard/Dashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import UserDashboardLayout from './components/Dashboard/UserDashboardLayout';
import LandingPage from './components/LandingPage';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Zustand stores
import { initializeStores, useAuthStore, useUIStore, useSocketStore } from './stores';

// Import DevTools for development
import DevTools from './components/DevTools/DevTools';

// Import test component
import StoreTest from './components/Testing/StoreTest';
import StoreIntegrationDemo from './components/Testing/StoreIntegrationDemo';

function AppRoutes() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Handler for actions that require login
  const requireLogin = () => setShowLoginModal(true);

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <LandingPage
          onLoginClick={() => setShowLoginModal(true)}
          onSignupClick={() => setShowSignupModal(true)}
          onAddToCart={requireLogin}
        />
        {showLoginModal && (
          <Login
            onClose={() => setShowLoginModal(false)}
            onSwitchToSignup={() => {
              setShowLoginModal(false);
              setShowSignupModal(true);
            }}
          />
        )}
        {showSignupModal && (
          <Signup
            onClose={() => setShowSignupModal(false)}
            onSwitchToLogin={() => {
              setShowSignupModal(false);
              setShowLoginModal(true);
            }}
          />
        )}
      </div>
    );
  }

  // User is logged in, show protected routes
  const userRole = user?.role?.toLowerCase();

  // Protect routes based on user role
  const ProtectedRoute = ({ element: Element, allowedRoles }) => {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      return userRole === 'vendor' ? <Dashboard /> : <UserDashboardLayout />;
    }
    return Element;
  };

  return (
    <Routes>
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute 
            element={<Dashboard />} 
            allowedRoles={['vendor']} 
          />
        } 
      />
      <Route 
        path="/user-dashboard" 
        element={
          <ProtectedRoute 
            element={<UserDashboardLayout />} 
            allowedRoles={['student']} 
          />
        } 
      />
      <Route path="/tracking" element={<Tracking />} />
      <Route path="/menu" element={<Menu />} />
      
      {/* Testing Routes - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <Route path="/test-stores" element={<StoreTest />} />
          <Route path="/demo-stores" element={<StoreIntegrationDemo />} />
        </>
      )}
      
      <Route path="*" element={
        userRole === 'vendor' ? <Dashboard /> : <UserDashboard />
      } />
    </Routes>
  );
}

function App() {
  // Initialize stores on app startup
  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeStores();
        console.log('🚀 Kingsmen app initialized with Zustand stores');
      } catch (error) {
        console.error('❌ Failed to initialize stores:', error);
      }
    };
    
    initApp();
  }, []);

  return (
    <AuthProvider>
      <DarkModeProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          
          {/* Development Tools */}
          <DevTools />
        </Router>
      </DarkModeProvider>
    </AuthProvider>
  );
}

export default App;
