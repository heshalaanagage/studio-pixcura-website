-- Studio Pixcura Admin V3 Fixed Supabase schema + safe migration
-- Run this FULL file in Supabase Dashboard > SQL Editor.
-- Safe to run again. It creates missing tables, missing columns, foreign keys, policies, and storage bucket.

create extension if not exists pgcrypto;

-- =========================
-- 1) CORE TABLES
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  category_id uuid,
  name text,
  grade text default 'Basic',
  shoot_type text,
  description text,
  deliverables text,
  base_price numeric(12,2) default 0,
  price numeric(12,2) default 0,
  duration text,
  print_photo_enabled boolean default false,
  print_photo_price numeric(12,2) default 0,
  album_book_enabled boolean default false,
  album_book_price numeric(12,2) default 0,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  category_id uuid,
  package_id uuid,
  title text,
  slug text,
  description text,
  location text,
  album_price numeric(12,2) default 0,
  cover_image_url text,
  shoot_date date,
  is_featured boolean default false,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid,
  image_url text,
  thumbnail_url text,
  caption text,
  sort_order bigint default 0,
  is_visible boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.addons (
  id uuid primary key default gen_random_uuid(),
  category_id uuid,
  name text,
  description text,
  price numeric(12,2) default 0,
  is_print_option boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  phone text,
  email text,
  shoot_type text,
  preferred_date date,
  location text,
  package_id uuid,
  message text,
  priority text default 'normal',
  status text default 'pending',
  estimated_total numeric(12,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.booking_addons (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid,
  addon_id uuid,
  quantity integer default 1,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1,
  studio_name text default 'Studio Pixcura',
  tagline text,
  whatsapp_number text,
  phone_alt text,
  email text,
  facebook_url text,
  instagram_url text,
  about_title text,
  about_text text,
  address text,
  copyright_text text,
  updated_at timestamptz default now(),
  constraint site_settings_singleton check (id = 1)
);

-- =========================
-- 2) SAFE COLUMN MIGRATIONS
-- =========================

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text default 'customer';
alter table public.profiles add column if not exists created_at timestamptz default now();

alter table public.categories add column if not exists name text;
alter table public.categories add column if not exists slug text;
alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists image_url text;
alter table public.categories add column if not exists created_at timestamptz default now();

alter table public.packages add column if not exists category_id uuid;
alter table public.packages add column if not exists name text;
alter table public.packages add column if not exists grade text default 'Basic';
alter table public.packages add column if not exists shoot_type text;
alter table public.packages add column if not exists description text;
alter table public.packages add column if not exists deliverables text;
alter table public.packages add column if not exists base_price numeric(12,2) default 0;
alter table public.packages add column if not exists price numeric(12,2) default 0;
alter table public.packages add column if not exists duration text;
alter table public.packages add column if not exists print_photo_enabled boolean default false;
alter table public.packages add column if not exists print_photo_price numeric(12,2) default 0;
alter table public.packages add column if not exists album_book_enabled boolean default false;
alter table public.packages add column if not exists album_book_price numeric(12,2) default 0;
alter table public.packages add column if not exists display_order integer default 0;
alter table public.packages add column if not exists is_active boolean default true;
alter table public.packages add column if not exists created_at timestamptz default now();
alter table public.packages add column if not exists updated_at timestamptz default now();

alter table public.albums add column if not exists category_id uuid;
alter table public.albums add column if not exists package_id uuid;
alter table public.albums add column if not exists title text;
alter table public.albums add column if not exists slug text;
alter table public.albums add column if not exists description text;
alter table public.albums add column if not exists location text;
alter table public.albums add column if not exists album_price numeric(12,2) default 0;
alter table public.albums add column if not exists cover_image_url text;
alter table public.albums add column if not exists shoot_date date;
alter table public.albums add column if not exists is_featured boolean default false;
alter table public.albums add column if not exists is_published boolean default true;
alter table public.albums add column if not exists created_at timestamptz default now();
alter table public.albums add column if not exists updated_at timestamptz default now();

alter table public.photos add column if not exists album_id uuid;
alter table public.photos add column if not exists image_url text;
alter table public.photos add column if not exists thumbnail_url text;
alter table public.photos add column if not exists caption text;
alter table public.photos add column if not exists sort_order bigint default 0;
alter table public.photos add column if not exists is_visible boolean default true;
alter table public.photos add column if not exists created_at timestamptz default now();
alter table public.photos add column if not exists updated_at timestamptz default now();
alter table public.photos alter column sort_order type bigint using sort_order::bigint;

alter table public.addons add column if not exists category_id uuid;
alter table public.addons add column if not exists name text;
alter table public.addons add column if not exists description text;
alter table public.addons add column if not exists price numeric(12,2) default 0;
alter table public.addons add column if not exists is_print_option boolean default false;
alter table public.addons add column if not exists is_active boolean default true;
alter table public.addons add column if not exists created_at timestamptz default now();
alter table public.addons add column if not exists updated_at timestamptz default now();

alter table public.bookings add column if not exists customer_name text;
alter table public.bookings add column if not exists phone text;
alter table public.bookings add column if not exists email text;
alter table public.bookings add column if not exists shoot_type text;
alter table public.bookings add column if not exists preferred_date date;
alter table public.bookings add column if not exists location text;
alter table public.bookings add column if not exists package_id uuid;
alter table public.bookings add column if not exists message text;
alter table public.bookings add column if not exists priority text default 'normal';
alter table public.bookings add column if not exists status text default 'pending';
alter table public.bookings add column if not exists estimated_total numeric(12,2) default 0;
alter table public.bookings add column if not exists created_at timestamptz default now();
alter table public.bookings add column if not exists updated_at timestamptz default now();

alter table public.booking_addons add column if not exists booking_id uuid;
alter table public.booking_addons add column if not exists addon_id uuid;
alter table public.booking_addons add column if not exists quantity integer default 1;
alter table public.booking_addons add column if not exists created_at timestamptz default now();

-- Fill older rows and keep aliases in sync.
update public.categories set slug = lower(regexp_replace(coalesce(slug, name, id::text), '[^a-zA-Z0-9]+', '-', 'g')) where slug is null or slug = '';
update public.packages set grade = coalesce(nullif(grade, ''), 'Basic');
update public.packages set base_price = coalesce(base_price, price, 0), price = coalesce(price, base_price, 0);
update public.packages set display_order = coalesce(display_order, 0), is_active = coalesce(is_active, true);
update public.packages p set shoot_type = coalesce(nullif(p.shoot_type, ''), c.name, 'Photoshoot') from public.categories c where p.category_id = c.id;
update public.packages set shoot_type = coalesce(nullif(shoot_type, ''), 'Photoshoot');
update public.albums set title = coalesce(nullif(title, ''), 'Untitled Album');
update public.albums set slug = lower(regexp_replace(coalesce(nullif(slug, ''), title, id::text), '[^a-zA-Z0-9]+', '-', 'g')) where slug is null or slug = '';
update public.albums set album_price = coalesce(album_price, 0), is_featured = coalesce(is_featured, false), is_published = coalesce(is_published, true);
update public.photos set sort_order = coalesce(sort_order, 0), is_visible = coalesce(is_visible, true);
update public.addons set price = coalesce(price, 0), is_print_option = coalesce(is_print_option, false), is_active = coalesce(is_active, true);
update public.bookings set priority = coalesce(nullif(priority, ''), 'normal'), status = coalesce(nullif(status, ''), 'pending'), estimated_total = coalesce(estimated_total, 0);
update public.booking_addons set quantity = coalesce(quantity, 1);

-- =========================
-- 3) UNIQUE INDEXES + FOREIGN KEYS
-- =========================

