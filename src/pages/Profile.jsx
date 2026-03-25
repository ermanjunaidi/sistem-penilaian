import { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Save, X, Edit, Mail, Phone } from 'lucide-react';
import { authAPI } from '../services/api';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  const [passwordData, setPasswordData] = useState({
    passwordLama: '',
    passwordBaru: '',
    konfirmasiPassword: '',
  });

  const [profileData, setProfileData] = useState({
    nama: currentUser.nama || '',
    email: currentUser.email || '',
    telepon: currentUser.telepon || '',
    nip: currentUser.nip || '',
  });
  
  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const ROLE_LABELS = {
    superadmin: 'Superadmin',
    admin: 'Admin',
    wali_kelas: 'Wali Kelas',
    guru: 'Guru',
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccessMessage('');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccessMessage('');
  };

  const resetPasswordForm = () => {
    setPasswordData({
      passwordLama: '',
      passwordBaru: '',
      konfirmasiPassword: '',
    });
    setError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (passwordData.passwordBaru.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return;
    }

    if (passwordData.passwordBaru !== passwordData.konfirmasiPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(passwordData.passwordLama, passwordData.passwordBaru);
      setSuccessMessage('Password berhasil diubah.');
      resetPasswordForm();
      setShowPasswordModal(false);
    } catch (err) {
      setError(err.message || 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setProfileLoading(true);

    try {
      await authAPI.updateProfile({
        nama: profileData.nama,
        email: profileData.email,
        telepon: profileData.telepon,
      });

      const updatedUser = { ...currentUser, ...profileData };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccessMessage('Profile berhasil diperbarui.');
      setShowProfileModal(false);
    } catch (err) {
      setError(err.message || 'Gagal memperbarui profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const openProfileModal = () => {
    setProfileData({
      nama: currentUser.nama || '',
      email: currentUser.email || '',
      telepon: currentUser.telepon || '',
      nip: currentUser.nip || '',
    });
    setError('');
    setSuccessMessage('');
    setShowProfileModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile Saya</h1>
      </div>

      {successMessage && !showPasswordModal && !showProfileModal && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #86efac',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: '0.875rem',
        }}>
          {successMessage}
        </div>
      )}

      {/* Profile Info Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <User size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Informasi Profile
          </h3>
          <button className="btn btn-sm btn-secondary" onClick={openProfileModal}>
            <Edit size={16} style={{ marginRight: 4 }} />
            Edit Profile
          </button>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)',
            }}>
              {currentUser.nama?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {currentUser.nama || 'User'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {ROLE_LABELS[currentUser.role] || currentUser.role}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16,
            marginTop: 8,
          }}>
            <div style={{
              padding: 16,
              background: 'var(--background)',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Email</p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{currentUser.email || '-'}</p>
            </div>
            <div style={{
              padding: 16,
              background: 'var(--background)',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>NIP</p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{currentUser.nip || '-'}</p>
            </div>
            <div style={{
              padding: 16,
              background: 'var(--background)',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Telepon</p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{currentUser.telepon || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Lock size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Keamanan Account
          </h3>
        </div>

        <div style={{ padding: 8 }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Ubah password secara berkala untuk menjaga keamanan account Anda.
          </p>
          
          <button className="btn btn-primary" onClick={() => setShowPasswordModal(true)}>
            <Lock size={18} />
            Ubah Password
          </button>
        </div>
      </div>

      {/* Modal Ubah Password */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Lock size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Ubah Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  transition: 'background 0.2s',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{
                margin: '16px 24px 0',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Password Lama *</label>
                  <div className="password-input">
                    <input
                      type={showPasswordLama ? 'text' : 'password'}
                      name="passwordLama"
                      className="form-input"
                      value={passwordData.passwordLama}
                      onChange={handlePasswordChange}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswordLama(!showPasswordLama)}
                      tabIndex={-1}
                    >
                      {showPasswordLama ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Password Baru *</label>
                  <div className="password-input">
                    <input
                      type={showPasswordBaru ? 'text' : 'password'}
                      name="passwordBaru"
                      className="form-input"
                      value={passwordData.passwordBaru}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswordBaru(!showPasswordBaru)}
                      tabIndex={-1}
                    >
                      {showPasswordBaru ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Minimal 6 karakter
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Konfirmasi Password Baru *</label>
                  <div className="password-input">
                    <input
                      type={showKonfirmasi ? 'text' : 'password'}
                      name="konfirmasiPassword"
                      className="form-input"
                      value={passwordData.konfirmasiPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                      tabIndex={-1}
                    >
                      {showKonfirmasi ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Profile */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Edit size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Edit Profile
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{
                margin: '16px 24px 0',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Nama Lengkap *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                    <input
                      type="text"
                      name="nama"
                      className="form-input"
                      style={{ paddingLeft: 40 }}
                      value={profileData.nama}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Email *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      style={{ paddingLeft: 40 }}
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Nomor Telepon</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                    <input
                      type="text"
                      name="telepon"
                      className="form-input"
                      style={{ paddingLeft: 40 }}
                      value={profileData.telepon}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">NIP (Tidak dapat diubah)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.nip}
                    disabled
                    style={{ background: '#f8fafc' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowProfileModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
