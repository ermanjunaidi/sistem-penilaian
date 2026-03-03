import jwt from 'jsonwebtoken';
import { db } from '../lib/database.js';
import { users } from '../schema/index.js';
import { eq } from 'drizzle-orm';

// Middleware untuk verifikasi JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ambil user dari database
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.userId),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan.',
      });
    }

    if (user.status !== 'aktif') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
      });
    }

    // Attach user ke request object
    req.user = {
      id: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role,
      nip: user.nip,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token tidak valid.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token telah kadaluarsa. Silakan login kembali.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.',
      error: error.message,
    });
  }
};

// Middleware untuk role-based access control
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke resource ini.',
        required: allowedRoles,
        yourRole: req.user?.role || 'unauthenticated',
      });
    }
    next();
  };
};

// Middleware untuk check permission berdasarkan role hierarchy
export const authorizeHierarchy = (minRole) => {
  const roleHierarchy = {
    guru: 1,
    wali_kelas: 2,
    admin: 3,
    superadmin: 4,
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userRoleLevel = roleHierarchy[req.user.role] || 0;
    const requiredRoleLevel = roleHierarchy[minRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin yang cukup.',
        yourRole: req.user.role,
        requiredRole: minRole,
      });
    }

    next();
  };
};

// Middleware opsional untuk logging activity
export const logActivity = (action, table) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = async (body) => {
      // Log activity after response
      if (req.user) {
        try {
          const { activityLogs } = await import('../schema/index.js');
          db.insert(activityLogs).values({
            userId: req.user.id,
            action,
            table,
            recordId: req.params.id || null,
            newValue: JSON.stringify(body),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
          }).then(() => {}).catch((error) => {
            console.error('Error logging activity:', error);
          });
        } catch (error) {
          console.error('Error logging activity:', error);
        }
      }
      return originalJson(body);
    };

    next();
  };
};
