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
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(37, 99, 235, 0.25);
            box-shadow: 0 -10px 40px rgba(37, 99, 235, 0.1);
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
          fontFamily: "'Host Grotesk', system-ui, sans-serif",  direction: isArabic ? "rtl" : "ltr"
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '50%', display: 'flex' }}>
            <Cookie size={24} color="#2563EB" />
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.25rem', color: '#0f1f3d', fontSize: '1.05rem', fontWeight: 800 }}>
              {isArabic ? "ملفات تعريف الارتباط 🍪" : "Cookie Consent 🍪"}
            </h4>
            <p style={{ color: '#4b5563', fontSize: '0.88rem', margin: 0 }}>
              {isArabic 
                ? "نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك التعليمية ثلاثية الأبعاد. باستمرارك، أنت توافق على سياساتنا."
                : "We use cookies to enhance your 3D learning experience. By continuing, you agree to our policies."}
              {' '}
              <Link to="/privacy" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 'bold' }}>
                {isArabic ? "اقرأ المزيد" : "Learn more"}
              </Link>
            </p>
          </div>
        </div>

        <button 
          onClick={handleAccept} 
          style={{
            background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
            border: 'none', color: '#fff', padding: '10px 24px',
            borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold',
            fontSize: '0.9rem', whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
            transition: 'transform 0.2s', flexShrink: 0, fontFamily: 'inherit'
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
