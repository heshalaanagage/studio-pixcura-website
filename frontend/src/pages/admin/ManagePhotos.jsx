import { useEffect, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { ErrorState, SuccessState } from '../../components/Status';
import { adminDeletePhoto, adminPhotos, adminUpdatePhoto, adminUploadAlbumPhotos, getAlbums } from '../../lib/api';

export default function ManagePhotos() {
  const [albums, setAlbums] = useState([]);
  const [albumId, setAlbumId] = useState('');
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadAlbums() {
      const list = await getAlbums({ admin: true });
      setAlbums(list);
      setAlbumId(list[0]?.id || '');
    }
    loadAlbums().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!albumId) return;
    adminPhotos(albumId).then(setPhotos).catch((err) => setError(err.message));
  }, [albumId]);

  async function upload(event) {
    event.preventDefault();
    if (!albumId || files.length === 0) return;
    try {
      setError(''); setSuccess(''); setUploading(true);
      await adminUploadAlbumPhotos(albumId, files);
      setFiles([]);
      setSuccess('Photos uploaded.');
      setPhotos(await adminPhotos(albumId));
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  }

  async function savePhoto(photo) {
    try {
      setError('');
      await adminUpdatePhoto(photo);
      setSuccess('Photo updated.');
      setPhotos(await adminPhotos(albumId));
    } catch (err) { setError(err.message); }
  }

  async function removePhoto(id) {
    if (!confirm('Delete this photo from database? Storage file may need manual cleanup.')) return;
    try { await adminDeletePhoto(id); setPhotos(await adminPhotos(albumId)); } catch (err) { setError(err.message); }
  }

  function updateLocal(id, key, value) {
    setPhotos((current) => current.map((photo) => photo.id === id ? { ...photo, [key]: value } : photo));
  }

  return (
    <div>
      <div className="section-head"><p className="eyebrow">Admin</p><h1>Manage Photos</h1></div>
      <GlassCard className="admin-block">
        <form className="form-grid" onSubmit={upload}>
          <ErrorState message={error} /><SuccessState message={success} />
          <label className="full">Select Album
            <select value={albumId} onChange={(event) => setAlbumId(event.target.value)}>{albums.map((album) => <option key={album.id} value={album.id}>{album.title}</option>)}</select>
          </label>
          <label className="full">Upload Photos<input type="file" accept="image/*" multiple onChange={(event) => setFiles(event.target.files || [])} /></label>
          <button className="btn primary" type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Photos'}</button>
        </form>
      </GlassCard>
      <div className="photo-admin-grid">
        {photos.map((photo) => (
          <GlassCard key={photo.id} className="photo-admin-card">
            <img src={photo.image_url} alt={photo.caption || 'Album photo'} />
            <label>Caption<input value={photo.caption || ''} onChange={(event) => updateLocal(photo.id, 'caption', event.target.value)} /></label>
            <label>Order<input type="number" value={photo.sort_order || 0} onChange={(event) => updateLocal(photo.id, 'sort_order', event.target.value)} /></label>
            <label className="checkbox-row"><input type="checkbox" checked={photo.is_visible} onChange={(event) => updateLocal(photo.id, 'is_visible', event.target.checked)} /> Visible</label>
            <div className="row-actions"><button onClick={() => savePhoto(photo)}>Save</button><button onClick={() => removePhoto(photo.id)}>Delete</button></div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
