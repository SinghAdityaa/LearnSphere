import { LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, googleLogin, devLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const enableDemo = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!clientId) return;
    const existing = document.querySelector('script[data-google-identity]');
    const renderButton = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            setError('');
            await googleLogin(credential);
          } catch (err) {
            setError(err.response?.data?.message || 'Google sign-in failed');
          }
        }
      });
      const container = document.getElementById('google-signin');
      if (container) window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 320 });
    };
    if (existing) renderButton();
    else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
      script.onload = renderButton;
      document.head.appendChild(script);
    }
  }, [clientId, googleLogin]);

  const useDemo = async (role) => {
    try {
      setError('');
      await devLogin(role);
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    }
  };

  return (
    <section className="auth-page section-shell">
      <div className="auth-card">
        <div className="auth-icon"><LogIn /></div>
        <span className="eyebrow">Welcome back</span>
        <h1>Sign in to LearnSphere</h1>
        <p>Your courses, progress and certificates stay connected to your account.</p>
        {error && <div className="alert error">{error}</div>}
        {clientId ? <div id="google-signin" className="google-button-slot" /> : (
          <div className="setup-note">Google sign-in appears here after you add <code>VITE_GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_ID</code>.</div>
        )}
        {enableDemo && <>
          <div className="divider"><span>local development</span></div>
          <button className="button secondary full" onClick={() => useDemo('student')}><UserRound size={18} /> Continue as demo student</button>
          <button className="button secondary full" onClick={() => useDemo('admin')}><ShieldCheck size={18} /> Continue as demo admin</button>
        </>}
      </div>
    </section>
  );
}
