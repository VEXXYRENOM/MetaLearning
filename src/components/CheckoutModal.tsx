import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Loader2, CreditCard } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { showToast } from "./Toast";
import { initializePaddle, Paddle } from "@paddle/paddle-js";

interface CheckoutModalProps {
  tier: "pro" | "max";
  onClose: () => void;
  onSuccess: () => void;
}

const TIER_CONFIG = {
  pro: {
    name:  "PRO",
    price: "20 د.ت",
    color: "#06b6d4",
    glow:  "rgba(6,182,212,0.4)",
    gradient: "linear-gradient(135deg, #0891b2, #06b6d4)",
    priceId: import.meta.env.VITE_PADDLE_PRO_PRICE_ID,
  },
  max: {
    name:  "MAX",
    price: "30 د.ت",
    color: "#f59e0b",
    glow:  "rgba(245,158,11,0.4)",
    gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
    priceId: import.meta.env.VITE_PADDLE_MAX_PRICE_ID,
  },
};

export function CheckoutModal({ tier, onClose, onSuccess }: CheckoutModalProps) {
  const cfg = TIER_CONFIG[tier];
  const [loading, setLoading] = useState(false);
  const [paddle, setPaddle] = useState<Paddle | undefined>();

  useEffect(() => {
    initializePaddle({
      environment: (import.meta.env.VITE_PADDLE_ENVIRONMENT as "sandbox" | "production") ?? "sandbox",
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || "",
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to continue.");

      const priceId = cfg.priceId;
      if (!priceId) throw new Error("Paddle price ID is missing from environment variables.");

      if (!paddle) throw new Error("Payment gateway is initializing. Please try again in a few seconds.");

      // Open Paddle Overlay Checkout
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: user.email!,
        },
        settings: {
          locale: navigator.language || "en",
        },
        customData: {
          userId: user.id,
          subscription_tier: tier,
        },
      });

      // Close the modal since the Paddle overlay is taking over
      onClose();
      
    } catch (err: any) {
      console.error(err);
      showToast({ type: "error", title: "Checkout Error", message: err.message });
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem"
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: "420px",
            background: "rgba(15,23,42,0.95)", backdropFilter: "blur(20px)",
            border: `1px solid ${cfg.color}55`,
            boxShadow: `0 0 60px ${cfg.glow}, 0 25px 50px rgba(0,0,0,0.8)`,
            borderRadius: "24px", padding: "2rem",
            fontFamily: "'Inter', system-ui, sans-serif"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: cfg.gradient, borderRadius: "999px",
                padding: "4px 14px", fontSize: "0.75rem", fontWeight: "bold",
                color: "white", marginBottom: "8px", letterSpacing: "0.08em"
              }}>
                ⚡ {cfg.name} PLAN
              </div>
              <h2 style={{ margin: 0, color: "white", fontSize: "1.6rem", fontWeight: 700 }}>
                Checkout
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94a3b8", cursor: loading ? "not-allowed" : "pointer", borderRadius: "8px", padding: "8px", display: "flex" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Price summary */}
          <div style={{
            background: `${cfg.color}12`, border: `1px solid ${cfg.color}35`,
            borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "2rem",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.8rem" }}>MONTHLY SUBSCRIPTION</p>
              <p style={{ margin: 0, color: "white", fontWeight: 600 }}>MetaLearning {cfg.name}</p>
            </div>
            <p style={{ margin: 0, color: cfg.color, fontWeight: "bold", fontSize: "1.4rem" }}>{cfg.price}</p>
          </div>

          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.5 }}>
            You will be securely redirected to Paddle to complete your payment.
          </p>

          {/* Action Button */}
          <motion.button
            onClick={handleCheckout}
            disabled={loading || !paddle}
            whileHover={(loading || !paddle) ? {} : { scale: 1.02 }}
            whileTap={(loading || !paddle) ? {} : { scale: 0.98 }}
            style={{
              width: "100%",
              background: (loading || !paddle) ? "rgba(255,255,255,0.05)" : cfg.gradient,
              border: "none", color: "white", padding: "14px",
              borderRadius: "12px", cursor: (loading || !paddle) ? "not-allowed" : "pointer",
              fontWeight: "bold", fontSize: "1.05rem",
              display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: "10px",
              boxShadow: (loading || !paddle) ? "none" : `0 8px 24px ${cfg.glow}`,
              transition: "all 0.2s"
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                Loading checkout...
              </>
            ) : !paddle ? (
              <>
                <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                Initializing gateway...
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Proceed to Payment
              </>
            )}
          </motion.button>
          
          <div style={{ textAlign: "center", marginTop: "1rem", color: "#64748b", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Lock size={12} /> SSL encrypted · Powered by Paddle
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
