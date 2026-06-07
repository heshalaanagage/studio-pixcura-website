-- Studio Pixcura Admin V3 seed data
-- Run after backend/supabase/schema.sql.
-- Safe to run again. It adds default categories, packages, add-ons, and sample albums.

-- Categories
insert into public.categories (name, slug, description, image_url)
values
  ('Birthday Shoot', 'birthday-shoot', 'Birthday photoshoots and celebration memories.', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80'),
  ('Graduation', 'graduation', 'Graduation stories and proud academic memories.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80'),
  ('Wedding', 'wedding', 'Wedding day stories and elegant couple memories.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'),
  ('Portrait', 'portrait', 'Creative portrait sessions with cinematic style.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80'),
  ('Engagement', 'engagement', 'Engagement sessions and romantic stories.', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80'),
  ('Preshoot', 'preshoot', 'Pre-wedding and concept photoshoots.', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'),
  ('Events', 'events', 'Event photography and function coverage.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url;

-- Packages
insert into public.packages (
  category_id, name, grade, shoot_type, description, deliverables, base_price, price,
  duration, print_photo_enabled, print_photo_price, album_book_enabled, album_book_price,
  display_order, is_active
)
select c.id, v.name, v.grade, c.name, v.description, v.deliverables, v.base_price, v.base_price,
       v.duration, v.print_photo_enabled, v.print_photo_price, v.album_book_enabled, v.album_book_price,
       v.display_order, true
from (
  values
    ('birthday-shoot', 'Birthday Basic', 'Basic', 'Simple birthday photo session.', '1 hour shoot, selected edited photos, online delivery.', 15000::numeric, '1 hour', true, 400::numeric, false, 0::numeric, 1),
    ('birthday-shoot', 'Birthday Premium', 'Premium', 'Creative birthday shoot with detail shots.', '2 hour shoot, detail photos, edited portraits, online gallery.', 25000::numeric, '2 hours', true, 400::numeric, true, 15000::numeric, 2),
    ('graduation', 'Graduation Basic', 'Basic', 'Individual graduation shoot.', '1 hour shoot, individual portraits, selected edited photos.', 16000::numeric, '1 hour', true, 400::numeric, false, 0::numeric, 3),
    ('graduation', 'Graduation Standard', 'Standard', 'Graduate, family, and couple frames.', '2 hour shoot, graduate portraits, family frames, edited images.', 22000::numeric, '2 hours', true, 400::numeric, true, 18000::numeric, 4),
    ('graduation', 'Graduation Luxury', 'Luxury', 'Premium graduation story with full coverage.', 'Extended session, family/couple frames, premium edit set, online gallery.', 35000::numeric, '3 hours', true, 500::numeric, true, 25000::numeric, 5),
    ('wedding', 'Wedding Standard', 'Standard', 'Wedding ceremony photo coverage.', 'Ceremony coverage, couple portraits, edited online gallery.', 65000::numeric, 'Half day', true, 500::numeric, true, 25000::numeric, 6),
    ('portrait', 'Portrait Basic', 'Basic', 'Minimal portrait shoot.', '1 hour shoot, selected edited portraits, online delivery.', 15000::numeric, '1 hour', true, 350::numeric, false, 0::numeric, 7),
    ('engagement', 'Engagement Signature', 'Signature', 'Romantic engagement photography.', '2 hour session, couple portraits, detail shots, edited gallery.', 30000::numeric, '2 hours', true, 500::numeric, true, 20000::numeric, 8),
    ('preshoot', 'Preshoot Pro', 'Pro', 'Outdoor cinematic preshoot package.', '3 hour concept shoot, multiple looks, premium edited gallery.', 45000::numeric, '3 hours', true, 500::numeric, true, 25000::numeric, 9),
    ('events', 'Event Coverage', 'Standard', 'Hourly event photography coverage.', 'Event coverage, selected edits, online delivery.', 20000::numeric, '2 hours', true, 400::numeric, false, 0::numeric, 10)
) as v(slug, name, grade, description, deliverables, base_price, duration, print_photo_enabled, print_photo_price, album_book_enabled, album_book_price, display_order)
join public.categories c on c.slug = v.slug
where not exists (
  select 1 from public.packages p where lower(p.name) = lower(v.name)
);

-- Add-ons
insert into public.addons (category_id, name, description, price, is_print_option, is_active)
select null::uuid, v.name, v.description, v.price, v.is_print_option, true
from (
  values
    ('Extra Edited Photo', 'Additional retouched photo.', 1000::numeric, false),
    ('Extra Hour', 'Additional shoot time.', 6000::numeric, false),
    ('Short Reel', 'Creative vertical reel edit.', 8000::numeric, false),
    ('Photo Print', 'One printed photo copy.', 400::numeric, true),
    ('Album Book', 'Printed album book design and delivery.', 18000::numeric, true),
    ('Extra Location', 'Additional location within the same shoot.', 7000::numeric, false)
) as v(name, description, price, is_print_option)
where not exists (select 1 from public.addons a where lower(a.name) = lower(v.name));

-- Sample albums for each category. These help you see the final layout immediately.
insert into public.albums (
  category_id, package_id, title, slug, description, location, album_price,
  cover_image_url, shoot_date, is_featured, is_published
)
select c.id, p.id, v.title, v.slug, v.description, v.location, v.album_price,
       v.cover_image_url, v.shoot_date::date, v.is_featured, true
from (
  values
    ('birthday-shoot', 'Birthday Premium', 'Nishadi', 'nishadi', 'A soft birthday shoot with warm details and elegant styling.', 'Colombo', 25000::numeric, 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80', '2026-05-01', true),
    ('graduation', 'Graduation Standard', 'Lakmini Wasana Graduation', 'lakmini-wasana-graduation', 'A proud graduation story captured with clean timeless elegance.', 'BMICH', 22000::numeric, 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80', '2026-05-12', true),
    ('wedding', 'Wedding Standard', 'Kavindu & Tharushi Wedding', 'kavindu-tharushi-wedding', 'Romantic wedding memories with soft luxury details.', 'Colombo', 65000::numeric, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', '2026-04-20', true),
    ('portrait', 'Portrait Basic', 'Moody Portrait Session', 'moody-portrait-session', 'Minimal luxury portraits with cinematic shadows.', 'Outdoor', 15000::numeric, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80', '2026-04-10', true),
    ('engagement', 'Engagement Signature', 'Dinithi & Akila Engagement', 'dinithi-akila-engagement', 'Soft romantic engagement session with elegant tones.', 'Galle Face', 30000::numeric, 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80', '2026-03-22', false),
    ('preshoot', 'Preshoot Pro', 'Sahan & Iresha Preshoot', 'sahan-iresha-preshoot', 'Outdoor cinematic preshoot story with natural light.', 'Kandy', 45000::numeric, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', '2026-03-02', false),
    ('events', 'Event Coverage', 'Corporate Event Coverage', 'corporate-event-coverage', 'Professional event coverage with clean documentary style.', 'Colombo', 20000::numeric, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', '2026-02-14', false)
) as v(category_slug, package_name, title, slug, description, location, album_price, cover_image_url, shoot_date, is_featured)
join public.categories c on c.slug = v.category_slug
left join public.packages p on lower(p.name) = lower(v.package_name)
where not exists (select 1 from public.albums a where a.slug = v.slug);

-- Sample photo rows for photo count and album detail preview.
insert into public.photos (album_id, image_url, caption, sort_order, is_visible)
select a.id, v.image_url, v.caption, v.sort_order, true
from (
  values
    ('nishadi', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80', 'Birthday frame 01', 1),
    ('nishadi', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80', 'Birthday frame 02', 2),
    ('lakmini-wasana-graduation', 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80', 'Graduation frame 01', 1),
    ('lakmini-wasana-graduation', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80', 'Graduation frame 02', 2),
    ('kavindu-tharushi-wedding', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 'Wedding frame 01', 1),
    ('moody-portrait-session', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80', 'Portrait frame 01', 1),
    ('dinithi-akila-engagement', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80', 'Engagement frame 01', 1),
    ('sahan-iresha-preshoot', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', 'Preshoot frame 01', 1),
    ('corporate-event-coverage', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', 'Event frame 01', 1)
) as v(album_slug, image_url, caption, sort_order)
join public.albums a on a.slug = v.album_slug
where not exists (
  select 1 from public.photos p where p.album_id = a.id and p.image_url = v.image_url
);

insert into public.site_settings (
  id, studio_name, tagline, whatsapp_number, phone_alt, email,
  facebook_url, instagram_url, about_title, about_text, address, copyright_text
)
values (
  1,
  'Studio Pixcura',
  'Fresh. Elegant. Cinematic. Timeless.',
  '94789391396',
  '94757567570',
  'studiopixcura@gmail.com',
  'https://facebook.com/StudioPixcura',
  'https://instagram.com/studiopixcura',
  'Studio Pixcura is built for memories that deserve to stay timeless.',
  'Studio Pixcura is a creative photography brand focused on cinematic, elegant, and emotionally rich photoshoots. We capture portraits, graduation stories, birthdays, weddings, events, engagements, and preshoots with careful attention to light, composition, and storytelling.',
  'Sri Lanka',
  '© Studio Pixcura | Heshala Angage | Gayashan Perera. All images are copyrighted.'
)
on conflict (id) do update set
  studio_name = excluded.studio_name,
  tagline = excluded.tagline,
  whatsapp_number = excluded.whatsapp_number,
  phone_alt = excluded.phone_alt,
  email = excluded.email,
  facebook_url = excluded.facebook_url,
  instagram_url = excluded.instagram_url,
  about_title = excluded.about_title,
  about_text = excluded.about_text,
  address = excluded.address,
  copyright_text = excluded.copyright_text,
  updated_at = now();

notify pgrst, 'reload schema';
