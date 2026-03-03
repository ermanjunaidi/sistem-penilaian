import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../lib/database.js';
import { users } from '../schema/index.js';
import { eq, desc } from 'drizzle-orm';
import { authorize, authorizeHierarchy, logActivity } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin+)
router.get('/', authorizeHierarchy('admin'), async (req, res) => {
  try {
    const { role, status, search } = req.query;

    let query = db.query.users.findMany({
      columns: {
        password: false,
      },
      orderBy: [desc(users.createdAt)],
    });

    const allUsers = await query;

    // Filter manually for simplicity
    let filteredUsers = allUsers;

    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    if (status) {
      filteredUsers = filteredUsers.filter(u => u.status === status);
    }

    if (search) {
      filteredUsers = filteredUsers.filter(u =>
        u.nama.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.nip?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredUsers,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Get user by ID
router.get('/:id', authorizeHierarchy('admin'), async (req, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.params.id),
      columns: {
        password: false,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Create user (Superadmin only)
router.post('/', authorize('superadmin'), logActivity('CREATE', 'users'), async (req, res) => {
  try {
    const { email, password, nama, nip, role, telepon, alamat, tanggalLahir, tempatLahir } = req.body;

    if (!email || !password || !nama) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, dan nama wajib diisi.',
      });
    }

    // Check if email exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      nama,
      nip,
      role: role || 'guru',
      telepon,
      alamat,
      tanggalLahir,
      tempatLahir,
    }).returning({
      password: false,
    });

    res.status(201).json({
      success: true,
      message: 'User berhasil dibuat.',
      data: newUser[0],
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Update user (Admin+)
router.put('/:id', authorizeHierarchy('admin'), logActivity('UPDATE', 'users'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nip, role, status, telepon, alamat } = req.body;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.',
      });
    }

    // Prevent non-superadmin from changing roles to superadmin
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya superadmin yang dapat mengubah role ke superadmin.',
      });
    }

    await db.update(users)
      .set({
        nama: nama || undefined,
        nip: nip || undefined,
        role: role || undefined,
        status: status || undefined,
        telepon: telepon || undefined,
        alamat: alamat || undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({ password: false });

    res.json({
      success: true,
      message: 'User berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Delete user (Superadmin only)
router.delete('/:id', authorize('superadmin'), logActivity('DELETE', 'users'), async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.',
      });
    }

    // Prevent deleting superadmin
    if (existingUser.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Tidak dapat menghapus user superadmin.',
      });
    }

    await db.delete(users).where(eq(users.id, id));

    res.json({
      success: true,
      message: 'User berhasil dihapus.',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Reset password user (Admin+)
router.put('/:id/reset-password', authorizeHierarchy('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password baru wajib diisi.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    res.json({
      success: true,
      message: 'Password berhasil direset.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

export default router;
