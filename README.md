# Sistem Booking Lapangan Olahraga

> UTS Pembangunan Perangkat Lunak Berorientasi Service — Kelas B

## Identitas
**Nama**                  : Nathasya Herdaningsih  
**NIM**                   : 2410511139  
**Program Studi / Kelas** : S1 Informatika / B  
**Mata Kuliah**           : Pembangunan Perangkat Lunak Berorientasi Service - UTS

---

## Demo Video
https://youtu.be/QmshVakF94k

---

## Arsitektur
[Client / Postman]
↓
[API Gateway :8000]
↓
[auth-service :3001] [field-service :3002] [booking-service :3003]
[db_auth]            [db_field]            [db_booking]

### Peta Routing
| Path | Service | Port |
|------|---------|------|
| /api/auth/* | auth-service | 3001 |
| /api/fields/* | field-service | 3002 |
| /api/bookings/* | booking-service | 3003 |

---

## Cara Menjalankan

### Prasyarat
- Node.js v18+
- PHP 8.2 + Composer
- XAMPP (MySQL)

### 1. Clone Repository
```bash
git clone https://github.com/nthsyaaa21/uts-pplos-b-2410511139.git
cd uts-pplos-b-2410511139
```

### 2. Setup Database
Buka phpMyAdmin dan buat 3 database:
- `db_auth`
- `db_field`
- `db_booking`

### 3. Jalankan Semua Service
```bash
# Terminal 1 - Auth Service
cd services/auth-service && npm install && node index.js

# Terminal 2 - Field Service
cd services/field-service && php spark serve --port 3002

# Terminal 3 - Booking Service
cd services/booking-service && npm install && node index.js

# Terminal 4 - API Gateway
cd gateway && npm install && node index.js
```

---

## Peta Endpoint

### Auth Service (`/api/auth`)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi userbaru |
| POST | `/api/auth/login` | Login + dapat JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout + blacklist token |
| GET | `/api/auth/profile` | Get profile user |
| GET | `/api/auth/oauth/github` | Login via GitHub OAuth |

### Field Service (`/api/fields`) — PHP CodeIgniter 4
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/fields` | List lapangan + paging + filter |
| POST | `/api/fields` | Tambah lapangan |
| GET | `/api/fields/:id` | Detail lapangan |
| PUT | `/api/fields/:id` | Update lapangan |
| DELETE | `/api/fields/:id` | Hapus lapangan |
| GET | `/api/fields/:id/slots` | List slot lapangan |
| POST | `/api/fields/:id/slots` | Tambah slot |

### Booking Service (`/api/bookings`)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/bookings` | Buat booking baru |
| GET | `/api/bookings` | List booking saya |
| GET | `/api/bookings/:id` | Detail booking |
| POST | `/api/bookings/:id/payment/dp` | Bayar DP |
| POST | `/api/bookings/:id/payment/full` | Bayar lunas |
| DELETE | `/api/bookings/:id` | Cancel booking |
| GET | `/api/bookings/dashboard` | Dashboard owner |