
import type { ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";

import LandingPage from "./pages/LandingPage";
import SummerLandingPage from "./pages/SummerLandingPage";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
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

// The rentals, carried across from Coming Soon Home Rentals.
import Rentals from "./pages/rentals/Rentals";
import RentalDetail from "./pages/rentals/RentalDetail";
import Prequalify from "./pages/rentals/Prequalify";
import Apply from "./pages/rentals/Apply";

// Legal and contact, carried across from the rentals site and the daily.
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Contact from "./pages/Contact";

// The brand pages, carried across from Good Tenants Hub.
import About from "./pages/hub/About";
import Pricing from "./pages/hub/Pricing";
import Faq from "./pages/hub/Faq";
import FairHousing from "./pages/hub/FairHousing";
import Accessibility from "./pages/hub/Accessibility";
import ReferralProgram from "./pages/hub/ReferralProgram";
import Tenants from "./pages/hub/Tenants";
import TenantDetail from "./pages/hub/TenantDetail";
import Sharing from "./pages/tenant/Sharing";
import Documents from "./pages/tenant/Documents";
import Verify from "./pages/partner/Verify";
import Account from "./pages/tenant/Account";
import Resources from "./pages/hub/Resources";
import Help from "./pages/hub/Help";
import Landlords from "./pages/hub/Landlords";
import Realtors from "./pages/hub/Realtors";

// The editorial console, carried across from the daily's admin.
import AdminArticles from "./pages/admin/Articles";
import AdminAskQa from "./pages/admin/AskQa";
import AdminCalendar from "./pages/admin/Calendar";
import AdminCaseStudies from "./pages/admin/CaseStudies";
import AdminCtas from "./pages/admin/Ctas";
import AdminDrops from "./pages/admin/Drops";
import AdminInbox from "./pages/admin/Inbox";
import AdminLeads from "./pages/admin/Leads";
import AdminNotifications from "./pages/admin/Notifications";
import AdminPromos from "./pages/admin/Promos";
import AdminSeeds from "./pages/admin/Seeds";
import AdminTeam from "./pages/admin/Team";
import AdminTopics from "./pages/admin/Topics";
import AdminVerification from "./pages/admin/Verification";

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


/** Every editorial route sits behind the same guard. */
const AdminOnly = ({ children }: { children: ReactNode }) => (
  <RoleBasedRoute allowedRoles={["admin"]}>{children}</RoleBasedRoute>
);

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

          {/* Password recovery. Not behind PublicOnlyRoute: arriving from a
              reset link establishes a session, so the guard would bounce the
              person away from the page that link exists to reach. */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/fair-housing" element={<FairHousing />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/referral-program" element={<ReferralProgram />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/help" element={<Help />} />
          <Route path="/landlords" element={<Landlords />} />
          <Route path="/realtors" element={<Realtors />} />

          {/* The tenant directory. Only landlords, agents and admins browse it;
              the view itself already limits what any of them can see. */}
          <Route
            path="/tenants"
            element={
              <RoleBasedRoute allowedRoles={["landlord", "agent", "admin"]}>
                <Tenants />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/tenants/:id"
            element={
              <RoleBasedRoute allowedRoles={["landlord", "agent", "admin", "tenant"]}>
                <TenantDetail />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/verify"
            element={
              <RoleBasedRoute allowedRoles={["landlord", "agent", "admin"]}>
                <Verify />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <RoleBasedRoute allowedRoles={["tenant", "admin"]}>
                <Account />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <RoleBasedRoute allowedRoles={["tenant", "admin"]}>
                <Documents />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/sharing"
            element={
              <RoleBasedRoute allowedRoles={["tenant", "admin"]}>
                <Sharing />
              </RoleBasedRoute>
            }
          />

          {/* The rentals. Public: a suppressed listing never leaves the
              database, so these need no guard of their own. */}
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/rentals/:slug" element={<RentalDetail />} />
          <Route
            path="/rentals/:slug/apply"
            element={
              <RoleBasedRoute allowedRoles={["tenant", "admin"]}>
                <Apply />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/prequalify"
            element={
              <RoleBasedRoute allowedRoles={["tenant", "admin"]}>
                <Prequalify />
              </RoleBasedRoute>
            }
          />

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

          {/* The editorial console. Every screen reads tables whose policies are
              admin-only, so the guard here and the database agree. */}
          <Route path="/admin/calendar" element={<AdminOnly><AdminCalendar /></AdminOnly>} />
          <Route path="/admin/drops" element={<AdminOnly><AdminDrops /></AdminOnly>} />
          <Route path="/admin/articles" element={<AdminOnly><AdminArticles /></AdminOnly>} />
          <Route path="/admin/ask" element={<AdminOnly><AdminAskQa /></AdminOnly>} />
          <Route path="/admin/case-studies" element={<AdminOnly><AdminCaseStudies /></AdminOnly>} />
          <Route path="/admin/topics" element={<AdminOnly><AdminTopics /></AdminOnly>} />
          <Route path="/admin/promos" element={<AdminOnly><AdminPromos /></AdminOnly>} />
          <Route path="/admin/seeds" element={<AdminOnly><AdminSeeds /></AdminOnly>} />
          <Route path="/admin/ctas" element={<AdminOnly><AdminCtas /></AdminOnly>} />
          <Route path="/admin/leads" element={<AdminOnly><AdminLeads /></AdminOnly>} />
          <Route path="/admin/inbox" element={<AdminOnly><AdminInbox /></AdminOnly>} />
          <Route path="/admin/notifications" element={<AdminOnly><AdminNotifications /></AdminOnly>} />
          <Route path="/admin/team" element={<AdminOnly><AdminTeam /></AdminOnly>} />
          <Route path="/admin/verification" element={<AdminOnly><AdminVerification /></AdminOnly>} />

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
