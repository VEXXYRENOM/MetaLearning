import { Skeleton } from "./Skeleton";

/** Placeholder card for lesson gallery grids */
export function SkeletonLessonCard() {
  return (
    <div style={{
      borderRadius: "16px", overflow: "hidden",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Thumbnail */}
      <Skeleton width="100%" height="120px" borderRadius="0" />
      {/* Content */}
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Skeleton width="50%" height="14px" borderRadius="6px" />
        <Skeleton width="80%" height="18px" borderRadius="6px" />
        <Skeleton width="40%" height="12px" borderRadius="6px" />
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <Skeleton width="60px" height="28px" borderRadius="8px" />
          <Skeleton width="80px" height="28px" borderRadius="8px" />
        </div>
      </div>
    </div>
  );
}

/** Grid of skeleton lesson cards */
export function SkeletonLessonGrid({ count = 6 }: { count?: number }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "1.25rem",
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLessonCard key={i} />
      ))}
    </div>
  );
}
