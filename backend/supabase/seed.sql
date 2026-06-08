-- Studio Pixcura Admin V3 seed data
-- Run after backend/supabase/schema.sql.
-- Safe to run again. It adds default categories, packages, add-ons, and editable home settings. It does not add sample albums.

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

-- Sample albums are intentionally not inserted in this release.
-- Use Admin → Albums to create only the albums you want to show.

insert into public.site_settings (
  id, studio_name, tagline, whatsapp_number, phone_alt, email,
  facebook_url, instagram_url, about_title, about_text, address,
  home_hero_eyebrow, home_hero_title, home_hero_text, home_hero_image_url,
  home_photographer_title, home_photographer_text, home_photographer_image_url,
  copyright_text
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
  'Premium Photography • Sri Lanka',
  'Every frame has a story — captured with elegance, emotion, and cinematic light.',
  'Studio Pixcura creates timeless portraits, graduation stories, birthdays, weddings, events, engagements, and preshoots with a fresh luxury mood.',
  null,
  'Meet the photographer behind Studio Pixcura',
  'Add your personal photographer introduction from Admin → Home Content.',
  null,
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
  home_hero_eyebrow = coalesce(public.site_settings.home_hero_eyebrow, excluded.home_hero_eyebrow),
  home_hero_title = coalesce(public.site_settings.home_hero_title, excluded.home_hero_title),
  home_hero_text = coalesce(public.site_settings.home_hero_text, excluded.home_hero_text),
  home_hero_image_url = coalesce(public.site_settings.home_hero_image_url, excluded.home_hero_image_url),
  home_photographer_title = coalesce(public.site_settings.home_photographer_title, excluded.home_photographer_title),
  home_photographer_text = coalesce(public.site_settings.home_photographer_text, excluded.home_photographer_text),
  home_photographer_image_url = coalesce(public.site_settings.home_photographer_image_url, excluded.home_photographer_image_url),
  copyright_text = excluded.copyright_text,
  updated_at = now();

notify pgrst, 'reload schema';
