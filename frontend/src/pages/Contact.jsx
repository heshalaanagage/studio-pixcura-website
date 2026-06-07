import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import { getSiteSettings } from '../lib/api';
import { whatsappLink } from '../lib/helpers';

export default function Contact() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  const email = settings?.email || import.meta.env.VITE_STUDIO_EMAIL || 'studiopixcura@gmail.com';
  const facebook = settings?.facebook_url || import.meta.env.VITE_FACEBOOK_URL || 'https://facebook.com/StudioPixcura';
  const instagram = settings?.instagram_url || import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/studiopixcura';
  const whatsapp = settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER || '94789391396';
  const phoneAlt = settings?.phone_alt || '94757567570';

  return (
    <section className="container section-pad page-top contact-grid">
      <div>
        <p className="eyebrow">Contact</p>
        <h1>Let’s create your next beautiful photoshoot.</h1>
        <p className="muted">{settings?.tagline || 'For bookings, details, and price packages, message us directly or send an email.'}</p>
        {settings?.address && <p className="muted">Area: {settings.address}</p>}
      </div>
      <GlassCard>
        <div className="contact-links">
          <a href={whatsappLink('Hello Studio Pixcura, I want to book a photoshoot.', whatsapp)} target="_blank" rel="noreferrer">WhatsApp: +{whatsapp}</a>
          <a href={`tel:+${phoneAlt}`}>Call: +{phoneAlt}</a>
          <a href={`mailto:${email}`}>Email: {email}</a>
          <a href={facebook} target="_blank" rel="noreferrer">Facebook: Studio Pixcura</a>
          <a href={instagram} target="_blank" rel="noreferrer">Instagram: @studiopixcura</a>
        </div>
      </GlassCard>
    </section>
  );
}
