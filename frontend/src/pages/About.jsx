import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import { getSiteSettings } from '../lib/api';

export default function About() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  return (
    <section className="container section-pad page-top about-grid">
      <div>
        <p className="eyebrow">About</p>
        <h1>{settings?.about_title || 'Studio Pixcura is built for memories that deserve to stay timeless.'}</h1>
        <p className="lead">
          {settings?.about_text || 'Studio Pixcura is a creative photography brand focused on cinematic, elegant, and emotionally rich photoshoots. We capture portraits, graduation stories, birthdays, weddings, events, engagements, and preshoots with careful attention to light, composition, and storytelling.'}
        </p>
        <p className="muted">
          {settings?.copyright_text || 'Founded by Heshala Angage and Gayashan Perera, Studio Pixcura turns simple moments into beautiful visual memories with a premium modern style.'}
        </p>
      </div>
      <div className="about-stack">
        <GlassCard>
          <h3>Our Style</h3>
          <p>Fresh, elegant, cinematic, minimal, and timeless.</p>
        </GlassCard>
        <GlassCard>
          <h3>Our Shoots</h3>
          <p>Graduation, portrait, birthday, wedding, event, engagement, preshoot, couple, and family photography.</p>
        </GlassCard>
        <GlassCard>
          <h3>Our Promise</h3>
          <p>Every frame tells a story with passion and precision.</p>
        </GlassCard>
      </div>
    </section>
  );
}
