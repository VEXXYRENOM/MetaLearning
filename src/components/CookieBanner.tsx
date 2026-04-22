import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Cookie } from "lucide-react";

export function CookieBanner() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('ml_cookie_consent');
    if (consent) {
      setAccepted(true);
    } else {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ml_cookie_consent', 'accepted');
    setAccepted(true);
  };

  if (accepted !== false) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideUpBanner {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .glass-cookie {
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(56, 189, 248, 0.3);
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
            animation: slideUpBanner 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>
      <div 
        className="glass-cookie"
        style={{
          position: 'fixed', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '1.25rem 2rem', borderRadius: '16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap',
          fontFamily: "'Inter', system-ui, sans-serif",  direction: isArabic ? "rtl" : "ltr"
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '10px', borderRadius: '50%', display: 'flex' }}>
            <Cookie size={24} color="#38bdf8" />
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.25rem', color: '#fff', fontSize: '1rem' }}>
              {isArabic ? "ملفات تعريف الارتباط 🍪" : "Cookie Consent 🍪"}
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              {isArabic 
                ? "نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك التعليمية ثلاثية الأبعاد. باستمرارك، أنت توافق على سياساتنا."
                : "We use cookies to enhance your 3D learning experience. By continuing, you agree to our policies."}
              {' '}
              <Link to="/privacy" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>
                {isArabic ? "اقرأ المزيد" : "Learn more"}
              </Link>
            </p>
          </div>
        </div>

        <button 
          onClick={handleAccept} 
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
            border: 'none', color: '#fff', padding: '10px 24px',
            borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
            fontSize: '0.9rem', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            transition: 'transform 0.2s', flexShrink: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isArabic ? "تأكيد ومتابعة" : "Got it!"}
        </button>
      </div>
    </>
  );
}
