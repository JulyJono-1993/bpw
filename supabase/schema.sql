-- ============================================================================
--  BPW P3UW - Skema Database Supabase
--  Jalankan script ini di Supabase: SQL Editor -> New query -> paste -> Run
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tabel: banners (banner beranda)
-- ---------------------------------------------------------------------------
create table if not exists banners (
  "id"        text primary key,
  "tag"       text,
  "tagColor"  text,
  "title"     text,
  "imageUrl"  text
);

-- ---------------------------------------------------------------------------
-- Tabel: shrimp_prices (harga udang per buyer)
-- ---------------------------------------------------------------------------
create table if not exists shrimp_prices (
  "id"            text primary key,
  "namaBuyer"     text,
  "hargaStandar" numeric,
  "tanggalUpdate" text
);

-- ---------------------------------------------------------------------------
-- Tabel: news (berita)
-- ---------------------------------------------------------------------------
create table if not exists news (
  "id"       text primary key,
  "title"    text,
  "excerpt"  text,
  "content"  text,
  "imageUrl" text,
  "date"     text,
  "category" text
);

-- ---------------------------------------------------------------------------
-- Tabel: promos (promosi)
-- ---------------------------------------------------------------------------
create table if not exists promos (
  "id"         text primary key,
  "title"      text,
  "description" text,
  "buttonText" text,
  "icon"       text,
  "imageUrl"   text
);

-- ---------------------------------------------------------------------------
-- Tabel: info_items (info statis)
-- ---------------------------------------------------------------------------
create table if not exists info_items (
  "id"      text primary key,
  "title"   text,
  "content" text,
  "icon"    text
);

-- ---------------------------------------------------------------------------
-- Tabel: harvest_data (data panen petambak)
-- ---------------------------------------------------------------------------
create table if not exists harvest_data (
  "id"           text primary key,
  "nama"         text,
  "alamatTambak" text,
  "tonase"       numeric,
  "size"         numeric,
  "tanggal"      text
);

-- ---------------------------------------------------------------------------
-- Tabel: admins (akun panel admin)
-- password_hash = SHA-256 dari password (dihitung di browser)
-- ---------------------------------------------------------------------------
create table if not exists admins (
  "id"           uuid primary key default gen_random_uuid(),
  "username"     text unique not null,
  "password_hash" text not null,
  "created_at"   timestamptz default now()
);

-- ===========================================================================
-- Row Level Security (RLS)
-- Aplikasi ini adalah SPA murni yang memakai anon key di browser.
-- - Semua tabel bisa dibaca publik (SELECT).
-- - Tabel konten & site_settings & admins bisa ditulis via anon key (supaya
--   admin bisa edit dari panel).
-- Untuk produksi yang lebih aman, ganti write policy dengan auth berbasis
-- Supabase Auth (role terbatas), bukan anon key.
-- ===========================================================================
alter table banners        enable row level security;
alter table shrimp_prices  enable row level security;
alter table news           enable row level security;
alter table promos         enable row level security;
alter table info_items     enable row level security;
alter table harvest_data   enable row level security;
alter table admins         enable row level security;

-- Baca publik (semua tabel)
create policy "public_read_banners"       on banners       for select using (true);
create policy "public_read_shrimp_prices" on shrimp_prices for select using (true);
create policy "public_read_news"          on news          for select using (true);
create policy "public_read_promos"        on promos        for select using (true);
create policy "public_read_info_items"    on info_items    for select using (true);
create policy "public_read_harvest_data"  on harvest_data  for select using (true);
create policy "public_read_admins"        on admins        for select using (true);

-- Tulis (anon) khusus tabel konten
create policy "anon_write_banners"        on banners       for all using (true) with check (true);
create policy "anon_write_shrimp_prices"  on shrimp_prices for all using (true) with check (true);
create policy "anon_write_news"           on news          for all using (true) with check (true);
create policy "anon_write_promos"         on promos        for all using (true) with check (true);
create policy "anon_write_info_items"     on info_items    for all using (true) with check (true);
create policy "anon_write_harvest_data"   on harvest_data  for all using (true) with check (true);

-- ===========================================================================
-- Contoh isi (seed data)
-- ===========================================================================

