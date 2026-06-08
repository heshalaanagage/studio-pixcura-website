import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOutAdmin } from '../lib/api';

export default function AdminLayout() {
  const navigate = useNavigate();

  async function logout() {
    await signOutAdmin();
    navigate('/admin/login');
  }

  return (
    <section className="admin-shell container section-pad">
      <aside className="admin-sidebar glass-card">
        <h2>Pixcura Admin</h2>
        <NavLink to="/admin">Dashboard</NavLink>
        <NavLink to="/admin/albums">Albums</NavLink>
        <NavLink to="/admin/packages">Packages</NavLink>
        <NavLink to="/admin/home-content">Home Content</NavLink>
        <NavLink to="/admin/bookings">Bookings</NavLink>
        <NavLink to="/admin/settings">Contact / Site</NavLink>
        <button type="button" onClick={logout}>Logout</button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </section>
  );
}
