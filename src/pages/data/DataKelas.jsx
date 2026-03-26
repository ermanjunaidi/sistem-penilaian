import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, School, Search, Users } from 'lucide-react';
import { usersAPI } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';

const INITIAL_FORM = {
  nama: '',
  waliKelasId: '',
  waliKelas: '',
  keterangan: '',
};

export default function DataKelas() {
  const { dataKelas, setDataKelas, dataSiswa, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [waliKelasOptions, setWaliKelasOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchWaliKelas = async () => {
      setLoadingUsers(true);
      try {
        const response = await usersAPI.getAll({ role: 'wali_kelas' });
        if (!active) return;
        setWaliKelasOptions(
          (response.data || []).map((user) => ({
            id: user.id,
            nama: user.nama,
            email: user.email,
          }))
        );
      } catch (error) {
        if (!active) return;
        setWaliKelasOptions([]);
      } finally {
        if (active) setLoadingUsers(false);
      }
    };

    fetchWaliKelas();
    return () => {
      active = false;
    };
  }, []);

  const filteredKelas = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return dataKelas;

    return dataKelas.filter((kelas) =>
      kelas.nama?.toLowerCase().includes(keyword) ||
      kelas.waliKelas?.toLowerCase().includes(keyword) ||
      kelas.keterangan?.toLowerCase().includes(keyword)
    );
  }, [dataKelas, searchTerm]);

  const jumlahSiswaByKelas = useMemo(() => {
    return dataSiswa.reduce((acc, siswa) => {
      const namaKelas = siswa.kelas || '';
      if (!namaKelas) return acc;
      acc[namaKelas] = (acc[namaKelas] || 0) + 1;
      return acc;
    }, {});
  }, [dataSiswa]);

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    paginatedData,
  } = usePagination(filteredKelas);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingKelas(null);
  };

  const handleOpenModal = (kelas = null) => {
    if (kelas) {
      setEditingKelas(kelas);
      setFormData({
        nama: kelas.nama || '',
        waliKelasId: kelas.waliKelasId || '',
        waliKelas: kelas.waliKelas || '',
        keterangan: kelas.keterangan || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedWaliKelas = waliKelasOptions.find((user) => user.id === formData.waliKelasId);

    const payload = {
      nama: formData.nama.trim().toUpperCase(),
      waliKelasId: formData.waliKelasId,
      waliKelas: selectedWaliKelas?.nama || '',
      keterangan: formData.keterangan.trim(),
    };

    if (!payload.nama) return;

    const duplicate = dataKelas.find(
      (kelas) => kelas.nama === payload.nama && kelas.id !== editingKelas?.id
    );
    if (duplicate) {
      window.alert('Nama kelas sudah ada.');
      return;
    }

    if (editingKelas) {
      setDataKelas((prev) =>
        prev.map((kelas) => (kelas.id === editingKelas.id ? { ...kelas, ...payload } : kelas))
      );
    } else {
      setDataKelas((prev) => [...prev, { id: generateId(), ...payload }]);
    }

    handleCloseModal();
  };

  const handleDelete = (kelas) => {
    const jumlahSiswa = jumlahSiswaByKelas[kelas.nama] || 0;
    if (jumlahSiswa > 0) {
      window.alert(`Kelas ${kelas.nama} masih dipakai oleh ${jumlahSiswa} siswa.`);
      return;
    }

    if (window.confirm(`Hapus kelas ${kelas.nama}?`)) {
      setDataKelas((prev) => prev.filter((item) => item.id !== kelas.id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Kelas</h1>
        <div className="flex gap-1">
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Tambah Kelas
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <School size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Kelas
          </h3>
          <div className="flex items-center gap-1">
            <Search size={18} color="#64748b" />
            <input
              type="text"
              className="form-input"
              placeholder="Cari kelas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: 250 }}
            />
          </div>
        </div>

        <div className="table-container mobile-card-table">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kelas</th>
                <th>Wali Kelas</th>
                <th>Jumlah Siswa</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredKelas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    <div className="empty-state">
                      <School size={48} className="empty-state-icon" />
                      <p>Belum ada data kelas. Tambahkan kelas terlebih dahulu sebelum input siswa.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((kelas, index) => (
                  <tr key={kelas.id}>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Kelas">
                      <span className="badge badge-primary">{kelas.nama}</span>
                    </td>
                    <td data-label="Wali Kelas">{kelas.waliKelas || '-'}</td>
                    <td data-label="Jumlah Siswa">
                      <span className="badge badge-success">
                        <Users size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                        {jumlahSiswaByKelas[kelas.nama] || 0}
                      </span>
                    </td>
                    <td data-label="Keterangan">{kelas.keterangan || '-'}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(kelas)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(kelas)}>
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

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nama Kelas *</label>
                    <input
                      type="text"
                      name="nama"
                      className="form-input"
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder="Contoh: 7A"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Wali Kelas</label>
                    <select
                      name="waliKelasId"
                      className="form-select"
                      value={formData.waliKelasId}
                      onChange={handleChange}
                      disabled={loadingUsers}
                    >
                      <option value="">
                        {loadingUsers ? 'Memuat data wali kelas...' : 'Pilih Wali Kelas'}
                      </option>
                      {waliKelasOptions.map((waliKelas) => (
                        <option key={waliKelas.id} value={waliKelas.nama}>
                          {waliKelas.nama}
                        </option>
                      ))}
                    </select>
                    {!loadingUsers && waliKelasOptions.length === 0 && (
                      <p style={{ marginTop: 8, fontSize: '0.8125rem', color: '#dc2626' }}>
                        Belum ada user dengan role wali_kelas.
                      </p>
                    )}
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Keterangan</label>
                    <textarea
                      name="keterangan"
                      className="form-textarea"
                      value={formData.keterangan}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary">{editingKelas ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
