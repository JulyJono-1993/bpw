-- ============================================================================
--  BPW P3UW - Migration ke Supabase Auth + RLS production-ready
--  Jalankan DI SINI: https://supabase.com/dashboard/project/_/sql/new
--  Catatan: jalankan seluruh isi file ini sekaligus, bukan potongan-potongan.
-- ============================================================================

-- ============================================================================
-- BAGIAN 1: PASTIKAN SEMUA TABEL SUDAH ADA
-- ============================================================================

create table if not exists banners (
  "id"        text primary key,
  "tag"       text,
  "tagColor"  text,
  "title"     text,
  "imageUrl"  text
);

create table if not exists shrimp_prices (
  "id"            text primary key,
  "namaBuyer"     text,
  "hargaStandar" numeric,
  "tanggalUpdate" text
);

create table if not exists news (
  "id"       text primary key,
  "title"    text,
  "excerpt"  text,
  "content"  text,
  "imageUrl" text,
  "date"     text,
  "category" text
);

create table if not exists promos (
  "id"         text primary key,
  "title"      text,
  "description" text,
  "buttonText" text,
  "icon"       text,
  "imageUrl"   text
);

create table if not exists info_items (
  "id"      text primary key,
  "title"   text,
  "content" text,
  "icon"    text
);

create table if not exists harvest_data (
  "id"           text primary key,
  "nama"         text,
  "alamatTambak" text,
  "tonase"       numeric,
  "size"         numeric,
  "tanggal"      text
);

create table if not exists site_settings (
  "id"            text primary key,
  "orgName"       text,
  "regionName"    text,
  "primaryColor"  text,
  "secondaryColor" text,
  "backgroundColor" text,
   "locationName"  text,
    "latitude"      text,
    "longitude"     text,
    "showWeather"   boolean default true
);

create table if not exists weather_cache (
  "id"           text primary key,
  "latitude"     text,
  "longitude"    text,
  "locationName" text,
  "payload"      jsonb,
  "fetchedAt"    timestamptz default now()
);

-- Hapus tabel admins lama (login hash di browser sudah tidak dipakai lagi)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'admins'
  ) then
    drop policy if exists "anon_write_admins" on admins;
    drop policy if exists "public_read_admins"     on admins;
    alter table admins disable row level security;
    drop table admins;
  end if;
end $$;

-- Tabel admin_users: hanya user terdaftar di Supabase Auth yang boleh login admin
create table if not exists admin_users (
  user_id  uuid references auth.users(id) on delete cascade primary key,
  email    text unique not null,
  role     text not null default 'admin',
  created_at timestamptz default now()
);

alter table admin_users enable row level security;

create policy "admin_users_read_self"
  on admin_users for select
  using (auth.uid() = user_id);

create policy "admin_users_insert_self"
  on admin_users for insert
  with check (auth.uid() = user_id);

grant select, insert, delete on table admin_users to authenticated;


-- ============================================================================
-- BAGIAN 2: FUNGSI HELPER & RLS BARU
-- ============================================================================

create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from admin_users
    where user_id = auth.uid()
      and role = 'admin'
  );
end;
$$ language plpgsql security definer;


-- Public read (tetap terbuka)
drop policy if exists "public_read_banners"        on banners;
drop policy if exists "public_read_shrimp_prices"  on shrimp_prices;
drop policy if exists "public_read_news"           on news;
drop policy if exists "public_read_promos"         on promos;
drop policy if exists "public_read_info_items"     on info_items;
drop policy if exists "public_read_harvest_data"   on harvest_data;
drop policy if exists "public_read_site_settings" on site_settings;

create policy "public_read_banners"       on banners       for select using (true);
create policy "public_read_shrimp_prices" on shrimp_prices for select using (true);
create policy "public_read_news"          on news          for select using (true);
create policy "public_read_promos"        on promos        for select using (true);
create policy "public_read_info_items"    on info_items    for select using (true);
create policy "public_read_harvest_data"  on harvest_data  for select using (true);
create policy "public_read_site_settings" on site_settings for select using (true);


-- Admin write saja (bukan anon)
drop policy if exists "admin_write_banners"       on banners;
drop policy if exists "admin_write_shrimp_prices" on shrimp_prices;
drop policy if exists "admin_write_news"          on news;
drop policy if exists "admin_write_promos"        on promos;
drop policy if exists "admin_write_info_items"    on info_items;
drop policy if exists "admin_write_harvest_data"  on harvest_data;
drop policy if exists "admin_write_site_settings" on site_settings;

