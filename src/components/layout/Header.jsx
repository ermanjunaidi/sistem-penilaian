import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header({ onToggleSidebar, isSidebarOpen, colorTheme, onChangeColorTheme }) {
  const [currentPage] = useState('Dashboard');

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
          <h2>Sistem Penilaian</h2>
          <p className="header-subtitle">Kurikulum Merdeka</p>
        </div>
        <div className="header-info">
          <div className="theme-switch" role="group" aria-label="Pilih tema warna">
            <button
              type="button"
              className={`theme-btn ${colorTheme === 'terang' ? 'active' : ''}`}
              onClick={() => onChangeColorTheme('terang')}
            >
              Terang
            </button>
            <button
              type="button"
              className={`theme-btn ${colorTheme === 'gelap' ? 'active' : ''}`}
              onClick={() => onChangeColorTheme('gelap')}
            >
              Gelap
            </button>
          </div>
          <span className="date">{new Date().toLocaleDateString('id-ID', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
          })}</span>
        </div>
      </div>
    </header>
  );
}
