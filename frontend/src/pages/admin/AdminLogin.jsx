import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/GlassCard';
import { ErrorState } from '../../components/Status';
import { signInAdmin } from '../../lib/api';
import { isSupabaseReady } from '../../lib/supabaseClient';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      setLoading(true);
      await signInAdmin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container section-pad page-top login-page">
      <GlassCard className="login-card">
        <p className="eyebrow">Admin Login</p>
        <h1>Studio Pixcura Control Panel</h1>
        {!isSupabaseReady && (
          <div className="alert error">
            Supabase is not configured yet. Copy .env.example to .env.local and add your Supabase URL + anon key.
          </div>
        )}
        <form className="form-grid single" onSubmit={submit}>
          <ErrorState message={error} />
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="btn primary" type="submit" disabled={loading || !isSupabaseReady}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
      </GlassCard>
    </section>
  );
}
