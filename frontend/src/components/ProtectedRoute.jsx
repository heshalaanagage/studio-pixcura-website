import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkIsAdmin, getCurrentSession } from '../lib/api';
import { isSupabaseReady } from '../lib/supabaseClient';
import { LoadingState } from './Status';

export default function ProtectedRoute() {
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    let ignore = false;
    async function verify() {
      if (!isSupabaseReady) {
        if (!ignore) setState({ loading: false, allowed: false });
        return;
      }
      const session = await getCurrentSession();
      const allowed = Boolean(session) && await checkIsAdmin();
      if (!ignore) setState({ loading: false, allowed });
    }
    verify();
    return () => { ignore = true; };
  }, []);

  if (state.loading) return <LoadingState label="Checking admin access..." />;
  if (!state.allowed) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