create unique index if not exists categories_slug_key on public.categories(slug);
create unique index if not exists categories_name_key on public.categories(name);
create unique index if not exists albums_slug_key on public.albums(slug);

-- Foreign keys are added as NOT VALID so old messy data will not block the migration.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'packages_category_id_fkey') then
    alter table public.packages add constraint packages_category_id_fkey foreign key (category_id) references public.categories(id) on delete set null not valid;
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'albums_category_id_fkey') then
    alter table public.albums add constraint albums_category_id_fkey foreign key (category_id) references public.categories(id) on delete restrict not valid;
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'albums_package_id_fkey') then
    alter table public.albums add constraint albums_package_id_fkey foreign key (package_id) references public.packages(id) on delete set null not valid;
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'photos_album_id_fkey') then
    alter table public.photos add constraint photos_album_id_fkey foreign key (album_id) references public.albums(id) on delete cascade not valid;
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'addons_category_id_fkey') then
    alter table public.addons add constraint addons_category_id_fkey foreign key (category_id) references public.categories(id) on delete set null not valid;
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'bookings_package_id_fkey') then
    alter table public.bookings add constraint bookings_package_id_fkey foreign key (package_id) references public.packages(id) on delete set null not valid;
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'booking_addons_booking_id_fkey') then
    alter table public.booking_addons add constraint booking_addons_booking_id_fkey foreign key (booking_id) references public.bookings(id) on delete cascade not valid;
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'booking_addons_addon_id_fkey') then
    alter table public.booking_addons add constraint booking_addons_addon_id_fkey foreign key (addon_id) references public.addons(id) on delete restrict not valid;
  end if;
