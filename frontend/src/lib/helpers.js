export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function currency(value) {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString('en-LK')}`;
}

export function formatDate(date) {
  if (!date) return 'Not set';
  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
}

export function monthName(monthValue) {
  if (!monthValue) return 'Any month';
  const date = new Date(2026, Number(monthValue) - 1, 1);
  return new Intl.DateTimeFormat('en-LK', { month: 'long' }).format(date);
}

export function whatsappLink(message = 'Hello Studio Pixcura, I want to book a photoshoot.', numberOverride = '') {
  const number = numberOverride || import.meta.env.VITE_WHATSAPP_NUMBER || '94789391396';
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function safeFileName(name) {
  const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : 'jpg';
  const baseName = name.replace(new RegExp(`\\.${extension}$`, 'i'), '');
  const clean = slugify(baseName) || 'photo';
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${clean}-${unique}.${extension}`;
}

export function getYear(date) {
  if (!date) return '';
  return new Date(date).getFullYear().toString();
}

export function getMonth(date) {
  if (!date) return '';
  return String(new Date(date).getMonth() + 1).padStart(2, '0');
}
