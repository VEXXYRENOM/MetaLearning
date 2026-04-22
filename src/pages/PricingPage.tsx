import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Sparkles, ArrowLeft, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { MetaTags } from "../components/MetaTags";
import { CheckoutModal } from "../components/CheckoutModal";
import { showToast } from "../components/Toast";

// ── Plan definitions ─────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free" as const,
    key: "free",
    price_monthly: "0",
    currency: "د.ت",
    icon: <Zap size={28} />,
    color: "#64748b",
    border: "rgba(100,116,139,0.35)",
    glow: "rgba(100,116,139,0)",
    gradient: "linear-gradient(135deg, #475569, #64748b)",
    recommended: false,
    features: [
      { en: "3 lessons per day",             ar: "3 دروس يومياً",             fr: "3 leçons par jour",            es: "3 lecciones al día" },
      { en: "All basic 3D models",           ar: "جميع النماذج الأساسية",     fr: "Tous les modèles 3D de base", es: "Modelos 3D básicos" },
      { en: "PIN code sharing",              ar: "مشاركة برمز PIN",           fr: "Partage par PIN",              es: "Compartir por PIN" },
      { en: "QR code sharing",              ar: "مشاركة برمز QR",           fr: "Partage par QR",              es: "Compartir por QR" },
      { en: "Standard XP earnings",         ar: "نقاط XP عادية",            fr: "Gains XP standards",          es: "XP estándar" },
      { en: "Up to 30 students/session",    ar: "حتى 30 طالب للجلسة",       fr: "30 étudiants/session",        es: "30 estudiantes/sesión" },
    ],
  },
  {
    id: "pro" as const,
    key: "pro",
    price_monthly: "20",
    currency: "د.ت",
    icon: <Zap size={28} />,
    color: "#06b6d4",
    border: "rgba(6,182,212,0.5)",
    glow: "rgba(6,182,212,0.25)",
    gradient: "linear-gradient(135deg, #0891b2, #06b6d4)",
    recommended: false,
    features: [
      { en: "Unlimited lessons",           ar: "دروس غير محدودة",           fr: "Leçons illimitées",          es: "Lecciones ilimitadas" },
      { en: "Global Leaderboard access",   ar: "الوصول للوحة المتصدرين",    fr: "Accès au Classement global", es: "Acceso al clasificador global" },
      { en: "All standard badges",         ar: "جميع الشارات الأساسية",      fr: "Tous les badges standards",  es: "Todas las insignias básicas" },
      { en: "Image to 3D AI conversion",   ar: "تحويل الصور إلى 3D بذكاء",  fr: "Conversion image vers 3D",  es: "Conversión imagen a 3D IA" },
      { en: "200 students/session",        ar: "200 طالب للجلسة",           fr: "200 étudiants/session",      es: "200 estudiantes/sesión" },
      { en: "Teacher analytics dashboard", ar: "لوحة تحليلات المعلم",       fr: "Tableau de bord analytique", es: "Panel de análisis" },
    ],
  },
  {
    id: "max" as const,
    key: "max",
    price_monthly: "30",
    currency: "د.ت",
    icon: <Crown size={28} />,
    color: "#f59e0b",
    border: "rgba(245,158,11,0.7)",
    glow: "rgba(245,158,11,0.35)",
    gradient: "linear-gradient(135deg, #d97706, #f59e0b, #fbbf24)",
    recommended: true,
    features: [
      { en: "Everything in PRO",              ar: "كل مزايا PRO",                fr: "Tout dans PRO",               es: "Todo de PRO" },
      { en: "Ultra 4K textures",             ar: "تقنية 4K فائقة الدقة",        fr: "Textures Ultra 4K",           es: "Texturas Ultra 4K" },
      { en: "Early access to new 3D models", ar: "وصول مبكر للنماذج الجديدة",   fr: "Accès anticipé aux modèles",  es: "Acceso anticipado a modelos" },
      { en: "Priority support (24h)",        ar: "دعم فوري (24 ساعة)",           fr: "Support prioritaire (24h)",   es: "Soporte prioritario (24h)" },
      { en: "Exclusive Legendary Glow badges", ar: "شارات أسطورية حصرية مضيئة", fr: "Badges Légendaires exclusifs", es: "Insignias Legendarias exclusivas" },
      { en: "Unlimited students/session",    ar: "طلاب غير محدودين للجلسة",     fr: "Étudiants illimités/session", es: "Estudiantes ilimitados/sesión" },
    ],
  },
];

