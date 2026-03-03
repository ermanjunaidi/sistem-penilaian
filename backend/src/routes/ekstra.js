import express from 'express';
import { db } from '../lib/database.js';
import { ekstrakurikuler, penilaianEkstrakurikuler } from '../schema/index.js';
import { eq, desc } from 'drizzle-orm';
import { authorizeHierarchy, logActivity } from '../middleware/auth.js';

const router = express.Router();

// ===== EKSTRAKURIKULER =====

// Get all ekstrakurikuler
router.get('/', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { jenis } = req.query;

    let ekstra = await db.query.ekstrakurikuler.findMany({
      orderBy: [desc(ekstrakurikuler.createdAt)],
    });

    if (jenis) {
      ekstra = ekstra.filter(e => e.jenis === jenis);
    }

    res.json({
      success: true,
      data: ekstra,
    });
  } catch (error) {
    console.error('Get ekstra error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Get ekstra by ID
router.get('/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const ekstra = await db.query.ekstrakurikuler.findFirst({
      where: eq(ekstrakurikuler.id, req.params.id),
    });

    if (!ekstra) {
      return res.status(404).json({
        success: false,
        message: 'Ekstrakurikuler tidak ditemukan.',
      });
    }

    res.json({
      success: true,
      data: ekstra,
    });
  } catch (error) {
    console.error('Get ekstra error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create ekstrakurikuler (Admin+)
router.post('/', authorizeHierarchy('admin'), logActivity('CREATE', 'ekstrakurikuler'), async (req, res) => {
  try {
    const { kode, nama, jenis, pembina, jadwal, tempat, keterangan } = req.body;

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: 'Nama ekstrakurikuler wajib diisi.',
      });
    }

    const newEkstra = await db.insert(ekstrakurikuler).values({
      kode,
      nama,
      jenis: jenis || 'Wajib',
      pembina,
      jadwal,
      tempat,
      keterangan,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Ekstrakurikuler berhasil ditambahkan.',
      data: newEkstra[0],
    });
  } catch (error) {
    console.error('Create ekstra error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Update ekstrakurikuler (Admin+)
router.put('/:id', authorizeHierarchy('admin'), logActivity('UPDATE', 'ekstrakurikuler'), async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, jenis, pembina, jadwal, tempat, keterangan } = req.body;

    const existing = await db.query.ekstrakurikuler.findFirst({
      where: eq(ekstrakurikuler.id, id),
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Ekstrakurikuler tidak ditemukan.',
      });
    }

    await db.update(ekstrakurikuler)
      .set({
        kode: kode || undefined,
        nama: nama || undefined,
        jenis: jenis || undefined,
        pembina: pembina || undefined,
        jadwal: jadwal || undefined,
        tempat: tempat || undefined,
        keterangan: keterangan || undefined,
        updatedAt: new Date(),
      })
      .where(eq(ekstrakurikuler.id, id))
      .returning();

    res.json({
      success: true,
      message: 'Ekstrakurikuler berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Update ekstra error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Delete ekstrakurikuler (Admin+)
router.delete('/:id', authorizeHierarchy('admin'), logActivity('DELETE', 'ekstrakurikuler'), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.query.ekstrakurikuler.findFirst({
      where: eq(ekstrakurikuler.id, id),
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Ekstrakurikuler tidak ditemukan.',
      });
    }

    await db.delete(ekstrakurikuler).where(eq(ekstrakurikuler.id, id));

    res.json({
      success: true,
      message: 'Ekstrakurikuler berhasil dihapus.',
    });
  } catch (error) {
    console.error('Delete ekstra error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// ===== PENILAIAN EKSTRAKURIKULER =====

// Get all penilaian ekstra
router.get('/penilaian/nilai', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { siswaId, ekstrakurikulerId, semester, tahunAjaran } = req.query;

    let penilaian = await db.query.penilaianEkstrakurikuler.findMany({
      orderBy: [desc(penilaianEkstrakurikuler.createdAt)],
    });

    if (siswaId) {
      penilaian = penilaian.filter(p => p.siswaId === siswaId);
    }

    if (ekstrakurikulerId) {
      penilaian = penilaian.filter(p => p.ekstrakurikulerId === ekstrakurikulerId);
    }

    if (semester) {
      penilaian = penilaian.filter(p => p.semester === semester);
    }

    if (tahunAjaran) {
      penilaian = penilaian.filter(p => p.tahunAjaran === tahunAjaran);
    }

    res.json({
      success: true,
      data: penilaian,
    });
  } catch (error) {
    console.error('Get penilaian ekstra error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create penilaian ekstra (Guru+)
router.post('/penilaian/nilai', authorizeHierarchy('guru'), logActivity('CREATE', 'penilaian_ekstrakurikuler'), async (req, res) => {
  try {
    const { ekstrakurikulerId, siswaId, semester, tahunAjaran, nilai, predikat, deskripsi } = req.body;

    if (!ekstrakurikulerId || !siswaId || !nilai) {
      return res.status(400).json({
        success: false,
        message: 'Ekstrakurikuler, siswa, dan nilai wajib diisi.',
      });
    }

    const newPenilaian = await db.insert(penilaianEkstrakurikuler).values({
      ekstrakurikulerId,
      siswaId,
      semester: semester || '1',
      tahunAjaran,
      nilai,
      predikat,
      deskripsi,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Penilaian ekstrakurikuler berhasil ditambahkan.',
      data: newPenilaian[0],
    });
  } catch (error) {
    console.error('Create penilaian ekstra error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Update penilaian ekstra
router.put('/penilaian/nilai/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nilai, predikat, deskripsi } = req.body;

    await db.update(penilaianEkstrakurikuler)
      .set({
        nilai: nilai || undefined,
        predikat: predikat || undefined,
        deskripsi: deskripsi || undefined,
        updatedAt: new Date(),
      })
      .where(eq(penilaianEkstrakurikuler.id, id));

    res.json({
      success: true,
      message: 'Penilaian berhasil diperbarui.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete penilaian ekstra
router.delete('/penilaian/nilai/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    await db.delete(penilaianEkstrakurikuler).where(eq(penilaianEkstrakurikuler.id, req.params.id));
    res.json({ success: true, message: 'Penilaian berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
