# ZOOM-STA: Zoom Management System
### STIPER Santo Thomas Aquinas Jayapura

Dashboard dan control panel resmi institusi **STIPER Santo Thomas Aquinas Jayapura** untuk mengelola akun Zoom institusi (`stipersta@gmail.com`) secara terpusat, aman, dan efisien via Zoom API resmi.

---

## 🚀 Fitur Utama

- **Dashboard Utama**: Status akun Zoom realtime, statistik rapat, rapat hari ini, dan aksi cepat.
- **Manajemen Rapat**: Buat jadwal, ubah, hapus, mulai rapat instan, dan tinjau detail rapat.
- **Template Rapat**: Template siap pakai (Kuliah Umum, Rapat Akademik, Sidang Skripsi, Seminar Online).
- **Kalender Rapat**: Tampilan kalender interaktif bulanan dan daftar agenda.
- **Peserta & Presensi**: Pelacakan peserta rapat selesai, perhitungan rasio kehadiran, dan ambang batas presensi (15m, 30m, 45m, 60m).
- **Rekaman Cloud**: Tinjau rekaman Zoom Cloud, file video MP4, audio M4A, transkrip, salin link, dan hapus rekaman.
- **Webinar & Pengguna**: Deteksi lisensi Webinar otomatis dan daftar akun berlisensi Zoom.
- **Laporan & Statistik**: Visualisasi tren peserta dan durasi menit pertemuan.
- **Audit & Activity Log**: Pencatatan riwayat setiap aksi administratif.
- **Teks Undangan Resmi**: Generator format undangan Zoom resmi untuk disalin ke WhatsApp/Email.
- **Zona Waktu Jayapura**: Dikonfigurasi presisi untuk `Asia/Jayapura` (WIT / UTC+9).
- **Zoom Webhook**: Endpoint `/api/webhooks/zoom` untuk event update otomatis.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui inspired glassmorphism UI
- **Icons**: Lucide React
- **Authentication**: NextAuth.js / Auth.js (JWT Strategy)
- **Validation**: Zod
- **Zoom API**: Server-to-Server OAuth Client dengan exponential backoff pada 429 rate limit
- **Database**: PostgreSQL / SQLite abstraction layer

---

## 📋 Prasyarat

1. Node.js v20+ atau Node.js v24+
2. Akun Zoom Marketplace (untuk membuat App Server-to-Server OAuth)

---

## ⚙️ Setup Zoom Developer App (Server-to-Server OAuth)

1. Buka [Zoom App Marketplace](https://marketplace.zoom.us/) dan login dengan akun `stipersta@gmail.com` atau admin institusi.
2. Klik **Develop** -> **Build App** -> pilih **Server-to-Server OAuth**.
3. Berikan nama aplikasi (misal: `ZOOM-STA Control`).
4. Salin **Account ID**, **Client ID**, dan **Client Secret**.
5. Pada tab **Scopes**, tambahkan minimal izin berikut:
   - `meeting:read:admin` / `meeting:read`
   - `meeting:write:admin` / `meeting:write`
   - `user:read:admin` / `user:read`
   - `recording:read:admin` / `recording:read`
   - `recording:write:admin` / `recording:write`
   - `report:read:admin` / `report:read`
   - `webinar:read:admin` (opsional jika memiliki lisensi webinar)
6. Klik **Activate App**.

---

## 💻 Instalasi & Menjalankan Aplikasi

1. **Clone repository dan salin environment variables:**
   ```bash
   cp .env.example .env.local
   ```

2. **Sesuaikan `.env.local`:**
   ```env
   AUTH_SECRET="buat-secret-acak-32-karakter"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="password"

   ZOOM_ACCOUNT_ID="your_account_id"
   ZOOM_CLIENT_ID="your_client_id"
   ZOOM_CLIENT_SECRET="your_client_secret"
   ZOOM_USER_ID="stipersta@gmail.com"
   DEFAULT_TIMEZONE="Asia/Jayapura"
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```

4. **Build untuk production:**
   ```bash
   npm run build
   npm run start
   ```

5. Buka `http://localhost:3000` di browser dan login dengan kredensial administrator.

---

## 📡 Internal API Endpoints

- `GET/POST /api/zoom/meetings` - Ambil daftar dan buat rapat baru
- `GET/PATCH/DELETE /api/zoom/meetings/[id]` - Operasi per rapat
- `GET /api/zoom/account` - Status akun Zoom institusi
- `GET /api/zoom/participants` - Data peserta rapat
- `GET /api/zoom/recordings` - Daftar rekaman Zoom cloud
- `GET /api/zoom/users` - Daftar user berlisensi
- `GET /api/zoom/reports` - Laporan statistik
- `GET/POST /api/zoom/webinars` - Modul webinar
- `POST /api/zoom/sync` - Sinkronisasi manual seluruh data
- `POST /api/webhooks/zoom` - Endpoint webhook Zoom realtime

---

## 🔒 Keamanan

- Semua interaksi Zoom API dan secret key hanya dieksekusi di sisi server (**Server Components / Server Actions / Route Handlers**).
- Tidak ada token atau secret yang diekspos ke frontend browser.
- Route dashboard diproteksi middleware autentikasi.

---

© 2026 STIPER Santo Thomas Aquinas Jayapura