create policy "admin_write_banners"       on banners       for all using (is_admin()) with check (is_admin());
create policy "admin_write_shrimp_prices" on shrimp_prices for all using (is_admin()) with check (is_admin());
create policy "admin_write_news"          on news          for all using (is_admin()) with check (is_admin());
create policy "admin_write_promos"        on promos        for all using (is_admin()) with check (is_admin());
create policy "admin_write_info_items"    on info_items    for all using (is_admin()) with check (is_admin());
create policy "admin_write_harvest_data"  on harvest_data  for all using (is_admin()) with check (is_admin());
create policy "admin_write_site_settings" on site_settings for all using (is_admin()) with check (is_admin());


-- Hapus policy akses lebar ke anon sebelumnya
drop policy if exists "anon_write_banners"        on banners;
drop policy if exists "anon_write_shrimp_prices"  on shrimp_prices;
drop policy if exists "anon_write_news"           on news;
drop policy if exists "anon_write_promos"         on promos;
drop policy if exists "anon_write_info_items"     on info_items;
drop policy if exists "anon_write_harvest_data"   on harvest_data;


-- Grant explicit
grant select, insert, update, delete on table banners        to anon, authenticated;
grant select, insert, update, delete on table shrimp_prices  to anon, authenticated;
grant select, insert, update, delete on table news           to anon, authenticated;
grant select, insert, update, delete on table promos         to anon, authenticated;
grant select, insert, update, delete on table info_items     to anon, authenticated;
grant select, insert, update, delete on table harvest_data   to anon, authenticated;
grant select, insert, update, delete on table site_settings  to anon, authenticated;
grant select, insert, delete on table admin_users    to anon, authenticated;


-- Weather cache: boleh ditulis publik (data cuaca dari browser)
drop policy if exists "anon_write_weather_cache" on weather_cache;
create policy "anon_write_weather_cache" on weather_cache for all using (true) with check (true);
grant select, insert, update, delete on table weather_cache to anon, authenticated;
alter table weather_cache enable row level security;


-- ============================================================================
-- BAGIAN 3: SEED DATA (isi awal tabel, aman dijalankan berulang kali)
-- ============================================================================

