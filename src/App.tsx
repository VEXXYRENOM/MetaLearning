import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastContainer } from "./components/Toast";
import { NotFoundPage } from "./pages/NotFoundPage";

import { CookieBanner } from "./components/CookieBanner";
import { PageTransition } from "./components/PageTransition";
import { Skeleton } from "./components/Skeleton";

// ── Eagerly loaded (critical path, tiny bundles) ─────────────────────────────
import { HomePage }         from "./pages/HomePage";
import { AuthPage }         from "./pages/AuthPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { RoleSelectionPage } from "./pages/RoleSelectionPage";
import { StudentJoinPage }  from "./pages/StudentJoinPage";

// ── Lazily loaded (heavy pages — split into separate chunks) ─────────────────
const LessonPage            = lazy(() => import("./pages/LessonPage").then(m => ({ default: m.LessonPage })));
const TeacherDashboardPage  = lazy(() => import("./pages/TeacherDashboardPage").then(m => ({ default: m.TeacherDashboardPage })));
const TeacherAnalyticsPage  = lazy(() => import("./pages/TeacherAnalyticsPage").then(m => ({ default: m.TeacherAnalyticsPage })));
const StudentDashboardPage  = lazy(() => import("./pages/StudentDashboardPage").then(m => ({ default: m.StudentDashboardPage })));
const SandboxPage           = lazy(() => import("./pages/SandboxPage").then(m => ({ default: m.SandboxPage })));
const InteractiveLabPage    = lazy(() => import("./pages/InteractiveLabPage").then(m => ({ default: m.InteractiveLabPage })));
const PricingPage           = lazy(() => import("./pages/PricingPage").then(m => ({ default: m.PricingPage })));
const LeaderboardPage       = lazy(() => import("./pages/LeaderboardPage").then(m => ({ default: m.LeaderboardPage })));
const AIGenerationHubPage   = lazy(() => import("./pages/AIGenerationHubPage").then(m => ({ default: m.AIGenerationHubPage })));
const ImageTo3DExperiencePage = lazy(() => import("./pages/ImageTo3DExperiencePage").then(m => ({ default: m.ImageTo3DExperiencePage })));
const CreatorDashboardPage  = lazy(() => import("./pages/CreatorDashboardPage").then(m => ({ default: m.CreatorDashboardPage })));
const AdminDashboardPage    = lazy(() => import("./pages/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const PrivacyPolicyPage     = lazy(() => import("./pages/PrivacyPolicyPage").then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage    = lazy(() => import("./pages/TermsOfServicePage").then(m => ({ default: m.TermsOfServicePage })));
const CreatorStudioPage     = lazy(() => import("./pages/CreatorStudioPage").then(m => ({ default: m.CreatorStudioPage })));
const OrgAdminDashboard     = lazy(() => import("./pages/OrgAdminDashboard").then(m => ({ default: m.OrgAdminDashboard })));

// ── Lightweight global fallback for Suspense ──────────────────────────────────
function PageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#020617", padding: "2rem" }}>
      <Skeleton width="100%" height="60px" borderRadius="12px" />
      <div style={{ marginTop: "2rem", display: "grid", gap: "1rem",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} width="100%" height="180px" borderRadius="16px" />
        ))}
      </div>
    </div>
  );
}

