# Sistem Booking Lapangan Olahraga

**Nama:** Nathasya Herdaningsih  
**NIM:** 2410511139  
**Kelas:** B  
**Mata Kuliah:** Pembangunan Perangkat Lunak Berorientasi Service

## Deskripsi
Sistem booking lapangan olahraga berbasis microservice dengan fitur listing lapangan,
jadwal slot per jam, booking dengan DP, pembayaran lunas, dan dashboard pemilik lapangan.

## Arsitektur
- API Gateway (Node.js) — port 8000
- auth-service (Node.js + Express) — port 3001
- field-service (CodeIgniter 4) — port 3002
- booking-service (Node.js + Express) — port 3003

## Cara Menjalankan

### Prasyarat
- Node.js
- PHP 8.2 + Composer
- MariaDB/MySQL (XAMPP)

### Setup Database
Jalankan SQL berikut di MariaDB:
- `db_auth` — untuk auth-service
- `db_field` — untuk field-service  
- `db_booking` — untuk booking-service

### Jalankan Services
```bash
# Auth Service
cd services/auth-service
npm install
node index.js

# Field Service
cd services/field-service
php spark serve --port 3002

# Booking Service
cd services/booking-service
npm install
node index.js

# API Gateway
cd gateway
npm install
node index.js
```

## Peta Endpoint

| Method | Path | Keterangan |
|--------|------|------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login + dapat JWT |
| POST | /api/auth/refresh | Refresh token |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/profile | Profile user |
| GET | /api/auth/oauth/github | Login GitHub OAuth |
| GET | /api/fields | List lapangan |
| POST | /api/fields | Tambah lapangan |
| GET | /api/fields/:id | Detail lapangan |
| PUT | /api/fields/:id | Update lapangan |
| DELETE | /api/fields/:id | Hapus lapangan |
| GET | /api/bookings | List booking saya |
| POST | /api/bookings | Buat booking + DP |
| GET | /api/bookings/:id | Detail booking |
| DELETE | /api/bookings/:id | Cancel booking |
| POST | /api/bookings/payment/full | Bayar lunas |

## Demo Video
(akan diupdate)