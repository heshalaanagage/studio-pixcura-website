import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { ErrorState, LoadingState } from '../../components/Status';
import { adminBookings, adminStats, getAlbums } from '../../lib/api';
import { currency, formatDate } from '../../lib/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [statData, bookingData, albumData] = await Promise.all([adminStats(), adminBookings(), getAlbums({ admin: true })]);
        setStats(statData);
        setBookings(bookingData);
        setAlbums(albumData);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  const overview = useMemo(() => {
    const upcoming = bookings
      .filter((booking) => ['pending', 'confirmed'].includes(booking.status))
      .sort((a, b) => new Date(a.preferred_date) - new Date(b.preferred_date))
      .slice(0, 5);
    const latest = bookings.slice(0, 5);
    const totalBookingValue = bookings.reduce((sum, booking) => sum + Number(booking.estimated_total || 0), 0);
    const publishedAlbums = albums.filter((album) => album.is_published).length;
    const draftAlbums = albums.length - publishedAlbums;
    return { upcoming, latest, totalBookingValue, publishedAlbums, draftAlbums };
  }, [bookings, albums]);

  if (!stats && !error) return <LoadingState label="Loading dashboard..." />;

  return (
    <div>
      <div className="section-head">
        <p className="eyebrow">Dashboard</p>
        <h1>Studio Pixcura Overview</h1>
        <p className="muted">Booking notifications, album summary, revenue overview, and latest customer requests.</p>
      </div>
      <ErrorState message={error} />

      <div className="stats-grid dashboard-stats">
        <GlassCard><span>Total Bookings</span><strong>{stats?.bookings || 0}</strong><small>{stats?.pendingBookings || 0} pending notification(s)</small></GlassCard>
        <GlassCard><span>Albums</span><strong>{stats?.albums || 0}</strong><small>{overview.publishedAlbums} published • {overview.draftAlbums} drafts</small></GlassCard>
        <GlassCard><span>Photos</span><strong>{stats?.photos || 0}</strong><small>Uploaded album frames</small></GlassCard>
        <GlassCard><span>Booking Value</span><strong>{currency(overview.totalBookingValue)}</strong><small>{currency(stats?.revenue || 0)} confirmed/completed</small></GlassCard>
      </div>

      {(stats?.pendingBookings || 0) > 0 && (
        <GlassCard className="admin-block notification-card">
          <h2>🔔 Booking Notifications</h2>
          <p>You have {stats.pendingBookings} pending booking request(s). Open the Bookings tab to confirm, complete, or cancel them.</p>
        </GlassCard>
      )}

      <div className="two-col-admin">
        <GlassCard className="admin-block">
          <h2>Upcoming / Pending Shoots</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {overview.upcoming.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.customer_name}</td>
                    <td>{booking.shoot_type}</td>
                    <td>{formatDate(booking.preferred_date)}</td>
                    <td>{currency(booking.estimated_total)}</td>
                    <td><span className="pill">{booking.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {overview.upcoming.length === 0 && <p className="muted">No pending or confirmed upcoming shoots.</p>}
        </GlassCard>

        <GlassCard className="admin-block">
          <h2>Latest Albums</h2>
          <div className="mini-list">
            {albums.slice(0, 6).map((album) => (
              <div key={album.id} className="mini-row simple-row">
                <span>{album.title}<small>{album.categories?.name} • {album.photo_count || 0} photos • {formatDate(album.shoot_date)}</small></span>
              </div>
            ))}
          </div>
          {albums.length === 0 && <p className="muted">No albums created yet.</p>}
        </GlassCard>
      </div>

      <GlassCard className="admin-block">
        <h2>Latest Booking Requests</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Shoot</th><th>Date</th><th>Total</th><th>Priority</th><th>Status</th></tr></thead>
            <tbody>
              {overview.latest.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.customer_name}</td>
                  <td>{booking.shoot_type}</td>
                  <td>{formatDate(booking.preferred_date)}</td>
                  <td>{currency(booking.estimated_total)}</td>
                  <td><span className="pill">{booking.priority || 'normal'}</span></td>
                  <td><span className="pill">{booking.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
