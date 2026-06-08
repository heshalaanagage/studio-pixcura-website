import { supabase, isSupabaseReady } from './supabaseClient';
import { demoAddons, demoAlbums, demoCategories, demoPackages, demoPhotos, demoSiteSettings, demoHomePhotos } from '../data/demoData';
import { safeFileName, slugify } from './helpers';

function requireSupabase() {
  if (!isSupabaseReady || !supabase) {
    throw new Error('Supabase is not configured. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.');
  }
  return supabase;
}

function friendlyError(error) {
  if (!error) return null;
  const message = error.message || String(error);
  if (/does not exist|Could not find|relationship/i.test(message)) {
    return new Error(`${message}. Run backend/supabase/schema.sql in Supabase SQL Editor, then run backend/supabase/seed.sql, and refresh the browser.`);
  }
  return new Error(message || 'Supabase request failed');
}

function throwIfError(error) {
  if (error) throw friendlyError(error);
}


function uniqueStoragePath(file, folder = 'uploads') {
  const cleanName = safeFileName(file?.name || 'photo.jpg');
  const extension = cleanName.includes('.') ? cleanName.split('.').pop() : 'jpg';
  const baseName = cleanName.replace(new RegExp(`\\.${extension}$`, 'i'), '').slice(0, 70) || 'photo';
  const random = Math.random().toString(36).slice(2, 8);
  return `${folder}/${Date.now()}-${random}-${baseName}.${extension}`;
}

async function safeSelect(builder, fallback = []) {
  const { data, error } = await builder;
  if (error) {
    console.warn('Supabase optional query failed:', error.message);
    return fallback;
  }
  return data || fallback;
}

function withPhotoCount(album) {
  const photoList = Array.isArray(album.photos) ? album.photos : [];
  return {
    ...album,
    photo_count: Number(album.photo_count ?? photoList.length ?? 0),
    photos: photoList
  };
}

