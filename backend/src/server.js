import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import siswaRoutes from './routes/siswa.js';
import sekolahRoutes from './routes/sekolah.js';
import mapelRoutes from './routes/mapel.js';
import ekstraRoutes from './routes/ekstra.js';
import penilaianRoutes from './routes/penilaian.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, usersRoutes);
app.use('/api/sekolah', authenticateToken, sekolahRoutes);
app.use('/api/siswa', authenticateToken, siswaRoutes);
app.use('/api/mapel', authenticateToken, mapelRoutes);
app.use('/api/ekstra', authenticateToken, ekstraRoutes);
app.use('/api/penilaian', authenticateToken, penilaianRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 Sistem Penilaian - Backend Server                   ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                           ║
║   Roles Available:                                        ║
║   • Superadmin - Full Access                              ║
║   • Admin - Management Access                             ║
║   • Wali Kelas - Class Teacher Access                     ║
║   • Guru - Teacher Access                                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
