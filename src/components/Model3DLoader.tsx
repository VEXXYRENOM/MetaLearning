import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Cuboid } from "lucide-react";

export function Model3DLoader() {
  const { progress, active } = useProgress();
  const pct = Math.round(progress);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          style={{
            position: "absolute", inset: 0, zIndex: 50,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(2,6,23,0.92)", backdropFilter: "blur(6px)",
            fontFamily: "'Inter', system-ui, sans-serif",
            pointerEvents: "none",
          }}
        >
          {/* Spinning icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ marginBottom: "1.5rem", color: "#38bdf8" }}
          >
            <Cuboid size={48} strokeWidth={1.2} />
          </motion.div>

          {/* Progress bar */}
          <div style={{
            width: "220px", height: "6px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "999px", overflow: "hidden",
            marginBottom: "0.75rem",
          }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${pct}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                borderRadius: "999px",
                boxShadow: "0 0 10px rgba(56,189,248,0.6)",
              }}
            />
          </div>

          {/* Percentage */}
          <p style={{ color: "#38bdf8", fontWeight: "bold", fontSize: "1.1rem", margin: 0 }}>
            {pct}%
          </p>
          <p style={{ color: "#334155", fontSize: "0.75rem", margin: "4px 0 0" }}>
            Loading 3D Model...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
