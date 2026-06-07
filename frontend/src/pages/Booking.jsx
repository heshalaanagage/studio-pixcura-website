import { useEffect, useMemo, useState } from 'react';
import GlassCard from '../components/GlassCard';
import { createBooking, getAddons, getCategories, getPackages, getSiteSettings } from '../lib/api';
import { currency, whatsappLink } from '../lib/helpers';
import { ErrorState, SuccessState } from '../components/Status';

const initialForm = {
  customer_name: '',
  phone: '',
  email: '',
  shoot_type: '',
  preferred_date: '',
  location: '',
  package_id: '',
  message: '',
  priority: 'normal'
};

export default function Booking() {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const [cats, packageList, addonList, site] = await Promise.all([getCategories(), getPackages(), getAddons(), getSiteSettings()]);
      if (!ignore) {
        setCategories(cats);
        setPackages(packageList);
        setAddons(addonList);
        setSettings(site);
        const firstCategory = cats[0]?.name || packageList[0]?.shoot_type || 'Graduation';
        const firstPackage = packageList.find((pack) => pack.shoot_type === firstCategory) || packageList[0];
        setForm((current) => ({ ...current, shoot_type: firstCategory, package_id: firstPackage?.id || '' }));
      }
    }
    load().catch((err) => setError(err.message));
    return () => { ignore = true; };
  }, []);

  const selectedCategory = categories.find((cat) => cat.name === form.shoot_type || cat.id === form.shoot_type);

  const availablePackages = useMemo(() => {
    return packages.filter((pack) => pack.shoot_type === form.shoot_type || pack.category_id === selectedCategory?.id);
  }, [packages, form.shoot_type, selectedCategory]);

  const availableAddons = useMemo(() => {
    return addons.filter((addon) => !addon.category_id || addon.category_id === selectedCategory?.id);
  }, [addons, selectedCategory]);

  const selectedPackage = packages.find((pack) => pack.id === form.package_id);
  const total = useMemo(() => {
    const base = Number(selectedPackage?.base_price || 0);
    const add = availableAddons
      .filter((addon) => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => sum + Number(addon.price || 0), 0);
    return base + add;
  }, [availableAddons, selectedAddons, selectedPackage]);

  function updateField(event) {
    const { name, value } = event.target;
    if (name === 'shoot_type') {
      const nextCategory = categories.find((cat) => cat.name === value);
      const nextPackage = packages.find((pack) => pack.shoot_type === value || pack.category_id === nextCategory?.id);
      setSelectedAddons([]);
      setForm((current) => ({ ...current, shoot_type: value, package_id: nextPackage?.id || '' }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleAddon(id) {
    setSelectedAddons((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!form.customer_name || !form.phone || !form.preferred_date || !form.package_id) {
      setError('Please fill name, phone, date, and package.');
      return;
    }
    try {
      setSubmitting(true);
      await createBooking({ ...form, estimated_total: total, status: 'pending', priority: 'normal' }, selectedAddons);
      setSuccess('Booking request sent successfully. We will contact you soon.');
      const firstPackage = packages.find((pack) => pack.shoot_type === form.shoot_type) || packages[0];
      setForm({ ...initialForm, shoot_type: form.shoot_type, package_id: firstPackage?.id || '' });
      setSelectedAddons([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container section-pad page-top booking-grid">
      <div>
        <p className="eyebrow">Booking</p>
        <h1>Reserve your Studio Pixcura photoshoot</h1>
        <p className="muted">Choose a shoot type, package, and add-ons. Your request will appear in the admin booking dashboard.</p>
        <GlassCard className="booking-summary">
          <h3>Estimated Total</h3>
          <strong>{currency(total)}</strong>
          <p>{selectedPackage ? `${selectedPackage.grade || ''} ${selectedPackage.name}` : 'Select a package'}</p>
          {selectedPackage?.deliverables && <p className="muted">{selectedPackage.deliverables}</p>}
          <a className="btn ghost" href={whatsappLink('Hello Studio Pixcura, I want to book a photoshoot.', settings?.whatsapp_number)} target="_blank" rel="noreferrer">Message on WhatsApp</a>
        </GlassCard>
      </div>

      <GlassCard>
        <form className="form-grid" onSubmit={handleSubmit}>
          <ErrorState message={error} />
          <SuccessState message={success} />
          <label>Name<input name="customer_name" value={form.customer_name} onChange={updateField} /></label>
          <label>Phone<input name="phone" value={form.phone} onChange={updateField} /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={updateField} /></label>
          <label>Shoot Type
            <select name="shoot_type" value={form.shoot_type} onChange={updateField}>
              {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </label>
          <label>Preferred Date<input name="preferred_date" type="date" value={form.preferred_date} onChange={updateField} /></label>
          <label>Location<input name="location" value={form.location} onChange={updateField} /></label>
          <label className="full">Package
            <select name="package_id" value={form.package_id} onChange={updateField}>
              {availablePackages.map((pack) => (
                <option key={pack.id} value={pack.id}>{pack.grade || 'Package'} — {pack.name} — {currency(pack.base_price)}</option>
              ))}
              {availablePackages.length === 0 && <option value="">No package available for this category</option>}
            </select>
          </label>
          <div className="full addon-list">
            <span>Add-ons</span>
            {availableAddons.map((addon) => (
              <label key={addon.id} className="checkbox-row">
                <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => toggleAddon(addon.id)} />
                <span>{addon.name} — {currency(addon.price)}</span>
              </label>
            ))}
            {availableAddons.length === 0 && <p className="muted">No add-ons available.</p>}
          </div>
          <label className="full">Message<textarea name="message" value={form.message} onChange={updateField} rows="4" /></label>
          <button className="btn primary full" disabled={submitting} type="submit">{submitting ? 'Sending...' : 'Send Booking Request'}</button>
        </form>
      </GlassCard>
    </section>
  );
}
