import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // Add this import
import 'react-toastify/dist/ReactToastify.css'; // Add CSS import
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Packages from './pages/Packages';
import Enquiry from './pages/Enquiry';
import Reports from './pages/Reports';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { RootState } from './store';
import { jwtDecode } from 'jwt-decode';
import { setUser } from './store/authSlice';
import ForgotPassword from './components/Forgotpass';
import Profile from './pages/profile';// Fixed casing to match import

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const token = localStorage.getItem('token');
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode<{ exp: number; iat: number; sub: string }>(token);
        console.log('Decoded Token:', decodedToken);
        dispatch(setUser(decodedToken));
      } catch (error) {
        console.error('Invalid Token:', error);
      }
    }
  }, [token, dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot" element={<ForgotPassword />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Clients"
          element={
            <ProtectedRoute>
              <Layout>
                <Clients />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Products"
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Packages"
          element={
            <ProtectedRoute>
              <Layout>
                <Packages />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Enquiry"
          element={
            <ProtectedRoute>
              <Layout>
                <Enquiry />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      {/* Add ToastContainer here */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
};

export default App;