import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header({ onToggleSidebar, isSidebarOpen }) {
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
        <h2>{currentPage}</h2>
        <div className="header-info">
          <span className="date">{new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>
    </header>
  );
}
