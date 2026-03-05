# Sistem Penilaian Hasil Belajar Intrakurikuler - Kurikulum Merdeka

Sistem informasi manajemen penilaian hasil belajar untuk sekolah dengan kurikulum Merdeka. Frontend menggunakan React (Vite), backend menggunakan Go, dan database PostgreSQL.

## Fitur Utama

- Informasi umum: informasi sekolah, data siswa, mata pelajaran
- Kurikulum: intrakurikuler dan ekstrakurikuler
- Input penilaian: tujuan pembelajaran, lingkup materi, asesmen formatif, asesmen sumatif
- Penilaian: penilaian ekstrakurikuler dan nilai akhir
- Cetak: sampul rapor dan rapor
- Laporan: mutasi dan buku induk

## Role

- `superadmin`: akses penuh + manajemen user
- `admin`: manajemen data sekolah/siswa/guru
- `wali_kelas`: manajemen siswa kelas dan rapor
- `guru`: input asesmen dan nilai

## Prasyarat

- Node.js >= 18
- Go >= 1.22
- PostgreSQL

## Instalasi

```bash
git clone <repository-url>
cd sistem-penilaian
npm install
```

## Konfigurasi Environment

Buat file `.env` di root project untuk frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

Buat file `backend/.env` untuk backend:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
JWT_SECRET=change-this-in-production
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Menjalankan Aplikasi

Jalankan frontend dan backend bersamaan:

```bash
npm run dev:all
```

Atau terpisah:

```bash
# Backend Go
npm run dev:backend

# Frontend
npm run dev
```

## Build Production

```bash
npm run build
npm run build:backend
```

## Deploy Local Dengan Docker Compose

Jalankan semua service (`frontend + backend + database`):

```bash
npm run docker:up
```

Sebelum menjalankan, salin `.env.docker.example` menjadi `.env.docker` lalu sesuaikan nilainya jika diperlukan.

Atau tanpa npm script:

```bash
docker compose --env-file .env.docker up -d --build
```

Akses aplikasi:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000/api`
- PostgreSQL: `localhost:5432`

Stop service:

```bash
npm run docker:down
```

## Setup Database

Jalankan setup otomatis (migrasi schema + seed default user):

```bash
npm run db:setup
```

Default user yang di-seed:

- `superadmin@school.id` / `admin123`
- `admin@school.id` / `admin123`
- `walikelas@school.id` / `guru123`
- `guru@school.id` / `guru123`

## Struktur Folder

```text
sistem-penilaian/
|- src/                     # Frontend React
|- backend/                 # Backend Go
|  |- cmd/server/main.go
|  |- internal/app/app.go
|  |- go.mod
|  |- go.sum
|  `- README.md
`- package.json
```

## Scripts

- `npm run dev`: jalankan frontend
- `npm run dev:backend`: jalankan backend Go
- `npm run dev:all`: jalankan frontend + backend
- `npm run build`: build frontend
- `npm run build:backend`: build backend Go
- `npm run db:setup`: migrate schema + seed default users
- `npm run docker:up`: build + jalankan seluruh stack Docker
- `npm run docker:down`: stop stack Docker
- `npm run docker:logs`: lihat log Docker compose

## API Dasar

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `GET /api/siswa`
- `GET /api/mapel/mapel`
- `GET /api/penilaian/formatif`

## Catatan

Ubah `JWT_SECRET` dan kredensial default sebelum deploy ke production.