// ── Animated routes (needs useLocation, so wrapped in a child) ───────────────
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public ──────────────────────────────────────────── */}
        <Route path="/" element={<Suspense fallback={<PageSkeleton />}><PageTransition><HomePage /></PageTransition></Suspense>} />
        <Route path="/auth" element={<Suspense fallback={<PageSkeleton />}><PageTransition><AuthPage /></PageTransition></Suspense>} />
        <Route path="/auth/callback" element={<Suspense fallback={<PageSkeleton />}><PageTransition><AuthCallbackPage /></PageTransition></Suspense>} />
        <Route path="/auth/role-selection" element={<Suspense fallback={<PageSkeleton />}><PageTransition><RoleSelectionPage /></PageTransition></Suspense>} />
        <Route path="/join" element={<Suspense fallback={<PageSkeleton />}><PageTransition><StudentJoinPage /></PageTransition></Suspense>} />
        <Route path="/pricing" element={<Suspense fallback={<PageSkeleton />}><PageTransition><PricingPage /></PageTransition></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageSkeleton />}><PageTransition><PrivacyPolicyPage /></PageTransition></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageSkeleton />}><PageTransition><TermsOfServicePage /></PageTransition></Suspense>} />
        <Route path="/leaderboard" element={<Suspense fallback={<PageSkeleton />}><PageTransition><LeaderboardPage /></PageTransition></Suspense>} />
        <Route path="/lesson/:lessonId" element={<Suspense fallback={<PageSkeleton />}><PageTransition variant="fade"><LessonPage /></PageTransition></Suspense>} />

        {/* ── Teacher ─────────────────────────────────────────── */}
        <Route path="/teacher/create" element={
          <ProtectedRoute requiredRole="teacher">
            <Suspense fallback={<PageSkeleton />}><PageTransition><TeacherDashboardPage /></PageTransition></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/teacher/analytics" element={
          <ProtectedRoute requiredRole="teacher">
            <Suspense fallback={<PageSkeleton />}><PageTransition><TeacherAnalyticsPage /></PageTransition></Suspense>
          </ProtectedRoute>
        } />

        {/* ── Student ─────────────────────────────────────────── */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute requiredRole="student">
            <Suspense fallback={<PageSkeleton />}><PageTransition><StudentDashboardPage /></PageTransition></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/sandbox" element={
          <ProtectedRoute requiredRole="student">
            <Suspense fallback={<PageSkeleton />}><PageTransition variant="fade"><SandboxPage /></PageTransition></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/lab" element={
          <ProtectedRoute requiredRole="student">
            <Suspense fallback={<PageSkeleton />}><PageTransition variant="fade"><InteractiveLabPage /></PageTransition></Suspense>
          </ProtectedRoute>
        } />

        {/* ── Creator ─────────────────────────────────────────── */}
        <Route path="/creator/lab" element={
          <ProtectedRoute requiredRole="creator">
            <Suspense fallback={<PageSkeleton />}><PageTransition><CreatorDashboardPage /></PageTransition></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/creator/studio" element={
          <ProtectedRoute requiredRole={["creator", "teacher"]}>
            <Suspense fallback={<PageSkeleton />}><PageTransition variant="fade"><CreatorStudioPage /></PageTransition></Suspense>
          </ProtectedRoute>
        } />

        {/* ── Admin (Platform) ──────────────────────────── */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageSkeleton />}><PageTransition><AdminDashboardPage /></PageTransition></Suspense>
          </ProtectedRoute>
        } />

        {/* ── Org Admin (Enterprise Schools) ───────────── */}
        <Route path="/org-admin" element={
          <ProtectedRoute requiredRole={["teacher", "admin"]}>
            <Suspense fallback={<PageSkeleton />}><PageTransition><OrgAdminDashboard /></PageTransition></Suspense>
          </ProtectedRoute>
        } />

        {/* ── 3D Lab ──────────────────────────────────────────── */}
        <Route path="/experience/hub" element={
          <ProtectedRoute requiredRole={["teacher", "creator"]}>
            <Suspense fallback={<PageSkeleton />}><PageTransition><AIGenerationHubPage /></PageTransition></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/experience/image-to-3d" element={
          <ProtectedRoute requiredRole={["teacher", "creator"]}>
            <Suspense fallback={<PageSkeleton />}><PageTransition><ImageTo3DExperiencePage key="image" defaultInputType="image" /></PageTransition></Suspense>
          </ProtectedRoute>
        } />
        <Route path="/experience/text-to-3d" element={
          <ProtectedRoute requiredRole={["teacher", "creator"]}>
            <Suspense fallback={<PageSkeleton />}><PageTransition><ImageTo3DExperiencePage key="text" defaultInputType="text" /></PageTransition></Suspense>
          </ProtectedRoute>
        } />

        {/* ── 404 ─────────────────────────────────────────────── */}
        <Route path="*" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><NotFoundPage /></PageTransition>
          </Suspense>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AnimatedRoutes />
        <ToastContainer />

        <CookieBanner />
      </BrowserRouter>
    </AuthProvider>
  );
}
