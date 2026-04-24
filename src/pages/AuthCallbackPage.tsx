import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const ROLE_HOME: Record<string, string> = {
  teacher: '/teacher/create',
  student: '/student/dashboard',
  creator: '/creator/lab',
  admin:   '/admin/dashboard',
};

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Give Supabase time to process the hash/session from the URL
      setTimeout(async () => {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          navigate('/auth');
          return;
        }

        // Check if user already has a profile with a role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role && ROLE_HOME[profile.role]) {
          // Existing user — go straight to their dashboard
          navigate(ROLE_HOME[profile.role]);
        } else {
          // New user — pick a role first
          navigate('/auth/role-selection');
        }
      }, 600);
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0f172a',
      color: 'white',
      gap: '1rem',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #a855f7',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p>جاري تسجيل الدخول...</p>
    </div>
  );
}
