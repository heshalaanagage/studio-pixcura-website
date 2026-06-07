import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { whatsappLink } from '../lib/helpers';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/albums', label: 'Albums' },
  { to: '/booking', label: 'Booking' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav-shell">
      <nav className="navbar container">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark">PX</span>
          <span>
            <strong>Studio Pixcura</strong>
            <small>Photography</small>
          </span>
        </Link>

        <button className="menu-btn" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? 'Close' : 'Menu'}
        </button>

        <div className={`nav-links ${open ? 'show' : ''}`}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink>
          <a className="nav-cta" href={whatsappLink()} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      </nav>
    </header>
  );
}
