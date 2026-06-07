export const demoCategories = [
  {
    id: 'cat-birthday',
    name: 'Birthday Shoot',
    slug: 'birthday-shoot',
    description: 'Elegant birthday memories with a cinematic mood.',
    image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'cat-graduation',
    name: 'Graduation',
    slug: 'graduation',
    description: 'Proud academic stories captured with timeless beauty.',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'cat-portrait',
    name: 'Portrait',
    slug: 'portrait',
    description: 'Creative portraits with soft light and luxury details.',
    image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'cat-wedding',
    name: 'Wedding',
    slug: 'wedding',
    description: 'Romantic wedding memories for a lifetime.',
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'cat-events',
    name: 'Events',
    slug: 'events',
    description: 'Professional coverage for celebrations and events.',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80'
  }
];

export const demoAlbums = [
  {
    id: 'alb-nishadi',
    category_id: 'cat-birthday',
    package_id: 'pkg-birthday-premium',
    title: 'Nishadi',
    slug: 'nishadi',
    description: 'A soft birthday photoshoot full of grace, joy, and warm details.',
    location: 'Colombo',
    album_price: 25000,
    cover_image_url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80',
    shoot_date: '2026-05-01',
    is_featured: true,
    is_published: true,
    categories: { name: 'Birthday Shoot', slug: 'birthday-shoot' },
    packages: { name: 'Birthday Premium', grade: 'Premium', base_price: 25000 },
    photo_count: 6,
    photos: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }, { id: 'p5' }, { id: 'p6' }]
  },
  {
    id: 'alb-lakmini',
    category_id: 'cat-graduation',
    package_id: 'pkg-grad-standard',
    title: 'Lakmini Wasana Graduation',
    slug: 'lakmini-wasana-graduation',
    description: 'A proud graduation story captured with clean, timeless elegance.',
    location: 'BMICH',
    album_price: 22000,
    cover_image_url: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=900&q=80',
    shoot_date: '2026-05-12',
    is_featured: true,
    is_published: true,
    categories: { name: 'Graduation', slug: 'graduation' },
    packages: { name: 'Graduation Standard', grade: 'Standard', base_price: 22000 },
    photo_count: 4,
    photos: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }, { id: 'p4' }]
  },
  {
    id: 'alb-portrait',
    category_id: 'cat-portrait',
    package_id: 'pkg-portrait-basic',
    title: 'Moody Portrait Session',
    slug: 'moody-portrait-session',
    description: 'Minimal luxury portraits with cinematic shadows.',
    location: 'Outdoor',
    album_price: 15000,
    cover_image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    shoot_date: '2026-04-20',
    is_featured: true,
    is_published: true,
    categories: { name: 'Portrait', slug: 'portrait' },
    packages: { name: 'Portrait Basic', grade: 'Basic', base_price: 15000 },
    photo_count: 3,
    photos: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }]
  }
];

export const demoPhotos = [
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1523438097201-512ae7d59c44?auto=format&fit=crop&w=1000&q=80'
].map((image_url, index) => ({
  id: `demo-photo-${index}`,
  image_url,
  caption: `Studio Pixcura frame ${index + 1}`,
  sort_order: index,
  is_visible: true
}));

export const demoPackages = [
  {
    id: 'pkg-portrait-basic',
    category_id: 'cat-portrait',
    name: 'Portrait Basic',
    grade: 'Basic',
    shoot_type: 'Portrait',
    description: '1 hour session with selected edited photos.',
    deliverables: '1 hour shoot, selected edited photos, online delivery.',
    base_price: 15000,
    duration: '1 hour',
    print_photo_enabled: true,
    print_photo_price: 350,
    album_book_enabled: false,
    album_book_price: 0,
    display_order: 1,
    is_active: true,
    categories: { name: 'Portrait', slug: 'portrait' }
  },
  {
    id: 'pkg-grad-standard',
    category_id: 'cat-graduation',
    name: 'Graduation Standard',
    grade: 'Standard',
    shoot_type: 'Graduation',
    description: 'Individual graduation session with family/couple frames.',
    deliverables: '2 hour shoot, graduate portraits, family frames, edited images.',
    base_price: 22000,
    duration: '2 hours',
    print_photo_enabled: true,
    print_photo_price: 400,
    album_book_enabled: true,
    album_book_price: 18000,
    display_order: 2,
    is_active: true,
    categories: { name: 'Graduation', slug: 'graduation' }
  },
  {
    id: 'pkg-birthday-premium',
    category_id: 'cat-birthday',
    name: 'Birthday Premium',
    grade: 'Premium',
    shoot_type: 'Birthday Shoot',
    description: 'Creative birthday shoot with detail shots.',
    deliverables: '2 hour shoot, detail shots, edited portraits, online gallery.',
    base_price: 25000,
    duration: '2 hours',
    print_photo_enabled: true,
    print_photo_price: 400,
    album_book_enabled: true,
    album_book_price: 15000,
    display_order: 3,
    is_active: true,
    categories: { name: 'Birthday Shoot', slug: 'birthday-shoot' }
  }
];

export const demoAddons = [
  { id: 'add-extra-photo', category_id: '', name: 'Extra Edited Photo', description: 'Additional retouched photo', price: 1000, is_print_option: false, is_active: true },
  { id: 'add-hour', category_id: '', name: 'Extra Hour', description: 'Additional shoot time', price: 6000, is_print_option: false, is_active: true },
  { id: 'add-reel', category_id: '', name: 'Short Reel', description: 'Creative vertical reel edit', price: 8000, is_print_option: false, is_active: true },
  { id: 'add-print', category_id: '', name: 'Photo Print', description: 'Printed photo copy', price: 400, is_print_option: true, is_active: true },
  { id: 'add-album-book', category_id: '', name: 'Album Book', description: 'Printed album book', price: 18000, is_print_option: true, is_active: true }
];

export const demoSiteSettings = {
  id: 1,
  studio_name: 'Studio Pixcura',
  tagline: 'Fresh. Elegant. Cinematic. Timeless.',
  whatsapp_number: '94789391396',
  phone_alt: '94757567570',
  email: 'studiopixcura@gmail.com',
  facebook_url: 'https://facebook.com/StudioPixcura',
  instagram_url: 'https://instagram.com/studiopixcura',
  address: 'Sri Lanka',
  about_title: 'Studio Pixcura is built for memories that deserve to stay timeless.',
  about_text: 'Studio Pixcura is a creative photography brand focused on cinematic, elegant, and emotionally rich photoshoots. We capture portraits, graduation stories, birthdays, weddings, events, engagements, and preshoots with careful attention to light, composition, and storytelling.',
  copyright_text: '© Studio Pixcura | Heshala Angage | Gayashan Perera. All images are copyrighted.'
};
