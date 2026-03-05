import { pgTable, text, timestamp, uuid, varchar, integer, boolean, date, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['superadmin', 'admin', 'wali_kelas', 'guru']);
export const statusEnum = pgEnum('status', ['aktif', 'nonaktif']);
export const jenisKelaminEnum = pgEnum('jenis_kelamin', ['L', 'P']);
export const semesterEnum = pgEnum('semester', ['1', '2']);
export const kelompokEnum = pgEnum('kelompok', ['A', 'B', 'C']);
export const jenisMutasiEnum = pgEnum('jenis_mutasi', ['Masuk', 'Keluar']);
export const statusSiswaEnum = pgEnum('status_siswa', ['Aktif', 'Lulus', 'Pindah', 'Drop Out']);
export const jenisAsesmenEnum = pgEnum('jenis_asemen', ['Kuis', 'Tugas', 'Observasi', 'Presentasi', 'Diskusi', 'Lainnya']);
export const jenisAsesmenSumatifEnum = pgEnum('jenis_asemen_sumatif', ['Sumatif Tengah Semester', 'Sumatif Akhir Semester', 'Sumatif Akhir Tahun']);
export const nilaiEkstraEnum = pgEnum('nilai_ekstra', ['A', 'B', 'C', 'D']);
export const jenisEkstraEnum = pgEnum('jenis_ekstra', ['Wajib', 'Pilihan']);

