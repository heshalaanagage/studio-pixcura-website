import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import AlbumCard from '../components/AlbumCard';
import GlassCard from '../components/GlassCard';
import { getAlbums, getCategories, getHomeContent, getPackages } from '../lib/api';
import { currency, whatsappLink } from '../lib/helpers';
import { ErrorState, LoadingState } from '../components/Status';

const gradeOrder = ['Basic', 'Standard', 'Signature', 'Pro', 'Premium', 'Luxury'];

export default function Home() {
  const [data, setData] = useState({ categories: [], albums: [], packages: [], settings: {}, galleryPhotos: [] });
  const [selectedPackageCategory, setSelectedPackageCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [categories, albums, packagesList, homeContent] = await Promise.all([
          getCategories(),
          getAlbums({ featuredOnly: true }),
          getPackages(),
          getHomeContent()
        ]);
        if (!ignore) {
          setData({
            categories,
            albums,
            packages: packagesList,
            settings: homeContent.settings || {},
            galleryPhotos: homeContent.galleryPhotos || []
          });
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

  const settings = data.settings || {};
  const heroStyle = settings.home_hero_image_url
    ? { backgroundImage: `linear-gradient(180deg, rgba(6,10,14,.18), rgba(4,7,10,.78) 68%, rgba(4,7,10,.96)), url('${settings.home_hero_image_url}')` }
    : undefined;

  const galleryLead = data.galleryPhotos[0] || null;
  const galleryStack = data.galleryPhotos.slice(1, 5);

  return (
    <>
      <section className="hero hero-editorial container">
        <div className="hero-copy">
          <p className="eyebrow">{settings.home_hero_eyebrow || 'Studio Pixcura • Cinematic Photography'}</p>
          <h1>{settings.home_hero_title || 'Minimal frames. Cinematic mood. Timeless photography.'}</h1>
          <p>
            {settings.home_hero_text || 'A refined photography experience with a dark editorial aesthetic, modern layouts, and elegant storytelling for portraits, graduations, birthdays, weddings, and events.'}
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/booking">Book a Shoot</Link>
            <Link className="btn ghost" to="/albums">Explore Albums</Link>
          </div>

          <div className="hero-info-strip">
            <div className="hero-info-item">
              <span>01</span>
              <strong>Cinematic Mood</strong>
              <small>Modern, aesthetic, clean visual storytelling.</small>
            </div>
            <div className="hero-info-item">
              <span>02</span>
              <strong>Curated Albums</strong>
              <small>Featured work managed directly from admin.</small>
            </div>
            <div className="hero-info-item">
              <span>03</span>
              <strong>Flexible Packages</strong>
              <small>Category-wise packages with optional add-ons.</small>
            </div>
          </div>
        </div>

        <div className="hero-visual editorial-panel">
          <div className="hero-photo main-photo" style={heroStyle} />
          <div className="hero-slide-index">
            <span>01</span>
            <span>02</span>
            <span className="active">03</span>
            <span>04</span>
          </div>
          <GlassCard className="floating-card minimal-card">
            <span>{settings.studio_name || 'Studio Pixcura'}</span>
            <strong>{settings.tagline || 'Fresh • Elegant • Timeless'}</strong>
          </GlassCard>
        </div>
      </section>

      <section className="container section-pad">
        <div className="section-head row-between">
          <div>
            <p className="eyebrow">Featured Categories</p>
            <h2>Choose your photography style</h2>
          </div>
          <p className="muted compact-max">Every category card uses the same 2:3 portrait ratio for a more premium and consistent layout.</p>
        </div>
        {loading && <LoadingState />}
        <ErrorState message={error} />
        <div className="category-feature-grid">
          {data.categories.slice(0, 6).map((category, index) => (
            <Link className="category-feature-card" key={category.id} to={`/albums?category=${category.slug}`}>
              {category.image_url ? <img src={category.image_url} alt={category.name} loading="lazy" /> : <div className="empty-image-fill" />}
              <div className="category-feature-overlay">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{category.name}</h3>
                <p>{category.description || 'Customizable featured category image from admin.'}</p>
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
        {data.albums.length > 0 ? (
          <div className="album-grid featured-album-grid">
            {data.albums.map((album) => <AlbumCard key={album.id} album={album} />)}
          </div>
        ) : (
          <GlassCard className="empty-home-state">
            <h3>No featured albums selected yet</h3>
            <p>Use Admin → Albums and mark an album as featured to show it here.</p>
          </GlassCard>
        )}
      </section>

      <section className="container section-pad cinematic-gallery-section">
        <div className="section-head row-between">
          <div>
            <p className="eyebrow">Visual Mood</p>
            <h2>Modern cinematic presentation</h2>
          </div>
          <p className="muted compact-max">This section uses home gallery photos uploaded from Admin → Home Content, so you can change the home visuals whenever you want.</p>
        </div>

        <div className="cinematic-gallery-layout">
          <div className="gallery-copy-block">
            <h2>Discover your story in a new way</h2>
            <p>
              Clean typography, minimal UI, and editorial spacing inspired by modern premium interfaces — without heavy liquid crystal effects.
            </p>
            <a className="btn ghost" href={whatsappLink()} target="_blank" rel="noreferrer">Watch the vibe on WhatsApp</a>
          </div>

          <div className="gallery-lead-frame">
            {galleryLead ? (
              <img src={galleryLead.image_url} alt={galleryLead.title || 'Studio Pixcura visual'} loading="lazy" />
            ) : (
              <div className="empty-image-fill" />
            )}
          </div>

          <div className="gallery-stack-grid">
            {galleryStack.length > 0 ? galleryStack.map((photo) => (
              <div key={photo.id} className="gallery-stack-card">
                <img src={photo.image_url} alt={photo.title || 'Studio Pixcura frame'} loading="lazy" />
              </div>
            )) : [1, 2, 3, 4].map((item) => <div key={item} className="gallery-stack-card empty-image-fill" />)}
          </div>
        </div>
      </section>

      <section className="container section-pad photographer-section">
        <div className="photographer-grid minimal-split-grid">
          <div className="photographer-photo-wrap">
            {settings.home_photographer_image_url ? (
              <img src={settings.home_photographer_image_url} alt="Studio Pixcura photographer" loading="lazy" />
            ) : (
              <div className="empty-image-fill photographer-placeholder" />
            )}
          </div>
          <GlassCard className="photographer-copy">
            <p className="eyebrow">About Photographer</p>
            <h2>{settings.home_photographer_title || 'Meet the photographer behind Studio Pixcura'}</h2>
            <p>{settings.home_photographer_text || settings.about_text || 'Add your photographer introduction from Admin → Home Content.'}</p>
            <Link className="btn ghost" to="/about">More About Us</Link>
          </GlassCard>
        </div>
      </section>

      <section className="container section-pad">
        <div className="section-head">
          <p className="eyebrow">Packages</p>
          <h2>Packages by photoshoot category</h2>
          <p className="muted">Select a category to view its package details separately.</p>
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
            <GlassCard key={pack.id} className="price-card detailed-price-card minimal-panel">
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
            <GlassCard className="price-card empty-package-card minimal-panel">
              <span>{selectedCategory?.name || 'Package'}</span>
              <h3>No packages added yet</h3>
              <p>Use Admin → Packages to add packages for this category.</p>
            </GlassCard>
          )}
        </div>
      </section>

      <section className="container section-pad">
        <GlassCard className="cta-card minimal-panel">
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