const DEFAULT_CATEGORIES = [
  { name: 'Birthday Shoot', slug: 'birthday-shoot', description: 'Birthday photoshoots and celebrations.', image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Graduation', slug: 'graduation', description: 'Graduation stories and academic memories.', image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Wedding', slug: 'wedding', description: 'Wedding day moments and couple memories.', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Portrait', slug: 'portrait', description: 'Creative portrait sessions.', image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Engagement', slug: 'engagement', description: 'Engagement and romantic sessions.', image_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Preshoot', slug: 'preshoot', description: 'Pre-wedding and concept photoshoots.', image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Events', slug: 'events', description: 'Events, functions, and celebrations.', image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' }
];

export const PACKAGE_GRADES = ['Basic', 'Standard', 'Signature', 'Pro', 'Premium', 'Luxury'];
export const BOOKING_PRIORITIES = ['normal', 'urgent', 'high', 'low'];

function normalizeCategory(category) {
  if (!category) return null;
  return {
    ...category,
    slug: category.slug || slugify(category.name)
  };
}

function sortCategories(list) {
  return [...(list || [])].map(normalizeCategory).sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
}

function sortPackages(list) {
  return [...(list || [])].sort((a, b) => {
    const order = Number(a.display_order || 0) - Number(b.display_order || 0);
    if (order !== 0) return order;
    const price = Number(a.base_price || a.price || 0) - Number(b.base_price || b.price || 0);
    if (price !== 0) return price;
    return (a.name || '').localeCompare(b.name || '');
  });
}

function normalizePackage(pack, categoryMap = new Map()) {
  if (!pack) return null;
  const category = categoryMap.get(pack.category_id) || null;
  return {
    ...pack,
    base_price: Number(pack.base_price ?? pack.price ?? 0),
    display_order: Number(pack.display_order || 0),
    grade: pack.grade || 'Basic',
    shoot_type: pack.shoot_type || category?.name || 'Photoshoot',
    categories: category ? { name: category.name, slug: category.slug } : null
  };
}

function normalizeAddon(addon, categoryMap = new Map()) {
  if (!addon) return null;
  const category = categoryMap.get(addon.category_id) || null;
  return {
    ...addon,
    price: Number(addon.price || 0),
    categories: category ? { name: category.name, slug: category.slug } : null
  };
}

function normalizeHomePhoto(photo) {
  if (!photo) return null;
  return {
    ...photo,
    sort_order: Number(photo.sort_order || 0),
    is_active: photo.is_active !== false
  };
}

function sortHomePhotos(list) {
  return [...(list || [])]
    .map(normalizeHomePhoto)
    .filter(Boolean)
    .sort((a, b) => {
      const order = Number(a.sort_order || 0) - Number(b.sort_order || 0);
      if (order !== 0) return order;
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    });
}

function normalizeAlbum(album, { categoryMap = new Map(), packageMap = new Map(), photosByAlbum = new Map() } = {}) {
  if (!album) return null;
  const category = categoryMap.get(album.category_id) || null;
  const pack = packageMap.get(album.package_id) || null;
  const photos = photosByAlbum.get(album.id) || [];
  return withPhotoCount({
    ...album,
    album_price: Number(album.album_price || 0),
    categories: category ? { name: category.name, slug: category.slug } : null,
    packages: pack ? { name: pack.name, grade: pack.grade, base_price: Number(pack.base_price || 0) } : null,
    photos
  });
}

async function fetchCategoriesRaw() {
  const client = requireSupabase();
  const { data, error } = await client.from('categories').select('*');
  throwIfError(error);
  return sortCategories(data || []);
}

async function fetchCategoryMap() {
  const categories = await fetchCategoriesRaw();
  return new Map(categories.map((category) => [category.id, category]));
}

async function ensureStarterCategories() {
  if (!isSupabaseReady) return demoCategories;
  const current = await fetchCategoriesRaw();
  const existingSlugs = new Set(current.map((category) => category.slug));
  const missing = DEFAULT_CATEGORIES.filter((category) => !existingSlugs.has(category.slug));
  if (missing.length > 0 && await checkIsAdmin().catch(() => false)) {
    const { error } = await supabase.from('categories').upsert(missing, { onConflict: 'slug' });
    throwIfError(error);
    return fetchCategoriesRaw();
  }
  return current;
}

async function fetchPackagesRaw({ activeOnly = false } = {}) {
  const client = requireSupabase();
  let query = client.from('packages').select('*');
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  throwIfError(error);
  const categoryMap = await fetchCategoryMap().catch(() => new Map());
  return sortPackages((data || []).map((pack) => normalizePackage(pack, categoryMap)));
}

async function fetchPackageMap() {
  const packages = await fetchPackagesRaw({ activeOnly: false });
  return new Map(packages.map((pack) => [pack.id, pack]));
}

async function fetchPhotosByAlbum(albumIds, { admin = false } = {}) {
  if (!albumIds.length) return new Map();
  let query = supabase.from('photos').select('id, album_id, image_url, caption, sort_order, is_visible');
  if (!admin) query = query.eq('is_visible', true);
  const rows = await safeSelect(query.in('album_id', albumIds), []);
  const grouped = new Map();
  rows.forEach((row) => {
    const list = grouped.get(row.album_id) || [];
    list.push(row);
    grouped.set(row.album_id, list);
  });
  grouped.forEach((list) => list.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)));
  return grouped;
}

async function hydrateAlbums(albums, { admin = false } = {}) {
  const categoryMap = await fetchCategoryMap().catch(() => new Map());
  const packageMap = await fetchPackageMap().catch(() => new Map());
  const photosByAlbum = await fetchPhotosByAlbum((albums || []).map((album) => album.id), { admin }).catch(() => new Map());
  return (albums || []).map((album) => normalizeAlbum(album, { categoryMap, packageMap, photosByAlbum }));
}

export async function getCurrentSession() {
  if (!isSupabaseReady) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInAdmin(email, password) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  throwIfError(error);
  const admin = await checkIsAdmin();
  if (!admin) {
    await client.auth.signOut();
    throw new Error('This login is not allowed for admin panel. Set this user role to admin in profiles table.');
  }
  return data;
}

export async function signOutAdmin() {
  if (!isSupabaseReady) return;
  await supabase.auth.signOut();
}

