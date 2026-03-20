import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  School, 
  CheckCircle, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  Zap
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="home-nav-container">
          <div className="home-logo">
            <School className="text-primary" size={32} />
            <span>Sistem Penilaian</span>
          </div>
          <div className="home-nav-links">
            {isLoggedIn ? (
              <button 
                onClick={() => navigate('/dashboard')} 
                className="btn btn-primary"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')} 
                className="btn btn-primary"
              >
                Login
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            <span>Kurikulum Merdeka Ready</span>
          </div>
          <h1>Kelola Penilaian Sekolah dengan Lebih Efisien</h1>
          <p>
            Platform digital terintegrasi untuk guru dan sekolah dalam mengelola data siswa, 
            asesmen formatif & sumatif, hingga pencetakan rapor Kurikulum Merdeka secara otomatis.
          </p>
          <div className="hero-actions">
            <button 
              onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')} 
              className="btn btn-primary btn-lg"
            >
              {isLoggedIn ? 'Buka Dashboard' : 'Mulai Sekarang'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-placeholder">
            <BarChart3 size={120} strokeWidth={1} />
            <div className="floating-card c1">
              <CheckCircle className="text-success" size={24} />
              <div>
                <small>Asesmen</small>
                <strong>Selesai</strong>
              </div>
            </div>
            <div className="floating-card c2">
              <Users className="text-primary" size={24} />
              <div>
                <small>Siswa</small>
                <strong>1,240</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="section-header">
          <h2>Fitur Unggulan</h2>
          <p>Didesain khusus untuk memenuhi kebutuhan administrasi sekolah modern</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon i1">
              <BookOpen size={24} />
            </div>
            <h3>Manajemen Kurikulum</h3>
            <p>Kelola Tujuan Pembelajaran (TP) dan Lingkup Materi dengan mudah sesuai kebutuhan sekolah.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon i2">
              <ShieldCheck size={24} />
            </div>
            <h3>Input Nilai Cepat</h3>
            <p>Sistem input nilai formatif dan sumatif yang intuitif, mempercepat proses penilaian harian.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon i3">
              <BarChart3 size={24} />
            </div>
            <h3>Otomatisasi Rapor</h3>
            <p>Generate Nilai Akhir dan cetak Rapor Kurikulum Merdeka secara instan tanpa perlu rumus manual.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon i4">
              <Users size={24} />
            </div>
            <h3>Multi-Role</h3>
            <p>Akses terkendali untuk Administrator, Guru, dan Wali Kelas dengan sistem keamanan terjamin.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-info">
            <div className="home-logo">
              <School size={24} />
              <span>Sistem Penilaian</span>
            </div>
            <p>© 2026 Sistem Penilaian Kurikulum Merdeka. Seluruh hak cipta dilindungi.</p>
          </div>
          <div className="footer-bottom">
            <p>Membantu pendidikan Indonesia lebih maju melalui digitalisasi.</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-page {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Quicksand', sans-serif;
        }

        .home-nav {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid #e2e8f0;
          padding: 1rem 0;
        }

        .home-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .home-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 1.25rem;
          color: #1e293b;
        }

        .home-logo svg {
          color: #2563eb;
        }

        .home-hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 6rem 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #dbeafe;
          color: #2563eb;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 600;
          width: fit-content;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          line-height: 1.2;
          font-weight: 800;
          color: #0f172a;
          background: linear-gradient(135deg, #0f172a 0%, #2563eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-content p {
          font-size: 1.125rem;
          color: #475569;
          line-height: 1.7;
          max-width: 500px;
        }

        .btn-lg {
          padding: 1rem 2rem;
          font-size: 1.125rem;
          border-radius: 12px;
        }

        .hero-image {
          position: relative;
        }

        .hero-image-placeholder {
          background: white;
          border-radius: 24px;
          aspect-ratio: 4/3;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          color: #e2e8f0;
          position: relative;
        }

        .floating-card {
          position: absolute;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid #f1f5f9;
        }

        .floating-card strong {
          display: block;
          color: #1e293b;
          font-size: 1.125rem;
        }

        .floating-card small {
          color: #64748b;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .floating-card.c1 {
          top: 15%;
          right: -5%;
          animation: float 3s ease-in-out infinite;
        }

        .floating-card.c2 {
          bottom: 15%;
          left: -5%;
          animation: float 3s ease-in-out infinite 1.5s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .home-features {
          max-width: 1200px;
          margin: 0 auto;
          padding: 6rem 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .section-header p {
          color: #64748b;
          font-size: 1.125rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 2.5rem;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border-color: #dbeafe;
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .feature-icon.i1 { background: #eff6ff; color: #2563eb; }
        .feature-icon.i2 { background: #ecfdf5; color: #10b981; }
        .feature-icon.i3 { background: #fefce8; color: #eab308; }
        .feature-icon.i4 { background: #faf5ff; color: #9333ea; }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: #64748b;
          line-height: 1.6;
        }

        .home-footer {
          background: #0f172a;
          color: white;
          padding: 4rem 2rem;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 2rem;
          margin-bottom: 2rem;
        }

        .footer-info .home-logo {
          color: white;
        }

        .footer-info p {
          color: #94a3b8;
        }

        .footer-bottom {
          color: #64748b;
          font-size: 0.875rem;
        }

        @media (max-width: 968px) {
          .home-hero {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 4rem 2rem;
          }
          
          .hero-content {
            align-items: center;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .hero-image {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .home-nav-container {
            padding: 0 1rem;
          }
          
          .home-logo span {
            display: none;
          }

          .hero-content h1 {
            font-size: 2rem;
          }
        }
      `}} />
    </div>
  );
}
