
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

import LandingPage from "./pages/LandingPage";
import SummerLandingPage from "./pages/SummerLandingPage";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import NewScenario from "./pages/lending/NewScenario";
import MyScenarios from "./pages/lending/MyScenarios";
import LenderDashboard from "./pages/lending/LenderDashboard";
import LenderProfile from "./pages/lending/LenderProfile";
import Dashboard from "./pages/Dashboard";
import MarketAnalytics from "./pages/MarketAnalytics";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import DevBypassBanner from "./components/DevBypassBanner";
import { RoleBasedRoute } from "./components/access";
import PublicOnlyRoute from "./components/access/PublicOnlyRoute";

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

// The daily. Public content carried across from Irvine Living Daily.
import Blog from "./pages/daily/Blog";
import BlogPost from "./pages/daily/BlogPost";
import Topics from "./pages/daily/Topics";
import TopicDetail from "./pages/daily/TopicDetail";
import CaseStudies from "./pages/daily/CaseStudies";
import SearchPage from "./pages/daily/SearchPage";
import Ask from "./pages/daily/Ask";
import AskThanks from "./pages/daily/AskThanks";
import Start from "./pages/daily/Start";

/**
 * One client for the whole app. Content is public and changes a few times a
 * day, so a short stale time is enough — the per-query values live with their
 * query definitions rather than here.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <Router>
        <DevBypassBanner />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
          <Route path="/summer" element={<SummerLandingPage />} />
          <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* The daily — readable signed in or out, so no PublicOnlyRoute. */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/:slug" element={<TopicDetail />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/ask/thanks" element={<AskThanks />} />
          <Route path="/start" element={<Start />} />

          {/* Lending. Scenario authoring is open to any signed-in account;
              the lender views require the lender role. */}
          <Route path="/scenarios" element={<ProtectedRoute><MyScenarios /></ProtectedRoute>} />
          <Route path="/scenarios/new" element={<ProtectedRoute><NewScenario /></ProtectedRoute>} />
          <Route path="/lender" element={<RoleBasedRoute allowedRoles={["lender", "admin"]}><LenderDashboard /></RoleBasedRoute>} />
          <Route path="/lender/profile" element={<RoleBasedRoute allowedRoles={["lender", "admin"]}><LenderProfile /></RoleBasedRoute>} />
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
    </QueryClientProvider>
  );
}

export default App;
