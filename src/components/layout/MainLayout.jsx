import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Cek apakah di desktop (window.innerWidth > 768)
    const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;
    // Desktop: selalu terbuka default, Mobile: selalu tertutup default
    return isDesktop;
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // Auto open sidebar saat resize ke desktop, auto close saat ke mobile
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth > 768;
      setIsSidebarOpen(isDesktop);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="main-content">
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen}
        />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
