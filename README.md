# Sistem Pemesanan Restoran (Restaurant Reservation & Ordering System)

Aplikasi Web Sistem Pemesanan Restoran berbasis **Laravel 11**, **React 18**, **Inertia.js**, dan **Tailwind CSS**, dikembangkan untuk **Uji Kompetensi Sertifikasi LSP Okupasi Programmer (BNSP)**.

Sistem dirancang dengan arsitektur monolitik modern berlapis (*Layered Architecture*), mematuhi standar penulisan kode **PSR-12**, menerapkan prinsip **Pemrograman Berorientasi Objek (OOP)** termasuk interface polimorfik, manajemen transaksi basis data atomik (`DB::transaction`), serta dilengkapi 64 unit & feature automated tests (**PHPUnit**).

---

## 🚀 Fitur Utama

- **Multi-Role Authentication**: Pemisahan hak akses antara **Administrator** (akses penuh & analitik) dan **Staf** (operasional harian meja, reservasi, & pesanan).
- **Dashboard Interaktif**: Metrik reservasi, tamu, meja aktif, grafik tren 7 hari, dan ringkasan reservasi hari ini.
- **Manajemen Meja & Pelanggan**: Pencatatan kapasitas, lokasi (indoor/outdoor/vip), status aktif, serta profil pelanggan dengan preferensi dan catatan alergi.
- **Kategori & Menu Makanan/Minuman**: Pengelolaan menu dengan status ketersediaan (*available/out of stock*) dan proteksi *soft-delete*.
- **Reservasi Meja Cerdas**:
  - Validasi jam operasional restoran (10:00 - 22:00).
  - Durasi standar otomatis 2 jam (+120 menit).
  - Algoritma pencegahan bentrok ketersediaan meja (*conflict prevention*).
  - Siklus status: `Dipesan` ➔ `Dikonfirmasi` ➔ `Selesai` / `Dibatalkan`.
- **Pencatatan Pesanan & Perhitungan Otomatis**:
  - Pemesanan menu per meja/reservasi dengan snapshot harga historis.
  - Perhitungan otomatis Pajak Restoran (10%) dan Biaya Layanan (5%) menggunakan interface polimorfik (`SurchargeInterface`).
  - Validasi integritas: reservasi hanya dapat diselesaikan jika pesanan telah selesai dibayar.
- **Laporan & Ekspor PDF**:
  - Filter analitik pendapatan berdasarkan rentang tanggal.
  - Unduh bukti pemesanan meja PDF dan laporan rekapitulasi penjualan PDF via `barryvdh/laravel-dompdf`.
- **Desain UI Premium**: Antarmuka responsif mengadopsi *Colorful Flat Design* (Cobalt Blue `#4361EE`, border flat `#E4E7EF`, Inter font, dan Lucide React outline icons tanpa emoji).

---

## 🛠️ Tech Stack

- **Backend**: PHP 8.2+, Laravel 11.x, Eloquent ORM, Laravel Breeze
- **Frontend**: React 18.x, Inertia.js 2.x, Tailwind CSS 3.4.x, Lucide React
- **Basis Data**: MySQL / MariaDB 10.x (Testing: SQLite in-memory)
- **Ekspor Dokumen**: `barryvdh/laravel-dompdf`
- **Testing & QA**: PHPUnit 11.x (64 test cases, 218 assertions), Laravel Pint (PSR-12)

---

## 📋 Panduan Instalasi (Setelah Clone ke Laptop)

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal:

### 1. Clone Repository & Masuk ke Direktori
```bash
git clone <URL_REPOSITORY_ANDA>
cd restaurant-app
```

### 2. Instal Dependensi Backend & Frontend
```bash
# Instal paket PHP (Composer)
composer install

# Instal dependensi JavaScript (NPM)
npm install
```

### 3. Konfigurasi Environment (.env)
Salin berkas konfigurasi template:
```bash
# Di Windows (Command Prompt / PowerShell)
copy .env.example .env

# Di Linux / macOS
cp .env.example .env
```

Generate application key:
```bash
php artisan key:generate
```

### 4. Konfigurasi Basis Data MySQL
Pastikan server MySQL (XAMPP / Laragon / MySQL Service) sudah aktif, lalu buat basis data bernama `restaurant_db`:
```sql
CREATE DATABASE restaurant_db;
```

Buka berkas `.env` dan sesuaikan koneksi database jika menggunakan kredensial berbeda:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restaurant_db
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Jalankan Migrasi & Seeder Awal
Perintah berikut akan membuat seluruh skema tabel dan mengisi akun demo serta master data contoh:
```bash
php artisan migrate:fresh --seed
```

### 6. Kompilasi Aset Frontend
```bash
# Mode Produksi (Cepat & Siap Pakai)
npm run build

# ATAU Mode Development (Live Reload / HMR)
npm run dev
```

### 7. Jalankan Server Aplikasi
```bash
php artisan serve
```
Akses aplikasi melalui peramban web di: **`http://localhost:8000`**

---

## 🔑 Akun Bawaan (Default Credentials)

Setelah menjalankan `db:seed`, akun berikut siap digunakan untuk login:

| Peran (Role) | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@resto.com` | `password` | Akses penuh (Dashboard, Master Data, Meja, Menu, Pengguna, Laporan PDF) |
| **Staf (Kasir/Pelayan)** | `staf@resto.com` | `password` | Operasional (Pelanggan, Reservasi Meja, Pesanan Menu, Cetak Bukti PDF) |

---

## 🧪 Pengujian Otomatis & Standar Kode

### Menjalankan Automated Tests (PHPUnit)
```bash
php artisan test
```
*Hasil: 64 passed, 218 assertions (100% lulus).*

### Menjalankan Linter Standar PSR-12 (Laravel Pint)
```bash
vendor/bin/pint --test
```
*Hasil: Zero lint errors.*

---

## 📁 Struktur Direktori Utama

```
restaurant-app/
├── app/
│   ├── Contracts/           # Interface polimorfik (SurchargeInterface)
│   ├── Enums/               # Backed Enums (Role, ReservationStatus, OrderStatus)
│   ├── Http/Controllers/    # Controller penangan HTTP request Inertia
│   ├── Http/Requests/       # Form Request validasi input server-side
│   ├── Models/              # Eloquent ORM Models (User, Reservation, Order, dll)
│   └── Services/            # Business Logic Layer (ReservationService, OrderService)
├── config/                  # Konfigurasi sistem (restaurant.php)
├── database/
│   ├── factories/           # Model Factories untuk pengujian otomatis
│   ├── migrations/          # Definisi skema tabel basis data
│   └── seeders/             # DatabaseSeeder (Akun demo, meja, menu, pelanggan)
├── resources/
│   ├── js/                  # Frontend React + Inertia Components & Pages
│   │   ├── Components/      # Komponen UI Flat Design (Button, Table, Modal, dll)
│   │   ├── Layouts/         # GuestLayout & AuthenticatedLayout (Sidebar)
│   │   └── Pages/           # Halaman Antarmuka (Dashboard, Reservasi, Order, dll)
│   └── views/               # Blade root template & template PDF
├── routes/                  # Definisi routing web (web.php, auth.php)
└── tests/                   # Otomasi pengujian (Unit & Feature tests)
```

---

## 📄 Lisensi

Aplikasi ini dilisensikan di bawah lisensi [MIT](LICENSE).
