# Template Import/Export Mata Pelajaran

## 📁 Lokasi Template
```
backend/cmd/dbsetup/templates/
├── mapel_export_template.csv    # Format CSV
├── mapel_export_template.json   # Format JSON
├── mapel_export_template.xlsx   # Format Excel
└── README.md                    # Dokumentasi
```

## 📋 Struktur Data

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `id` | UUID | ❌ | Auto-generated jika kosong |
| `kode` | VARCHAR(20) | ❌ | Kode mapel (contoh: MAP-001) |
| `nama` | VARCHAR(255) | ✅ | Nama mata pelajaran |
| `kelompok` | TEXT | ❌ | A/B/C (default: A) |
| `fase` | TEXT | ❌ | Fase D/E/F untuk SMP |
| `jp_per_minggu` | TEXT | ❌ | Contoh: "4 JP" |
| `guru` | VARCHAR(255) | ❌ | Nama guru pengampu |
| `keterangan` | TEXT | ❌ | Catatan tambahan |

## 📤 Export Data

### Via Frontend
1. Buka halaman **Mata Pelajaran**
2. Klik tombol **Export** untuk download JSON
3. Klik tombol **Template** untuk download template CSV/Excel/JSON

### Via API
```bash
GET /api/mapel/export?format=json
Authorization: Bearer <token>
```

### Via Database Direct
```bash
# Export ke CSV
psql -d sistem_penilaian -c "\COPY (SELECT id,kode,nama,kelompok,fase,jp_per_minggu,guru,keterangan FROM mata_pelajaran ORDER BY nama) TO STDOUT WITH CSV HEADER" > mapel_export.csv
```

## 📥 Import Data

### Via Frontend (Recommended)
1. Buka halaman **Mata Pelajaran**
2. Klik tombol **Import**
3. Download template (CSV, Excel, atau JSON)
4. Isi data sesuai template
5. Upload file dan preview data
6. Klik **Import Data**

### Via API
```bash
POST /api/mapel/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <mapel_export_template.csv>
```

### Via Database Direct
```bash
# Import dari CSV
psql -d sistem_penilaian -c "\COPY mata_pelajaran(kode,nama,kelompok,fase,jp_per_minggu,guru,keterangan) FROM 'mapel_import.csv' WITH CSV HEADER"
```

## 📝 Contoh Data

### CSV Format
```csv
id,kode,nama,kelompok,fase,jp_per_minggu,guru,keterangan
,MAP-001,Matematika,A,Fase D,6 JP,Budi Santoso,Mata pelajaran wajib
,MAP-002,Bahasa Indonesia,A,Fase D,4 JP,Siti Aminah,Mata pelajaran wajib
```

### JSON Format
```json
{
  "data": [
    {
      "kode": "MAP-001",
      "nama": "Matematika",
      "kelompok": "A",
      "fase": "Fase D",
      "jpPerMinggu": "6 JP",
      "guru": "Budi Santoso",
      "keterangan": "Mata pelajaran wajib"
    }
  ]
}
```

### Excel Format
- Buka file `mapel_export_template.xlsx`
- Isi data di sheet **Mata Pelajaran**
- Sheet **Instruksi** berisi panduan lengkap

## ⚠️ Validasi

- **nama** tidak boleh kosong
- **kelompok** harus salah satu: A, B, C
- **kode** harus unik (jika diisi)
- **fase** format: Fase A/B/C/D/E/F

## 🎯 Kelompok Mata Pelajaran

| Kode | Keterangan | Contoh |
|------|------------|--------|
| A | Wajib | Matematika, Bahasa Indonesia |
| B | Wajib Pilihan | Seni Budaya, PJOK |
| C | Pilihan | Informatika, Bahasa Daerah |

## 🔄 Import Behavior

- Data dengan **kode yang sama** akan di-**update**
- Data dengan **kode baru** akan di-**insert**
- Import tidak menghapus data yang sudah ada
- Support 3 format: CSV, Excel (.xlsx), JSON
