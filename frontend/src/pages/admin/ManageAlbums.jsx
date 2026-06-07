import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { ErrorState, SuccessState } from '../../components/Status';
import {
  adminDeleteAlbum,
  adminUpdateAlbumCover,
  adminUploadAlbumPhotos,
  adminUpsertAlbum,
  adminUpsertCategory,
  getAlbums,
  getCategories,
  adminAllPackages
} from '../../lib/api';
import { currency, formatDate, getMonth, getYear, slugify } from '../../lib/helpers';

const emptyForm = {
  id: '',
  category_id: '',
  package_id: '',
  title: '',
  slug: '',
  description: '',
  location: '',
  album_price: '',
  cover_image_url: '',
  shoot_date: '',
  is_featured: false,
  is_published: true
};

const emptyFilters = {
  search: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  date: '',
  month: '',
  year: '',
  sort: 'newest'
};

export default function ManageAlbums() {
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryBox, setShowCategoryBox] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const [cats, albs, packageList] = await Promise.all([
      getCategories(),
      getAlbums({ admin: true }),
      adminAllPackages()
    ]);
    setCategories(cats);
    setAlbums(albs);
    setPackages(packageList);
    setForm((current) => ({
      ...current,
      category_id: current.category_id || cats[0]?.id || '',
      package_id: current.package_id || ''
    }));
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && !current.id ? { slug: slugify(value) } : {})
    }));
  }

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    try {
      setError('');
      const category = await adminUpsertCategory({ name: newCategory.trim(), slug: slugify(newCategory.trim()) });
      setNewCategory('');
      setShowCategoryBox(false);
      await load();
      setForm((current) => ({ ...current, category_id: category.id }));
      setSuccess('New category added.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function submit(event) {
    event.preventDefault();
    try {
      setError('');
      setSuccess('');
      setSaving(true);
      const savedAlbum = await adminUpsertAlbum(form, coverFile);
      const uploadedPhotos = await adminUploadAlbumPhotos(savedAlbum.id, photoFiles);
      if (!savedAlbum.cover_image_url && uploadedPhotos[0]?.image_url) {
        await adminUpdateAlbumCover(savedAlbum.id, uploadedPhotos[0].image_url);
      }
      setForm({ ...emptyForm, category_id: categories[0]?.id || '' });
      setCoverFile(null);
      setPhotoFiles([]);
      setSuccess(`Album saved${uploadedPhotos.length ? ` with ${uploadedPhotos.length} photo(s).` : '.'}`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this album? Database photos linked to this album will also be deleted.')) return;
    try {
      setError('');
      await adminDeleteAlbum(id);
      setSuccess('Album deleted.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function editAlbum(album) {
    setForm({
      ...emptyForm,
      ...album,
      category_id: album.category_id || '',
      package_id: album.package_id || '',
      album_price: album.album_price || '',
      shoot_date: album.shoot_date || ''
    });
    setCoverFile(null);
    setPhotoFiles([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filteredAlbums = useMemo(() => {
    const text = filters.search.toLowerCase().trim();
    const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice);

    return [...albums]
      .filter((album) => {
        const nameMatch = !text || `${album.title} ${album.location || ''} ${album.description || ''}`.toLowerCase().includes(text);
        const categoryMatch = !filters.category || album.category_id === filters.category;
        const price = Number(album.album_price || album.packages?.base_price || 0);
        const minMatch = minPrice === null || price >= minPrice;
        const maxMatch = maxPrice === null || price <= maxPrice;
        const dateMatch = !filters.date || album.shoot_date === filters.date;
        const monthMatch = !filters.month || getMonth(album.shoot_date) === filters.month;
        const yearMatch = !filters.year || getYear(album.shoot_date) === filters.year;
        return nameMatch && categoryMatch && minMatch && maxMatch && dateMatch && monthMatch && yearMatch;
      })
      .sort((a, b) => {
        if (filters.sort === 'name') return a.title.localeCompare(b.title);
        if (filters.sort === 'category') return (a.categories?.name || '').localeCompare(b.categories?.name || '');
        if (filters.sort === 'price-low') return Number(a.album_price || 0) - Number(b.album_price || 0);
        if (filters.sort === 'price-high') return Number(b.album_price || 0) - Number(a.album_price || 0);
        if (filters.sort === 'photos-high') return Number(b.photo_count || 0) - Number(a.photo_count || 0);
        if (filters.sort === 'oldest') return new Date(a.shoot_date || a.created_at) - new Date(b.shoot_date || b.created_at);
        return new Date(b.shoot_date || b.created_at) - new Date(a.shoot_date || a.created_at);
      });
  }, [albums, filters]);

  const selectedCategory = categories.find((cat) => cat.id === form.category_id);
  const suggestedPackages = packages.filter((pack) => !form.category_id || pack.category_id === form.category_id || pack.shoot_type === selectedCategory?.name);

  return (
    <div>
      <div className="section-head">
        <p className="eyebrow">Admin</p>
        <h1>Albums</h1>
        <p className="muted">Album = customer shoot name, Category = photoshoot type. Example: Album “Nimesh”, Category “Graduation”.</p>
      </div>

      <GlassCard className="admin-block">
        <form className="form-grid" onSubmit={submit}>
          <ErrorState message={error} />
          <SuccessState message={success} />

          <label>Album Name / Customer Name
            <input name="title" value={form.title} onChange={update} placeholder="Ex: Nimesh" required />
          </label>
          <label>Category
            <div className="input-with-button">
              <select name="category_id" value={form.category_id} onChange={update} required>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <button className="square-btn" type="button" title="Add category" onClick={() => setShowCategoryBox((value) => !value)}>+</button>
            </div>
          </label>

          {showCategoryBox && (
            <div className="full inline-create">
              <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="New category name, ex: Couple Shoot" />
              <button className="btn ghost" type="button" onClick={addCategory}>Add Category</button>
            </div>
          )}

          <label>Package
            <select name="package_id" value={form.package_id || ''} onChange={update}>
              <option value="">No package selected</option>
              {suggestedPackages.map((pack) => <option key={pack.id} value={pack.id}>{pack.grade} — {pack.name} ({currency(pack.base_price)})</option>)}
              {suggestedPackages.length === 0 && packages.map((pack) => <option key={pack.id} value={pack.id}>{pack.grade} — {pack.name} ({currency(pack.base_price)})</option>)}
            </select>
          </label>
          <label>Album Price
            <input type="number" name="album_price" value={form.album_price || ''} onChange={update} placeholder="Ex: 22000" />
          </label>

          <label>Location
            <input name="location" value={form.location || ''} onChange={update} placeholder="Ex: BMICH / Colombo" />
          </label>
          <label>Shoot Date
            <input type="date" name="shoot_date" value={form.shoot_date || ''} onChange={update} />
          </label>

          <label>Slug
            <input name="slug" value={form.slug} onChange={update} required />
          </label>
          <label>Cover Image URL
            <input name="cover_image_url" value={form.cover_image_url || ''} onChange={update} placeholder="Optional; first uploaded photo can become cover" />
          </label>

          <label className="full">Description
            <textarea name="description" value={form.description || ''} onChange={update} rows="4" placeholder="Short story/details about this shoot" />
          </label>

          <label>Upload Cover Photo
            <input type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} />
          </label>
          <label>Select Album Photos from PC
            <input type="file" accept="image/*" multiple onChange={(event) => setPhotoFiles(Array.from(event.target.files || []))} />
            <small className="muted">Selected photo count: {photoFiles.length}</small>
          </label>

          <label className="checkbox-row"><input type="checkbox" name="is_featured" checked={form.is_featured} onChange={update} /> Featured album</label>
          <label className="checkbox-row"><input type="checkbox" name="is_published" checked={form.is_published} onChange={update} /> Published on website</label>

          <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Saving...' : form.id ? 'Update Album' : 'Create Album'}</button>
          {form.id && <button className="btn ghost" type="button" onClick={() => { setForm({ ...emptyForm, category_id: categories[0]?.id || '' }); setPhotoFiles([]); setCoverFile(null); }}>Cancel Edit</button>}
        </form>
      </GlassCard>

      <GlassCard className="admin-block">
        <h2>Search & Sort Albums</h2>
        <div className="advanced-filters">
          <input name="search" value={filters.search} onChange={updateFilter} placeholder="Search by name, location, description..." />
          <select name="category" value={filters.category} onChange={updateFilter}>
            <option value="">All categories</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <input type="number" name="minPrice" value={filters.minPrice} onChange={updateFilter} placeholder="Min price" />
          <input type="number" name="maxPrice" value={filters.maxPrice} onChange={updateFilter} placeholder="Max price" />
          <input type="date" name="date" value={filters.date} onChange={updateFilter} />
          <select name="month" value={filters.month} onChange={updateFilter}>
            <option value="">Any month</option>
            {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).map((month) => <option key={month} value={month}>{month}</option>)}
          </select>
          <input name="year" value={filters.year} onChange={updateFilter} placeholder="Year, ex: 2026" />
          <select name="sort" value={filters.sort} onChange={updateFilter}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A-Z</option>
            <option value="category">Category A-Z</option>
            <option value="price-low">Price low-high</option>
            <option value="price-high">Price high-low</option>
            <option value="photos-high">Most photos</option>
          </select>
          <button className="btn ghost" type="button" onClick={() => setFilters(emptyFilters)}>Reset</button>
        </div>
      </GlassCard>

      <div className="admin-list">
        {filteredAlbums.map((album) => (
          <GlassCard key={album.id} className="admin-row album-admin-row">
            <img className="admin-thumb" src={album.cover_image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80'} alt={album.title} />
            <div>
              <strong>{album.title}</strong>
              <small>{album.categories?.name || 'No category'} • {album.location || 'No location'} • {formatDate(album.shoot_date)}</small>
              <p>{album.description || 'No description'}</p>
              <div className="addon-tags">
                <span>{album.photo_count || 0} photos</span>
                <span>{currency(album.album_price || album.packages?.base_price || 0)}</span>
                {album.packages?.name && <span>{album.packages.grade} package</span>}
                <span>{album.is_published ? 'Published' : 'Draft'}</span>
              </div>
              {Array.isArray(album.photos) && album.photos.length > 0 && (
                <div className="mini-photo-strip">
                  {album.photos.slice(0, 7).map((photo) => (
                    <img key={photo.id} src={photo.image_url} alt={photo.caption || album.title} loading="lazy" />
                  ))}
                  {album.photos.length > 7 && <span>+{album.photos.length - 7}</span>}
                </div>
              )}
            </div>
            <div className="row-actions">
              <button onClick={() => editAlbum(album)}>Edit</button>
              <button onClick={() => remove(album.id)}>Delete</button>
            </div>
          </GlassCard>
        ))}
        {filteredAlbums.length === 0 && <div className="state-card">No albums found for selected filters.</div>}
      </div>
    </div>
  );
}
