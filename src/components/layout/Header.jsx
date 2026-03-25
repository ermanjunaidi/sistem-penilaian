import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Informasi Umum',
  '/dashboard/data-sekolah': 'Data Sekolah',
  '/dashboard/manajemen-user': 'Manajemen User',
  '/dashboard/data-siswa': 'Data Siswa',
  '/dashboard/mata-pelajaran': 'Mata Pelajaran',
  '/dashboard/intrakurikuler': 'Intrakurikuler',
  '/dashboard/ekstrakurikuler': 'Ekstrakurikuler',
  '/dashboard/tujuan-pembelajaran': 'Tujuan Pembelajaran',
  '/dashboard/lingkup-materi': 'Lingkup Materi',
  '/dashboard/asesmen-formatif': 'Asesmen Formatif',
  '/dashboard/asesmen-sumatif': 'Asesmen Sumatif',
  '/dashboard/penilaian-ekstrakurikuler': 'Penilaian Ekstrakurikuler',
  '/dashboard/nilai-akhir': 'Nilai Akhir',
  '/dashboard/sampul-rapor': 'Sampul Rapor',
  '/dashboard/rapor': 'Rapor',
  '/dashboard/mutasi': 'Mutasi',
  '/dashboard/buku-induk': 'Buku Induk',
  '/dashboard/profile': 'Profile Saya',
};

export default function Header({ onToggleSidebar, isSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const pathname = location.pathname;
    const title = pageTitles[pathname] || 'Dashboard';
    setCurrentPage(title);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="header">
      <button
        className="menu-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="header-content">
        <div className="header-title-wrapper">
          <h2>{currentPage}</h2>
          <p className="header-subtitle">Kurikulum Merdeka</p>
        </div>
        <div className="header-info">
          <span className="date">{new Date().toLocaleDateString('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}</span>

          {/* User Profile Dropdown */}
          <div className="user-dropdown" ref={dropdownRef}>
            <button
              className="user-dropdown-toggle"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="User menu"
            >
              <div className="user-avatar">{getInitial(user.nama)}</div>
              <div className="user-info">
                <span className="user-name">{user.nama || 'User'}</span>
              </div>
              <ChevronDown size={16} className={`chevron ${showDropdown ? 'rotated' : ''}`} />
            </button>

            {showDropdown && (
              <div className="user-dropdown-menu">
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/dashboard/profile');
                    setShowDropdown(false);
                  }}
                >
                  <User size={18} />
                  <span>Profile Saya</span>
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item dropdown-item-danger"
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
