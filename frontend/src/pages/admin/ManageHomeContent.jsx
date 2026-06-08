import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { ErrorState, LoadingState, SuccessState } from '../../components/Status';
import {
  adminDeleteHomePhoto,
  adminHomePhotos,
  adminUpdateCategoryImage,
  adminUpdateSiteSettings,
  adminUpsertHomePhoto,
  getCategories,
  getSiteSettings,
  uploadPublicImage
} from '../../lib/api';

const emptyGalleryForm = {
  id: '',
  section: 'home_gallery',
  title: '',
  subtitle: '',
  image_url: '',
  sort_order: 0,
  is_active: true
};

export default function ManageHomeContent() {
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [homePhotos, setHomePhotos] = useState([]);
  const [galleryForm, setGalleryForm] = useState(emptyGalleryForm);
  const [heroFile, setHeroFile] = useState(null);
  const [photographerFile, setPhotographerFile] = useState(null);
  const [galleryFile, setGalleryFile] = useState(null);
  const [categoryFiles, setCategoryFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    try {
      setError('');
      const [settingsData, categoryData, homePhotoData] = await Promise.all([
        getSiteSettings(),
        getCategories(),
        adminHomePhotos()
      ]);
      setSettings(settingsData);
      setCategories(categoryData);
      setHomePhotos(homePhotoData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const galleryPhotos = useMemo(() => homePhotos.filter((photo) => photo.section === 'home_gallery'), [homePhotos]);

  function updateSettings(event) {
    const { name, value } = event.target;
    setSettings((current) => ({ ...current, [name]: value }));
  }

  function updateGalleryForm(event) {
    const { name, value, type, checked } = event.target;
    setGalleryForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function saveHeroAndPhotographer(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      let nextSettings = { ...settings };
      if (heroFile) {
        nextSettings.home_hero_image_url = await uploadPublicImage(heroFile, 'home/hero');
      }
      if (photographerFile) {
        nextSettings.home_photographer_image_url = await uploadPublicImage(photographerFile, 'home/photographer');
      }
      await adminUpdateSiteSettings(nextSettings);
      setSettings(nextSettings);
      setHeroFile(null);
      setPhotographerFile(null);
      setSuccess('Home hero and photographer content updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveCategoryImage(categoryId) {
    try {
      const file = categoryFiles[categoryId];
      if (!file) throw new Error('Please select an image for this category first.');
      setSaving(true);
      setError('');
      setSuccess('');
      const updatedCategory = await adminUpdateCategoryImage(categoryId, file);
      setCategories((current) => current.map((category) => (category.id === categoryId ? updatedCategory : category)));
      setCategoryFiles((current) => ({ ...current, [categoryId]: null }));
      setSuccess('Category featured image updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveGalleryPhoto(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await adminUpsertHomePhoto(galleryForm, galleryFile);
      setGalleryForm(emptyGalleryForm);
      setGalleryFile(null);
      setSuccess('Home gallery photo saved.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteGalleryPhoto(id) {
    if (!window.confirm('Delete this home gallery photo?')) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await adminDeleteHomePhoto(id);
      setHomePhotos((current) => current.filter((photo) => photo.id !== id));
      setSuccess('Home gallery photo deleted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function editGalleryPhoto(photo) {
    setGalleryForm({
      id: photo.id,
      section: photo.section || 'home_gallery',
      title: photo.title || '',
      subtitle: photo.subtitle || '',
      image_url: photo.image_url || '',
      sort_order: photo.sort_order || 0,
      is_active: photo.is_active !== false
    });
    setGalleryFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading) return <LoadingState />;
  if (!settings) return <ErrorState message={error || 'Home settings could not be loaded.'} />;

  return (
    <div>
      <div className="section-head">
        <p className="eyebrow">Admin</p>
        <h1>Home Content & Photos</h1>
        <p className="muted">Customize the home page hero image, category featured photos, home gallery photos, and photographer section without changing other website functions.</p>
      </div>

      <ErrorState message={error} />
      <SuccessState message={success} />

      <GlassCard className="admin-block">
        <form className="form-grid" onSubmit={saveHeroAndPhotographer}>
          <h2 className="full">Hero Section</h2>
          <label>Hero Eyebrow<input name="home_hero_eyebrow" value={settings.home_hero_eyebrow || ''} onChange={updateSettings} /></label>
          <label>Hero Title<input name="home_hero_title" value={settings.home_hero_title || ''} onChange={updateSettings} /></label>
          <label className="full">Hero Text<textarea name="home_hero_text" value={settings.home_hero_text || ''} onChange={updateSettings} rows="3" /></label>
          <label className="full">Current Hero Image URL<input name="home_hero_image_url" value={settings.home_hero_image_url || ''} onChange={updateSettings} /></label>
          <label className="full">Upload New Hero Image<input type="file" accept="image/*" onChange={(event) => setHeroFile(event.target.files?.[0] || null)} /></label>
          {settings.home_hero_image_url && <img className="admin-preview-img full" src={settings.home_hero_image_url} alt="Hero preview" />}

          <h2 className="full">About Photographer Section</h2>
          <label className="full">Photographer Title<input name="home_photographer_title" value={settings.home_photographer_title || ''} onChange={updateSettings} /></label>
          <label className="full">Photographer Text<textarea name="home_photographer_text" value={settings.home_photographer_text || ''} onChange={updateSettings} rows="4" /></label>
          <label className="full">Photographer Image URL<input name="home_photographer_image_url" value={settings.home_photographer_image_url || ''} onChange={updateSettings} /></label>
          <label className="full">Upload Photographer Photo<input type="file" accept="image/*" onChange={(event) => setPhotographerFile(event.target.files?.[0] || null)} /></label>
          {settings.home_photographer_image_url && <img className="admin-preview-img full" src={settings.home_photographer_image_url} alt="Photographer preview" />}

          <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Home Text & Main Photos'}</button>
        </form>
      </GlassCard>

      <GlassCard className="admin-block">
        <div className="section-head compact-package-head">
          <p className="eyebrow">Category Featured Photos</p>
          <h2>Change the photos shown in the home category section</h2>
        </div>
        <div className="home-admin-grid">
          {categories.map((category) => (
            <div className="home-admin-card" key={category.id}>
              {category.image_url ? <img src={category.image_url} alt={category.name} /> : <div className="empty-image-fill" />}
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <input type="file" accept="image/*" onChange={(event) => setCategoryFiles((current) => ({ ...current, [category.id]: event.target.files?.[0] || null }))} />
              <button className="btn ghost" type="button" disabled={saving} onClick={() => saveCategoryImage(category.id)}>Update Category Photo</button>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="admin-block">
        <form className="form-grid" onSubmit={saveGalleryPhoto}>
          <h2 className="full">Other Home Page Photos / Gallery</h2>
          <label>Title<input name="title" value={galleryForm.title} onChange={updateGalleryForm} /></label>
          <label>Sort Order<input name="sort_order" type="number" value={galleryForm.sort_order} onChange={updateGalleryForm} /></label>
          <label className="full">Description<textarea name="subtitle" value={galleryForm.subtitle} onChange={updateGalleryForm} rows="3" /></label>
          <label className="full">Image URL<input name="image_url" value={galleryForm.image_url} onChange={updateGalleryForm} /></label>
          <label className="full">Upload Photo<input type="file" accept="image/*" onChange={(event) => setGalleryFile(event.target.files?.[0] || null)} /></label>
          <label className="checkbox-line full"><input name="is_active" type="checkbox" checked={galleryForm.is_active} onChange={updateGalleryForm} /> Show this photo on home page</label>
          <div className="hero-actions full">
            <button className="btn primary" type="submit" disabled={saving}>{galleryForm.id ? 'Update Home Photo' : 'Add Home Photo'}</button>
            {galleryForm.id && <button className="btn ghost" type="button" onClick={() => { setGalleryForm(emptyGalleryForm); setGalleryFile(null); }}>Cancel Edit</button>}
          </div>
        </form>

        <div className="home-admin-grid gallery-admin-list">
          {galleryPhotos.map((photo) => (
            <div className="home-admin-card" key={photo.id}>
              <img src={photo.image_url} alt={photo.title || 'Home gallery'} />
              <h3>{photo.title || 'Untitled home photo'}</h3>
              <p>{photo.subtitle}</p>
              <small>Order: {photo.sort_order} • {photo.is_active ? 'Visible' : 'Hidden'}</small>
              <div className="hero-actions compact-actions">
                <button className="btn ghost" type="button" onClick={() => editGalleryPhoto(photo)}>Edit</button>
                <button className="btn danger" type="button" onClick={() => deleteGalleryPhoto(photo.id)}>Delete</button>
              </div>
            </div>
          ))}
          {galleryPhotos.length === 0 && <p className="muted">No custom home gallery photos added yet.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
