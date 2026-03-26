import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useAutoLogout } from './hooks/useAutoLogout';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Profile from './pages/Profile';
import InformasiUmum from './pages/informasi/InformasiUmum';
import DataSekolah from './pages/informasi/DataSekolah';
import DataSiswa from './pages/data/DataSiswa';
import DataKelas from './pages/data/DataKelas';
import MataPelajaran from './pages/data/MataPelajaran';
import Intrakurikuler from './pages/penilaian/Intrakurikuler';
import Ekstrakurikuler from './pages/penilaian/Ekstrakurikuler';
import TujuanPembelajaran from './pages/input/TujuanPembelajaran';
import LingkupMateri from './pages/input/LingkupMateri';
import AsesmenFormatif from './pages/input/AsesmenFormatif';
import AsesmenSumatif from './pages/input/AsesmenSumatif';
import PenilaianEkstrakurikuler from './pages/penilaian/PenilaianEkstrakurikuler';
import NilaiAkhir from './pages/penilaian/NilaiAkhir';
import SampulRapor from './pages/cetak/SampulRapor';
import Rapor from './pages/cetak/Rapor';
import Mutasi from './pages/laporan/Mutasi';
import BukuInduk from './pages/laporan/BukuInduk';
import ManajemenUser from './pages/admin/ManajemenUser';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h1>Akses Ditolak</h1>
        <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <p>Role Anda: {user.role}</p>
        <p>Role yang diperlukan: {allowedRoles.join(', ')}</p>
      </div>
    );
  }

  return children;
}

// App Routes Component
function AppRoutes() {
  const token = localStorage.getItem('token');

  // Auto-logout setelah 3 menit tidak aktif
  useAutoLogout();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={
          <ProtectedRoute><InformasiUmum /></ProtectedRoute>
        } />
        
        {/* Informasi - All roles */}
        <Route path="data-sekolah" element={
          <ProtectedRoute><DataSekolah /></ProtectedRoute>
        } />
        <Route path="data-siswa" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin', 'wali_kelas']}><DataSiswa /></ProtectedRoute>
        } />
        <Route path="data-kelas" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin', 'wali_kelas']}><DataKelas /></ProtectedRoute>
        } />
        <Route path="mata-pelajaran" element={
          <ProtectedRoute><MataPelajaran /></ProtectedRoute>
        } />
        <Route path="manajemen-user" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}><ManajemenUser /></ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        
        {/* Kurikulum - All roles */}
        <Route path="intrakurikuler" element={
          <ProtectedRoute><Intrakurikuler /></ProtectedRoute>
        } />
        <Route path="ekstrakurikuler" element={
          <ProtectedRoute><Ekstrakurikuler /></ProtectedRoute>
        } />
        
        {/* Input - Guru+ */}
        <Route path="tujuan-pembelajaran" element={
          <ProtectedRoute allowedRoles={['guru', 'wali_kelas', 'admin', 'superadmin']}><TujuanPembelajaran /></ProtectedRoute>
        } />
        <Route path="lingkup-materi" element={
          <ProtectedRoute allowedRoles={['guru', 'wali_kelas', 'admin', 'superadmin']}><LingkupMateri /></ProtectedRoute>
        } />
        <Route path="asesmen-formatif" element={
          <ProtectedRoute allowedRoles={['guru', 'wali_kelas', 'admin', 'superadmin']}><AsesmenFormatif /></ProtectedRoute>
        } />
        <Route path="asesmen-sumatif" element={
          <ProtectedRoute allowedRoles={['guru', 'wali_kelas', 'admin', 'superadmin']}><AsesmenSumatif /></ProtectedRoute>
        } />
        
        {/* Penilaian - Guru+ */}
        <Route path="penilaian-ekstrakurikuler" element={
          <ProtectedRoute allowedRoles={['guru', 'wali_kelas', 'admin', 'superadmin']}><PenilaianEkstrakurikuler /></ProtectedRoute>
        } />
        <Route path="nilai-akhir" element={
          <ProtectedRoute allowedRoles={['guru', 'wali_kelas', 'admin', 'superadmin']}><NilaiAkhir /></ProtectedRoute>
        } />
        
        {/* Cetak - All roles */}
        <Route path="sampul-rapor" element={
          <ProtectedRoute><SampulRapor /></ProtectedRoute>
        } />
        <Route path="rapor" element={
          <ProtectedRoute><Rapor /></ProtectedRoute>
        } />
        
        {/* Laporan - Admin+ */}
        <Route path="mutasi" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}><Mutasi /></ProtectedRoute>
        } />
        <Route path="buku-induk" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin', 'wali_kelas']}><BukuInduk /></ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
