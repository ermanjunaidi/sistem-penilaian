import express from 'express';
import { db } from '../lib/database.js';
import { asesmenFormatif, asesmenSumatif, nilaiAkhir, mutasi } from '../schema/index.js';
import { eq, desc } from 'drizzle-orm';
import { authorizeHierarchy, logActivity } from '../middleware/auth.js';

const router = express.Router();

// ===== ASESMEN FORMATIF =====

// Get all asesmen formatif
router.get('/formatif', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { mataPelajaranId, siswaId } = req.query;

    let asesmen = await db.query.asesmenFormatif.findMany({
      orderBy: [desc(asesmenFormatif.createdAt)],
    });

    if (mataPelajaranId) {
      asesmen = asesmen.filter(a => a.mataPelajaranId === mataPelajaranId);
    }

    if (siswaId) {
      asesmen = asesmen.filter(a => a.siswaId === siswaId);
    }

    res.json({
      success: true,
      data: asesmen,
    });
  } catch (error) {
    console.error('Get asesmen formatif error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create asesmen formatif (Guru+)
router.post('/formatif', authorizeHierarchy('guru'), logActivity('CREATE', 'asesmen_formatif'), async (req, res) => {
  try {
    const { mataPelajaranId, siswaId, jenis, tanggal, nilai, deskripsi, keterangan } = req.body;

    if (!mataPelajaranId || !siswaId) {
      return res.status(400).json({
        success: false,
        message: 'Mata pelajaran dan siswa wajib diisi.',
      });
    }

    const newAsesmen = await db.insert(asesmenFormatif).values({
      mataPelajaranId,
      siswaId,
      jenis: jenis || 'Kuis',
      tanggal,
      nilai,
      deskripsi,
      keterangan,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Asesmen formatif berhasil ditambahkan.',
      data: newAsesmen[0],
    });
  } catch (error) {
    console.error('Create asesmen formatif error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Update asesmen formatif
router.put('/formatif/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { id } = req.params;
    const { jenis, tanggal, nilai, deskripsi, keterangan } = req.body;

    await db.update(asesmenFormatif)
      .set({
        jenis: jenis || undefined,
        tanggal: tanggal || undefined,
        nilai: nilai || undefined,
        deskripsi: deskripsi || undefined,
        keterangan: keterangan || undefined,
        updatedAt: new Date(),
      })
      .where(eq(asesmenFormatif.id, id));

    res.json({ success: true, message: 'Asesmen formatif berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete asesmen formatif
router.delete('/formatif/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    await db.delete(asesmenFormatif).where(eq(asesmenFormatif.id, req.params.id));
    res.json({ success: true, message: 'Asesmen formatif berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== ASESMEN SUMATIF =====

// Get all asesmen sumatif
router.get('/sumatif', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { mataPelajaranId, siswaId, jenis } = req.query;

    let asesmen = await db.query.asesmenSumatif.findMany({
      orderBy: [desc(asesmenSumatif.createdAt)],
    });

    if (mataPelajaranId) {
      asesmen = asesmen.filter(a => a.mataPelajaranId === mataPelajaranId);
    }

    if (siswaId) {
      asesmen = asesmen.filter(a => a.siswaId === siswaId);
    }

    if (jenis) {
      asesmen = asesmen.filter(a => a.jenis === jenis);
    }

    res.json({
      success: true,
      data: asesmen,
    });
  } catch (error) {
    console.error('Get asesmen sumatif error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create asesmen sumatif (Guru+)
router.post('/sumatif', authorizeHierarchy('guru'), logActivity('CREATE', 'asesmen_sumatif'), async (req, res) => {
  try {
    const { mataPelajaranId, siswaId, jenis, tanggal, nilai, kkm, keterangan } = req.body;

    if (!mataPelajaranId || !siswaId) {
      return res.status(400).json({
        success: false,
        message: 'Mata pelajaran dan siswa wajib diisi.',
      });
    }

    const newAsesmen = await db.insert(asesmenSumatif).values({
      mataPelajaranId,
      siswaId,
      jenis: jenis || 'Sumatif Tengah Semester',
      tanggal,
      nilai,
      kkm: kkm || '75',
      keterangan,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Asesmen sumatif berhasil ditambahkan.',
      data: newAsesmen[0],
    });
  } catch (error) {
    console.error('Create asesmen sumatif error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Update asesmen sumatif
router.put('/sumatif/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { id } = req.params;
    const { jenis, tanggal, nilai, kkm, keterangan } = req.body;

    await db.update(asesmenSumatif)
      .set({
        jenis: jenis || undefined,
        tanggal: tanggal || undefined,
        nilai: nilai || undefined,
        kkm: kkm || undefined,
        keterangan: keterangan || undefined,
        updatedAt: new Date(),
      })
      .where(eq(asesmenSumatif.id, id));

    res.json({ success: true, message: 'Asesmen sumatif berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete asesmen sumatif
router.delete('/sumatif/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    await db.delete(asesmenSumatif).where(eq(asesmenSumatif.id, req.params.id));
    res.json({ success: true, message: 'Asesmen sumatif berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== NILAI AKHIR =====

// Get all nilai akhir
router.get('/nilai-akhir', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { siswaId, mataPelajaranId, semester, tahunAjaran } = req.query;

    let nilai = await db.query.nilaiAkhir.findMany({
      orderBy: [desc(nilaiAkhir.createdAt)],
    });

    if (siswaId) {
      nilai = nilai.filter(n => n.siswaId === siswaId);
    }

    if (mataPelajaranId) {
      nilai = nilai.filter(n => n.mataPelajaranId === mataPelajaranId);
    }

    if (semester) {
      nilai = nilai.filter(n => n.semester === semester);
    }

    if (tahunAjaran) {
      nilai = nilai.filter(n => n.tahunAjaran === tahunAjaran);
    }

    res.json({
      success: true,
      data: nilai,
    });
  } catch (error) {
    console.error('Get nilai akhir error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Calculate and save nilai akhir (Guru+)
router.post('/nilai-akhir/calculate', authorizeHierarchy('guru'), logActivity('CALCULATE', 'nilai_akhir'), async (req, res) => {
  try {
    const { semester, tahunAjaran } = req.body;

    // Get all students and subjects
    const { dataSiswa } = await import('../schema/index.js');
    const { mataPelajaran } = await import('../schema/index.js');
    const { asesmenFormatif: af } = await import('../schema/index.js');
    const { asesmenSumatif: as } = await import('../schema/index.js');

    const students = await db.query.dataSiswa.findMany();
    const subjects = await db.query.mataPelajaran.findMany();

    const calculatedNilai = [];

    for (const student of students) {
      for (const subject of subjects) {
        // Get formatif scores
        const formatifScores = await db.query.asesmenFormatif.findMany({
          where: (fields, ops) => ops.and(
            ops.eq(fields.mataPelajaranId, subject.id),
            ops.eq(fields.siswaId, student.id)
          ),
        });

        // Get sumatif scores
        const sumatifScores = await db.query.asesmenSumatif.findMany({
          where: (fields, ops) => ops.and(
            ops.eq(fields.mataPelajaranId, subject.id),
            ops.eq(fields.siswaId, student.id)
          ),
        });

        // Calculate averages
        const avgFormatif = formatifScores.length > 0
          ? formatifScores.reduce((sum, a) => sum + parseFloat(a.nilai || 0), 0) / formatifScores.length
          : 0;

        const avgSumatif = sumatifScores.length > 0
          ? sumatifScores.reduce((sum, a) => sum + parseFloat(a.nilai || 0), 0) / sumatifScores.length
          : 0;

        // Final: 30% formatif + 70% sumatif
        const nilaiAkhirValue = avgFormatif > 0 || avgSumatif > 0
          ? Math.round((avgFormatif * 0.3) + (avgSumatif * 0.7))
          : 0;

        if (nilaiAkhirValue > 0) {
          // Determine predicate
          let predikat = '';
          let deskripsi = '';

          if (nilaiAkhirValue >= 90) {
            predikat = 'A';
            deskripsi = 'Sangat Baik';
          } else if (nilaiAkhirValue >= 80) {
            predikat = 'B';
            deskripsi = 'Baik';
          } else if (nilaiAkhirValue >= 70) {
            predikat = 'C';
            deskripsi = 'Cukup';
          } else if (nilaiAkhirValue >= 60) {
            predikat = 'D';
            deskripsi = 'Kurang';
          } else {
            predikat = 'E';
            deskripsi = 'Sangat Kurang';
          }

          calculatedNilai.push({
            mataPelajaranId: subject.id,
            mataPelajaran: subject.nama,
            siswaId: student.id,
            siswa: student.nama,
            nisn: student.nisn,
            nilaiFormatif: Math.round(avgFormatif).toString(),
            nilaiSumatif: Math.round(avgSumatif).toString(),
            nilaiAkhir: nilaiAkhirValue.toString(),
            predikat,
            deskripsi,
            tahunAjaran: tahunAjaran || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
            semester: semester || '1',
          });
        }
      }
    }

    // Insert calculated nilai
    if (calculatedNilai.length > 0) {
      await db.insert(nilaiAkhir).values(calculatedNilai);
    }

    res.json({
      success: true,
      message: `Berhasil menghitung ${calculatedNilai.length} nilai akhir.`,
      data: {
        count: calculatedNilai.length,
        nilai: calculatedNilai,
      },
    });
  } catch (error) {
    console.error('Calculate nilai akhir error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Delete nilai akhir (Admin+)
router.delete('/nilai-akhir/:id', authorizeHierarchy('admin'), async (req, res) => {
  try {
    await db.delete(nilaiAkhir).where(eq(nilaiAkhir.id, req.params.id));
    res.json({ success: true, message: 'Nilai akhir berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== MUTASI =====

// Get all mutasi
router.get('/mutasi', authorizeHierarchy('admin'), async (req, res) => {
  try {
    const { jenis, siswaId } = req.query;

    let mutasiData = await db.query.mutasi.findMany({
      orderBy: [desc(mutasi.createdAt)],
    });

    if (jenis) {
      mutasiData = mutasiData.filter(m => m.jenis === jenis);
    }

    if (siswaId) {
      mutasiData = mutasiData.filter(m => m.siswaId === siswaId);
    }

    res.json({
      success: true,
      data: mutasiData,
    });
  } catch (error) {
    console.error('Get mutasi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create mutasi (Admin+)
router.post('/mutasi', authorizeHierarchy('admin'), logActivity('CREATE', 'mutasi'), async (req, res) => {
  try {
    const { siswaId, jenis, tanggal, asalSekolah, tujuanSekolah, alasan, keterangan, nomorSurat } = req.body;

    if (!siswaId || !jenis) {
      return res.status(400).json({
        success: false,
        message: 'Siswa dan jenis mutasi wajib diisi.',
      });
    }

    const newMutasi = await db.insert(mutasi).values({
      siswaId,
      jenis,
      tanggal,
      asalSekolah,
      tujuanSekolah,
      alasan,
      keterangan,
      nomorSurat,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Mutasi berhasil ditambahkan.',
      data: newMutasi[0],
    });
  } catch (error) {
    console.error('Create mutasi error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Update mutasi
router.put('/mutasi/:id', authorizeHierarchy('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { jenis, tanggal, asalSekolah, tujuanSekolah, alasan, keterangan, nomorSurat } = req.body;

    await db.update(mutasi)
      .set({
        jenis: jenis || undefined,
        tanggal: tanggal || undefined,
        asalSekolah: asalSekolah || undefined,
        tujuanSekolah: tujuanSekolah || undefined,
        alasan: alasan || undefined,
        keterangan: keterangan || undefined,
        nomorSurat: nomorSurat || undefined,
        updatedAt: new Date(),
      })
      .where(eq(mutasi.id, id));

    res.json({ success: true, message: 'Mutasi berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete mutasi
router.delete('/mutasi/:id', authorizeHierarchy('admin'), async (req, res) => {
  try {
    await db.delete(mutasi).where(eq(mutasi.id, req.params.id));
    res.json({ success: true, message: 'Mutasi berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
