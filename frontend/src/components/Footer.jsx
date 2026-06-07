import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSiteSettings } from '../lib/api';
import { whatsappLink } from '../lib/helpers';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  const email = settings?.email || import.meta.env.VITE_STUDIO_EMAIL || 'studiopixcura@gmail.com';
  const facebook = settings?.facebook_url || import.meta.env.VITE_FACEBOOK_URL || 'https://facebook.com/StudioPixcura';
  const instagram = settings?.instagram_url || import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/studiopixcura';
  const whatsapp = settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER || '94789391396';

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h2>{settings?.studio_name || 'Studio Pixcura'}</h2>
          <p>{settings?.tagline || 'Fresh. Elegant. Cinematic. Timeless. Every frame tells a story with passion and precision.'}</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link to="/albums">Albums</Link>
          <Link to="/booking">Booking</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <a href={whatsappLink('Hello Studio Pixcura, I want to book a photoshoot.', whatsapp)} target="_blank" rel="noreferrer">WhatsApp Message</a>
          <a href={`mailto:${email}`}>{email}</a>
          <a href={facebook} target="_blank" rel="noreferrer">Facebook</a>
          <a href={instagram} target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>
      <div className="footer-bottom">{settings?.copyright_text || `© ${new Date().getFullYear()} Studio Pixcura | All images are copyrighted.`}</div>
    </footer>
  );
}