end $$;

create index if not exists albums_category_id_idx on public.albums(category_id);
create index if not exists albums_package_id_idx on public.albums(package_id);
create index if not exists albums_shoot_date_idx on public.albums(shoot_date);
create index if not exists packages_category_id_idx on public.packages(category_id);
create index if not exists packages_display_order_idx on public.packages(display_order);
create index if not exists addons_category_id_idx on public.addons(category_id);
create index if not exists photos_album_id_idx on public.photos(album_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_date_idx on public.bookings(preferred_date);
create index if not exists bookings_priority_idx on public.bookings(priority);
create index if not exists booking_addons_booking_id_idx on public.booking_addons(booking_id);
create index if not exists booking_addons_addon_id_idx on public.booking_addons(addon_id);

-- =========================
-- 4) AUTH HELPERS
-- =========================

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================
-- 5) DEFAULT SITE SETTINGS
-- =========================

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

-- =========================
-- 6) RLS + POLICIES
-- =========================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.packages enable row level security;
alter table public.addons enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_addons enable row level security;
alter table public.site_settings enable row level security;

-- Drop old and current policies to keep this file rerunnable.
drop policy if exists "Profiles can be read by owner or admin" on public.profiles;
drop policy if exists "Profiles can be updated by admin" on public.profiles;
drop policy if exists "Public can read categories" on public.categories;
drop policy if exists "Admin can insert categories" on public.categories;
drop policy if exists "Admin can update categories" on public.categories;
drop policy if exists "Admin can delete categories" on public.categories;
drop policy if exists "Public can read published albums" on public.albums;
drop policy if exists "Admin can insert albums" on public.albums;
drop policy if exists "Admin can update albums" on public.albums;
drop policy if exists "Admin can delete albums" on public.albums;
drop policy if exists "Public can read visible photos from published albums" on public.photos;
drop policy if exists "Admin can insert photos" on public.photos;
drop policy if exists "Admin can update photos" on public.photos;
drop policy if exists "Admin can delete photos" on public.photos;
drop policy if exists "Public can read active packages" on public.packages;
drop policy if exists "Admin can insert packages" on public.packages;
drop policy if exists "Admin can update packages" on public.packages;
drop policy if exists "Admin can delete packages" on public.packages;
drop policy if exists "Public can read active addons" on public.addons;
drop policy if exists "Admin can insert addons" on public.addons;
drop policy if exists "Admin can update addons" on public.addons;
drop policy if exists "Admin can delete addons" on public.addons;
drop policy if exists "Anyone can create booking requests" on public.bookings;
drop policy if exists "Admin can read bookings" on public.bookings;
drop policy if exists "Admin can update bookings" on public.bookings;
drop policy if exists "Admin can delete bookings" on public.bookings;
drop policy if exists "Anyone can add addons to a booking request" on public.booking_addons;
drop policy if exists "Admin can read booking addons" on public.booking_addons;
drop policy if exists "Admin can update booking addons" on public.booking_addons;
drop policy if exists "Admin can delete booking addons" on public.booking_addons;
drop policy if exists "Public can read site settings" on public.site_settings;
drop policy if exists "Admin can insert site settings" on public.site_settings;
drop policy if exists "Admin can update site settings" on public.site_settings;

