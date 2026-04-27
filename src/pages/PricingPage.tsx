import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Sparkles, ArrowLeft, Star, Building2, Mail } from "lucide-react";
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
    currency: "$",
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
    price_monthly: "9",
    priceId_monthly: import.meta.env.VITE_PADDLE_PRO_PRICE_ID,
    price_annual: "91",
    priceId_annual: import.meta.env.VITE_PADDLE_PRO_ANNUAL_PRICE_ID,
    currency: "$",
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
    price_monthly: "14",
    priceId_monthly: import.meta.env.VITE_PADDLE_MAX_PRICE_ID,
    price_annual: "141",
    priceId_annual: import.meta.env.VITE_PADDLE_MAX_ANNUAL_PRICE_ID,
    currency: "$",
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
  const { user, profile } = useAuth();
  const navigate  = useNavigate();
  const { i18n }  = useTranslation();
  const lang = i18n.language.startsWith("ar") ? "ar"
             : i18n.language.startsWith("fr") ? "fr"
             : i18n.language.startsWith("es") ? "es"
             : "en";

  const [seatCount, setSeatCount] = useState(25);
  const pricePerSeat = 5; // $5 per seat/month for enterprise
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const isAnnual = billing === 'annual';
  const [checkoutTier, setCheckoutTier] = useState<{ tier: Tier; priceId: string } | null>(null);

  const handleUpgrade = (plan: typeof PLANS[0]) => {
    if (!user) { navigate("/auth"); return; }
    const priceId = isAnnual && (plan as any).priceId_annual
      ? (plan as any).priceId_annual
      : (plan as any).priceId_monthly;
    setCheckoutTier({ tier: plan.id as Tier, priceId });
  };

  const handleSuccess = () => {
    showToast({ type: "success", title: "🎉 Subscription activated!", message: "Your MetaLearning plan is now active." });
    if (!user) { navigate("/"); return; }
    switch (profile?.role) {
      case "teacher":  navigate("/teacher/create");    break;
      case "creator":  navigate("/creator/lab");       break;
      case "admin":    navigate("/admin");              break;
      default:         navigate("/student/dashboard"); break;
    }
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

        {/* Billing Period Toggle */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "8px", marginBottom: "2.5rem",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "50px", padding: "5px",
          width: "fit-content", margin: "0 auto 2.5rem",
        }}>
          {(['monthly', 'annual'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: "8px 20px", borderRadius: "50px", cursor: "pointer",
                border: "none", fontSize: "0.9rem", fontWeight: 600, transition: "all 0.2s",
                background: billing === b
                  ? "linear-gradient(135deg, #7c3aed, #3b82f6)"
                  : "transparent",
                color: billing === b ? "white" : "#64748b",
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              {b === 'monthly' ? 'Monthly' : (
                <>Annual <span style={{
                  background: "#10b981", color: "white",
                  fontSize: "0.65rem", fontWeight: 700,
                  padding: "2px 7px", borderRadius: "10px",
                }}>Save 16%</span></>
              )}
            </button>
          ))}
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
                <span style={{ fontSize: "2.5rem", fontWeight: 900, color: plan.id === "free" ? "#94a3b8" : plan.color }}>
                  {plan.currency}
                  {isAnnual && (plan as any).price_annual
                    ? (plan as any).price_annual
                    : plan.price_monthly}
                </span>
                <span style={{ color: "#475569", fontSize: "0.85rem", marginLeft: "4px" }}>
                  {isAnnual ? "/yr" : "/mo"}
                </span>
                {isAnnual && (plan as any).price_annual && plan.id !== 'free' && (
                  <div style={{ color: "#10b981", fontSize: "0.75rem", marginTop: "3px" }}>
                    vs ${parseInt(plan.price_monthly) * 12}/yr if monthly
                  </div>
                )}
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
                  onClick={() => handleUpgrade(plan)}
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

        {/* ── ENTERPRISE CARD ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            maxWidth: "860px", margin: "0 auto 4rem",
            background: "linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,10,60,0.9) 100%)",
            border: "1px solid rgba(124,58,237,0.5)",
            boxShadow: "0 0 80px rgba(124,58,237,0.15), 0 20px 40px rgba(0,0,0,0.5)",
            borderRadius: "24px", padding: "2.5rem",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", alignItems: "center" }}>
            {/* Left: Info */}
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                <div style={{
                  padding: "10px", borderRadius: "12px",
                  background: "rgba(124,58,237,0.2)", color: "#a78bfa",
                }}>
                  <Building2 size={28} />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: "white", fontSize: "1.5rem", fontWeight: 800 }}>Enterprise</h2>
                  <p style={{ margin: 0, color: "#7c3aed", fontSize: "0.8rem", fontWeight: 600 }}>Schools &amp; Institutions</p>
                </div>
                <span style={{
                  marginLeft: "auto", padding: "4px 12px", borderRadius: "999px",
                  background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)",
                  color: "#a78bfa", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em",
                }}>CUSTOM PRICING</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "9px" }}>
                {[
                  { en: "Everything in MAX", ar: "كل مزايا MAX", fr: "Tout dans MAX", es: "Todo en MAX" },
                  { en: "Bulk seats for teachers & students", ar: "مقاعد جماعية للطلاب والمعلمين", fr: "Places en volume", es: "Asientos en volumen" },
                  { en: "Organization Admin Dashboard", ar: "لوحة تحكم مدير المدرسة", fr: "Tableau de bord admin", es: "Panel de admin org" },
                  { en: "Magic invite link (auto seat assign)", ar: "رابط انضمام سحري تلقائي", fr: "Lien d'invitation magique", es: "Enlace de invitación mágico" },
                  { en: "Auto-approve by email domain", ar: "قبول تلقائي بنطاق الإيميل", fr: "Approbation auto par domaine", es: "Aprobación auto por dominio" },
                  { en: "Dedicated support & onboarding", ar: "دعم مخصص وتأهيل", fr: "Support dédié & onboarding", es: "Soporte dedicado" },
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", color: "#94a3b8", fontSize: "0.88rem" }}>
                    <Check size={15} style={{ color: "#7c3aed", flexShrink: 0, marginTop: "2px" }} />
                    {f[lang] || f.en}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Seat Calculator */}
            <div style={{
              flex: "1 1 260px",
              background: "rgba(124,58,237,0.07)",
              border: "1px solid rgba(124,58,237,0.2)",
              borderRadius: "18px", padding: "1.75rem",
            }}>
              <p style={{ margin: "0 0 0.5rem", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Seat Calculator</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "1rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 900, color: "#a78bfa" }}>${(seatCount * pricePerSeat).toLocaleString()}</span>
                <span style={{ color: "#475569" }}>/mo</span>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "0 0 1.25rem" }}>
                {seatCount} seats × ${pricePerSeat}/seat &nbsp;·&nbsp; ${(seatCount * pricePerSeat * 10).toLocaleString()}/yr (Save 16%)
              </p>

              {/* Slider */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Number of seats</span>
                  <span style={{ color: "#a78bfa", fontWeight: 700 }}>{seatCount}</span>
                </div>
                <input
                  type="range" min={10} max={500} step={5}
                  value={seatCount}
                  onChange={e => setSeatCount(Number(e.target.value))}
                  style={{
                    width: "100%", accentColor: "#7c3aed",
                    cursor: "pointer",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: "0.72rem" }}>
                  <span>10 min</span>
                  <span>500 max</span>
                </div>
              </div>

              {/* CTA */}
              <motion.a
                href={`mailto:enterprise@metalearning.app?subject=Enterprise Inquiry — ${seatCount} Seats&body=Hello, I'm interested in the Enterprise plan for ${seatCount} seats.`}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  width: "100%", padding: "13px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                  color: "white", fontWeight: 700, fontSize: "0.95rem",
                  textDecoration: "none", boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
                  marginBottom: "0.75rem",
                }}
              >
                <Mail size={16} /> Contact Sales
              </motion.a>
              <p style={{ textAlign: "center", color: "#475569", fontSize: "0.72rem", margin: 0 }}>
                Response within 24 hours · Custom contracts available
              </p>
            </div>
          </div>
        </motion.div>
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
          <Sparkles size={12} style={{ verticalAlign: "middle" }} /> Prices in USD. International cards accepted via Paddle. Cancel anytime.
        </p>
      </div>

      {/* Checkout Modal */}
      {checkoutTier && (
        <CheckoutModal
          tier={checkoutTier.tier}
          priceId={checkoutTier.priceId}
          isAnnual={isAnnual}
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
