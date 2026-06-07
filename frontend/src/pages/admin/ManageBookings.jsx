import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { ErrorState, SuccessState } from '../../components/Status';
import { BOOKING_PRIORITIES, adminBookings, updateBookingStatus } from '../../lib/api';
import { currency, formatDate, whatsappLink, getMonth, getYear } from '../../lib/helpers';

const emptyFilters = {
  search: '',
  type: '',
  status: '',
  priority: '',
  minPrice: '',
  maxPrice: '',
  date: '',
  month: '',
  year: '',
  sort: 'newest'
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setBookings(await adminBookings());
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function changeStatus(id, status, priority) {
    try {
      setError('');
      setSuccess('');
      await updateBookingStatus(id, status, priority);
      setSuccess('Booking updated.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const shootTypes = useMemo(() => [...new Set(bookings.map((booking) => booking.shoot_type).filter(Boolean))], [bookings]);

  const filteredBookings = useMemo(() => {
    const text = filters.search.toLowerCase().trim();
    const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice);

    return [...bookings]
      .filter((booking) => {
        const textMatch = !text || `${booking.customer_name} ${booking.phone} ${booking.email || ''} ${booking.location || ''} ${booking.message || ''}`.toLowerCase().includes(text);
        const typeMatch = !filters.type || booking.shoot_type === filters.type;
        const statusMatch = !filters.status || booking.status === filters.status;
        const priorityMatch = !filters.priority || (booking.priority || 'normal') === filters.priority;
        const price = Number(booking.estimated_total || 0);
        const minMatch = minPrice === null || price >= minPrice;
        const maxMatch = maxPrice === null || price <= maxPrice;
        const dateMatch = !filters.date || booking.preferred_date === filters.date;
        const monthMatch = !filters.month || getMonth(booking.preferred_date) === filters.month;
        const yearMatch = !filters.year || getYear(booking.preferred_date) === filters.year;
        return textMatch && typeMatch && statusMatch && priorityMatch && minMatch && maxMatch && dateMatch && monthMatch && yearMatch;
      })
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        if (filters.sort === 'date-old') return new Date(a.preferred_date || a.created_at) - new Date(b.preferred_date || b.created_at);
        if (filters.sort === 'price-low') return Number(a.estimated_total || 0) - Number(b.estimated_total || 0);
        if (filters.sort === 'price-high') return Number(b.estimated_total || 0) - Number(a.estimated_total || 0);
        if (filters.sort === 'type') return (a.shoot_type || '').localeCompare(b.shoot_type || '');
        if (filters.sort === 'priority') return (priorityOrder[a.priority || 'normal'] ?? 9) - (priorityOrder[b.priority || 'normal'] ?? 9);
        return new Date(b.preferred_date || b.created_at) - new Date(a.preferred_date || a.created_at);
      });
  }, [bookings, filters]);

  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;
  const urgentCount = bookings.filter((booking) => ['urgent', 'high'].includes(booking.priority)).length;

  return (
    <div>
      <div className="section-head">
        <p className="eyebrow">Admin</p>
        <h1>Bookings</h1>
        <p className="muted">All photoshoots booked through the website appear here. Sort by date, type, price, status, and priority.</p>
      </div>
      <ErrorState message={error} />
      <SuccessState message={success} />

      <div className="stats-grid two-stats">
        <GlassCard><span>Pending requests</span><strong>{pendingCount}</strong></GlassCard>
        <GlassCard><span>High priority</span><strong>{urgentCount}</strong></GlassCard>
      </div>

      <GlassCard className="admin-block">
        <h2>Search & Sort Bookings</h2>
        <div className="advanced-filters">
          <input name="search" value={filters.search} onChange={updateFilter} placeholder="Search name, phone, location..." />
          <select name="type" value={filters.type} onChange={updateFilter}>
            <option value="">All types</option>
            {shootTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select name="status" value={filters.status} onChange={updateFilter}>
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select name="priority" value={filters.priority} onChange={updateFilter}>
            <option value="">All priority</option>
            {BOOKING_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <input type="number" name="minPrice" value={filters.minPrice} onChange={updateFilter} placeholder="Min price" />
          <input type="number" name="maxPrice" value={filters.maxPrice} onChange={updateFilter} placeholder="Max price" />
          <input type="date" name="date" value={filters.date} onChange={updateFilter} />
          <select name="month" value={filters.month} onChange={updateFilter}>
            <option value="">Any month</option>
            {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).map((month) => <option key={month} value={month}>{month}</option>)}
          </select>
          <input name="year" value={filters.year} onChange={updateFilter} placeholder="Year" />
          <select name="sort" value={filters.sort} onChange={updateFilter}>
            <option value="newest">Newest date</option>
            <option value="date-old">Oldest date</option>
            <option value="type">Type A-Z</option>
            <option value="price-low">Price low-high</option>
            <option value="price-high">Price high-low</option>
            <option value="priority">Priority first</option>
          </select>
          <button className="btn ghost" type="button" onClick={() => setFilters(emptyFilters)}>Reset</button>
        </div>
      </GlassCard>

      <div className="booking-admin-list">
        {filteredBookings.map((booking) => (
          <GlassCard key={booking.id} className="booking-admin-card">
            <div>
              <div className="booking-title-line">
                <h3>{booking.customer_name}</h3>
                <span className={`pill priority-${booking.priority || 'normal'}`}>{booking.priority || 'normal'}</span>
              </div>
              <p>{booking.shoot_type} • {formatDate(booking.preferred_date)} • {booking.location || 'No location'}</p>
              <p>{booking.packages?.grade ? `${booking.packages.grade} — ` : ''}{booking.packages?.name || 'No package'} — {currency(booking.estimated_total)}</p>
              <p>Phone: {booking.phone}{booking.email ? ` • Email: ${booking.email}` : ''}</p>
              <p className="muted">{booking.message || 'No message'}</p>
              <div className="addon-tags">
                {booking.booking_addons?.map((row) => <span key={row.addon_id}>{row.addons?.name} × {row.quantity}</span>)}
              </div>
            </div>
            <div className="booking-actions">
              <span className="pill">{booking.status}</span>
              <select value={booking.status} onChange={(event) => changeStatus(booking.id, event.target.value, booking.priority || 'normal')}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select value={booking.priority || 'normal'} onChange={(event) => changeStatus(booking.id, booking.status, event.target.value)}>
                {BOOKING_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
              <a className="btn ghost" href={whatsappLink(`Hello ${booking.customer_name}, this is Studio Pixcura about your ${booking.shoot_type} booking.`, '')} target="_blank" rel="noreferrer">WhatsApp Reply</a>
              {booking.email && <a className="btn ghost" href={`mailto:${booking.email}`}>Email</a>}
            </div>
          </GlassCard>
        ))}
        {filteredBookings.length === 0 && <div className="state-card">No bookings found for selected filters.</div>}
      </div>
    </div>
  );
}
