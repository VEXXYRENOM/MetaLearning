import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PrivacyPolicyPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  return (
    <div style={{
      minHeight: "100vh", background: "#020617", color: "#e2e8f0",
      fontFamily: "'Inter', system-ui, sans-serif", padding: "2rem", lineHeight: "1.7",
      direction: isArabic ? "rtl" : "ltr"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
        
        <div style={{ marginBottom: "2rem" }}>
          <Link to="/" style={{ color: "#38bdf8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            {isArabic ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            {isArabic ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem",
          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
          padding: "1.5rem", borderRadius: "16px"
        }}>
          <ShieldCheck size={40} color="#3b82f6" />
          <div>
            <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem", color: "white" }}>
              {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
            </h1>
            <p style={{ margin: 0, color: "#94a3b8" }}>
              {isArabic ? "آخر تحديث: أبريل 2026" : "Last updated: April 2026"}
            </p>
          </div>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(12px)", borderRadius: "16px", padding: "2rem", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
          
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#38bdf8", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "1. مقدمة وهوية متحكم البيانات" : "1. Introduction & Data Controller Identity"}
            </h2>
            <p>
              {isArabic 
                ? "مرحباً بكم في MetaLearning. نحن ملتزمون بحماية خصوصيتكم وضمان معالجة معلوماتكم الشخصية بطريقة آمنة ومسؤولة. توضح هذه السياسة كيفية جمعنا، واستخدامنا، وحمايتنا لبياناتكم." 
                : "Welcome to MetaLearning. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your data."}
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#38bdf8", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "2. تقليل البيانات (Data Minimization)" : "2. Data Minimization (What We Collect)"}
            </h2>
            <p>
              {isArabic 
                ? "نحن نمارس التقليل الصارم للبيانات. نجمع فقط ما هو ضروري جداً لتشغيل منصتنا التعليمية:" 
                : "We practice strict data minimization. We only collect what is absolutely necessary to operate our educational platform:"}
            </p>
            <ul>
              <li><strong>{isArabic ? "بيانات الحساب:" : "Account data:"}</strong> {isArabic ? "البريد الإلكتروني، الاسم الكامل، واختيار الدور (معلم/طالب)." : "Email address, full name, and your selected role."}</li>
              <li><strong>{isArabic ? "تحليلات الطلاب:" : "Student Analytics:"}</strong> {isArabic ? "نسجل تفاعلات الطلاب مع النقاط الفعالة وإجابات الاختبارات بهدف مساعدة المعلم على تقييم الفهم فقط. لا نستخدم التحليلات للإعلانات أبداً." : "We log student interactions with hotspots and quiz answers strictly to help the teacher assess understanding. Analytics are never used for advertising."}</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#38bdf8", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "3. التخزين الآمن عبر Supabase" : "3. Secure Storage via Supabase"}
            </h2>
            <p>
              {isArabic 
                ? "جميع بياناتاتكم محفوظة بشكل آمن باستخدام قواعد بيانات Supabase. حيث يتم تشفير البيانات أثناء النقل وأثناء التخزين على الخواص (Encryption at Rest and in Transit) مع سياسات وصول دقيقة (Row Level Security)." 
                : "All your data is securely stored using Supabase databases. Data is encrypted in transit and at rest, guarded by strict Row Level Security (RLS) policies."}
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#38bdf8", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "4. التوافق مع GDPR للمستخدمين في أوروبا" : "4. GDPR Compliance (EU Users)"}
            </h2>
            <p>
              {isArabic 
                ? "منصة MetaLearning متوافقة بالكامل مع اللائحة العامة لحماية البيانات (GDPR). يمتلك المستخدمون حق الوصول لبياناتهم، حق النسيان (حذف الحساب بالكامل)، وحق نقل البيانات." 
                : "MetaLearning is fully compliant with the General Data Protection Regulation (GDPR). Users retain the right to access data, the right to be forgotten (full account deletion), and data portability."}
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#38bdf8", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "5. التوافق مع COPPA وحماية الأطفال" : "5. COPPA Compliance & Child Protection"}
            </h2>
            <p>
              {isArabic 
                ? "حماية الطلاب أولوية مطلقة. تلتزم المنصة بقانون حماية خصوصية الأطفال على الإنترنت (COPPA). نحن لا نبيع أبدًا بيانات الطلاب لجهات خارجية ولا نعرض أي إعلانات مستهدفة." 
                : "Student protection is an absolute priority. We comply heavily with the Children's Online Privacy Protection Act (COPPA). We never sell student data to third parties, nor do we run targeted advertisements."}
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
