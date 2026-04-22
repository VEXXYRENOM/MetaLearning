import { Skeleton } from "./Skeleton";

/** Placeholder for user profile header while data loads */
export function SkeletonProfile() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "1rem",
      padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)",
      marginBottom: "2rem"
    }}>
      {/* Avatar circle */}
      <Skeleton width="56px" height="56px" borderRadius="50%" />
      {/* Text lines */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <Skeleton width="180px" height="20px" borderRadius="6px" />
        <Skeleton width="120px" height="14px" borderRadius="6px" />
      </div>
      {/* XP pill placeholder */}
      <Skeleton width="110px" height="32px" borderRadius="999px" />
    </div>
  );
}

/** Full dashboard skeleton (profile + stats + cards) */
export function SkeletonDashboard() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <SkeletonProfile />

      {/* Stats row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem", marginBottom: "2rem"
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.03)", borderRadius: "12px",
            padding: "1.5rem", border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: "1rem"
          }}>
            <Skeleton width="44px" height="44px" borderRadius="10px" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
              <Skeleton width="70%" height="12px" borderRadius="4px" />
              <Skeleton width="40%" height="22px" borderRadius="4px" />
            </div>
          </div>
        ))}
      </div>

      {/* XP bar */}
      <div style={{
        background: "rgba(255,255,255,0.03)", borderRadius: "16px",
        padding: "1.5rem", marginBottom: "2rem",
        border: "1px solid rgba(255,255,255,0.06)",
        display: "flex", gap: "1rem", alignItems: "center"
      }}>
        <Skeleton width="56px" height="56px" borderRadius="50%" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <Skeleton width="40%" height="16px" borderRadius="6px" />
          <Skeleton width="100%" height="10px" borderRadius="999px" />
          <Skeleton width="25%" height="12px" borderRadius="6px" />
        </div>
      </div>
    </div>
  );
}