-- banners
insert into banners ("id", "tag", "tagColor", "title", "imageUrl") values
('1', 'Update', 'primary', 'Musim Panen Raya Diprediksi Melimpah', 'https://lh3.googleusercontent.com/aida-public/AB6AXuALwktJ_vWKVjxqwo80sQ9k4iooIR4Qtqj1ne-cBBhuN1xyZb_kHxV8vSbb0fQIj4Z8FHjyfivi7kTDuVzgrQYv2N7Pnkg6RO7AMdnvXT0PzR1khRLCbBN9G3m8tnNnm5Eg9OtKcGXqBH_u95UpD2p0TW3dy776YPdoKRplaFMwYYFiGvMgZcR9Y6Djlb-qxy_RBYYNryQtYa4tuNFaJpa79vRVNA1F5Dv6oCfPBfDbWiXQ5p18EjeZ'),
('2', 'Edukasi', 'secondary', 'Tips Menjaga Kualitas Air Kolam', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf7sqLARM8ygwNmvDnw1r0_5LqgArlo3R1NFZOnzJqc9eDLuyw8APvitk6VkL6AtgP3_rPBFRrjd1DubHP7q_KY7Q9O_983-p8f0rIF1llu4IleF3ELXzBteO-z92deCYkx4zh5X2TY-4ckkYR-SeQQzBXA1Z-ijDd5OGFpalf8SGnzQ6xP4_JRKOZmu4Z_Penc-db1U0UU30M948frJzUxQ7SYnJVgZwuo1_5YF0qwMcOCC_BGu0h')
on conflict ("id") do nothing;

-- shrimp_prices
insert into shrimp_prices ("id", "namaBuyer", "hargaStandar", "tanggalUpdate") values
('1', 'PT. Udang Makmur Sejahtera', 85000, '12 Okt 2023'),
('2', 'CV. Berkah Laut', 82000, '10 Okt 2023'),
('3', 'UD. Sumber Rejeki', 80000, '8 Okt 2023')
on conflict ("id") do nothing;

-- news
insert into news ("id", "title", "excerpt", "content", "imageUrl", "date", "category") values
('1', 'Pemerintah Luncurkan Program Subsidi Pakan Udang 2024',
 'Program subsidi pakan udang dari pemerintah akan mulai berlaku pada Januari 2024 untuk membantu petambak kecil.',
 E'Pemerintah Indonesia melalui Kementerian Kelautan dan Perikanan (KKP) resmi meluncurkan program subsidi pakan udang yang akan berlaku mulai Januari 2024. Program ini ditujukan untuk membantu para petambak kecil dan menengah dalam mengurangi biaya produksi.\n\nProgram subsidi ini mencakup pakan udang berkualitas tinggi dengan potongan harga hingga 30% dari harga normal. Petambak yang memenuhi syarat dapat mengajukan permohonan melalui dinas perikanan setempat.\n\nSyarat utama untuk mendapatkan subsidi ini antara lain memiliki luas tambak maksimal 5 hektar, terdaftar di kelompok petambak, dan memiliki NIB (Nomor Induk Berusaha).',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuALwktJ_vWKVjxqwo80sQ9k4iooIR4Qtqj1ne-cBBhuN1xyZb_kHxV8vSbb0fQIj4Z8FHjyfivi7kTDuVzgrQYv2N7Pnkg6RO7AMdnvXT0PzR1khRLCbBN9G3m8tnNnm5Eg9OtKcGXqBH_u95UpD2p0TW3dy776YPdoKRplaFMwYYFiGvMgZcR9Y6Djlb-qxy_RBYYNryQtYa4tuNFaJpa79vRVNA1F5Dv6oCfPBfDbWiXQ5p18EjeZ',
 '15 Okt 2023', 'Kebijakan'),
('2', 'Teknik Budidaya Udang Vanamei yang Efisien dan Berkelanjutan',
 'Panduan lengkap tentang teknik budidaya udang vanamei modern yang ramah lingkungan dan menghasilkan produktivitas tinggi.',
 E'Budidaya udang vanamei telah menjadi salah satu sektor perikanan yang paling menguntungkan di Indonesia. Dengan teknik yang tepat, petambak dapat meningkatkan produktivitas hingga 40% dibandingkan metode konvensional.\n\nBeberapa teknik kunci yang perlu diperhatikan:\n\n1. Persiapan Kolam: Pastikan dasar kolam sudah dikeringkan dan diberi kapur dolomit untuk menstabilkan pH tanah.\n\n2. Kualitas Air: Gunakan probiotik secara rutin untuk menjaga keseimbangan bakteri dalam air kolam.\n\n3. Pemberian Pakan: Terapkan feeding tray untuk mengontrol jumlah pakan yang diberikan dan menghindari overfeeding.\n\n4. Monitoring: Lakukan pengecekan kualitas air minimal 2 kali sehari, terutama pH, DO, dan salinitas.',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf7sqLARM8ygwNmvDnw1r0_5LqgArlo3R1NFZOnzJqc9eDLuyw8APvitk6VkL6AtgP3_rPBFRrjd1DubHP7q_KY7Q9O_983-p8f0rIF1llu4IleF3ELXzBteO-z92deCYkx4zh5X2TY-4ckkYR-SeQQzBXA1Z-ijDd5OGFpalf8SGnzQ6xP4_JRKOZmu4Z_Penc-db1U0UU30M948frJzUxQ7SYnJVgZwuo1_5YF0qwMcOCC_BGu0h',
 '10 Okt 2023', 'Edukasi'),
('3', 'Harga Udang Vanamei Melonjak di Pasar Ekspor',
 'Permintaan udang vanamei dari pasar ekspor meningkat tajam, mendorong kenaikan harga hingga 15% dalam sebulan terakhir.',
 E'Harga udang vanamei di pasar ekspor mengalami kenaikan signifikan dalam satu bulan terakhir. Data dari Asosiasi Petambak menunjukkan kenaikan rata-rata 15% untuk semua size.\n\nKenaikan ini didorong oleh meningkatnya permintaan dari pasar Amerika Serikat dan Uni Eropa menjelang musim liburan akhir tahun. Selain itu, pasokan dari negara produsen utama seperti India dan Vietnam mengalami penurunan akibat cuaca buruk.\n\nPara petambak diharapkan dapat memanfaatkan momentum ini dengan meningkatkan kualitas produksi agar memenuhi standar ekspor internasional.',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuALwktJ_vWKVjxqwo80sQ9k4iooIR4Qtqj1ne-cBBhuN1xyZb_kHxV8vSbb0fQIj4Z8FHjyfivi7kTDuVzgrQYv2N7Pnkg6RO7AMdnvXT0PzR1khRLCbBN9G3m8tnNnm5Eg9OtKcGXqBH_u95UpD2p0TW3dy776YPdoKRplaFMwYYFiGvMgZcR9Y6Djlb-qxy_RBYYNryQtYa4tuNFaJpa79vRVNA1F5Dv6oCfPBfDbWiXQ5p18EjeZ',
 '8 Okt 2023', 'Pasar'),
('4', 'Workshop Pengelolaan Tambak Modern di Surabaya',
 'Workshop pengelolaan tambak modern akan diselenggarakan di Surabaya pada November 2023, terbuka untuk umum.',
 E'BPW P3UW bekerjasama dengan Dinas Perikanan Jawa Timur akan menyelenggarakan workshop pengelolaan tambak modern di Surabaya pada tanggal 15-17 November 2023.\n\nWorkshop ini akan membahas berbagai topik penting:\n- Teknologi IoT untuk monitoring kualitas air\n- Sistem bioflok untuk budidaya intensif\n- Manajemen pakan otomatis\n- Penanganan penyakit udang\n\nPeserta workshop akan mendapatkan sertifikat dan modul pelatihan lengkap. Pendaftaran dibuka mulai 20 Oktober 2023 melalui website resmi BPW P3UW.',
 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf7sqLARM8ygwNmvDnw1r0_5LqgArlo3R1NFZOnzJqc9eDLuyw8APvitk6VkL6AtgP3_rPBFRrjd1DubHP7q_KY7Q9O_983-p8f0rIF1llu4IleF3ELXzBteO-z92deCYkx4zh5X2TY-4ckkYR-SeQQzBXA1Z-ijDd5OGFpalf8SGnzQ6xP4_JRKOZmu4Z_Penc-db1U0UU30M948frJzUxQ7SYnJVgZwuo1_5YF0qwMcOCC_BGu0h',
 '5 Okt 2023', 'Event')
on conflict ("id") do nothing;

-- promos
insert into promos ("id", "title", "description", "buttonText", "icon", "imageUrl") values
('1', 'Butuh Modal Ternak?', 'Ajukan pinjaman Investasi 1000 dengan bunga ringan.', 'Daftar Sekarang', 'savings', null),
('2', 'Bibit Unggul Vanamei', 'Dapatkan bibit kualitas ekspor harga subsidi.', 'Cek Stok', null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf7sqLARM8ygwNmvDnw1r0_5LqgArlo3R1NFZOnzJqc9eDLuyw8APvitk6VkL6AtgP3_rPBFRrjd1DubHP7q_KY7Q9O_983-p8f0rIF1llu4IleF3ELXzBteO-z92deCYkx4zh5X2TY-4ckkYR-SeQQzBXA1Z-ijDd5OGFpalf8SGnzQ6xP4_JRKOZmu4Z_Penc-db1U0UU30M948frJzUxQ7SYnJVgZwuo1_5YF0qwMcOCC_BGu0h')
on conflict ("id") do nothing;

-- info_items
insert into info_items ("id", "title", "content", "icon") values
('1', 'Tentang BPW P3UW',
 'Badan Pengelola Wilayah Pusat Pengembangan dan Pemberdayaan Usaha Walet (BPW P3UW) adalah lembaga yang berperan dalam pengembangan sektor perikanan udang di Indonesia. Kami berkomitmen untuk mendukung petambak melalui edukasi, akses modal, dan informasi pasar terkini.',
 'info'),
('2', 'Visi & Misi',
 E'Visi: Menjadi pusat informasi dan pengembangan usaha perikanan udang terdepan di Indonesia.\n\nMisi:\n1. Menyediakan informasi harga pasar yang akurat dan real-time\n2. Memberikan edukasi dan pelatihan budidaya modern\n3. Memfasilitasi akses permodalan bagi petambak\n4. Mendorong praktik budidaya yang berkelanjutan',
 'visibility'),
('3', 'Kontak Kami',
 E'Alamat: Jl. Perikanan No. 123, Jakarta Utara\nTelepon: (021) 1234-5678\nEmail: info@bpwp3uw.go.id\nWhatsApp: 0812-3456-7890\n\nJam Operasional:\nSenin - Jumat: 08:00 - 16:00 WIB\nSabtu: 08:00 - 12:00 WIB',
 'contact_support'),
('4', 'Program Investasi 1000',
 E'Program Investasi 1000 adalah inisiatif pemerintah untuk memberdayakan 1000 petambak udang melalui pembiayaan berbunga rendah. Program ini menyediakan modal usaha mulai dari Rp 10 juta hingga Rp 500 juta dengan bunga hanya 3% per tahun.\n\nSyarat pendaftaran:\n- WNI berusia 21-60 tahun\n- Memiliki lahan tambak\n- Tergabung dalam kelompok petambak\n- Memiliki pengalaman budidaya minimal 2 tahun',
 'account_balance_wallet')
on conflict ("id") do nothing;

-- harvest_data
insert into harvest_data ("id", "nama", "alamatTambak", "tonase", "size", "tanggal") values
('1', 'Budi Santoso', 'Tambak Blok A-12, Desa Margasari, Kec. Labuhan Maringgai, Lampung Timur', 2.5, 30, '10 Okt 2023'),
('2', 'Ahmad Hidayat', 'Tambak Blok B-05, Desa Sriminosari, Kec. Labuhan Maringgai, Lampung Timur', 1.8, 50, '8 Okt 2023'),
('3', 'Siti Rahayu', 'Tambak Blok C-08, Desa Muara Gading Mas, Kec. Labuhan Maringgai, Lampung Timur', 3.2, 40, '5 Okt 2023'),
('4', 'Hendra Wijaya', 'Tambak Blok D-03, Desa Margasari, Kec. Labuhan Maringgai, Lampung Timur', 2.0, 60, '3 Okt 2023'),
('5', 'Surya Pratama', 'Tambak Blok E-07, Desa Sriminosari, Kec. Labuhan Maringgai, Lampung Timur', 1.5, 45, '1 Okt 2023'),
('6', 'Dewi Lestari', 'Tambak Blok A-03, Desa Margasari, Kec. Labuhan Maringgai, Lampung Timur', 2.8, 35, '28 Sep 2023'),
('7', 'Agus Setiawan', 'Tambak Blok B-11, Desa Muara Gading Mas, Kec. Labuhan Maringgai, Lampung Timur', 3.0, 40, '25 Sep 2023'),
('8', 'Rina Wulandari', 'Tambak Blok C-02, Desa Sriminosari, Kec. Labuhan Maringgai, Lampung Timur', 1.2, 55, '22 Sep 2023'),
('9', 'Bambang Sutrisno', 'Tambak Blok D-09, Desa Margasari, Kec. Labuhan Maringgai, Lampung Timur', 2.3, 38, '20 Sep 2023'),
('10', 'Sri Mulyani', 'Tambak Blok E-01, Desa Muara Gading Mas, Kec. Labuhan Maringgai, Lampung Timur', 1.9, 42, '18 Sep 2023'),
('11', 'Joko Widodo', 'Tambak Blok A-15, Desa Sriminosari, Kec. Labuhan Maringgai, Lampung Timur', 2.7, 32, '15 Sep 2023'),
('12', 'Andi Firmansyah', 'Tambak Blok B-08, Desa Margasari, Kec. Labuhan Maringgai, Lampung Timur', 3.5, 28, '12 Sep 2023')
on conflict ("id") do nothing;

-- ===========================================================================
-- Akun Admin (username / password: admin / bpw2024udang)
-- password_hash = SHA-256('bpw2024udang')
-- ===========================================================================
insert into admins ("username", "password_hash") values
('admin', '05a849ab77bf24dc6d7fb1ac570545e277dfb22b2fb853ccf2483148d1e29649')
on conflict ("username") do nothing;

-- ===========================================================================
-- Tabel: site_settings (profil organisasi + tema warna)
-- Satu baris saja (id = 'default').
-- ===========================================================================
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
   "locationMode"  text default 'manual',
   "showWeather"   boolean default true
);

-- Migrasi: tambahkan kolom jika schema lama sudah dijalankan sebelumnya
alter table site_settings add column if not exists "backgroundColor" text;
alter table site_settings add column if not exists "locationName" text;
alter table site_settings add column if not exists "latitude" text;
alter table site_settings add column if not exists "longitude" text;
alter table site_settings add column if not exists "locationMode" text default 'manual';
alter table site_settings add column if not exists "showWeather" boolean default true;

alter table site_settings enable row level security;
create policy "public_read_site_settings" on site_settings for select using (true);
create policy "anon_write_site_settings"  on site_settings for all using (true) with check (true);

-- Izinkan kelola akun admin dari panel (tulis via anon key).
-- Catatan: karena SPA memakai anon key, write ini terbuka untuk anon.
-- Untuk produksi, batasi via Supabase Auth (role terbatas).
create policy "anon_write_admins" on admins for all using (true) with check (true);

-- Seed pengaturan awal
insert into site_settings ("id", "orgName", "regionName", "primaryColor", "secondaryColor", "backgroundColor", "locationName", "latitude", "longitude", "showWeather") values
('default', 'BPW P3UW', 'Wilayah Lampung Timur', '#00dddd', '#89ceff', '#0b1326', 'Labuhan Maringgai, Lampung Timur', '-5.3833', '105.4667', true)
on conflict ("id") do nothing;

-- Update baris yang sudah ada agar kolom baru terisi
update site_settings set
  "locationName" = coalesce("locationName", 'Labuhan Maringgai, Lampung Timur'),
  "latitude" = coalesce("latitude", '-5.3833'),
  "longitude" = coalesce("longitude", '105.4667'),
  "showWeather" = coalesce("showWeather", true)
where "id" = 'default';

-- Aktifkan Realtime agar perubahan tema/settings langsung tersebar ke
-- semua tab/instance yang terbuka (tanpa perlu refresh).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'site_settings'
  ) then
    alter publication supabase_realtime add table site_settings;
  end if;
