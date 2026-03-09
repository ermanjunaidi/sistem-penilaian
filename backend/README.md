# Backend Go - Sistem Penilaian

## Environment

Buat `.env` di root project (atau set env di terminal):

- `DATABASE_URL=postgres://...`
- `JWT_SECRET=...`
- `PORT=5000` (opsional)
- `FRONTEND_URL=http://localhost:5173` (opsional)

## Menjalankan

```bash
cd backend
go mod tidy
go run ./cmd/dbsetup
go run ./cmd/server
```

Server akan expose API yang sama di `http://localhost:5000/api`.

## Docker (Opsional)

Build image backend:

```bash
cd backend
docker build -t sistem-penilaian-backend .
```

Untuk deployment penuh frontend+backend+db, gunakan `docker compose` dari root project.
