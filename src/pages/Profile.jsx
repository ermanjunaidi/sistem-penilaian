import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Save, X } from 'lucide-react';
import { authAPI } from '../services/api';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [formData, setFormData] = useState({
    passwordLama: '',
    passwordBaru: '',
    konfirmasiPassword: '',
  });
  
  const [showPasswordLama, setShowPasswordLama] = useState(false);
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const ROLE_LABELS = {
    superadmin: 'Superadmin',
    admin: 'Admin',
    wali_kelas: 'Wali Kelas',
    guru: 'Guru',
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccessMessage('');
  };

  const resetForm = () => {
    setFormData({
      passwordLama: '',
      passwordBaru: '',
      konfirmasiPassword: '',
    });
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validasi
    if (formData.passwordBaru.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return;
    }

    if (formData.passwordBaru !== formData.konfirmasiPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    if (formData.passwordLama === formData.passwordBaru) {
      setError('Password baru tidak boleh sama dengan password lama.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(formData.passwordLama, formData.passwordBaru);

      setSuccessMessage('Password berhasil diubah.');
      resetForm();
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile Saya</h1>
      </div>

      {successMessage && !showModal && (
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
              {user.nama?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {user.nama || 'User'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {ROLE_LABELS[user.role] || user.role}
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
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user.email || '-'}</p>
            </div>
            <div style={{
              padding: 16,
              background: 'var(--background)',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>NIP</p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user.nip || '-'}</p>
            </div>
            <div style={{
              padding: 16,
              background: 'var(--background)',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Telepon</p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{user.telepon || '-'}</p>
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
          
          <button className="btn btn-primary" onClick={openModal}>
            <Lock size={18} />
            Ubah Password
          </button>
        </div>
      </div>

      {/* Modal Ubah Password */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Lock size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Ubah Password
              </h3>
              <button
                onClick={closeModal}
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
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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

            {successMessage && (
              <div style={{
                margin: '16px 24px 0',
                background: '#ecfdf5',
                border: '1px solid #86efac',
                color: '#166534',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: '0.875rem',
              }}>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Password Lama *</label>
                  <div className="password-input">
                    <input
                      type={showPasswordLama ? 'text' : 'password'}
                      name="passwordLama"
                      className="form-input"
                      value={formData.passwordLama}
                      onChange={handleChange}
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
                      value={formData.passwordBaru}
                      onChange={handleChange}
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
                      value={formData.konfirmasiPassword}
                      onChange={handleChange}
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

                <div style={{
                  marginTop: 16,
                  padding: '12px 14px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  color: '#92400e',
                }}>
                  <strong>💡 Tips:</strong> Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    'Menyimpan...'
                  ) : (
                    <>
                      <Save size={16} />
                      Simpan Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