end $$;

-- ===========================================================================
-- Tabel: weather_cache (snapshot cuaca & pasang surut dari Open-Meteo)
-- Data tidak dihitung di server, melainkan di-fetch dari Open-Meteo di
-- browser lalu disimpan ke sini agar tetap tersedia (cache) dan bisa dibaca
-- ulang jika API sedang gagal. Satu baris per lokasi (kunci = koordinat).
-- ===========================================================================
create table if not exists weather_cache (
  "id"           text primary key,
  "latitude"     text,
  "longitude"    text,
  "locationName" text,
  "payload"      jsonb,
  "fetchedAt"    timestamptz default now()
);

alter table weather_cache enable row level security;
create policy "public_read_weather_cache" on weather_cache for select using (true);
create policy "anon_write_weather_cache"  on weather_cache for all using (true) with check (true);

grant select, insert, update, delete on table weather_cache to anon, authenticated;

-- ===========================================================================
-- GRANT akses ke role anon & authenticated
-- PENTING: tabel yang dibuat lewat SQL Editor TIDAK otomatis mendapat grant,
-- sehingga role anon bisa membaca tapi GAGAL menulis (data tidak tersimpan /
-- reset setelah reload). Berikan hak CRUD secara eksplisit. RLS + policy di
-- atas tetap mengatur siapa yang boleh akses.
-- ===========================================================================
grant select, insert, update, delete on table banners        to anon, authenticated;
grant select, insert, update, delete on table shrimp_prices  to anon, authenticated;
grant select, insert, update, delete on table news           to anon, authenticated;
grant select, insert, update, delete on table promos         to anon, authenticated;
grant select, insert, update, delete on table info_items     to anon, authenticated;
grant select, insert, update, delete on table harvest_data   to anon, authenticated;
grant select, insert, update, delete on table admins         to anon, authenticated;
grant select, insert, update, delete on table site_settings  to anon, authenticated;