insert into banners ("id", "tag", "tagColor", "title", "imageUrl") values
('1', 'Update', 'primary', 'Musim Panen Raya Diprediksi Melimpah', 'https://lh3.googleusercontent.com/aida-public/AB6AXuALwktJ_vWKVjxqwo80sQ9k4iooIR4Qtqj1ne-cBBhuN1xyZb_kHxV8vSbb0fQIj4Z8FHjyfivi7kTDuVzgrQYv2N7Pnkg6RO7AMdnvXT0PzR1khRLCbBN9G3m8tnNnm5Eg9OtKcGXqBH_u95UpD2p0TW3dy776YPdoKRplaFMwYYFiGvMgZcR9Y6Djlb-qxy_RBYYNryQtYa4tuNFaJpa79vRVNA1F5Dv6oCfPBfDbWiXQ5p18EjeZ'),
('2', 'Edukasi', 'secondary', 'Tips Menjaga Kualitas Air Kolam', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf7sqLARM8ygwNmvDnw1r0_5LqgArlo3R1NFZOnzJqc9eDLuyw8APvitk6VkL6AtgP3_rPBFRrjd1DubHP7q_KY7Q9O_983-p8f0rIF1llu4IleF3ELXzBteO-z92deCYkx4zh5X2TY-4ckkYR-SeQQzBXA1Z-ijDd5OGFpalf8SGnzQ6xP4_JRKOZmu4Z_Penc-db1U0UU30M948frJzUxQ7SYnJVgZwuo1_5YF0qwMcOCC_BGu0h')
on conflict ("id") do nothing;

insert into shrimp_prices ("id", "namaBuyer", "hargaStandar", "tanggalUpdate") values
('1', 'PT. Udang Makmur Sejahtera', 85000, '12 Okt 2023'),
('2', 'CV. Berkah Laut', 82000, '10 Okt 2023'),
('3', 'UD. Sumber Rejeki', 80000, '8 Okt 2023')
on conflict ("id") do nothing;

insert into news ("id", "title", "excerpt", "content", "imageUrl", "date", "category") values
('1', 'Pemerintah Luncurkan Program Subsidi Pakan Udang 2024',
 'Program subsidi pakan udang dari pemerintah akan mulai berlaku pada Januari 2024 untuk membantu petambak kecil.',
 E'Pemerintah Indonesia melalui Kementerian Kelautan dan Perikanan (KKP) resmi meluncurkan program subsidi pakan udang yang akan berlaku mulai Januari 2024. Program ini ditujukan untuk membantu para petambak kecil dan menengah dalam mengurangi biaya produksi.',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuALwktJ_vWKVjxqwo80sQ9k4iooIR4Qtqj1ne-cBBhuN1xyZb_kHxV8vSbb0fQIj4Z8FHjyfivi7kTDuVzgrQYv2N7Pnkg6RO7AMdnvXT0PzR1khRLCbBN9G3m8tnNnm5Eg9OtKcGXqBH_u95UpD2p0TW3dy776YPdoKRplaFMwYYFiGvMgZcR9Y6Djlb-qxy_RBYYNryQtYa4tuNFaJpa79vRVNA1F5Dv6oCfPBfDbWiXQ5p18EjeZ',
  '15 Okt 2023', 'Kebijakan')
on conflict ("id") do nothing;

insert into promos ("id", "title", "description", "buttonText", "icon", "imageUrl") values
('1', 'Butuh Modal Ternak?', 'Ajukan pinjaman Investasi 1000 dengan bunga ringan.', 'Daftar Sekarang', 'savings', null),
('2', 'Bibit Unggul Vanamei', 'Dapatkan bibit kualitas ekspor harga subsidi.', 'Cek Stok', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf7sqLARM8ygwNmvDnw1r0_5LqgArlo3R1NFZOnzJqc9eDLuyw8APvitk6VkL6AtgP3_rPBFRrjd1DubHP7q_KY7Q9O_983-p8f0rIF1llu4IleF3ELXzBteO-z92deCYkx4zh5X2TY-4ckkYR-SeQQzBXA1Z-ijDd5OGFpalf8SGnzQ6xP4_JRKOZmu4Z_Penc-db1U0UU30M948frJzUxQ7SYnJVgZwuo1_5YF0qwMcOCC_BGu0h')
on conflict ("id") do nothing;

insert into info_items ("id", "title", "content", "icon") values
('1', 'Tentang BPW P3UW',
 'Badan Pengelola Wilayah Pusat Pengembangan dan Pemberdayaan Usaha Walet (BPW P3UW) adalah lembaga yang berperan dalam pengembangan sektor perikanan udang di Indonesia.',
  'info'),
('2', 'Visi & Misi',
 E'Visi: Menjadi pusat informasi dan pengembangan usaha perikanan udang terdepan di Indonesia.',
  'visibility'),
('3', 'Kontak Kami',
 E'Alamat: Jl. Perikanan No. 123, Jakarta Utara
Telepon: (021) 1234-5678
Email: info@bpwp3uw.go.id
WhatsApp: 0812-3456-7890',
  'contact_support')
on conflict ("id") do nothing;

insert into harvest_data ("id", "nama", "alamatTambak", "tonase", "size", "tanggal") values
('1', 'Budi Santoso', 'Tambak Blok A-12, Desa Margasari, Kec. Labuhan Maringgai, Lampung Timur', 2.5, 30, '10 Okt 2023'),
('2', 'Ahmad Hidayat', 'Tambak Blok B-05, Desa Sriminosari, Kec. Labuhan Maringgai, Lampung Timur', 1.8, 50, '8 Okt 2023'),
('3', 'Siti Rahayu', 'Tambak Blok C-08, Desa Muara Gading Mas, Kec. Labuhan Maringgai, Lampung Timur', 3.2, 40, '5 Okt 2023')
on conflict ("id") do nothing;

insert into site_settings ("id", "orgName", "regionName", "primaryColor", "secondaryColor", "backgroundColor", "locationName", "latitude", "longitude", "showWeather") values
('default', 'BPW P3UW', 'Wilayah Lampung Timur', '#00dddd', '#89ceff', '#0b1326', 'Labuhan Maringgai, Lampung Timur', '-5.3833', '105.4667', true)
on conflict ("id") do nothing;

update site_settings set
  "locationName" = coalesce("locationName", 'Labuhan Maringgai, Lampung Timur'),
  "latitude" = coalesce("latitude", '-5.3833'),
  "longitude" = coalesce("longitude", '105.4667'),
  "showWeather" = coalesce("showWeather", true)
where "id" = 'default';


-- ============================================================================
-- BAGIAN 4: CARA MENAMBAHKAN ADMIN PERTAMA
-- ===========================================================================
-- 1. Buka Dashboard Supabase > Authentication > Users > Add User
--    Masukkan email admin dan password.
-- 2. Catat User ID-nya (misal: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
-- 3. Jalankan SQL berikut (pakai User ID dari langkah 1):
--
-- insert into admin_users (user_id, email, role) values
-- ('GANTI_DENGAN_AUTH_USER_ID', 'email@admin-anda.com', 'admin');
-- ===========================================================================