// Users & Authentication
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  nama: varchar('nama', { length: 255 }).notNull(),
  nip: varchar('nip', { length: 50 }).unique(),
  role: roleEnum('role').notNull().default('guru'),
  status: statusEnum('status').notNull().default('aktif'),
  foto: text('foto'),
  telepon: varchar('telepon', { length: 20 }),
  alamat: text('alamat'),
  tanggalLahir: date('tanggal_lahir'),
  tempatLahir: varchar('tempat_lahir', { length: 100 }),
  tanggalBergabung: date('tanggal_bergabung').defaultNow(),
  terakhirLogin: timestamp('terakhir_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Data Sekolah
export const dataSekolah = pgTable('data_sekolah', {
  id: uuid('id').primaryKey().defaultRandom(),
  namaSekolah: varchar('nama_sekolah', { length: 255 }).notNull(),
  npsn: varchar('npsn', { length: 20 }),
  alamat: text('alamat'),
  kelurahan: varchar('kelurahan', { length: 100 }),
  kecamatan: varchar('kecamatan', { length: 100 }),
  kota: varchar('kota', { length: 100 }),
  provinsi: varchar('provinsi', { length: 100 }),
  kodePos: varchar('kode_pos', { length: 10 }),
  telepon: varchar('telepon', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  kepalaSekolah: varchar('kepala_sekolah', { length: 255 }),
  nipKepalaSekolah: varchar('nip_kepala_sekolah', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Informasi Umum
export const informasiUmum = pgTable('informasi_umum', {
  id: uuid('id').primaryKey().defaultRandom(),
  tahunAjaran: varchar('tahun_ajaran', { length: 20 }).notNull(),
  semester: semesterEnum('semester').notNull().default('1'),
  kelas: varchar('kelas', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Data Siswa
export const dataSiswa = pgTable('data_siswa', {
  id: uuid('id').primaryKey().defaultRandom(),
  nis: varchar('nis', { length: 20 }),
  nisn: varchar('nisn', { length: 20 }).notNull().unique(),
  nama: varchar('nama', { length: 255 }).notNull(),
  tempatLahir: varchar('tempat_lahir', { length: 100 }),
  tanggalLahir: date('tanggal_lahir'),
  jenisKelamin: jenisKelaminEnum('jenis_kelamin').notNull().default('L'),
  agama: varchar('agama', { length: 50 }),
  alamat: text('alamat'),
  namaOrtu: varchar('nama_ortu', { length: 255 }).notNull(),
  teleponOrtu: varchar('telepon_ortu', { length: 20 }),
  tanggalMasuk: date('tanggal_masuk'),
  kelas: varchar('kelas', { length: 10 }),
  status: statusSiswaEnum('status').default('Aktif'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mata Pelajaran
export const mataPelajaran = pgTable('mata_pelajaran', {
  id: uuid('id').primaryKey().defaultRandom(),
  kode: varchar('kode', { length: 20 }),
  nama: varchar('nama', { length: 255 }).notNull(),
  kelompok: kelompokEnum('kelompok').notNull().default('A'),
  jpPerMinggu: integer('jp_per_minggu'),
  guru: varchar('guru', { length: 255 }),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Ekstrakurikuler
export const ekstrakurikuler = pgTable('ekstrakurikuler', {
  id: uuid('id').primaryKey().defaultRandom(),
  kode: varchar('kode', { length: 20 }),
  nama: varchar('nama', { length: 255 }).notNull(),
  jenis: jenisEkstraEnum('jenis').notNull().default('Wajib'),
  pembina: varchar('pembina', { length: 255 }),
  jadwal: varchar('jadwal', { length: 255 }),
  tempat: varchar('tempat', { length: 255 }),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tujuan Pembelajaran
export const tujuanPembelajaran = pgTable('tujuan_pembelajaran', {
  id: uuid('id').primaryKey().defaultRandom(),
  mataPelajaranId: uuid('mata_pelajaran_id').references(() => mataPelajaran.id),
  kode: varchar('kode', { length: 20 }),
  deskripsi: text('deskripsi').notNull(),
  elemen: varchar('elemen', { length: 100 }),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Lingkup Materi
export const lingkupMateri = pgTable('lingkup_materi', {
  id: uuid('id').primaryKey().defaultRandom(),
  mataPelajaranId: uuid('mata_pelajaran_id').references(() => mataPelajaran.id),
  kode: varchar('kode', { length: 20 }),
  namaMateri: varchar('nama_materi', { length: 255 }).notNull(),
  deskripsi: text('deskripsi'),
  alokasiWaktu: integer('alokasi_waktu'),
  semester: semesterEnum('semester').default('1'),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Asesmen Formatif
export const asesmenFormatif = pgTable('asesmen_formatif', {
  id: uuid('id').primaryKey().defaultRandom(),
  mataPelajaranId: uuid('mata_pelajaran_id').references(() => mataPelajaran.id),
  siswaId: uuid('siswa_id').references(() => dataSiswa.id),
  jenis: jenisAsesmenEnum('jenis').notNull().default('Kuis'),
  tanggal: date('tanggal'),
  nilai: decimal('nilai', { precision: 5, scale: 2 }),
  deskripsi: text('deskripsi'),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Asesmen Sumatif
export const asesmenSumatif = pgTable('asesmen_sumatif', {
  id: uuid('id').primaryKey().defaultRandom(),
  mataPelajaranId: uuid('mata_pelajaran_id').references(() => mataPelajaran.id),
  siswaId: uuid('siswa_id').references(() => dataSiswa.id),
  jenis: jenisAsesmenSumatifEnum('jenis').notNull().default('Sumatif Tengah Semester'),
  tanggal: date('tanggal'),
  nilai: decimal('nilai', { precision: 5, scale: 2 }),
  kkm: decimal('kkm', { precision: 5, scale: 2 }).default('75'),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Penilaian Ekstrakurikuler
export const penilaianEkstrakurikuler = pgTable('penilaian_ekstrakurikuler', {
  id: uuid('id').primaryKey().defaultRandom(),
  ekstrakurikulerId: uuid('ekstrakurikuler_id').references(() => ekstrakurikuler.id),
  siswaId: uuid('siswa_id').references(() => dataSiswa.id),
  semester: semesterEnum('semester').notNull().default('1'),
  tahunAjaran: varchar('tahun_ajaran', { length: 20 }),
  nilai: nilaiEkstraEnum('nilai').notNull().default('A'),
  predikat: varchar('predikat', { length: 50 }),
  deskripsi: text('deskripsi'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Nilai Akhir
export const nilaiAkhir = pgTable('nilai_akhir', {
  id: uuid('id').primaryKey().defaultRandom(),
  mataPelajaranId: uuid('mata_pelajaran_id').references(() => mataPelajaran.id),
  mataPelajaran: varchar('mata_pelajaran', { length: 255 }),
  siswaId: uuid('siswa_id').references(() => dataSiswa.id),
  siswa: varchar('siswa', { length: 255 }),
  nisn: varchar('nisn', { length: 20 }),
  nilaiFormatif: decimal('nilai_formatif', { precision: 5, scale: 2 }),
  nilaiSumatif: decimal('nilai_sumatif', { precision: 5, scale: 2 }),
  nilaiAkhir: decimal('nilai_akhir', { precision: 5, scale: 2 }),
  predikat: varchar('predikat', { length: 10 }),
  deskripsi: text('deskripsi'),
  tahunAjaran: varchar('tahun_ajaran', { length: 20 }),
  semester: semesterEnum('semester'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mutasi
export const mutasi = pgTable('mutasi', {
  id: uuid('id').primaryKey().defaultRandom(),
  siswaId: uuid('siswa_id').references(() => dataSiswa.id),
  jenis: jenisMutasiEnum('jenis').notNull().default('Masuk'),
  tanggal: date('tanggal'),
  asalSekolah: varchar('asal_sekolah', { length: 255 }),
  tujuanSekolah: varchar('tujuan_sekolah', { length: 255 }),
  alasan: text('alasan'),
  keterangan: text('keterangan'),
  nomorSurat: varchar('nomor_surat', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activity Logs
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  table: varchar('table', { length: 100 }),
  recordId: uuid('record_id'),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(activityLogs),
}));

export const dataSiswaRelations = relations(dataSiswa, ({ many }) => ({
  asesmenFormatif: many(asesmenFormatif),
  asesmenSumatif: many(asesmenSumatif),
  penilaianEkstrakurikuler: many(penilaianEkstrakurikuler),
  nilaiAkhir: many(nilaiAkhir),
  mutasi: many(mutasi),
}));

export const mataPelajaranRelations = relations(mataPelajaran, ({ many }) => ({
  tujuanPembelajaran: many(tujuanPembelajaran),
  lingkupMateri: many(lingkupMateri),
  asesmenFormatif: many(asesmenFormatif),
  asesmenSumatif: many(asesmenSumatif),
  nilaiAkhir: many(nilaiAkhir),
}));

export const ekstrakurikulerRelations = relations(ekstrakurikuler, ({ many }) => ({
  penilaianEkstrakurikuler: many(penilaianEkstrakurikuler),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