export async function checkIsAdmin() {
  if (!isSupabaseReady) return false;
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return false;
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  if (error) return false;
  return data?.role === 'admin';
}

export async function getCategories() {
  if (!isSupabaseReady) return demoCategories;
  return ensureStarterCategories();
}

export async function getAlbums({ categorySlug = '', featuredOnly = false, admin = false } = {}) {
  if (!isSupabaseReady) return demoAlbums.map(withPhotoCount);

  let query = supabase.from('albums').select('*');
  if (!admin) query = query.eq('is_published', true);
  if (featuredOnly) query = query.eq('is_featured', true).limit(6);

  const { data, error } = await query;
  throwIfError(error);

  let list = await hydrateAlbums(data || [], { admin });
  list = list.sort((a, b) => new Date(b.shoot_date || b.created_at || 0) - new Date(a.shoot_date || a.created_at || 0));
  if (categorySlug) list = list.filter((album) => album.categories?.slug === categorySlug);
  return list;
}

export async function getAlbumBySlug(slug) {
  if (!isSupabaseReady) {
    return demoAlbums.map(withPhotoCount).find((album) => album.slug === slug) || demoAlbums[0];
  }
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  throwIfError(error);
  const list = await hydrateAlbums(data ? [data] : [], { admin: false });
  return list[0] || null;
}

export async function getPhotosByAlbumId(albumId) {
  if (!isSupabaseReady) return demoPhotos;
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', albumId)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });
  throwIfError(error);
  return data || [];
}

export async function getPackages() {
  if (!isSupabaseReady) return demoPackages;
  return fetchPackagesRaw({ activeOnly: true });
}

export async function getAddons() {
  if (!isSupabaseReady) return demoAddons;
  const { data, error } = await supabase.from('addons').select('*').eq('is_active', true);
  throwIfError(error);
  const categoryMap = await fetchCategoryMap().catch(() => new Map());
  return (data || []).map((addon) => normalizeAddon(addon, categoryMap)).sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
}

export async function getSiteSettings() {
  if (!isSupabaseReady) return demoSiteSettings;
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throwIfError(error);
  return data || demoSiteSettings;
}

export async function adminUpdateSiteSettings(form) {
  const client = requireSupabase();
  const payload = {
    id: 1,
    studio_name: form.studio_name || 'Studio Pixcura',
    tagline: form.tagline || null,
    whatsapp_number: form.whatsapp_number || null,
    phone_alt: form.phone_alt || null,
    email: form.email || null,
    facebook_url: form.facebook_url || null,
    instagram_url: form.instagram_url || null,
    about_title: form.about_title || null,
    about_text: form.about_text || null,
    address: form.address || null,
    home_hero_eyebrow: form.home_hero_eyebrow || null,
    home_hero_title: form.home_hero_title || null,
    home_hero_text: form.home_hero_text || null,
    home_hero_image_url: form.home_hero_image_url || null,
    home_photographer_title: form.home_photographer_title || null,
    home_photographer_text: form.home_photographer_text || null,
    home_photographer_image_url: form.home_photographer_image_url || null,
    copyright_text: form.copyright_text || null,
    updated_at: new Date().toISOString()
  };
  const { error } = await client.from('site_settings').upsert(payload, { onConflict: 'id' });
  throwIfError(error);
}

export async function getHomePhotos({ section = '', admin = false } = {}) {
  if (!isSupabaseReady) return demoHomePhotos;
  let query = supabase.from('home_photos').select('*');
  if (section) query = query.eq('section', section);
  if (!admin) query = query.eq('is_active', true);
  const { data, error } = await query;
  throwIfError(error);
  return sortHomePhotos(data || []);
}

export async function getHomeContent() {
  if (!isSupabaseReady) {
    return {
      settings: demoSiteSettings,
      homePhotos: demoHomePhotos,
      galleryPhotos: demoHomePhotos.filter((photo) => photo.section === 'home_gallery'),
      heroPhoto: demoSiteSettings.home_hero_image_url || '',
      photographerPhoto: demoSiteSettings.home_photographer_image_url || ''
    };
  }
  const [settings, homePhotos] = await Promise.all([
    getSiteSettings(),
    getHomePhotos({ admin: false })
  ]);
  return {
    settings,
    homePhotos,
    galleryPhotos: homePhotos.filter((photo) => photo.section === 'home_gallery'),
    heroPhoto: settings.home_hero_image_url || '',
    photographerPhoto: settings.home_photographer_image_url || ''
  };
}

