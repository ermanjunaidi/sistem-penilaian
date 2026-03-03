# 🎓 Sistem Penilaian Hasil Belajar Intrakurikuler - Kurikulum Merdeka

Sistem informasi manajemen penilaian hasil belajar untuk sekolah dengan kurikulum Merdeka. Dibangun dengan React.js (Vite) untuk frontend dan Node.js/Express dengan Drizzle ORM untuk backend.

## 🚀 Fitur Utama

### Modul Sistem
- **INFORMASI UMUM** - Informasi Umum, Data Sekolah, Data Siswa, Mata Pelajaran
- **KURIKULUM** - Intrakurikuler, Ekstrakurikuler
- **INPUT** - Tujuan Pembelajaran, Lingkup Materi, Asesmen Formatif, Asesmen Sumatif
- **PENILAIAN** - Penilaian Ekstrakurikuler, Nilai Akhir
- **CETAK** - Sampul Rapor, Rapor
- **LAPORAN** - Mutasi, Buku Induk

### Role-Based Access Control
| Role | Akses |
|------|-------|
| **Superadmin** | Full akses ke semua fitur, manajemen user |
| **Admin** | Manajemen data sekolah, siswa, guru |
| **Wali Kelas** | Manajemen siswa kelasnya, nilai, rapor |
| **Guru** | Input nilai, asesmen, tujuan pembelajaran |

### Fitur Excel
- Export data siswa ke Excel
- Import data siswa dari Excel
- Download template Excel
- Format lengkap dengan validasi

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL (Supabase)
- npm atau yarn

## 🛠️ Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd sistem-penilaian
```

### 2. Install Dependencies
```bash
# Install frontend & backend
npm run install:all
```

### 3. Setup Database
```bash
# Setup database (migrate + seed)
npm run db:setup
```

### 4. Konfigurasi Environment

**Backend (.env di folder backend/):**
```env
DATABASE_URL=postgresql://postgres.xxx:password@host:6543/postgres
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env di root):**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Menjalankan Aplikasi

### Development Mode

**Jalankan Frontend & Backend bersamaan:**
```bash
npm run dev:all
```

**Atau jalankan terpisah:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev
```

### Production Build
```bash
# Build frontend
npm run build

# Build backend
npm run build:backend
```

## 👤 Default Users

Setelah menjalankan `npm run db:setup`, gunakan credentials berikut:

| Email | Password | Role |
|-------|----------|------|
| superadmin@school.id | admin123 | superadmin |
| admin@school.id | admin123 | admin |
| walikelas@school.id | guru123 | wali_kelas |
| guru@school.id | guru123 | guru |

## 📁 Struktur Folder

```
sistem-penilaian/
├── src/                    # Frontend React
│   ├── components/
│   │   └── layout/
│   ├── context/
│   ├── pages/
│   │   ├── auth/
│   │   ├── informasi/
│   │   ├── data/
│   │   ├── input/
│   │   ├── penilaian/
│   │   ├── cetak/
│   │   └── laporan/
│   ├── services/
│   │   └── api.js
│   └── App.jsx
├── backend/                # Backend Express
│   ├── src/
│   │   ├── drizzle/
│   │   │   ├── migrations/
│   │   │   ├── migrate.js
│   │   │   └── seed.js
│   │   ├── lib/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── siswa.js
│   │   │   ├── sekolah.js
│   │   │   ├── mapel.js
│   │   │   ├── ekstra.js
│   │   │   └── penilaian.js
│   │   ├── schema/
│   │   │   └── index.js
│   │   └── server.js
│   ├── .env
│   ├── drizzle.config.js
│   └── package.json
└── package.json
```

## 🔐 Security Features

- JWT Authentication
- Password hashing dengan bcrypt
- Role-based access control
- Protected API routes
- Activity logging

## 📊 Database Schema

### Tables
- `users` - User accounts dengan role
- `data_sekolah` - Informasi sekolah
- `informasi_umum` - Tahun ajaran, semester, kelas
- `data_siswa` - Data siswa
- `mata_pelajaran` - Mata pelajaran
- `ekstrakurikuler` - Ekstrakurikuler
- `tujuan_pembelajaran` - Tujuan pembelajaran
- `lingkup_materi` - Lingkup materi
- `asesmen_formatif` - Nilai formatif
- `asesmen_sumatif` - Nilai sumatif
- `penilaian_ekstrakurikuler` - Nilai ekstra
- `nilai_akhir` - Nilai akhir kalkulasi
- `mutasi` - Mutasi siswa
- `activity_logs` - Log aktivitas

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run dev:all` | Start both frontend & backend |
| `npm run build` | Build frontend for production |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with default data |
| `npm run db:setup` | Migrate + Seed |

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (superadmin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Siswa
- `GET /api/siswa` - Get all students
- `POST /api/siswa` - Create student
- `POST /api/siswa/bulk` - Bulk import
- `PUT /api/siswa/:id` - Update student
- `DELETE /api/siswa/:id` - Delete student

### Dan lain-lain...

## 📝 License

MIT License

## 👨‍💻 Developer

Sistem Penilaian Kurikulum Merdeka

---

**Catatan:** Pastikan untuk mengubah `JWT_SECRET` dan credentials default sebelum deploy ke production!
