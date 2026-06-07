import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { ErrorState, SuccessState } from '../../components/Status';
import {
  PACKAGE_GRADES,
  adminAllAddons,
  adminAllPackages,
  adminDeleteAddon,
  adminDeletePackage,
  adminUpsertAddon,
  adminUpsertPackage,
  getCategories
} from '../../lib/api';
import { currency } from '../../lib/helpers';

const emptyPackage = {
  id: '',
  category_id: '',
  name: '',
  grade: 'Basic',
  shoot_type: '',
  description: '',
  deliverables: '',
  base_price: '',
  duration: '',
  print_photo_enabled: false,
  print_photo_price: '',
  album_book_enabled: false,
  album_book_price: '',
  display_order: 0,
  is_active: true
};

const emptyAddon = {
  id: '',
  category_id: '',
  name: '',
  description: '',
  price: '',
  is_print_option: false,
  is_active: true
};

export default function ManagePackages() {
  const [packageForm, setPackageForm] = useState(emptyPackage);
  const [addonForm, setAddonForm] = useState(emptyAddon);
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const [packageList, addonList, cats] = await Promise.all([adminAllPackages(), adminAllAddons(), getCategories()]);
    setPackages(packageList);
    setAddons(addonList);
    setCategories(cats);
    setPackageForm((current) => ({ ...current, category_id: current.category_id || cats[0]?.id || '', shoot_type: current.shoot_type || cats[0]?.name || 'Graduation' }));
    setAddonForm((current) => ({ ...current, category_id: current.category_id || '' }));
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  function updatePackage(event) {
    const { name, value, type, checked } = event.target;
    setPackageForm((current) => {
      const next = { ...current, [name]: type === 'checkbox' ? checked : value };
      if (name === 'category_id') {
        next.shoot_type = categories.find((cat) => cat.id === value)?.name || next.shoot_type;
      }
      return next;
    });
  }

  function updateAddon(event) {
    const { name, value, type, checked } = event.target;
    setAddonForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function savePackage(event) {
    event.preventDefault();
    try {
      setError('');
      setSuccess('');
      await adminUpsertPackage(packageForm);
      setPackageForm({ ...emptyPackage, category_id: categories[0]?.id || '', shoot_type: categories[0]?.name || 'Graduation' });
      setSuccess('Package saved.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveAddon(event) {
    event.preventDefault();
    try {
      setError('');
      setSuccess('');
      await adminUpsertAddon(addonForm);
      setAddonForm(emptyAddon);
      setShowAddonForm(false);
      setSuccess('Add-on saved.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removePackage(id) {
    if (!confirm('Delete this package? Existing bookings may keep old data, but new users will not see this package.')) return;
    try {
      await adminDeletePackage(id);
      setSuccess('Package deleted.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeAddon(id) {
    if (!confirm('Delete this add-on?')) return;
    try {
      await adminDeleteAddon(id);
      setSuccess('Add-on deleted.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredPackages = useMemo(() => {
    return packages.filter((pack) => !filterCategory || pack.category_id === filterCategory);
  }, [packages, filterCategory]);

  const filteredAddons = useMemo(() => {
    return addons.filter((addon) => !filterCategory || !addon.category_id || addon.category_id === filterCategory);
  }, [addons, filterCategory]);

  function editPackage(pack) {
    setPackageForm({ ...emptyPackage, ...pack, category_id: pack.category_id || '', base_price: pack.base_price || '', print_photo_price: pack.print_photo_price || '', album_book_price: pack.album_book_price || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      <div className="section-head">
        <p className="eyebrow">Admin</p>
        <h1>Packages & Prices</h1>
        <p className="muted">Create package grades, prices, print options, album book prices, and optional add-ons.</p>
      </div>

      <ErrorState message={error} />
      <SuccessState message={success} />

      <GlassCard className="admin-block">
        <form className="form-grid" onSubmit={savePackage}>
          <label>Category
            <select name="category_id" value={packageForm.category_id} onChange={updatePackage} required>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </label>
          <label>Package Grade
            <select name="grade" value={packageForm.grade} onChange={updatePackage}>
              {PACKAGE_GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
            </select>
          </label>
          <label>Package Name
            <input name="name" value={packageForm.name} onChange={updatePackage} placeholder="Ex: Graduation Standard" required />
          </label>
          <label>Base Price
            <input type="number" name="base_price" value={packageForm.base_price} onChange={updatePackage} required />
          </label>
          <label>Duration
            <input name="duration" value={packageForm.duration || ''} onChange={updatePackage} placeholder="Ex: 2 hours" />
          </label>
          <label>Display Order
            <input type="number" name="display_order" value={packageForm.display_order || 0} onChange={updatePackage} />
          </label>
          <label className="full">Description
            <textarea name="description" value={packageForm.description || ''} onChange={updatePackage} rows="3" />
          </label>
          <label className="full">Package Includes / Deliverables
            <textarea name="deliverables" value={packageForm.deliverables || ''} onChange={updatePackage} rows="3" placeholder="Ex: 2 hour shoot, 20 edited photos, online gallery" />
          </label>

          <label className="checkbox-row"><input type="checkbox" name="print_photo_enabled" checked={packageForm.print_photo_enabled} onChange={updatePackage} /> Photo print optional</label>
          <label>Photo Print Price
            <input type="number" name="print_photo_price" value={packageForm.print_photo_price || ''} onChange={updatePackage} placeholder="Ex: 400" />
          </label>
          <label className="checkbox-row"><input type="checkbox" name="album_book_enabled" checked={packageForm.album_book_enabled} onChange={updatePackage} /> Album book optional</label>
          <label>Album Book Price
            <input type="number" name="album_book_price" value={packageForm.album_book_price || ''} onChange={updatePackage} placeholder="Ex: 18000" />
          </label>
          <label className="checkbox-row"><input type="checkbox" name="is_active" checked={packageForm.is_active} onChange={updatePackage} /> Active package</label>

          <button className="btn primary" type="submit">{packageForm.id ? 'Update Package' : 'Add Package'}</button>
          {packageForm.id && <button className="btn ghost" type="button" onClick={() => setPackageForm({ ...emptyPackage, category_id: categories[0]?.id || '', shoot_type: categories[0]?.name || 'Graduation' })}>Cancel Edit</button>}
        </form>
      </GlassCard>

      <GlassCard className="admin-block">
        <div className="row-between compact-row">
          <div>
            <h2>Add-ons</h2>
            <p className="muted">Use + to add extra edited photos, reels, prints, album books, extra hours, etc.</p>
          </div>
          <button className="btn ghost" type="button" onClick={() => setShowAddonForm((value) => !value)}>+ Add-on</button>
        </div>
        {showAddonForm && (
          <form className="form-grid" onSubmit={saveAddon}>
            <label>Category
              <select name="category_id" value={addonForm.category_id || ''} onChange={updateAddon}>
                <option value="">All categories</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </label>
            <label>Add-on Name
              <input name="name" value={addonForm.name} onChange={updateAddon} placeholder="Ex: Extra Edited Photo" required />
            </label>
            <label>Price
              <input type="number" name="price" value={addonForm.price} onChange={updateAddon} required />
            </label>
            <label className="checkbox-row"><input type="checkbox" name="is_print_option" checked={addonForm.is_print_option} onChange={updateAddon} /> Print / physical product option</label>
            <label className="checkbox-row"><input type="checkbox" name="is_active" checked={addonForm.is_active} onChange={updateAddon} /> Active</label>
            <label className="full">Description
              <textarea name="description" value={addonForm.description || ''} onChange={updateAddon} rows="3" />
            </label>
            <button className="btn primary" type="submit">{addonForm.id ? 'Update Add-on' : 'Save Add-on'}</button>
            <button className="btn ghost" type="button" onClick={() => { setAddonForm(emptyAddon); setShowAddonForm(false); }}>Cancel</button>
          </form>
        )}
      </GlassCard>

      <GlassCard className="admin-block">
        <h2>Manage Package List</h2>
        <div className="filter-bar compact-filter">
          <select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <button className="btn ghost" type="button" onClick={() => setFilterCategory('')}>Reset</button>
        </div>
        <div className="package-admin-grid">
          {filteredPackages.map((pack) => (
            <div key={pack.id} className="package-admin-card">
              <span className="pill">{pack.categories?.name || pack.shoot_type}</span>
              <h3>{pack.grade} — {pack.name}</h3>
              <strong>{currency(pack.base_price)}</strong>
              <p>{pack.description}</p>
              <small>{pack.duration || 'No duration'} • {pack.is_active ? 'Active' : 'Hidden'}</small>
              <div className="addon-tags">
                {pack.print_photo_enabled && <span>Print: {currency(pack.print_photo_price)}</span>}
                {pack.album_book_enabled && <span>Album book: {currency(pack.album_book_price)}</span>}
              </div>
              <div className="row-actions"><button onClick={() => editPackage(pack)}>Edit</button><button onClick={() => removePackage(pack.id)}>Delete</button></div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="admin-block">
        <h2>Current Add-ons</h2>
        <div className="mini-list">
          {filteredAddons.map((addon) => (
            <div key={addon.id} className="mini-row addon-row">
              <span>{addon.name}<small>{addon.categories?.name || 'All categories'} • {currency(addon.price)} • {addon.is_active ? 'Active' : 'Hidden'}</small></span>
              <button onClick={() => { setAddonForm({ ...emptyAddon, ...addon, category_id: addon.category_id || '' }); setShowAddonForm(true); }}>Edit</button>
              <button onClick={() => removeAddon(addon.id)}>Delete</button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
