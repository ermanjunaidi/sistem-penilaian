import express from 'express';
import { db } from '../lib/database.js';
import { dataSiswa } from '../schema/index.js';
import { eq, desc, like, or } from 'drizzle-orm';
import { authorizeHierarchy, logActivity } from '../middleware/auth.js';

const router = express.Router();

// Get all students
router.get('/', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const { kelas, status, search, limit, offset } = req.query;

    let students = await db.query.dataSiswa.findMany({
      orderBy: [desc(dataSiswa.createdAt)],
    });

    // Filter
    if (kelas) {
      students = students.filter(s => s.kelas === kelas);
    }

    if (status) {
      students = students.filter(s => s.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(s =>
        s.nama.toLowerCase().includes(searchLower) ||
        s.nisn?.toLowerCase().includes(searchLower) ||
        s.nis?.toLowerCase().includes(searchLower) ||
        s.namaOrtu.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const page = parseInt(offset) || 0;
    const pageSize = parseInt(limit) || 50;
    const paginatedStudents = students.slice(page, page + pageSize);

    res.json({
      success: true,
      data: paginatedStudents,
      pagination: {
        total: students.length,
        page: Math.floor(page / pageSize) + 1,
        limit: pageSize,
        totalPages: Math.ceil(students.length / pageSize),
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Get student by ID
router.get('/:id', authorizeHierarchy('guru'), async (req, res) => {
  try {
    const student = await db.query.dataSiswa.findFirst({
      where: eq(dataSiswa.id, req.params.id),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan.',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create student (Admin+)
router.post('/', authorizeHierarchy('admin'), logActivity('CREATE', 'data_siswa'), async (req, res) => {
  try {
    const {
      nis, nisn, nama, tempatLahir, tanggalLahir,
      jenisKelamin, agama, alamat, namaOrtu, teleponOrtu,
      tanggalMasuk, kelas, status
    } = req.body;

    if (!nisn || !nama || !namaOrtu) {
      return res.status(400).json({
        success: false,
        message: 'NISN, nama, dan nama orang tua wajib diisi.',
      });
    }

    // Check if NISN already exists
    const existingStudent = await db.query.dataSiswa.findFirst({
      where: eq(dataSiswa.nisn, nisn),
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'NISN sudah terdaftar.',
      });
    }

    const newStudent = await db.insert(dataSiswa).values({
      nis,
      nisn,
      nama,
      tempatLahir,
      tanggalLahir,
      jenisKelamin: jenisKelamin || 'L',
      agama,
      alamat,
      namaOrtu,
      teleponOrtu,
      tanggalMasuk,
      kelas,
      status: status || 'Aktif',
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Siswa berhasil ditambahkan.',
      data: newStudent[0],
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Update student (Admin+ or Wali Kelas for their own class)
router.put('/:id', authorizeHierarchy('guru'), logActivity('UPDATE', 'data_siswa'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nis, nisn, nama, tempatLahir, tanggalLahir,
      jenisKelamin, agama, alamat, namaOrtu, teleponOrtu,
      tanggalMasuk, kelas, status
    } = req.body;

    const existingStudent = await db.query.dataSiswa.findFirst({
      where: eq(dataSiswa.id, id),
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan.',
      });
    }

    // Check NISN uniqueness if changed
    if (nisn && nisn !== existingStudent.nisn) {
      const nisnExists = await db.query.dataSiswa.findFirst({
        where: eq(dataSiswa.nisn, nisn),
      });

      if (nisnExists) {
        return res.status(400).json({
          success: false,
          message: 'NISN sudah terdaftar.',
        });
      }
    }

    await db.update(dataSiswa)
      .set({
        nis: nis || undefined,
        nisn: nisn || undefined,
        nama: nama || undefined,
        tempatLahir: tempatLahir || undefined,
        tanggalLahir: tanggalLahir || undefined,
        jenisKelamin: jenisKelamin || undefined,
        agama: agama || undefined,
        alamat: alamat || undefined,
        namaOrtu: namaOrtu || undefined,
        teleponOrtu: teleponOrtu || undefined,
        tanggalMasuk: tanggalMasuk || undefined,
        kelas: kelas || undefined,
        status: status || undefined,
        updatedAt: new Date(),
      })
      .where(eq(dataSiswa.id, id))
      .returning();

    res.json({
      success: true,
      message: 'Data siswa berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Delete student (Admin+)
router.delete('/:id', authorizeHierarchy('admin'), logActivity('DELETE', 'data_siswa'), async (req, res) => {
  try {
    const { id } = req.params;

    const existingStudent = await db.query.dataSiswa.findFirst({
      where: eq(dataSiswa.id, id),
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: 'Siswa tidak ditemukan.',
      });
    }

    await db.delete(dataSiswa).where(eq(dataSiswa.id, id));

    res.json({
      success: true,
      message: 'Siswa berhasil dihapus.',
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Bulk import students (Admin+)
router.post('/bulk', authorizeHierarchy('admin'), logActivity('BULK_IMPORT', 'data_siswa'), async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data siswa harus berupa array dan tidak boleh kosong.',
      });
    }

    const inserted = [];
    const errors = [];

    for (const student of students) {
      try {
        // Check NISN
        const existing = await db.query.dataSiswa.findFirst({
          where: eq(dataSiswa.nisn, student.nisn),
        });

        if (existing) {
          errors.push({
            nisn: student.nisn,
            nama: student.nama,
            error: 'NISN sudah terdaftar',
          });
          continue;
        }

        const newStudent = await db.insert(dataSiswa).values({
          nis: student.nis,
          nisn: student.nisn,
          nama: student.nama,
          tempatLahir: student.tempatLahir,
          tanggalLahir: student.tanggalLahir,
          jenisKelamin: student.jenisKelamin || 'L',
          agama: student.agama,
          alamat: student.alamat,
          namaOrtu: student.namaOrtu,
          teleponOrtu: student.teleponOrtu,
          tanggalMasuk: student.tanggalMasuk,
          kelas: student.kelas,
          status: student.status || 'Aktif',
        }).returning();

        inserted.push(newStudent[0]);
      } catch (err) {
        errors.push({
          nisn: student.nisn,
          nama: student.nama,
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Berhasil mengimport ${inserted.length} siswa.`,
      data: {
        inserted: inserted.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

export default router;
