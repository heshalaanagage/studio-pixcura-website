import { Link } from 'react-router-dom';
import { currency, formatDate } from '../lib/helpers';

export default function AlbumCard({ album }) {
  return (
    <Link className="album-card" to={`/albums/${album.slug}`}>
      <img src={album.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'} alt={album.title} />
      <div className="album-overlay">
        <span>{album.categories?.name || 'Photoshoot'}</span>
        <h3>{album.title}</h3>
        <small>{album.location || 'Studio Pixcura'} • {formatDate(album.shoot_date)} • {album.photo_count || 0} photos</small>
        {album.album_price > 0 && <small>{currency(album.album_price)}</small>}
      </div>
    </Link>
  );
}
