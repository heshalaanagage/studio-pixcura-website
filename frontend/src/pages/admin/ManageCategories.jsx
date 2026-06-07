import { useEffect, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { ErrorState, SuccessState } from '../../components/Status';
import { adminDeleteCategory, adminUpsertCategory, getCategories } from '../../lib/api';
import { slugify } from '../../lib/helpers';

const emptyForm = { id: '', name: '', slug: '', description: '', image_url: '' };

export default function ManageCategories() {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setItems(await getCategories());
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value, ...(name === 'name' && !current.id ? { slug: slugify(value) } : {}) }));
  }

  async function submit(event) {
    event.preventDefault();
    try {
      setError(''); setSuccess('');
      await adminUpsertCategory(form);
      setForm(emptyForm);
      setSuccess('Category saved.');
      await load();
    } catch (err) { setError(err.message); }
  }

  async function remove(id) {
    if (!confirm('Delete this category? Albums connected to this category must be moved or deleted first.')) return;
    try { await adminDeleteCategory(id); await load(); } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <div className="section-head"><p className="eyebrow">Admin</p><h1>Manage Categories</h1></div>
      <GlassCard className="admin-block">
        <form className="form-grid" onSubmit={submit}>
          <ErrorState message={error} /><SuccessState message={success} />
          <label>Name<input name="name" value={form.name} onChange={update} required /></label>
          <label>Slug<input name="slug" value={form.slug} onChange={update} required /></label>
          <label className="full">Description<textarea name="description" value={form.description} onChange={update} /></label>
          <label className="full">Image URL<input name="image_url" value={form.image_url} onChange={update} /></label>
          <button className="btn primary" type="submit">{form.id ? 'Update Category' : 'Add Category'}</button>
          {form.id && <button className="btn ghost" type="button" onClick={() => setForm(emptyForm)}>Cancel Edit</button>}
        </form>
      </GlassCard>
      <div className="admin-list">
        {items.map((item) => (
          <GlassCard key={item.id} className="admin-row">
            <div><strong>{item.name}</strong><small>{item.slug}</small><p>{item.description}</p></div>
            <div className="row-actions"><button onClick={() => setForm(item)}>Edit</button><button onClick={() => remove(item.id)}>Delete</button></div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
