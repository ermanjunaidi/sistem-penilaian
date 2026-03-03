import express from 'express';
import { db } from '../lib/database.js';
import { mataPelajaran, tujuanPembelajaran, lingkupMateri } from '../schema/index.js';
import { eq, desc } from 'drizzle-orm';
import { authorizeHierarchy, logActivity } from '../middleware/auth.js';

const router = express.Router();

// ===== MATA PELAJARAN =====

// Get all mata pelajaran
router.get('/mapel', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { fase, kelompok } = req.query;

    let mapel = await db.query.mataPelajaran.findMany({
      orderBy: [desc(mataPelajaran.createdAt)],
    });

    if (fase) {
      mapel = mapel.filter(m => m.fase === fase);
    }

    if (kelompok) {
      mapel = mapel.filter(m => m.kelompok === kelompok);
    }

    res.json({
      success: true,
      data: mapel,
    });
  } catch (error) {
    console.error('Get mapel error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Get mapel by ID
router.get('/mapel/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const mapel = await db.query.mataPelajaran.findFirst({
      where: eq(mataPelajaran.id, req.params.id),
    });

    if (!mapel) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran tidak ditemukan.',
      });
    }

    res.json({
      success: true,
      data: mapel,
    });
  } catch (error) {
    console.error('Get mapel error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create mapel (Admin+)
router.post('/mapel', authorizeHierarchy('admin'), logActivity('CREATE', 'mata_pelajaran'), async (req, res) => {
  try {
    const { kode, nama, kelompok, fase, jpPerMinggu, guru, keterangan } = req.body;

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: 'Nama mata pelajaran wajib diisi.',
      });
    }

    const newMapel = await db.insert(mataPelajaran).values({
      kode,
      nama,
      kelompok: kelompok || 'A',
      fase,
      jpPerMinggu,
      guru,
      keterangan,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Mata pelajaran berhasil ditambahkan.',
      data: newMapel[0],
    });
  } catch (error) {
    console.error('Create mapel error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Update mapel (Admin+)
router.put('/mapel/:id', authorizeHierarchy('admin'), logActivity('UPDATE', 'mata_pelajaran'), async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, kelompok, fase, jpPerMinggu, guru, keterangan } = req.body;

    const existing = await db.query.mataPelajaran.findFirst({
      where: eq(mataPelajaran.id, id),
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran tidak ditemukan.',
      });
    }

    await db.update(mataPelajaran)
      .set({
        kode: kode || undefined,
        nama: nama || undefined,
        kelompok: kelompok || undefined,
        fase: fase || undefined,
        jpPerMinggu: jpPerMinggu || undefined,
        guru: guru || undefined,
        keterangan: keterangan || undefined,
        updatedAt: new Date(),
      })
      .where(eq(mataPelajaran.id, id))
      .returning();

    res.json({
      success: true,
      message: 'Mata pelajaran berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Update mapel error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Delete mapel (Admin+)
router.delete('/mapel/:id', authorizeHierarchy('admin'), logActivity('DELETE', 'mata_pelajaran'), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.query.mataPelajaran.findFirst({
      where: eq(mataPelajaran.id, id),
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran tidak ditemukan.',
      });
    }

    await db.delete(mataPelajaran).where(eq(mataPelajaran.id, id));

    res.json({
      success: true,
      message: 'Mata pelajaran berhasil dihapus.',
    });
  } catch (error) {
    console.error('Delete mapel error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// ===== TUJUAN PEMBELAJARAN =====

// Get all tujuan pembelajaran
router.get('/tujuan-pembelajaran', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { mataPelajaranId, fase } = req.query;

    let tp = await db.query.tujuanPembelajaran.findMany({
      orderBy: [desc(tujuanPembelajaran.createdAt)],
    });

    if (mataPelajaranId) {
      tp = tp.filter(t => t.mataPelajaranId === mataPelajaranId);
    }

    if (fase) {
      tp = tp.filter(t => t.fase === fase);
    }

    res.json({
      success: true,
      data: tp,
    });
  } catch (error) {
    console.error('Get TP error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create tujuan pembelajaran (Guru+)
router.post('/tujuan-pembelajaran', authorizeHierarchy('guru'), logActivity('CREATE', 'tujuan_pembelajaran'), async (req, res) => {
  try {
    const { mataPelajaranId, kode, deskripsi, fase, elemen, keterangan } = req.body;

    if (!deskripsi) {
      return res.status(400).json({
        success: false,
        message: 'Deskripsi tujuan pembelajaran wajib diisi.',
      });
    }

    const newTp = await db.insert(tujuanPembelajaran).values({
      mataPelajaranId,
      kode,
      deskripsi,
      fase,
      elemen,
      keterangan,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Tujuan pembelajaran berhasil ditambahkan.',
      data: newTp[0],
    });
  } catch (error) {
    console.error('Create TP error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Update/Delete tujuan pembelajaran (similar pattern...)
router.put('/tujuan-pembelajaran/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, deskripsi, fase, elemen, keterangan } = req.body;

    await db.update(tujuanPembelajaran)
      .set({
        kode: kode || undefined,
        deskripsi: deskripsi || undefined,
        fase: fase || undefined,
        elemen: elemen || undefined,
        keterangan: keterangan || undefined,
        updatedAt: new Date(),
      })
      .where(eq(tujuanPembelajaran.id, id));

    res.json({
      success: true,
      message: 'Tujuan pembelajaran berhasil diperbarui.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete('/tujuan-pembelajaran/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    await db.delete(tujuanPembelajaran).where(eq(tujuanPembelajaran.id, req.params.id));
    res.json({ success: true, message: 'Tujuan pembelajaran berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== LINGKUP MATERI =====

router.get('/lingkup-materi', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { mataPelajaranId } = req.query;
    let materi = await db.query.lingkupMateri.findMany({
      orderBy: [desc(lingkupMateri.createdAt)],
    });

    if (mataPelajaranId) {
      materi = materi.filter(m => m.mataPelajaranId === mataPelajaranId);
    }

    res.json({ success: true, data: materi });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/lingkup-materi', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { mataPelajaranId, kode, namaMateri, deskripsi, alokasiWaktu, semester, keterangan } = req.body;

    if (!namaMateri) {
      return res.status(400).json({ success: false, message: 'Nama materi wajib diisi.' });
    }

    const newMateri = await db.insert(lingkupMateri).values({
      mataPelajaranId, kode, namaMateri, deskripsi, alokasiWaktu, semester, keterangan
    }).returning();

    res.status(201).json({ success: true, data: newMateri[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/lingkup-materi/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, namaMateri, deskripsi, alokasiWaktu, semester, keterangan } = req.body;

    await db.update(lingkupMateri)
      .set({ kode, namaMateri, deskripsi, alokasiWaktu, semester, keterangan, updatedAt: new Date() })
      .where(eq(lingkupMateri.id, id));

    res.json({ success: true, message: 'Lingkup materi berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/lingkup-materi/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    await db.delete(lingkupMateri).where(eq(lingkupMateri.id, req.params.id));
    res.json({ success: true, message: 'Lingkup materi berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
