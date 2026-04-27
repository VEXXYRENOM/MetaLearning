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
      await new Promise(r => setTimeout(r, 600));

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        navigate('/auth');
        return;
      }

      // ── STEP 1: Process pending org invite (from email confirmation flow) ──
      const pendingOrgToken = localStorage.getItem('pending_org_token');
      if (pendingOrgToken) {
        localStorage.removeItem('pending_org_token'); // Clear immediately to prevent reuse
        try {
          const { error: joinErr } = await supabase.rpc('join_organization', {
            p_token: pendingOrgToken,
          });
          if (joinErr) {
            console.warn('[AuthCallback] Org join failed:', joinErr.message);
            // Don't block login — just warn. User can retry joining later.
          } else {
            console.log('[AuthCallback] Successfully joined organization via invite token.');
          }
        } catch (e) {
          console.warn('[AuthCallback] Org join exception:', e);
        }
      }

      // ── STEP 2: Get/check profile role ────────────────────────────────────
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, org_id')
        .eq('id', session.user.id)
        .single();

      if (profile?.role && ROLE_HOME[profile.role]) {
        navigate(ROLE_HOME[profile.role]);
      } else {
        navigate('/auth/role-selection');
      }
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
      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>جاري تسجيل الدخول...</p>
    </div>
  );
}