// ── Comparison feature rows ──────────────────────────────────────────────────
const COMPARISON = [
  { label: { en: "Daily lessons",          ar: "الدروس اليومية",           fr: "Leçons quotidiennes",        es: "Lecciones diarias" },         free: "3",  pro: "∞",  max: "∞"  },
  { label: { en: "Students per session",   ar: "الطلاب لكل جلسة",          fr: "Étudiants/session",          es: "Estudiantes/sesión" },        free: "30", pro: "200",max: "∞"  },
  { label: { en: "3D models library",      ar: "مكتبة النماذج 3D",         fr: "Bibliothèque 3D",            es: "Biblioteca 3D" },             free: "✅", pro: "✅", max: "✅" },
  { label: { en: "Image to 3D AI",         ar: "صورة إلى 3D",              fr: "Image vers 3D",              es: "Imagen a 3D" },                free: "❌", pro: "✅", max: "✅" },
  { label: { en: "Ultra 4K textures",      ar: "تقنية 4K",                 fr: "Textures 4K",                es: "Texturas 4K" },                free: "❌", pro: "❌", max: "✅" },
  { label: { en: "Global Leaderboard",     ar: "لوحة المتصدرين",           fr: "Classement mondial",         es: "Clasificador global" },        free: "❌", pro: "✅", max: "✅" },
  { label: { en: "Legendary badges",       ar: "شارات أسطورية",            fr: "Badges légendaires",         es: "Insignias legendarias" },      free: "❌", pro: "❌", max: "✅" },
  { label: { en: "Priority support",       ar: "دعم فوري",                 fr: "Support prioritaire",        es: "Soporte prioritario" },        free: "❌", pro: "❌", max: "✅" },
];

type Tier = "pro" | "max";