export async function adminHomePhotos() {
  return getHomePhotos({ admin: true });
}

export async function adminUpsertHomePhoto(form, file = null) {
  const client = requireSupabase();
  let imageUrl = form.image_url || null;
  if (file) imageUrl = await uploadPublicImage(file, `home/${form.section || 'gallery'}`);
  if (!imageUrl) throw new Error('Please upload or enter a home photo URL.');
  const payload = {
    section: form.section || 'home_gallery',
    title: form.title || null,
    subtitle: form.subtitle || null,
    image_url: imageUrl,
    sort_order: Number(form.sort_order || 0),
    is_active: form.is_active !== false,
    updated_at: new Date().toISOString()
  };
  const query = form.id
    ? client.from('home_photos').update(payload).eq('id', form.id).select('*').single()
    : client.from('home_photos').insert(payload).select('*').single();
  const { data, error } = await query;
  throwIfError(error);
  return normalizeHomePhoto(data);
}

export async function adminDeleteHomePhoto(id) {
  const client = requireSupabase();
  const { error } = await client.from('home_photos').delete().eq('id', id);
  throwIfError(error);
}

export async function adminUpdateCategoryImage(categoryId, file) {
  const client = requireSupabase();
  if (!categoryId) throw new Error('Category ID is missing.');
  if (!file) throw new Error('Please select a category image.');
  const imageUrl = await uploadPublicImage(file, `home/categories/${categoryId}`);
  const { data, error } = await client
    .from('categories')
    .update({ image_url: imageUrl })
    .eq('id', categoryId)
    .select('*')
    .single();
  throwIfError(error);
  return normalizeCategory(data);
}

export async function createBooking(payload, selectedAddonIds = []) {
  if (!isSupabaseReady) {
    console.info('Demo booking submitted:', payload, selectedAddonIds);
    return { id: `demo-${Date.now()}` };
  }

  const cleanPayload = {
    ...payload,
    priority: payload.priority || 'normal'
  };

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(cleanPayload)
    .select('*')
    .single();
  throwIfError(error);

  if (selectedAddonIds.length > 0) {
    const rows = selectedAddonIds.map((addonId) => ({
      booking_id: booking.id,
      addon_id: addonId,
      quantity: 1
    }));
    const { error: addonError } = await supabase.from('booking_addons').insert(rows);
    throwIfError(addonError);
  }

  return booking;
}

export async function adminStats() {
  if (!isSupabaseReady) {
    return { categories: 0, albums: 0, photos: 0, bookings: 0, packages: 0, pendingBookings: 0, revenue: 0 };
  }
  const tables = ['categories', 'albums', 'photos', 'bookings', 'packages'];
  const results = await Promise.all(
    tables.map((table) => supabase.from(table).select('id', { count: 'exact', head: true }))
  );
  const { count: pendingBookings } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending');
  const { data: completedBookings } = await supabase
    .from('bookings')
    .select('estimated_total')
    .in('status', ['confirmed', 'completed']);
  const revenue = (completedBookings || []).reduce((sum, row) => sum + Number(row.estimated_total || 0), 0);
  return {
    ...Object.fromEntries(tables.map((table, index) => [table, results[index].count || 0])),
    pendingBookings: pendingBookings || 0,
    revenue
  };
}

