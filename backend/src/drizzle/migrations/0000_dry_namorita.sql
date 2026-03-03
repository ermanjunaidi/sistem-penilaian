CREATE TYPE "public"."fase" AS ENUM('A', 'B', 'C', 'D', 'E', 'F');--> statement-breakpoint
CREATE TYPE "public"."jenis_asemen" AS ENUM('Kuis', 'Tugas', 'Observasi', 'Presentasi', 'Diskusi', 'Lainnya');--> statement-breakpoint
CREATE TYPE "public"."jenis_asemen_sumatif" AS ENUM('Sumatif Tengah Semester', 'Sumatif Akhir Semester', 'Sumatif Akhir Tahun');--> statement-breakpoint
CREATE TYPE "public"."jenis_ekstra" AS ENUM('Wajib', 'Pilihan');--> statement-breakpoint
CREATE TYPE "public"."jenis_kelamin" AS ENUM('L', 'P');--> statement-breakpoint
CREATE TYPE "public"."jenis_mutasi" AS ENUM('Masuk', 'Keluar');--> statement-breakpoint
CREATE TYPE "public"."kelompok" AS ENUM('A', 'B', 'C');--> statement-breakpoint
CREATE TYPE "public"."nilai_ekstra" AS ENUM('A', 'B', 'C', 'D');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('superadmin', 'admin', 'wali_kelas', 'guru');--> statement-breakpoint
CREATE TYPE "public"."semester" AS ENUM('1', '2');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('aktif', 'nonaktif');--> statement-breakpoint
CREATE TYPE "public"."status_siswa" AS ENUM('Aktif', 'Lulus', 'Pindah', 'Drop Out');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"table" varchar(100),
	"record_id" uuid,
	"old_value" text,
	"new_value" text,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asesmen_formatif" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mata_pelajaran_id" uuid,
	"siswa_id" uuid,
	"jenis" "jenis_asemen" DEFAULT 'Kuis' NOT NULL,
	"tanggal" date,
	"nilai" numeric(5, 2),
	"deskripsi" text,
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asesmen_sumatif" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mata_pelajaran_id" uuid,
	"siswa_id" uuid,
	"jenis" "jenis_asemen_sumatif" DEFAULT 'Sumatif Tengah Semester' NOT NULL,
	"tanggal" date,
	"nilai" numeric(5, 2),
	"kkm" numeric(5, 2) DEFAULT '75',
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_sekolah" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_sekolah" varchar(255) NOT NULL,
	"npsn" varchar(20),
	"alamat" text,
	"kelurahan" varchar(100),
	"kecamatan" varchar(100),
	"kota" varchar(100),
	"provinsi" varchar(100),
	"kode_pos" varchar(10),
	"telepon" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"kepala_sekolah" varchar(255),
	"nip_kepala_sekolah" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_siswa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nis" varchar(20),
	"nisn" varchar(20) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"tempat_lahir" varchar(100),
	"tanggal_lahir" date,
	"jenis_kelamin" "jenis_kelamin" DEFAULT 'L' NOT NULL,
	"agama" varchar(50),
	"alamat" text,
	"nama_ortu" varchar(255) NOT NULL,
	"telepon_ortu" varchar(20),
	"tanggal_masuk" date,
	"kelas" varchar(10),
	"status" "status_siswa" DEFAULT 'Aktif',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "data_siswa_nisn_unique" UNIQUE("nisn")
);
--> statement-breakpoint
CREATE TABLE "ekstrakurikuler" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode" varchar(20),
	"nama" varchar(255) NOT NULL,
	"jenis" "jenis_ekstra" DEFAULT 'Wajib' NOT NULL,
	"pembina" varchar(255),
	"jadwal" varchar(255),
	"tempat" varchar(255),
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "informasi_umum" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tahun_ajaran" varchar(20) NOT NULL,
	"semester" "semester" DEFAULT '1' NOT NULL,
	"kelas" varchar(50),
	"fase" "fase",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lingkup_materi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mata_pelajaran_id" uuid,
	"kode" varchar(20),
	"nama_materi" varchar(255) NOT NULL,
	"deskripsi" text,
	"alokasi_waktu" integer,
	"semester" "semester" DEFAULT '1',
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mata_pelajaran" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode" varchar(20),
	"nama" varchar(255) NOT NULL,
	"kelompok" "kelompok" DEFAULT 'A' NOT NULL,
	"fase" "fase",
	"jp_per_minggu" integer,
	"guru" varchar(255),
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mutasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"siswa_id" uuid,
	"jenis" "jenis_mutasi" DEFAULT 'Masuk' NOT NULL,
	"tanggal" date,
	"asal_sekolah" varchar(255),
	"tujuan_sekolah" varchar(255),
	"alasan" text,
	"keterangan" text,
	"nomor_surat" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nilai_akhir" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mata_pelajaran_id" uuid,
	"mata_pelajaran" varchar(255),
	"siswa_id" uuid,
	"siswa" varchar(255),
	"nisn" varchar(20),
	"nilai_formatif" numeric(5, 2),
	"nilai_sumatif" numeric(5, 2),
	"nilai_akhir" numeric(5, 2),
	"predikat" varchar(10),
	"deskripsi" text,
	"tahun_ajaran" varchar(20),
	"semester" "semester",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "penilaian_ekstrakurikuler" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ekstrakurikuler_id" uuid,
	"siswa_id" uuid,
	"semester" "semester" DEFAULT '1' NOT NULL,
	"tahun_ajaran" varchar(20),
	"nilai" "nilai_ekstra" DEFAULT 'A' NOT NULL,
	"predikat" varchar(50),
	"deskripsi" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tujuan_pembelajaran" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mata_pelajaran_id" uuid,
	"kode" varchar(20),
	"deskripsi" text NOT NULL,
	"fase" "fase",
	"elemen" varchar(100),
	"keterangan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"nip" varchar(50),
	"role" "role" DEFAULT 'guru' NOT NULL,
	"status" "status" DEFAULT 'aktif' NOT NULL,
	"foto" text,
	"telepon" varchar(20),
	"alamat" text,
	"tanggal_lahir" date,
	"tempat_lahir" varchar(100),
	"tanggal_bergabung" date DEFAULT now(),
	"terakhir_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_nip_unique" UNIQUE("nip")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asesmen_formatif" ADD CONSTRAINT "asesmen_formatif_mata_pelajaran_id_mata_pelajaran_id_fk" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "public"."mata_pelajaran"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asesmen_formatif" ADD CONSTRAINT "asesmen_formatif_siswa_id_data_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."data_siswa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asesmen_sumatif" ADD CONSTRAINT "asesmen_sumatif_mata_pelajaran_id_mata_pelajaran_id_fk" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "public"."mata_pelajaran"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asesmen_sumatif" ADD CONSTRAINT "asesmen_sumatif_siswa_id_data_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."data_siswa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lingkup_materi" ADD CONSTRAINT "lingkup_materi_mata_pelajaran_id_mata_pelajaran_id_fk" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "public"."mata_pelajaran"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mutasi" ADD CONSTRAINT "mutasi_siswa_id_data_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."data_siswa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nilai_akhir" ADD CONSTRAINT "nilai_akhir_mata_pelajaran_id_mata_pelajaran_id_fk" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "public"."mata_pelajaran"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nilai_akhir" ADD CONSTRAINT "nilai_akhir_siswa_id_data_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."data_siswa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penilaian_ekstrakurikuler" ADD CONSTRAINT "penilaian_ekstrakurikuler_ekstrakurikuler_id_ekstrakurikuler_id_fk" FOREIGN KEY ("ekstrakurikuler_id") REFERENCES "public"."ekstrakurikuler"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penilaian_ekstrakurikuler" ADD CONSTRAINT "penilaian_ekstrakurikuler_siswa_id_data_siswa_id_fk" FOREIGN KEY ("siswa_id") REFERENCES "public"."data_siswa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tujuan_pembelajaran" ADD CONSTRAINT "tujuan_pembelajaran_mata_pelajaran_id_mata_pelajaran_id_fk" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "public"."mata_pelajaran"("id") ON DELETE no action ON UPDATE no action;