export function PricingPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const { i18n }  = useTranslation();
  const lang = i18n.language.startsWith("ar") ? "ar"
             : i18n.language.startsWith("fr") ? "fr"
             : i18n.language.startsWith("es") ? "es"
             : "en";

  const [checkoutTier, setCheckoutTier] = useState<Tier | null>(null);

  const handleUpgrade = (tier: Tier) => {
    if (!user) { navigate("/auth"); return; }
    setCheckoutTier(tier);
  };

  const handleSuccess = () => {
    showToast({ type: "success", title: "🎉 Subscription activated!", message: "Enjoy your new MetaLearning plan." });
    navigate(user ? "/student/dashboard" : "/");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #0f0823 0%, #020617 60%)",
      color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif",
      padding: "3rem 1.5rem", overflowX: "hidden"
    }}>
      <MetaTags title="Pricing — MetaLearning" description="Choose your MetaLearning plan. From free 3D exploration to MAX with 4K textures." path="/pricing" />

      {/* Back */}
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <Link to="/" style={{ color: "#64748b", textDecoration: "none", display: "inline-flex",
          alignItems: "center", gap: "6px", marginBottom: "2.5rem", fontSize: "0.85rem" }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "999px", padding: "6px 16px", fontSize: "0.8rem",
              color: "#f59e0b", marginBottom: "1.5rem" }}>
              <Star size={14} /> Turn MetaLearning into your unfair advantage
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", margin: "0 0 1rem",
              background: "linear-gradient(135deg, #fff 30%, #a5b4fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {lang === "ar" ? "الخطط والأسعار" : lang === "fr" ? "Plans & Tarifs" : lang === "es" ? "Planes y Precios" : "Plans & Pricing"}
            </h1>
            <p style={{ color: "#64748b", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
              {lang === "ar" ? "اختر الخطة التي تناسبك وابدأ تحويل التعليم!" : lang === "fr" ? "Choisissez le plan qui vous convient et transformez l'enseignement !" : lang === "es" ? "Elige el plan que se adapte a ti y transforma la educación." : "Choose the plan that fits you and start transforming education!"}
            </p>
          </motion.div>
        </div>

        {/* ── PRICING CARDS ───────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center",
          flexWrap: "wrap", marginBottom: "4rem" }}>
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                flex: "1 1 300px", maxWidth: "360px", position: "relative",
                background: plan.recommended ? "rgba(245,158,11,0.06)" : "rgba(15,23,42,0.8)",
                backdropFilter: "blur(16px)",
                border: `1px solid ${plan.border}`,
                borderRadius: "24px", padding: "2rem",
                boxShadow: plan.recommended ? `0 0 60px ${plan.glow}, 0 20px 40px rgba(0,0,0,0.5)` : "0 8px 32px rgba(0,0,0,0.4)"
              }}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div style={{
                  position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                  background: plan.gradient, color: "white", fontSize: "0.75rem",
                  fontWeight: "bold", padding: "5px 18px", borderRadius: "999px",
                  whiteSpace: "nowrap", letterSpacing: "0.08em",
                  boxShadow: `0 4px 16px ${plan.glow}`
                }}>
                  ✨ {lang === "ar" ? "الأكثر طلباً" : lang === "fr" ? "Recommandé" : lang === "es" ? "Recomendado" : "Recommended"}
                </div>
              )}

              {/* Icon + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
                <div style={{ padding: "10px", borderRadius: "12px", background: `${plan.color}20`, color: plan.color }}>
                  {plan.icon}
                </div>
                <div>
                  <h2 style={{ margin: 0, color: "white", fontSize: "1.4rem", fontWeight: 800 }}>
                    {plan.id.toUpperCase()}
                  </h2>
                  {plan.id === "free" && <p style={{ margin: 0, color: "#475569", fontSize: "0.75rem" }}>
                    {lang === "ar" ? "الخطة المجانية" : lang === "fr" ? "Plan Gratuit" : lang === "es" ? "Plan Gratuito" : "Free Plan"}
                  </p>}
                  {plan.id === "pro" && <p style={{ margin: 0, color: "#0891b2", fontSize: "0.75rem" }}>
                    {lang === "ar" ? "الخطة الاحترافية" : lang === "fr" ? "Plan Professionnel" : lang === "es" ? "Plan Profesional" : "Professional Plan"}
                  </p>}
                  {plan.id === "max" && <p style={{ margin: 0, color: "#d97706", fontSize: "0.75rem" }}>
                    {lang === "ar" ? "الخطة القصوى" : lang === "fr" ? "Plan Maximum" : lang === "es" ? "Plan Máximo" : "Ultimate Plan"}
                  </p>}
                </div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "1.75rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 900, color: plan.id === "free" ? "#94a3b8" : plan.color }}>
                  {plan.price_monthly}
                </span>
                <span style={{ color: "#475569", marginLeft: "6px" }}>{plan.currency}/</span>
                <span style={{ color: "#475569", fontSize: "0.85rem" }}>
                  {lang === "ar" ? "شهر" : lang === "fr" ? "mois" : lang === "es" ? "mes" : "month"}
                </span>
              </div>

              {/* Features */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                {plan.features.map((feat, fi) => (
                  <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: "10px",
                    color: "#94a3b8", fontSize: "0.9rem" }}>
                    <Check size={16} style={{ color: plan.color, flexShrink: 0, marginTop: "2px" }} />
                    {feat[lang] || feat.en}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.id === "free" ? (
                <Link to={user ? "/" : "/auth"}  style={{
                  display: "block", textAlign: "center", padding: "12px",
                  borderRadius: "12px", background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8",
                  textDecoration: "none", fontWeight: 600, fontSize: "0.95rem",
                  transition: "all 0.2s"
                }}>
                  {lang === "ar" ? "ابدأ مجاناً" : lang === "fr" ? "Commencer Gratuit" : lang === "es" ? "Comenzar Gratis" : "Get Started Free"}
                </Link>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: `0 12px 30px ${plan.glow}` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleUpgrade(plan.id as Tier)}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "12px",
                    background: plan.gradient, border: "none", color: "white",
                    fontWeight: "bold", fontSize: "0.95rem", cursor: "pointer",
                    boxShadow: `0 6px 20px ${plan.glow}`, transition: "all 0.2s"
                  }}
                >
                  {lang === "ar" ? `ترقية إلى ${plan.id.toUpperCase()}` : lang === "fr" ? `Passer à ${plan.id.toUpperCase()}` : lang === "es" ? `Actualizar a ${plan.id.toUpperCase()}` : `Upgrade to ${plan.id.toUpperCase()}`}
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── COMPARISON TABLE ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ overflowX: "auto", marginBottom: "4rem" }}
        >
          <h2 style={{ textAlign: "center", color: "white", marginBottom: "1.5rem", fontSize: "1.5rem" }}>
            {lang === "ar" ? "مقارنة الخطط" : lang === "fr" ? "Comparaison complète" : lang === "es" ? "Comparación completa" : "Full Comparison"}
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
            <thead>
              <tr>
                <th style={thStyle("#020617")}> </th>
                <th style={thStyle("rgba(100,116,139,0.1)")}>FREE</th>
                <th style={thStyle("rgba(6,182,212,0.1)")}>
                  <span style={{ color: "#06b6d4" }}>PRO</span>
                </th>
                <th style={thStyle("rgba(245,158,11,0.12)")}>
                  <span style={{ color: "#f59e0b" }}>MAX ✨</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                  <td style={tdStyle}>{row.label[lang] || row.label.en}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#64748b" }}>{row.free}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#06b6d4" }}>{row.pro}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#f59e0b", fontWeight: row.max === "✅" ? "bold" : "normal" }}>{row.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Footer note */}
        <p style={{ textAlign: "center", color: "#334155", fontSize: "0.8rem" }}>
          <Sparkles size={12} style={{ verticalAlign: "middle" }} /> Prices in Tunisian Dinar (TND / د.ت) · Cancel anytime · 30-day refund guarantee
        </p>
      </div>

      {/* Checkout Modal */}
      {checkoutTier && (
        <CheckoutModal
          tier={checkoutTier}
          onClose={() => setCheckoutTier(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

// ── Table styles ────────────────────────────────────────────────
const thStyle = (bg: string): React.CSSProperties => ({
  background: bg, padding: "12px 16px", textAlign: "center",
  color: "white", fontWeight: 700, fontSize: "0.9rem",
  borderBottom: "1px solid rgba(255,255,255,0.06)"
});

const tdStyle: React.CSSProperties = {
  padding: "12px 16px", color: "#94a3b8", fontSize: "0.875rem",
  borderBottom: "1px solid rgba(255,255,255,0.04)"
};
