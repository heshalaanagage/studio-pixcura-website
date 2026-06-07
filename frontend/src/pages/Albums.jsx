import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AlbumCard from '../components/AlbumCard';
import { getAlbums, getCategories } from '../lib/api';
import { ErrorState, LoadingState } from '../components/Status';

export default function Albums() {
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get('category') || '';
  const [categories, setCategories] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const [cats, albs] = await Promise.all([getCategories(), getAlbums()]);
        if (!ignore) {
          setCategories(cats);
          setAlbums(albs);
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

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const categoryMatch = !activeCategory || album.categories?.slug === activeCategory;
      const textMatch = !query || album.title.toLowerCase().includes(query.toLowerCase());
      return categoryMatch && textMatch;
    });
  }, [albums, activeCategory, query]);

  return (
    <section className="container section-pad page-top">
      <div className="section-head">
        <p className="eyebrow">Albums</p>
        <h1>Browse photoshoots by category and customer album</h1>
        <p className="muted">Example: Category = Birthday Shoot, Album = Nishadi.</p>
      </div>

      <div className="filter-bar glass-card">
        <button className={!activeCategory ? 'active' : ''} onClick={() => setParams({})}>All</button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={activeCategory === category.slug ? 'active' : ''}
            onClick={() => setParams({ category: category.slug })}
          >
            {category.name}
          </button>
        ))}
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search album name..." />
      </div>

      {loading && <LoadingState />}
      <ErrorState message={error} />
      <div className="album-grid">
        {filteredAlbums.map((album) => <AlbumCard key={album.id} album={album} />)}
      </div>
      {!loading && filteredAlbums.length === 0 && <div className="state-card">No albums found.</div>}
    </section>
  );
}
