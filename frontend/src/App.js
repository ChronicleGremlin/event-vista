import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import VerifyEmail from "./pages/Account/VerifyEmail/VerifyEmail";
import ResetPassword from "./pages/Account/ResetPassword/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import VenuePage from "./pages/Venues/VenuePage";
import VendorPage from "./pages/Vendors/VendorPage";
import ClientPage from "./pages/Clients/ClientPage";
import "./App.css";
import Welcome from "./pages/Welcome/Welcome";
import OAuth2RedirectHandler from "./pages/User/OAuth2RedirectHandler";
import UserProfile from "./pages/User/UserProfile";
import MainLayout from "./components/common/MainLayout";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Protected Routes with Shared Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="venues" element={<VenuePage />} />
            <Route path="vendors" element={<VendorPage />} />
            <Route path="clients" element={<ClientPage />} />
            <Route path="profile" element={<UserProfile />} />
            {/* Default route when inside layout */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
