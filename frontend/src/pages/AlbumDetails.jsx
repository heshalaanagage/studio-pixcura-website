import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAlbumBySlug, getPhotosByAlbumId, getSiteSettings } from '../lib/api';
import { ErrorState, LoadingState } from '../components/Status';
import { currency, formatDate, whatsappLink } from '../lib/helpers';

export default function AlbumDetails() {
  const { slug } = useParams();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const albumData = await getAlbumBySlug(slug);
        if (!albumData) throw new Error('Album not found');
        const [photoData, site] = await Promise.all([getPhotosByAlbumId(albumData.id), getSiteSettings()]);
        if (!ignore) {
          setAlbum(albumData);
          setPhotos(photoData);
          setSettings(site);
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [slug]);

  if (loading) return <LoadingState />;
  if (error) return <section className="container section-pad page-top"><ErrorState message={error} /></section>;
  if (!album) return null;

  return (
    <section className="container section-pad page-top">
      <Link className="text-link" to="/albums">← Back to albums</Link>
      <div className="album-hero glass-card">
        <img src={album.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'} alt={album.title} />
        <div>
          <p className="eyebrow">{album.categories?.name}</p>
          <h1>{album.title}</h1>
          <p>{album.description}</p>
          <div className="addon-tags detail-tags">
            <span>{formatDate(album.shoot_date)}</span>
            <span>{album.location || 'Studio Pixcura'}</span>
            <span>{photos.length} photos</span>
            {album.album_price > 0 && <span>{currency(album.album_price)}</span>}
          </div>
          <div className="hero-actions">
            <a className="btn primary" href={whatsappLink(`Hello Studio Pixcura, I saw the ${album.title} album and I want to book a similar shoot.`, settings?.whatsapp_number)} target="_blank" rel="noreferrer">Book Similar Shoot</a>
          </div>
        </div>
      </div>

      <div className="masonry-grid">
        {photos.map((photo) => (
          <button key={photo.id} className="photo-tile" type="button" onClick={() => setSelected(photo)}>
            <img src={photo.image_url} alt={photo.caption || album.title} loading="lazy" />
          </button>
        ))}
      </div>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)} role="button" tabIndex="0">
          <button type="button" className="lightbox-close" onClick={() => setSelected(null)}>×</button>
          <img src={selected.image_url} alt={selected.caption || album.title} />
          {selected.caption && <p>{selected.caption}</p>}
        </div>
      )}
    </section>
  );
}
