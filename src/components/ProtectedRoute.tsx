import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Profile } from "../services/supabaseClient";

type Role = Profile["role"];

export function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode; 
  requiredRole?: Role | Role[];
}) {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#020617", color: "white",
        flexDirection: "column", gap: "1rem", fontFamily: "Inter, sans-serif"
      }}>
        <div style={{
          width: "40px", height: "40px",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTop: "3px solid #a855f7",
          borderRadius: "50%", animation: "spin 1s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // No role yet → force role selection
  if (!profile?.role && window.location.pathname !== "/auth/role-selection") {
    return <Navigate to="/auth/role-selection" replace />;
  }

  // Check role access
  if (requiredRole && profile?.role) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(profile.role as Role)) {
      // Redirect to the user's own home based on their actual role
      const homeMap: Record<Role, string> = {
        teacher: "/teacher/create",
        student: "/student/dashboard",
        creator: "/creator/lab",
        admin: "/admin/dashboard",
      };
      return <Navigate to={homeMap[profile.role as Role] ?? "/"} replace />;
    }
  }

  return <>{children}</>;
}
