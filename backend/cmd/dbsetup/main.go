package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

const migrationVersion = "0001_init_go_schema"

type defaultUser struct {
	Email    string
	Password string
	Nama     string
	NIP      string
	Role     string
	Telepon  string
}

func loadDotEnv(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])
		value = strings.Trim(value, `"'`)
		if key == "" {
			continue
		}
		if _, exists := os.LookupEnv(key); !exists {
			_ = os.Setenv(key, value)
		}
	}
}

func main() {
	loadDotEnv(".env")

	dsn := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if dsn == "" {
		log.Fatal("DATABASE_URL is required")
	}

	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		log.Fatalf("invalid DATABASE_URL: %v", err)
	}

	db, err := pgxpool.NewWithConfig(context.Background(), cfg)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	if err := db.Ping(ctx); err != nil {
		log.Fatalf("database ping failed: %v", err)
	}

	if err := ensureMigrationTable(ctx, db); err != nil {
		log.Fatalf("failed to prepare migrations table: %v", err)
	}

	applied, err := isMigrationApplied(ctx, db, migrationVersion)
	if err != nil {
		log.Fatalf("failed to check migration state: %v", err)
	}

	if !applied {
		if err := runMigration(ctx, db); err != nil {
			log.Fatalf("migration failed: %v", err)
		}
		if _, err := db.Exec(ctx, "INSERT INTO schema_migrations (version, applied_at) VALUES ($1, NOW())", migrationVersion); err != nil {
			log.Fatalf("failed to record migration version: %v", err)
		}
		log.Printf("migration %s applied", migrationVersion)
	} else {
		log.Printf("migration %s already applied", migrationVersion)
	}

	seeded, err := seedDefaultUsers(ctx, db)
	if err != nil {
		log.Fatalf("seeding failed: %v", err)
	}

	log.Printf("db setup done. inserted default users: %d", seeded)
}

