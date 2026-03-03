import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../lib/database.js';
import { users } from '../schema/index.js';
import { eq, or } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
    }

    // Cari user berdasarkan email
    const user = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.nip, email)),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    // Cek status user
    if (user.status !== 'aktif') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
      });
    }

    // Update terakhir login
    await db.update(users)
      .set({ terakhirLogin: new Date() })
      .where(eq(users.id, user.id));

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nama: user.nama,
          nip: user.nip,
          role: user.role,
          foto: user.foto,
          telepon: user.telepon,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Register user baru (hanya untuk superadmin)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { email, password, nama, nip, role, telepon, alamat } = req.body;

    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya superadmin yang dapat mendaftarkan user baru.',
      });
    }

    if (!email || !password || !nama) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, dan nama wajib diisi.',
      });
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.nip, nip)),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email atau NIP sudah terdaftar.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      nama,
      nip,
      role: role || 'guru',
      telepon,
      alamat,
    }).returning();

    res.status(201).json({
      success: true,
      message: 'User berhasil didaftarkan.',
      data: {
        id: newUser[0].id,
        email: newUser[0].email,
        nama: newUser[0].nama,
        nip: newUser[0].nip,
        role: newUser[0].role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
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
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Update profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { nama, telepon, alamat, foto } = req.body;

    await db.update(users)
      .set({
        nama: nama || undefined,
        telepon: telepon || undefined,
        alamat: alamat || undefined,
        foto: foto || undefined,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.id))
      .returning();

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini dan password baru wajib diisi.',
      });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
    });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini salah.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.id));

    res.json({
      success: true,
      message: 'Password berhasil diubah.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
});

export default router;
