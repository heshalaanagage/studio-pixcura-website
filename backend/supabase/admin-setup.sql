-- Run this AFTER schema.sql and AFTER you create your admin user in Supabase Authentication > Users.
-- Replace the email below with your real admin email.

insert into public.profiles (id, email, role)
select id, email, 'admin'
from auth.users
where email = 'your-admin-email@example.com'
on conflict (id) do update
set email = excluded.email,
    role = 'admin';

-- Check admin profile:
select id, email, role from public.profiles where email = 'your-admin-email@example.com';
