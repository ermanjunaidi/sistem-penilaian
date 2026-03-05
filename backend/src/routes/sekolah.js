import express from 'express';
import { db } from '../lib/database.js';
import { dataSekolah, informasiUmum } from '../schema/index.js';
import { eq, desc } from 'drizzle-orm';
import { authorizeHierarchy, logActivity } from '../middleware/auth.js';

const router = express.Router();

// ===== DATA SEKOLAH =====

// Get data sekolah
router.get('/sekolah', async (req, res) => {
  try {
    const sekolah = await db.query.dataSekolah.findFirst({
      orderBy: [desc(dataSekolah.createdAt)],
    });

    res.json({
      success: true,
      data: sekolah || null,
    });
  } catch (error) {
    console.error('Get sekolah error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create/Update data sekolah (Admin+)
router.post('/sekolah', authorizeHierarchy('admin'), logActivity('UPDATE', 'data_sekolah'), async (req, res) => {
  try {
    const {
      namaSekolah, npsn, alamat, kelurahan, kecamatan,
      kota, provinsi, kodePos, telepon, email, website,
      kepalaSekolah, nipKepalaSekolah
    } = req.body;

    // Check if exists
    const existing = await db.query.dataSekolah.findFirst();

    let result;
    if (existing) {
      // Update
      result = await db.update(dataSekolah)
        .set({
          namaSekolah: namaSekolah || undefined,
          npsn: npsn || undefined,
          alamat: alamat || undefined,
          kelurahan: kelurahan || undefined,
          kecamatan: kecamatan || undefined,
          kota: kota || undefined,
          provinsi: provinsi || undefined,
          kodePos: kodePos || undefined,
          telepon: telepon || undefined,
          email: email || undefined,
          website: website || undefined,
          kepalaSekolah: kepalaSekolah || undefined,
          nipKepalaSekolah: nipKepalaSekolah || undefined,
          updatedAt: new Date(),
        })
        .where(eq(dataSekolah.id, existing.id))
        .returning();
    } else {
      // Create
      result = await db.insert(dataSekolah).values({
        namaSekolah,
        npsn,
        alamat,
        kelurahan,
        kecamatan,
        kota,
        provinsi,
        kodePos,
        telepon,
        email,
        website,
        kepalaSekolah,
        nipKepalaSekolah,
      }).returning();
    }

    res.json({
      success: true,
      message: 'Data sekolah berhasil disimpan.',
      data: result[0],
    });
  } catch (error) {
    console.error('Save sekolah error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// ===== INFORMASI UMUM =====

// Get informasi umum
router.get('/informasi', async (req, res) => {
  try {
    const informasi = await db.query.informasiUmum.findFirst({
      orderBy: [desc(informasiUmum.createdAt)],
    });

    res.json({
      success: true,
      data: informasi || null,
    });
  } catch (error) {
    console.error('Get informasi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create/Update informasi umum (Admin+)
router.post('/informasi', authorizeHierarchy('admin'), logActivity('UPDATE', 'informasi_umum'), async (req, res) => {
  try {
    const { tahunAjaran, semester, kelas } = req.body;

    const existing = await db.query.informasiUmum.findFirst();

    let result;
    if (existing) {
      result = await db.update(informasiUmum)
        .set({
          tahunAjaran: tahunAjaran || undefined,
          semester: semester || undefined,
          kelas: kelas || undefined,
          updatedAt: new Date(),
        })
        .where(eq(informasiUmum.id, existing.id))
        .returning();
    } else {
      result = await db.insert(informasiUmum).values({
        tahunAjaran,
        semester,
        kelas,
      }).returning();
    }

    res.json({
      success: true,
      message: 'Informasi umum berhasil disimpan.',
      data: result[0],
    });
  } catch (error) {
    console.error('Save informasi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

export default router;