create policy "Profiles can be read by owner or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "Profiles can be updated by admin" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

create policy "Public can read categories" on public.categories for select using (true);
create policy "Admin can insert categories" on public.categories for insert with check (public.is_admin());
create policy "Admin can update categories" on public.categories for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete categories" on public.categories for delete using (public.is_admin());

create policy "Public can read published albums" on public.albums for select using (is_published = true or public.is_admin());
create policy "Admin can insert albums" on public.albums for insert with check (public.is_admin());
create policy "Admin can update albums" on public.albums for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete albums" on public.albums for delete using (public.is_admin());

create policy "Public can read visible photos from published albums" on public.photos for select using (
  public.is_admin()
  or (
    coalesce(is_visible, true) = true
    and exists (select 1 from public.albums where albums.id = photos.album_id and coalesce(albums.is_published, true) = true)
  )
);
create policy "Admin can insert photos" on public.photos for insert with check (public.is_admin());
create policy "Admin can update photos" on public.photos for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete photos" on public.photos for delete using (public.is_admin());

create policy "Public can read active packages" on public.packages for select using (coalesce(is_active, true) = true or public.is_admin());
create policy "Admin can insert packages" on public.packages for insert with check (public.is_admin());
create policy "Admin can update packages" on public.packages for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete packages" on public.packages for delete using (public.is_admin());

create policy "Public can read active addons" on public.addons for select using (coalesce(is_active, true) = true or public.is_admin());
create policy "Admin can insert addons" on public.addons for insert with check (public.is_admin());
create policy "Admin can update addons" on public.addons for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete addons" on public.addons for delete using (public.is_admin());

create policy "Anyone can create booking requests" on public.bookings for insert with check (true);
create policy "Admin can read bookings" on public.bookings for select using (public.is_admin());
create policy "Admin can update bookings" on public.bookings for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete bookings" on public.bookings for delete using (public.is_admin());

create policy "Anyone can add addons to a booking request" on public.booking_addons for insert with check (true);
create policy "Admin can read booking addons" on public.booking_addons for select using (public.is_admin());
create policy "Admin can update booking addons" on public.booking_addons for update using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete booking addons" on public.booking_addons for delete using (public.is_admin());

create policy "Public can read site settings" on public.site_settings for select using (true);
create policy "Admin can insert site settings" on public.site_settings for insert with check (public.is_admin());
create policy "Admin can update site settings" on public.site_settings for update using (public.is_admin()) with check (public.is_admin());

-- =========================
-- 7) STORAGE
-- =========================

insert into storage.buckets (id, name, public)
values ('pixcura-photos', 'pixcura-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read pixcura photos" on storage.objects;
drop policy if exists "Admin can upload pixcura photos" on storage.objects;
drop policy if exists "Admin can update pixcura photos" on storage.objects;
drop policy if exists "Admin can delete pixcura photos" on storage.objects;

create policy "Public can read pixcura photos" on storage.objects for select using (bucket_id = 'pixcura-photos');
create policy "Admin can upload pixcura photos" on storage.objects for insert with check (bucket_id = 'pixcura-photos' and public.is_admin());
create policy "Admin can update pixcura photos" on storage.objects for update using (bucket_id = 'pixcura-photos' and public.is_admin()) with check (bucket_id = 'pixcura-photos' and public.is_admin());
create policy "Admin can delete pixcura photos" on storage.objects for delete using (bucket_id = 'pixcura-photos' and public.is_admin());

-- Force PostgREST/Supabase API to reload schema cache after new columns/foreign keys.
notify pgrst, 'reload schema';
