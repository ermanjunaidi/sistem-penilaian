import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { siswaAPI } from '../../services/api';
import { Plus, Edit, Trash2, UserPlus, FileText } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';

export default function Mutasi() {
  const { mutasi, setMutasi, dataSiswa, refreshDataSiswa, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    siswaId: '',
    jenis: 'Masuk',
    tanggal: '',
    asalSekolah: '',
    tujuanSekolah: '',
    alasan: '',
    keterangan: '',
    nomorSurat: ''
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        siswaId: '',
        jenis: 'Masuk',
        tanggal: '',
        asalSekolah: '',
        tujuanSekolah: '',
        alasan: '',
        keterangan: '',
        nomorSurat: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveMutasi();
  };

  const handleSaveMutasi = async () => {
    if (editingItem) {
      setMutasi(prev => prev.map(m => m.id === editingItem.id ? { ...formData, id: m.id } : m));
    } else {
      const newMutasi = { ...formData, id: generateId() };
      setMutasi(prev => [...prev, newMutasi]);
    }

    if (formData.siswaId) {
      const updatedStatus = formData.jenis === 'Masuk' ? 'Aktif' : 'Pindah';
      try {
        await siswaAPI.update(formData.siswaId, { status: updatedStatus });
        await refreshDataSiswa();
      } catch (err) {
        window.alert(err.message || 'Status siswa gagal diperbarui.');
      }
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data mutasi ini?')) {
      setMutasi(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getSiswaName = (id) => {
    const siswa = dataSiswa.find(s => s.id === id);
    return siswa ? `${siswa.nama}${siswa.kelas ? ` (${siswa.kelas})` : ''}` : '-';
  };

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    paginatedData,
  } = usePagination(mutasi);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mutasi Siswa</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Mutasi
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Mutasi</div>
          <div className="stat-value">{mutasi.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Siswa Masuk</div>
          <div className="stat-value">{mutasi.filter(m => m.jenis === 'Masuk').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Siswa Keluar</div>
          <div className="stat-value">{mutasi.filter(m => m.jenis === 'Keluar').length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <UserPlus size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Mutasi Siswa
          </h3>
        </div>

        <div className="table-container mobile-card-table">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Nama Siswa</th>
                <th>Jenis</th>
                <th>{'Asal/Tujuan Sekolah'}</th>
                <th>Nomor Surat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mutasi.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <FileText size={48} className="empty-state-icon" />
                      <p>Belum ada data mutasi. Klik "Tambah Mutasi" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id}>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Tanggal">{item.tanggal}</td>
                    <td data-label="Nama Siswa"><strong>{getSiswaName(item.siswaId)}</strong></td>
                    <td data-label="Jenis">
                      <span className={`badge ${item.jenis === 'Masuk' ? 'badge-success' : 'badge-danger'}`}>
                        {item.jenis}
                      </span>
                    </td>
                    <td data-label="Asal/Tujuan Sekolah">{item.jenis === 'Masuk' ? item.asalSekolah : item.tujuanSekolah || '-'}</td>
                    <td data-label="Nomor Surat">{item.nomorSurat || '-'}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(item)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
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

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tentang Mutasi Siswa</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Mutasi Siswa</strong> adalah perpindahan peserta didik dari satu sekolah ke sekolah lain atau perpindahan status kepesertaan didikan.</p>
          <br />
          <p><strong>Jenis Mutasi:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li><strong>Mutasi Masuk:</strong> Peserta didik pindahan dari sekolah lain</li>
            <li><strong>Mutasi Keluar:</strong> Peserta didik yang pindah ke sekolah lain</li>
          </ul>
          <br />
          <p><strong>Dokumen yang Diperlukan:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Surat permohonan mutasi dari orang tua/wali</li>
            <li>Surat keterangan pindah dari sekolah asal (untuk mutasi masuk)</li>
            <li>Fotokopi rapor terakhir</li>
            <li>Fotokopi kartu keluarga</li>
          </ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Mutasi' : 'Tambah Mutasi Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Siswa *</label>
                    <select name="siswaId" className="form-select" value={formData.siswaId} onChange={handleChange} required>
                      <option value="">Pilih Siswa</option>
                      {dataSiswa.map(siswa => (
                        <option key={siswa.id} value={siswa.id}>
                          {siswa.nama} ({siswa.nisn}){siswa.kelas ? ` - ${siswa.kelas}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jenis Mutasi *</label>
                    <select name="jenis" className="form-select" value={formData.jenis} onChange={handleChange} required>
                      <option value="Masuk">Mutasi Masuk</option>
                      <option value="Keluar">Mutasi Keluar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal</label>
                    <input type="date" name="tanggal" className="form-input" value={formData.tanggal} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Surat</label>
                    <input type="text" name="nomorSurat" className="form-input" value={formData.nomorSurat} onChange={handleChange} placeholder="Nomor surat mutasi" />
                  </div>
                  {formData.jenis === 'Masuk' && (
                    <div className="form-group full-width">
                      <label className="form-label">Asal Sekolah</label>
                      <input type="text" name="asalSekolah" className="form-input" value={formData.asalSekolah} onChange={handleChange} />
                    </div>
                  )}
                  {formData.jenis === 'Keluar' && (
                    <div className="form-group full-width">
                      <label className="form-label">Tujuan Sekolah</label>
                      <input type="text" name="tujuanSekolah" className="form-input" value={formData.tujuanSekolah} onChange={handleChange} />
                    </div>
                  )}
                  <div className="form-group full-width">
                    <label className="form-label">Alasan</label>
                    <textarea name="alasan" className="form-textarea" value={formData.alasan} onChange={handleChange} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Keterangan</label>
                    <textarea name="keterangan" className="form-textarea" value={formData.keterangan} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
