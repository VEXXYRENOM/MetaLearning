import { Link } from "react-router-dom";
import { ArrowRight, FileText, ArrowLeft, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MetaTags } from "../components/MetaTags";

export function TermsOfServicePage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  return (
    <div style={{
      minHeight: "100vh", background: "#020617", color: "#e2e8f0",
      fontFamily: "'Inter', system-ui, sans-serif", padding: "2rem", lineHeight: "1.7",
      direction: isArabic ? "rtl" : "ltr"
    }}>
      <MetaTags title={isArabic ? "شروط الخدمة" : "Terms of Service"} />

      <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "4rem" }}>
        
        <div style={{ marginBottom: "2rem" }}>
          <Link to="/" style={{ color: "#a855f7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            {isArabic ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            {isArabic ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem",
          background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
          padding: "1.5rem", borderRadius: "16px"
        }}>
          <FileText size={40} color="#a855f7" />
          <div>
            <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem", color: "white" }}>
              {isArabic ? "شروط الخدمة" : "Terms of Service"}
            </h1>
            <p style={{ margin: 0, color: "#94a3b8" }}>
              {isArabic ? "آخر تحديث: أبريل 2026" : "Last updated: April 2026"}
            </p>
          </div>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(12px)", borderRadius: "16px", padding: "2rem", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
          
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#a855f7", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "1. قبول الشروط" : "1. Acceptance of Terms"}
            </h2>
            <p>
              {isArabic 
                ? "دخولك واستخدامك لمنصة MetaLearning (المملوكة والمدارة من قبل Taki Allah Hichri) يعني موافقتك الصريحة على هذه الشروط الأساسية التي تحمي المنصة والمجتمع التعليمي."
                : "By accessing and using the MetaLearning platform (owned and operated by Taki Allah Hichri), you explicitly agree to these fundamental Terms protecting the platform and our educational community."}
            </p>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#a855f7", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "2. المحتوى المنشأ بواسطة المستخدم (سوق المبدعين)" : "2. User-Generated Content (Marketplace Rights)"}
            </h2>
            <p>
              {isArabic 
                ? "يتيح لك 'السوق العالمي' (Global Creator Marketplace) نشر دروسك الفراغية ليراها العالم."
                : "Our 'Global Creator Marketplace' allows you to publish your spatial lessons to the world."}
            </p>
            <ul>
              <li><strong>{isArabic ? "ملكية حقوق النشر:" : "Copyright Ownership:"}</strong> {isArabic ? "أنت تحتفظ بملكية كافة الدروس والمجسمات الأصلية التي تقوم بتنظيمها." : "You retain ownership of any original lessons and configurations you organize."}</li>
              <li><strong>{isArabic ? "منح الترخيص:" : "License Grant:"}</strong> {isArabic ? "عند اختيارك 'نشر إلى العالم'، فإنك تمنح MetaLearning ترخيصاً دولياً لعرض وتسليم المحتوى للمجتمع التعليمي." : "By toggling 'Publish to World', you grant MetaLearning a global license to display and deliver this content to the educational community."}</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#a855f7", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "3. السلوك المحظور والأمن السيبراني" : "3. Prohibited Behavior & CyberSafety"}
            </h2>
            <p>
              {isArabic 
                ? "لضمان بقاء المنصة مساحة آمنة للطلاب، نمنع منعاً باتاً السلوكيات التالية، والتي قد يؤدي خرقها إلى إيقاف الحساب:"
                : "To ensure the platform remains a safe arena for students, we strictly prohibit the following behaviors, violation of which may result in account termination:"}
            </p>
            <ul>
              <li><strong>{isArabic ? "المحتوى التخريبي:" : "Disruptive Content:"}</strong> {isArabic ? "يُمنع استيراد أو توليد أو نشر مجسمات 3D تحتوي على عنف أو تحريض أو أي محتوى لا يناسب البيئة التعليمية." : "Importing, generating, or distributing 3D models displaying violence, harassment, or any non-educational NSFW content is banned."}</li>
              <li><strong>{isArabic ? "إساءة استخدام الأنظمة:" : "System Abuse:"}</strong> {isArabic ? "يُمنع تنفيذ هجمات DDOS، محاولة حقن أكواد برمجية خبيثة في واجهات الـ Canvas الرسومية." : "Executing DDOS attacks, or attempting to inject malicious code into the Canvas interfaces."}</li>
            </ul>
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#a855f7", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "4. مسؤولية الحساب" : "4. Account Responsibility"}
            </h2>
            <ul>
              <li>{isArabic ? "أنت مسؤول وحدك عن تأمين كلمة المرور واسم الحساب الخاص بك." : "You are solely responsible for securing your password and account credentials."}</li>
              <li>{isArabic ? "المعلم مسؤول مسؤولية كاملة عن مراجعة جودة النماذج والأدوات المنشورة لطلابه عبر الـ PIN Code الخاص بالغرفة." : "Teachers bear complete responsibility for vetting the quality of models distributed to their students via Classroom PIN."}</li>
            </ul>
          </section>

          {/* Refund Policy Section — Critical for Paddle Approval */}
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#a855f7", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "5. سياسة الاسترجاع والإلغاء" : "5. Refund & Cancellation Policy"}
            </h2>
            <p>
              {isArabic 
                ? "نحن نؤمن بجودة خدمتنا، ولذلك نقدم ضماناً لاسترجاع الأموال:"
                : "We believe in our service quality, which is why we offer a satisfaction guarantee:"}
            </p>
            <ul>
              <li><strong>{isArabic ? "ضمان 30 يوماً:" : "30-Day Guarantee:"}</strong> {isArabic ? "يمكن للمشتركين الجدد طلب استرداد كامل المبلغ في غضون 30 يوماً من تاريخ الشراء الأول إذا لم تكن الخدمة مرضية." : "New subscribers can request a full refund within 30 days of their initial purchase if they are not satisfied with the service."}</li>
              <li><strong>{isArabic ? "طريقة الطلب:" : "How to Request:"}</strong> {isArabic ? "لطلب الاسترجاع، يرجى مراسلتنا عبر البريد الإلكتروني takihichri76@gmail.com مع ذكر تفاصيل الحساب." : "To request a refund, please email us at takihichri76@gmail.com with your account details."}</li>
              <li><strong>{isArabic ? "الإلغاء:" : "Cancellation:"}</strong> {isArabic ? "يمكنك إلغاء اشتراكك في أي وقت من خلال إعدادات الحساب، وستظل ميزات الخطة فعالة حتى نهاية الفترة المدفوعة." : "You can cancel your subscription at any time via your account settings; plan features will remain active until the end of the current billing period."}</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: "#a855f7", borderBottom: "1px solid #1e293b", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              {isArabic ? "6. معلومات الاتصال" : "6. Contact Information"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8" }}>
              <Mail size={18} />
              <a href="mailto:takihichri76@gmail.com" style={{ color: "#a855f7", textDecoration: "none" }}>takihichri76@gmail.com</a>
            </div>
            <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#64748b" }}>
              {isArabic ? "المشغل القانوني: Taki Allah Hichri" : "Legal Operator: Taki Allah Hichri"}
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
