import { NavLink } from 'react-router-dom';
import { 
  School, Users, BookOpen, ClipboardList, Target, 
  FileText, CheckSquare, Award, Printer, FileDown, 
  UserPlus, Book, Home, Settings
} from 'lucide-react';

const menuGroups = [
  {
    title: 'INFORMASI',
    items: [
      { path: '/', label: 'Informasi Umum', icon: Home },
      { path: '/data-sekolah', label: 'Data Sekolah', icon: School },
      { path: '/data-siswa', label: 'Data Siswa', icon: Users },
      { path: '/mata-pelajaran', label: 'Mata Pelajaran', icon: BookOpen },
    ]
  },
  {
    title: 'KURIKULUM',
    items: [
      { path: '/intrakurikuler', label: 'Intrakurikuler', icon: Book },
      { path: '/ekstrakurikuler', label: 'Ekstrakurikuler', icon: Users },
    ]
  },
  {
    title: 'INPUT',
    items: [
      { path: '/tujuan-pembelajaran', label: 'Tujuan Pembelajaran', icon: Target },
      { path: '/lingkup-materi', label: 'Lingkup Materi', icon: FileText },
      { path: '/asesmen-formatif', label: 'Asesmen Formatif', icon: CheckSquare },
      { path: '/asesmen-sumatif', label: 'Asesmen Sumatif', icon: ClipboardList },
    ]
  },
  {
    title: 'PENILAIAN',
    items: [
      { path: '/penilaian-ekstrakurikuler', label: 'Penilaian Ekstrakurikuler', icon: Award },
      { path: '/nilai-akhir', label: 'Nilai Akhir', icon: Award },
    ]
  },
  {
    title: 'CETAK',
    items: [
      { path: '/sampul-rapor', label: 'Sampul Rapor', icon: Printer },
      { path: '/rapor', label: 'Rapor', icon: FileDown },
    ]
  },
  {
    title: 'LAPORAN',
    items: [
      { path: '/mutasi', label: 'Mutasi', icon: UserPlus },
      { path: '/buku-induk', label: 'Buku Induk', icon: Book },
    ]
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>
          <School size={24} />
          Sistem Penilaian
        </h1>
        <p>Kurikulum Merdeka</p>
      </div>
      
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