func ensureMigrationTable(ctx context.Context, db *pgxpool.Pool) error {
	_, err := db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version text PRIMARY KEY,
			applied_at timestamptz NOT NULL DEFAULT NOW()
		)
	`)
	return err
}

func isMigrationApplied(ctx context.Context, db *pgxpool.Pool, version string) (bool, error) {
	var exists bool
	err := db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)", version).Scan(&exists)
	return exists, err
}

func runMigration(ctx context.Context, db *pgxpool.Pool) error {
	stmts := []string{
		`CREATE EXTENSION IF NOT EXISTS pgcrypto`,
		`CREATE TABLE IF NOT EXISTS users (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			email varchar(255) NOT NULL UNIQUE,
			password varchar(255) NOT NULL,
			nama varchar(255) NOT NULL,
			nip varchar(50) UNIQUE,
			role text NOT NULL DEFAULT 'guru',
			status text NOT NULL DEFAULT 'aktif',
			foto text,
			telepon varchar(20),
			alamat text,
			tanggal_lahir text,
			tempat_lahir varchar(100),
			tanggal_bergabung text DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
			terakhir_login timestamptz,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS data_sekolah (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			nama_sekolah varchar(255) NOT NULL,
			npsn varchar(20),
			alamat text,
			kelurahan varchar(100),
			kecamatan varchar(100),
			kota varchar(100),
			provinsi varchar(100),
			kode_pos varchar(10),
			telepon varchar(20),
			email varchar(255),
			website varchar(255),
			kepala_sekolah varchar(255),
			nip_kepala_sekolah varchar(50),
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS informasi_umum (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			tahun_ajaran varchar(20) NOT NULL,
			semester text NOT NULL DEFAULT '1',
			kelas varchar(50),
			fase text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS data_siswa (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			nis varchar(20),
			nisn varchar(20) NOT NULL UNIQUE,
			nama varchar(255) NOT NULL,
			tempat_lahir varchar(100),
			tanggal_lahir text,
			jenis_kelamin text NOT NULL DEFAULT 'L',
			agama varchar(50),
			alamat text,
			nama_ortu varchar(255) NOT NULL,
			telepon_ortu varchar(20),
			tanggal_masuk text,
			kelas varchar(10),
			status text DEFAULT 'Aktif',
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS mata_pelajaran (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			kode varchar(20),
			nama varchar(255) NOT NULL,
			kelompok text NOT NULL DEFAULT 'A',
			fase text,
			jp_per_minggu text,
			guru varchar(255),
			keterangan text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS data_kelas (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			nama varchar(50) NOT NULL UNIQUE,
			wali_kelas_id uuid,
			wali_kelas varchar(255),
			keterangan text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS ekstrakurikuler (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			kode varchar(20),
			nama varchar(255) NOT NULL,
			jenis text NOT NULL DEFAULT 'Wajib',
			pembina varchar(255),
			jadwal varchar(255),
			tempat varchar(255),
			keterangan text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS mutasi (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			siswa_id uuid NOT NULL REFERENCES data_siswa(id) ON DELETE CASCADE,
			jenis text NOT NULL DEFAULT 'Masuk',
			tanggal text,
			asal_sekolah varchar(255),
			tujuan_sekolah varchar(255),
			alasan text,
			nomor_surat varchar(100),
			keterangan text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS tujuan_pembelajaran (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			mata_pelajaran_id uuid,
			kode varchar(20),
			deskripsi text NOT NULL,
			fase text,
			elemen varchar(100),
			keterangan text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS lingkup_materi (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			mata_pelajaran_id uuid,
			kode varchar(20),
			nama_materi varchar(255) NOT NULL,
			deskripsi text,
			alokasi_waktu text,
			semester text DEFAULT '1',
			keterangan text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS asesmen_formatif (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			mata_pelajaran_id uuid,
			siswa_id uuid,
			jenis text NOT NULL DEFAULT 'Kuis',
			tanggal text,
			nilai text,
			deskripsi text,
			keterangan text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS asesmen_sumatif (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			mata_pelajaran_id uuid,
			siswa_id uuid,
			jenis text NOT NULL DEFAULT 'Sumatif Tengah Semester',
			tanggal text,
			nilai text,
			kkm text DEFAULT '75',
			keterangan text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS penilaian_ekstrakurikuler (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			ekstrakurikuler_id uuid,
			siswa_id uuid,
			semester text NOT NULL DEFAULT '1',
			tahun_ajaran varchar(20),
			nilai text NOT NULL DEFAULT 'A',
			predikat varchar(50),
			deskripsi text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS nilai_akhir (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			mata_pelajaran_id uuid,
			mata_pelajaran varchar(255),
			siswa_id uuid,
			siswa varchar(255),
			nisn varchar(20),
			nilai_formatif text,
			nilai_sumatif text,
			nilai_akhir text,
			predikat varchar(10),
			deskripsi text,
			tahun_ajaran varchar(20),
			semester text,
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS mutasi (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			siswa_id uuid,
			jenis text NOT NULL DEFAULT 'Masuk',
			tanggal text,
			asal_sekolah varchar(255),
			tujuan_sekolah varchar(255),
			alasan text,
			keterangan text,
			nomor_surat varchar(100),
			created_at timestamptz NOT NULL DEFAULT NOW(),
			updated_at timestamptz NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS activity_logs (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id uuid,
			action varchar(100) NOT NULL,
			"table" varchar(100),
			record_id uuid,
			old_value text,
			new_value text,
			ip_address varchar(50),
			user_agent text,
			created_at timestamptz NOT NULL DEFAULT NOW()
		)`,
	}

	for i, stmt := range stmts {
		if _, err := db.Exec(ctx, stmt); err != nil {
			return fmt.Errorf("statement %d failed: %w", i+1, err)
		}
	}

	return nil
}

func seedDefaultUsers(ctx context.Context, db *pgxpool.Pool) (int, error) {
	users := []defaultUser{
		{
			Email:    "superadmin@school.id",
			Password: "admin123",
			Nama:     "Super Administrator",
			NIP:      "ADMIN001",
			Role:     "superadmin",
			Telepon:  "081234567890",
		},
		{
			Email:    "admin@school.id",
			Password: "admin123",
			Nama:     "School Administrator",
			NIP:      "ADMIN002",
			Role:     "admin",
			Telepon:  "081234567891",
		},
		{
			Email:    "walikelas@school.id",
			Password: "guru123",
			Nama:     "Wali Kelas 7A",
			NIP:      "WK001",
			Role:     "wali_kelas",
			Telepon:  "081234567892",
		},
		{
			Email:    "guru@school.id",
			Password: "guru123",
			Nama:     "Guru Mata Pelajaran",
			NIP:      "GR001",
			Role:     "guru",
			Telepon:  "081234567893",
		},
	}

	inserted := 0
	for _, u := range users {
		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), 10)
		if err != nil {
			return inserted, err
		}
		tag, err := db.Exec(ctx, `
			INSERT INTO users (email, password, nama, nip, role, status, telepon)
			VALUES ($1, $2, $3, $4, $5, 'aktif', $6)
			ON CONFLICT (email) DO NOTHING
		`, u.Email, string(hash), u.Nama, u.NIP, u.Role, u.Telepon)
		if err != nil {
			return inserted, err
		}
		inserted += int(tag.RowsAffected())
	}

	if inserted == 0 {
		return 0, nil
	}
	return inserted, nil
}
