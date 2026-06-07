import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import AlbumCard from '../components/AlbumCard';
import GlassCard from '../components/GlassCard';
import { getAlbums, getCategories, getPackages } from '../lib/api';
import { currency, whatsappLink } from '../lib/helpers';
import { ErrorState, LoadingState } from '../components/Status';

const gradeOrder = ['Basic', 'Standard', 'Signature', 'Pro', 'Premium', 'Luxury'];

export default function Home() {
  const [data, setData] = useState({ categories: [], albums: [], packages: [] });
  const [selectedPackageCategory, setSelectedPackageCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [categories, albums, packagesList] = await Promise.all([
          getCategories(),
          getAlbums({ featuredOnly: true }),
          getPackages()
        ]);
        if (!ignore) {
          setData({ categories, albums, packages: packagesList });
          setSelectedPackageCategory(categories[0]?.id || '');
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const selectedCategory = useMemo(() => {
    return data.categories.find((category) => category.id === selectedPackageCategory) || data.categories[0] || null;
  }, [data.categories, selectedPackageCategory]);

  const visiblePackages = useMemo(() => {
    if (!selectedCategory) return data.packages;
    return data.packages
      .filter((pack) => pack.category_id === selectedCategory.id || pack.shoot_type === selectedCategory.name || pack.categories?.slug === selectedCategory.slug)
      .sort((a, b) => {
        const gradeDiff = gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
        if (gradeDiff !== 0) return gradeDiff;
        return Number(a.base_price || 0) - Number(b.base_price || 0);
      });
  }, [data.packages, selectedCategory]);

  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">Premium Photography • Sri Lanka</p>
          <h1>Every frame has a story — captured with elegance, emotion, and cinematic light.</h1>
          <p>
            Studio Pixcura creates timeless portraits, graduation stories, birthdays, weddings, events, engagements, and preshoots with a fresh luxury mood.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/booking">Book a Shoot</Link>
            <Link className="btn ghost" to="/albums">View Albums</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo main-photo" />
          <GlassCard className="floating-card">
            <span>Studio Pixcura</span>
            <strong>Fresh • Elegant • Timeless</strong>
          </GlassCard>
        </div>
      </section>

      <section className="container section-pad">
        <div className="section-head">
          <p className="eyebrow">Categories</p>
          <h2>Choose your photoshoot mood</h2>
        </div>
        {loading && <LoadingState />}
        <ErrorState message={error} />
        <div className="bento-grid">
          {data.categories.slice(0, 6).map((category, index) => (
            <Link className={`bento-item item-${index + 1}`} key={category.id} to={`/albums?category=${category.slug}`}>
              <img src={category.image_url} alt={category.name} loading="lazy" />
              <div>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section-pad">
        <div className="section-head row-between">
          <div>
            <p className="eyebrow">Featured Albums</p>
            <h2>Latest stories from the lens</h2>
          </div>
          <Link className="text-link" to="/albums">View all</Link>
        </div>
        <div className="album-grid">
          {data.albums.map((album) => <AlbumCard key={album.id} album={album} />)}
        </div>
      </section>

      <section className="container section-pad">
        <div className="section-head">
          <p className="eyebrow">Packages</p>
          <h2>Packages by photoshoot category</h2>
          <p className="muted">Select a category to view its Basic, Standard, Pro, Premium and Luxury package details separately.</p>
        </div>

        <div className="package-category-tabs">
          {data.categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={selectedCategory?.id === category.id ? 'active' : ''}
              onClick={() => setSelectedPackageCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="section-head compact-package-head">
          <p className="eyebrow">{selectedCategory?.name || 'All Packages'}</p>
          <h3>{selectedCategory?.name || 'Studio Pixcura'} package options</h3>
        </div>

        <div className="pricing-grid category-pricing-grid">
          {visiblePackages.map((pack) => (
            <GlassCard key={pack.id} className="price-card detailed-price-card">
              <span>{pack.grade || pack.shoot_type}</span>
              <h3>{pack.name}</h3>
              <p>{pack.description}</p>
              <strong>{currency(pack.base_price)}</strong>
              <small>{pack.duration || 'Duration can be customized'}</small>
              {pack.deliverables && <p className="package-deliverables">{pack.deliverables}</p>}
              <div className="addon-tags">
                {pack.print_photo_enabled && <span>Prints from {currency(pack.print_photo_price)}</span>}
                {pack.album_book_enabled && <span>Album book from {currency(pack.album_book_price)}</span>}
              </div>
            </GlassCard>
          ))}
          {visiblePackages.length === 0 && (
            <GlassCard className="price-card empty-package-card">
              <span>{selectedCategory?.name || 'Package'}</span>
              <h3>No packages added yet</h3>
              <p>Use Admin → Packages to add Basic, Standard, Pro and Premium packages for this category.</p>
            </GlassCard>
          )}
        </div>
      </section>

      <section className="container section-pad">
        <GlassCard className="cta-card">
          <div>
            <p className="eyebrow">Reserve Your Shoot</p>
            <h2>Ready to create your next timeless frame?</h2>
            <p>Send a booking request or message us directly on WhatsApp.</p>
          </div>
          <div className="hero-actions">
            <Link className="btn primary" to="/booking">Booking Form</Link>
            <a className="btn ghost" href={whatsappLink()} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </GlassCard>
      </section>
    </>
  );
}
