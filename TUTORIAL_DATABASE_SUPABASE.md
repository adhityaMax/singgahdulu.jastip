# Database dan login username

## Database baru

Jalankan seluruh `supabase_schema.sql` melalui Supabase SQL Editor. Isi `.env` berdasarkan `.env.example` untuk koneksi frontend. Script schema juga membuat tabel master `roles` dan profil pengguna dengan `role_id` serta `username` unik.

## Database yang sudah ada

Jika `profiles.role_id` sudah ada seperti pada screenshot, cukup jalankan `supabase/migrations/20260916_username_login.sql`. Jika masih memakai kolom teks `role`, jalankan `20260916_normalize_roles.sql` terlebih dahulu. SQL tidak membuat akun admin atau menyimpan password dalam tabel profil.

## Membuat admin

Tabel profiles kosong berarti belum ada profil akun. Buat akun melalui script berikut agar Supabase Auth dan profil dibuat bersama, bukan Insert manual ke profiles.

1. Buat file `.env.admin` di root proyek (sudah diabaikan Git):

```dotenv
SUPABASE_URL=https://PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ISI_SERVICE_ROLE_KEY
ADMIN_USERNAME=admin
ADMIN_PASSWORD=GantiPasswordKuatAnda123!
ADMIN_NAME=Administrator
```

2. Jalankan di terminal terpisah, tanpa mematikan dev server:

```sh
node --env-file=.env.admin scripts/create-admin.mjs
```

3. Login dengan username `admin` dan password yang Anda isi di `ADMIN_PASSWORD`. Contoh di atas belum menjadi akun sampai script berhasil dijalankan. Script tidak mencetak password. Service-role key hanya untuk script lokal ini: jangan gunakan nama variabel `VITE_` dan jangan masukkan ke frontend.

Alternatif tanpa script: setelah migrasi, buat user di Authentication > Users dengan alamat internal `admin@users.singgahdulu.invalid`, password pilihan Anda, dan Auto Confirm User. Setelah akun dibuat, jalankan:

```sql
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin'), name = 'Administrator'
WHERE username = 'admin';
```

Login di aplikasi tetap menggunakan `admin`, bukan alamat internal tersebut.

## Akun email lama

Migrasi memberi username sementara `user_<uuid>` untuk akun email lama, tanpa mengubah kredensial Auth. Untuk mengaktifkan login username akun lama, isi `ADMIN_EXISTING_USER_ID` dengan UUID akun tersebut di `.env.admin`, lalu jalankan script. Langkah ini mengubah alamat Auth menjadi alamat internal, mengganti password sesuai file, dan menjadikan akun tersebut admin; jangan gunakan untuk konversi akun driver/koordinator. ID akun dan relasi data tetap dipertahankan. Jangan mengubah username hanya melalui Table Editor karena alamat internal Auth harus ikut sesuai.

## Role dan relasi

| Role | Hak akses |
| --- | --- |
| admin | Kelola batch, order, biaya, pelunasan, dan settings |
| koordinator | Kelola batch, order, biaya, dan pelunasan |
| driver | Baca data operasional |

```sql
SELECT p.id, p.username, p.name, p.role_id, r.name AS role_name
FROM public.profiles p JOIN public.roles r ON r.id = p.role_id;
```

Password tetap dikelola Supabase Auth. Form hanya meminta username dan password; alamat `<username>@users.singgahdulu.invalid` dipakai internal sebagai identitas Auth, bukan email untuk menerima pesan. Reset password dilakukan admin melalui Supabase, karena alamat internal tidak menerima email. Username 3?40 huruf, angka, atau underscore, disimpan huruf kecil. Jangan membuka pendaftaran umum untuk aplikasi operasional ini.

Tanpa konfigurasi Supabase, akun demo lokal adalah `admin` / `admin123`. Akun demo ini tidak otomatis ada di Supabase. Data lokal tidak diunggah otomatis.

Referensi: [Supabase Admin createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser).

## Error `column profiles.role does not exist`

Source terbaru membaca `role_id` dengan join `roles`. Jika error ini tetap muncul, fungsi pemeriksaan role di database kemungkinan masih versi lama. Jalankan `supabase/migrations/20260916_fix_role_lookup.sql` di SQL Editor, lalu refresh aplikasi dan login lagi. Script memperbarui `current_app_role()` serta akses baca master role tanpa mengubah akun/password. Tidak perlu membuat ulang akun.

Jika tetap muncul, periksa definisi fungsi yang benar-benar terpasang:

```sql
SELECT pg_get_functiondef('public.current_app_role()'::regprocedure);
```

Definisi tersebut harus memakai `JOIN public.roles` dan `p.role_id`, bukan `profiles.role`. Pastikan frontend telah memuat source terbaru dan proyek Supabase yang dibuka sama dengan `VITE_SUPABASE_URL`.
