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

export default function Navbar({ theme = 'dark', onToggleTheme }) {
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

        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle dark and light mode"
            title="Toggle theme"
          >
            <span>{theme === 'dark' ? '☀' : '☾'}</span>
            <small>{theme === 'dark' ? 'Light' : 'Dark'}</small>
          </button>

          <button className="menu-btn" type="button" onClick={() => setOpen((value) => !value)}>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>

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
