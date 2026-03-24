import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  School, Users, BookOpen, ClipboardList, Target,
  FileText, CheckSquare, Award, Printer, FileDown,
  UserPlus, Book, Home, Settings, LogOut, User
} from 'lucide-react';

const menuGroups = [
  {
    title: 'INFORMASI',
    items: [
      { path: '/dashboard', label: 'Informasi Umum', icon: Home },
      { path: '/dashboard/data-sekolah', label: 'Data Sekolah', icon: School },
      { path: '/dashboard/manajemen-user', label: 'Manajemen User', icon: Settings },
      { path: '/dashboard/data-siswa', label: 'Data Siswa', icon: Users },
      { path: '/dashboard/mata-pelajaran', label: 'Mata Pelajaran', icon: BookOpen },
    ]
  },
  {
    title: 'KURIKULUM',
    items: [
      { path: '/dashboard/intrakurikuler', label: 'Intrakurikuler', icon: Book },
      { path: '/dashboard/ekstrakurikuler', label: 'Ekstrakurikuler', icon: Users },
    ]
  },
  {
    title: 'INPUT',
    items: [
      { path: '/dashboard/tujuan-pembelajaran', label: 'Tujuan Pembelajaran', icon: Target },
      { path: '/dashboard/lingkup-materi', label: 'Lingkup Materi', icon: FileText },
      { path: '/dashboard/asesmen-formatif', label: 'Asesmen Formatif', icon: CheckSquare },
      { path: '/dashboard/asesmen-sumatif', label: 'Asesmen Sumatif', icon: ClipboardList },
    ]
  },
  {
    title: 'PENILAIAN',
    items: [
      { path: '/dashboard/penilaian-ekstrakurikuler', label: 'Penilaian Ekstrakurikuler', icon: Award },
      { path: '/dashboard/nilai-akhir', label: 'Nilai Akhir', icon: Award },
    ]
  },
  {
    title: 'CETAK',
    items: [
      { path: '/dashboard/sampul-rapor', label: 'Sampul Rapor', icon: Printer },
      { path: '/dashboard/rapor', label: 'Rapor', icon: FileDown },
    ]
  },
  {
    title: 'LAPORAN',
    items: [
      { path: '/dashboard/mutasi', label: 'Mutasi', icon: UserPlus },
      { path: '/dashboard/buku-induk', label: 'Buku Induk', icon: Book },
    ]
  },
];

export default function Sidebar({ isSidebarOpen, onToggleSidebar }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>
              <School size={24} />
              <span>Sistem Penilaian</span>
            </h1>
          </Link>
          <div className="sidebar-header-actions">
            <button
              className="sidebar-toggle"
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              title={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isSidebarOpen ? (
                  <>
                    <line x1="15" y1="18" x2="9" y2="12"></line>
                    <line x1="9" y1="18" x2="15" y2="12"></line>
                  </>
                ) : (
                  <>
                    <line x1="9" y1="6" x2="15" y2="12"></line>
                    <line x1="9" y1="12" x2="15" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
            <button
              className="sidebar-close"
              onClick={onToggleSidebar}
              aria-label="Close menu"
              title="Tutup sidebar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <p className="sidebar-subtitle">Kurikulum Merdeka</p>
      </div>

      {/* <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            <User size={20} />
          </div>
          <div className="sidebar-user-details">
            <div className="sidebar-user-name">{user.nama || 'User'}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div> */}

      <nav className="sidebar-nav">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="nav-group">
            <div className="nav-group-title">{group.title}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  data-label={item.label}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
