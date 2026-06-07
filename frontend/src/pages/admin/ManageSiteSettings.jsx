import { useEffect, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { ErrorState, SuccessState } from '../../components/Status';
import { adminUpdateSiteSettings, getSiteSettings } from '../../lib/api';

export default function ManageSiteSettings() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getSiteSettings()
      .then(setForm)
      .catch((err) => setError(err.message));
  }, []);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function save(event) {
    event.preventDefault();
    try {
      setError('');
      setSuccess('');
      await adminUpdateSiteSettings(form);
      setSuccess('Site/contact details updated.');
    } catch (err) {
      setError(err.message);
    }
  }

  if (!form) return <GlassCard>Loading settings...</GlassCard>;

  return (
    <div>
      <div className="section-head">
        <p className="eyebrow">Admin</p>
        <h1>Contact & Site Details</h1>
        <p className="muted">Update contact details, social links, About text, and Studio Pixcura site information.</p>
      </div>
      <GlassCard className="admin-block">
        <form className="form-grid" onSubmit={save}>
          <ErrorState message={error} />
          <SuccessState message={success} />
          <label>Studio Name<input name="studio_name" value={form.studio_name || ''} onChange={update} /></label>
          <label>Tagline<input name="tagline" value={form.tagline || ''} onChange={update} /></label>
          <label>WhatsApp Number<input name="whatsapp_number" value={form.whatsapp_number || ''} onChange={update} placeholder="94789391396" /></label>
          <label>Second Phone<input name="phone_alt" value={form.phone_alt || ''} onChange={update} placeholder="94757567570" /></label>
          <label>Email<input name="email" value={form.email || ''} onChange={update} /></label>
          <label>Address / Area<input name="address" value={form.address || ''} onChange={update} /></label>
          <label className="full">Facebook URL<input name="facebook_url" value={form.facebook_url || ''} onChange={update} /></label>
          <label className="full">Instagram URL<input name="instagram_url" value={form.instagram_url || ''} onChange={update} /></label>
          <label className="full">About Title<textarea name="about_title" value={form.about_title || ''} onChange={update} rows="2" /></label>
          <label className="full">About Text<textarea name="about_text" value={form.about_text || ''} onChange={update} rows="6" /></label>
          <label className="full">Copyright / Site Note<textarea name="copyright_text" value={form.copyright_text || ''} onChange={update} rows="3" /></label>
          <button className="btn primary" type="submit">Save Details</button>
        </form>
      </GlassCard>
    </div>
  );
}
