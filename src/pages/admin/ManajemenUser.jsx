import { useEffect, useMemo, useState, useRef } from 'react';
import { Plus, Search, Users, Edit, Trash2, X, Download, FileDown, FileUp } from 'lucide-react';
import { usersAPI } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';

const INITIAL_FORM = {
  nama: '',
  email: '',
  nip: '',
  password: '',
  role: 'guru',
  telepon: '',
  alamat: '',
};

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'wali_kelas', label: 'Wali Kelas' },
  { value: 'guru', label: 'Guru' },
];

const ROLE_LABELS = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  wali_kelas: 'Wali Kelas',
  guru: 'Guru',
};

export default function ManajemenUser() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingUser(null);
    setError('');
    setSuccessMessage('');
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const blob = await usersAPI.downloadTemplate('xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_users.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'Gagal mengunduh template.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.export('json');
      const data = response.data;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMessage('Data user berhasil diexport.');
    } catch (err) {
      setError(err.message || 'Gagal mengeksport data.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await usersAPI.import(formData);
      if (response.success) {
        setSuccessMessage(response.message || 'Berhasil mengimpor data user.');
        await fetchUsers();
      } else {
        throw new Error(response.message || 'Gagal mengimpor data.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengimpor.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeAddModal = () => {
    resetForm();
    setShowModal(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) =>
      user.nama?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      user.nip?.toLowerCase().includes(keyword) ||
      user.role?.toLowerCase().includes(keyword)
    );
  }, [users, searchTerm]);

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    paginatedData,
  } = usePagination(filteredUsers);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, {
          nama: formData.nama,
          email: formData.email,
          nip: formData.nip,
          role: formData.role,
          telepon: formData.telepon,
          alamat: formData.alamat,
        });
        setSuccessMessage('User berhasil diperbarui.');
      } else {
        await usersAPI.create(formData);
        setSuccessMessage('User berhasil dibuat.');
      }
      resetForm();
      await fetchUsers();
    } catch (err) {
      setError(err.message || (editingUser ? 'Gagal memperbarui user.' : 'Gagal membuat user.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nama: user.nama || '',
      email: user.email || '',
      nip: user.nip || '',
      password: '',
      role: user.role || 'guru',
      telepon: user.telepon || '',
      alamat: user.alamat || '',
    });
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setError('');
    setSuccessMessage('');

    try {
      await usersAPI.delete(userToDelete.id);
      setSuccessMessage('User berhasil dihapus.');
      closeDeleteModal();
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Gagal menghapus user.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manajemen User</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleDownloadTemplate} title="Unduh Template (Excel)" disabled={loading}>
            <Download size={18} />
            Template
          </button>
          {currentUser.role === 'superadmin' && (
            <>
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} title="Import dari CSV/Excel" disabled={loading}>
                <FileUp size={18} />
                Import
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv,.xlsx"
                onChange={handleImport}
              />
            </>
          )}
          <button className="btn btn-secondary" onClick={handleExport} title="Export Data (JSON)" disabled={loading}>
            <FileDown size={18} />
            Export
          </button>
          <button className="btn btn-primary" onClick={openAddModal} disabled={loading}>
            <Plus size={18} />
            Tambah User
          </button>
        </div>
      </div>

      {successMessage && (
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

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Users size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar User
          </h3>
          <div style={{ minWidth: 280 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Cari nama, email, NIP, role..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="table-container mobile-card-table">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Email</th>
                <th>NIP</th>
                <th>Role</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">Memuat data user...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">Belum ada data user.</td>
                </tr>
              ) : (
                paginatedData.map((user, index) => (
                  <tr key={user.id}>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Nama">{user.nama}</td>
                    <td data-label="Email">{user.email}</td>
                    <td data-label="NIP">{user.nip || '-'}</td>
                    <td data-label="Role">{ROLE_LABELS[user.role] || user.role}</td>
                    <td data-label="Status">{user.status || '-'}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(user)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => openDeleteModal(user)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Modal Tambah/Edit User */}
      {showModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingUser ? 'Edit User' : 'Tambah User Baru'}
              </h3>
              <button
                onClick={closeAddModal}
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

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nama *</label>
                    <input
                      type="text"
                      name="nama"
                      className="form-input"
                      value={formData.nama}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NIP</label>
                    <input
                      type="text"
                      name="nip"
                      className="form-input"
                      value={formData.nip}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password {editingUser ? '(opsional)' : '*'}</label>
                    <input
                      type="password"
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleChange}
                      required={!editingUser}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      name="role"
                      className="form-select"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      {ROLE_OPTIONS
                        .filter(option => option.value !== 'superadmin' || currentUser.role === 'superadmin')
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telepon</label>
                    <input
                      type="text"
                      name="telepon"
                      className="form-input"
                      value={formData.telepon}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Alamat</label>
                    <textarea
                      name="alamat"
                      className="form-textarea"
                      value={formData.alamat}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAddModal}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Menyimpan...' : editingUser ? 'Update User' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3 className="modal-title">Konfirmasi Hapus</h3>
              <button
                onClick={closeDeleteModal}
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

            <div className="modal-body">
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Apakah Anda yakin ingin menghapus user ini?
              </p>
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: 'var(--background)',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 4 }}>User:</p>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{userToDelete.nama}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{userToDelete.email}</p>
              </div>
              <p style={{
                marginTop: 16,
                fontSize: '0.8125rem',
                color: '#dc2626',
                background: '#fef2f2',
                padding: '10px 14px',
                borderRadius: 6,
              }}>
                ⚠️ Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeDeleteModal}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                Hapus User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