export async function adminBookings() {
  const client = requireSupabase();
  const { data: bookings, error } = await client.from('bookings').select('*');
  throwIfError(error);
  const sortedBookings = [...(bookings || [])].sort((a, b) => new Date(b.created_at || b.preferred_date || 0) - new Date(a.created_at || a.preferred_date || 0));

  const packageIds = [...new Set(sortedBookings.map((booking) => booking.package_id).filter(Boolean))];
  const packageRows = packageIds.length
    ? await safeSelect(client.from('packages').select('*').in('id', packageIds), [])
    : [];
  const categoryMap = await fetchCategoryMap().catch(() => new Map());
  const packageMap = new Map(packageRows.map((pack) => [pack.id, normalizePackage(pack, categoryMap)]));

  const bookingIds = sortedBookings.map((booking) => booking.id);
  const bookingAddonRows = bookingIds.length
    ? await safeSelect(client.from('booking_addons').select('*').in('booking_id', bookingIds), [])
    : [];
  const addonIds = [...new Set(bookingAddonRows.map((row) => row.addon_id).filter(Boolean))];
  const addonRows = addonIds.length
    ? await safeSelect(client.from('addons').select('*').in('id', addonIds), [])
    : [];
  const addonMap = new Map(addonRows.map((addon) => [addon.id, normalizeAddon(addon, categoryMap)]));
  const addonsByBooking = new Map();
  bookingAddonRows.forEach((row) => {
    const list = addonsByBooking.get(row.booking_id) || [];
    list.push({ ...row, addons: addonMap.get(row.addon_id) || null });
    addonsByBooking.set(row.booking_id, list);
  });

  return sortedBookings.map((booking) => ({
    ...booking,
    priority: booking.priority || 'normal',
    packages: packageMap.get(booking.package_id) || null,
    booking_addons: addonsByBooking.get(booking.id) || []
  }));
}

export async function updateBookingStatus(id, status, priority = null) {
  const client = requireSupabase();
  const payload = priority ? { status, priority } : { status };
  const { error } = await client.from('bookings').update(payload).eq('id', id);
  throwIfError(error);
}

export async function adminUpsertCategory(form) {
  const client = requireSupabase();
  const payload = {
    name: form.name,
    slug: form.slug || slugify(form.name),
    description: form.description || null,
    image_url: form.image_url || null
  };
  const query = form.id
    ? client.from('categories').update(payload).eq('id', form.id).select('*').single()
    : client.from('categories').insert(payload).select('*').single();
  const { data, error } = await query;
  throwIfError(error);
  return normalizeCategory(data);
}

export async function adminDeleteCategory(id) {
  const client = requireSupabase();
  const { error } = await client.from('categories').delete().eq('id', id);
  throwIfError(error);
}

export async function adminUpsertAlbum(form, coverFile) {
  const client = requireSupabase();
  let coverUrl = form.cover_image_url || null;

  if (coverFile) {
    coverUrl = await uploadPublicImage(coverFile, 'covers');
  }

  const payload = {
    category_id: form.category_id,
    package_id: form.package_id || null,
    title: form.title,
    slug: form.slug || slugify(form.title),
    description: form.description || null,
    location: form.location || null,
    album_price: Number(form.album_price || 0),
    cover_image_url: coverUrl,
    shoot_date: form.shoot_date || null,
    is_featured: Boolean(form.is_featured),
    is_published: Boolean(form.is_published)
  };

  const query = form.id
    ? client.from('albums').update(payload).eq('id', form.id).select('*').single()
    : client.from('albums').insert(payload).select('*').single();
  const { data, error } = await query;
  throwIfError(error);
  const hydrated = await hydrateAlbums([data], { admin: true });
  return hydrated[0];
}

export async function adminUpdateAlbumCover(id, coverImageUrl) {
  const client = requireSupabase();
  const { error } = await client.from('albums').update({ cover_image_url: coverImageUrl }).eq('id', id);
  throwIfError(error);
}

export async function adminDeleteAlbum(id) {
  const client = requireSupabase();
  const { error } = await client.from('albums').delete().eq('id', id);
  throwIfError(error);
}

