
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

import LandingPage from "./pages/LandingPage";
import SummerLandingPage from "./pages/SummerLandingPage";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MarketAnalytics from "./pages/MarketAnalytics";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import DevBypassBanner from "./components/DevBypassBanner";
import { RoleBasedRoute } from "./components/access";

import OnboardTenant from "./pages/onboarding/OnboardTenant";
import OnboardAgent from "./pages/onboarding/OnboardAgent";
import OnboardLandlord from "./pages/onboarding/OnboardLandlord";
import CreateProperty from "./pages/CreateProperty";
import MessagingCenter from "./pages/messaging/MessagingCenter";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import TenantDashboard from "./pages/dashboards/TenantDashboard";
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import LandlordDashboard from "./pages/dashboards/LandlordDashboard";
import Index from "./pages/Index";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <DevBypassBanner />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/summer" element={<SummerLandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/index" element={<Index />} />

          {/* Market Analytics - Public Access */}
          <Route path="/market-analytics" element={<MarketAnalytics />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Role-Specific Dashboard Routes */}
          <Route
            path="/dashboard-tenant"
            element={
              <RoleBasedRoute allowedRoles={["tenant"]}>
                <TenantDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/dashboard-agent"
            element={
              <RoleBasedRoute allowedRoles={["agent"]}>
                <AgentDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/dashboard-landlord"
            element={
              <RoleBasedRoute allowedRoles={["landlord"]}>
                <LandlordDashboard />
              </RoleBasedRoute>
            }
          />

          {/* Admin Routes - Support both /admin and /admin-dashboard */}
          <Route
            path="/admin"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <RoleBasedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />

          {/* Role-Based Routes */}
          <Route
            path="/onboarding/tenant"
            element={
              <RoleBasedRoute allowedRoles={["tenant"]}>
                <OnboardTenant />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/onboard-tenant"
            element={
              <RoleBasedRoute allowedRoles={["tenant"]}>
                <OnboardTenant />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/onboarding/agent"
            element={
              <RoleBasedRoute allowedRoles={["agent"]}>
                <OnboardAgent />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/onboard-agent"
            element={
              <RoleBasedRoute allowedRoles={["agent"]}>
                <OnboardAgent />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/onboarding/landlord"
            element={
              <RoleBasedRoute allowedRoles={["landlord"]}>
                <OnboardLandlord />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/onboard-landlord"
            element={
              <RoleBasedRoute allowedRoles={["landlord"]}>
                <OnboardLandlord />
              </RoleBasedRoute>
            }
          />

          {/* Property Routes */}
          <Route
            path="/properties/create"
            element={
              <RoleBasedRoute allowedRoles={["agent", "landlord", "admin"]}>
                <CreateProperty />
              </RoleBasedRoute>
            }
          />

          {/* Messaging Routes */}
          <Route
            path="/messages"
            element={
              <RoleBasedRoute allowedRoles={["tenant", "agent", "landlord", "admin"]}>
                <MessagingCenter />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/messages/:threadId"
            element={
              <RoleBasedRoute allowedRoles={["tenant", "agent", "landlord", "admin"]}>
                <MessagingCenter />
              </RoleBasedRoute>
            }
          />

          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
