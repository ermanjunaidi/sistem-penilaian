import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Users, Edit, Trash2 } from 'lucide-react';
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

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingUser(null);
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
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Hapus user "${user.nama}"?`);
    if (!confirmed) return;

    setError('');
    setSuccessMessage('');

    try {
      await usersAPI.delete(user.id);
      if (editingUser?.id === user.id) {
        resetForm();
      }
      setSuccessMessage('User berhasil dihapus.');
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Gagal menghapus user.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manajemen User</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Plus size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Tambah User
          </h3>
        </div>

        {error && <div className="error-message">{error}</div>}
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

        <form onSubmit={handleSubmit}>
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
                disabled={Boolean(editingUser)}
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
                {ROLE_OPTIONS.map((option) => (
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
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : editingUser ? 'Update User' : 'Simpan User'}
            </button>
            {editingUser && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginLeft: 8 }}
                onClick={resetForm}
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

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
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user)}>
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
    </div>
  );
}