export async function uploadPublicImage(file, folder = 'uploads') {
  const client = requireSupabase();
  if (!file) throw new Error('No image file selected.');
  const path = uniqueStoragePath(file, folder);
  const { error } = await client.storage
    .from('pixcura-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  throwIfError(error);
  const { data } = client.storage.from('pixcura-photos').getPublicUrl(path);
  return data.publicUrl;
}

export async function adminUploadAlbumPhotos(albumId, files) {
  const client = requireSupabase();
  const fileList = Array.from(files || []);
  if (!albumId) throw new Error('Album ID is missing. Save the album before uploading photos.');
  if (fileList.length === 0) return [];

  const existingRows = await safeSelect(
    client
      .from('photos')
      .select('sort_order')
      .eq('album_id', albumId)
      .order('sort_order', { ascending: false })
      .limit(1),
    []
  );
  const startOrder = Number(existingRows?.[0]?.sort_order || 0);
  const rows = [];

  for (let index = 0; index < fileList.length; index += 1) {
    const file = fileList[index];
    const imageUrl = await uploadPublicImage(file, `albums/${albumId}`);
    rows.push({
      album_id: albumId,
      image_url: imageUrl,
      caption: '',
      sort_order: startOrder + index + 1,
      is_visible: true
    });
  }

  const { data, error } = await client.from('photos').insert(rows).select('*');
  throwIfError(error);

  if (!data || data.length === 0) {
    throw new Error('Photos were uploaded to storage, but photo records were not saved in the photos table. Check Supabase photos insert policy and run backend/supabase/schema.sql again.');
  }
  return data;
}

export async function adminPhotos(albumId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('photos')
    .select('*')
    .eq('album_id', albumId)
    .order('sort_order', { ascending: true });
  throwIfError(error);
  return data || [];
}

export async function adminUpdatePhoto(photo) {
  const client = requireSupabase();
  const { error } = await client
    .from('photos')
    .update({
      caption: photo.caption,
      sort_order: Number(photo.sort_order || 0),
      is_visible: Boolean(photo.is_visible)
    })
    .eq('id', photo.id);
  throwIfError(error);
}

export async function adminDeletePhoto(id) {
  const client = requireSupabase();
  const { error } = await client.from('photos').delete().eq('id', id);
  throwIfError(error);
}

export async function adminAllPackages() {
  if (!isSupabaseReady) return demoPackages;
  return fetchPackagesRaw({ activeOnly: false });
}

export async function adminAllAddons() {
  if (!isSupabaseReady) return demoAddons;
  const { data, error } = await supabase.from('addons').select('*');
  throwIfError(error);
  const categoryMap = await fetchCategoryMap().catch(() => new Map());
  return (data || []).map((addon) => normalizeAddon(addon, categoryMap)).sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
}

export async function adminUpsertPackage(form) {
  const client = requireSupabase();
  const payload = {
    category_id: form.category_id || null,
    name: form.name,
    grade: form.grade || 'Basic',
    shoot_type: form.shoot_type,
    description: form.description || null,
    deliverables: form.deliverables || null,
    base_price: Number(form.base_price || 0),
    price: Number(form.base_price || 0),
    duration: form.duration || null,
    print_photo_enabled: Boolean(form.print_photo_enabled),
    print_photo_price: Number(form.print_photo_price || 0),
    album_book_enabled: Boolean(form.album_book_enabled),
    album_book_price: Number(form.album_book_price || 0),
    display_order: Number(form.display_order || 0),
    is_active: Boolean(form.is_active)
  };
  const query = form.id
    ? client.from('packages').update(payload).eq('id', form.id)
    : client.from('packages').insert(payload);
  const { error } = await query;
  throwIfError(error);
}

export async function adminDeletePackage(id) {
  const client = requireSupabase();
  const { error } = await client.from('packages').delete().eq('id', id);
  throwIfError(error);
}

export async function adminUpsertAddon(form) {
  const client = requireSupabase();
  const payload = {
    category_id: form.category_id || null,
    name: form.name,
    description: form.description || null,
    price: Number(form.price || 0),
    is_print_option: Boolean(form.is_print_option),
    is_active: Boolean(form.is_active)
  };
  const query = form.id
    ? client.from('addons').update(payload).eq('id', form.id)
    : client.from('addons').insert(payload);
  const { error } = await query;
  throwIfError(error);
}

export async function adminDeleteAddon(id) {
  const client = requireSupabase();
  const { error } = await client.from('addons').delete().eq('id', id);
  throwIfError(error);
}
