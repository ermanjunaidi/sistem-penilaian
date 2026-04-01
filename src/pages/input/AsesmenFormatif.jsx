import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { penilaianAPI } from '../../services/api';
import { Plus, Edit, Trash2, CheckSquare } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';

export default function AsesmenFormatif() {
  const { asesmenFormatif, refreshAsesmenFormatif, mataPelajaran, dataSiswa } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const [formData, setFormData] = useState({
    mataPelajaranId: '',
    siswaId: '',
    jenis: 'Kuis',
    tanggal: '',
    nilai: '',
    deskripsi: '',
    keterangan: ''
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        mataPelajaranId: '',
        siswaId: '',
        jenis: 'Kuis',
        tanggal: '',
        nilai: '',
        deskripsi: '',
        keterangan: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ error: '', success: '' });

    const payload = {
      mataPelajaranId: formData.mataPelajaranId,
      siswaId: formData.siswaId,
      jenis: formData.jenis,
      tanggal: formData.tanggal || null,
      nilai: formData.nilai,
      deskripsi: formData.deskripsi.trim(),
      keterangan: formData.keterangan.trim(),
    };

    try {
      if (editingItem) {
        await penilaianAPI.updateFormatif(editingItem.id, payload);
      } else {
        await penilaianAPI.createFormatif(payload);
      }
      await refreshAsesmenFormatif();
      setFeedback({
        error: '',
        success: editingItem ? 'Asesmen formatif berhasil diperbarui.' : 'Asesmen formatif berhasil ditambahkan.',
      });
      handleCloseModal();
    } catch (err) {
      setFeedback({ error: err.message || 'Gagal menyimpan asesmen formatif.', success: '' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus asesmen formatif ini?')) {
      setFeedback({ error: '', success: '' });
      try {
        await penilaianAPI.deleteFormatif(id);
        await refreshAsesmenFormatif();
        setFeedback({ error: '', success: 'Asesmen formatif berhasil dihapus.' });
      } catch (err) {
        setFeedback({ error: err.message || 'Gagal menghapus asesmen formatif.', success: '' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getMapelName = (id) => {
    const mapel = mataPelajaran.find(m => m.id === id);
    return mapel ? mapel.nama : '-';
  };

  const getSiswaName = (id) => {
    const siswa = dataSiswa.find(s => s.id === id);
    return siswa ? siswa.nama : '-';
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
  } = usePagination(asesmenFormatif);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Asesmen Formatif</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Asesmen Formatif
        </button>
      </div>

      {feedback.error && <div className="alert alert-error">{feedback.error}</div>}
      {feedback.success && <div className="alert alert-success">{feedback.success}</div>}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <CheckSquare size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Asesmen Formatif
          </h3>
        </div>

        <div className="table-container mobile-card-table">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Mata Pelajaran</th>
                <th>Siswa</th>
                <th>Jenis</th>
                <th>Nilai</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {asesmenFormatif.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <CheckSquare size={48} className="empty-state-icon" />
                      <p>Belum ada asesmen formatif. Klik "Tambah Asesmen Formatif" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((asesmen, index) => (
                  <tr key={asesmen.id}>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Tanggal">{asesmen.tanggal}</td>
                    <td data-label="Mata Pelajaran"><strong>{getMapelName(asesmen.mataPelajaranId)}</strong></td>
                    <td data-label="Siswa">{getSiswaName(asesmen.siswaId)}</td>
                    <td data-label="Jenis">
                      <span className="badge badge-primary">{asesmen.jenis}</span>
                    </td>
                    <td data-label="Nilai">
                      <strong style={{ color: asesmen.nilai >= 75 ? '#10b981' : '#ef4444' }}>
                        {asesmen.nilai}
                      </strong>
                    </td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(asesmen)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(asesmen.id)}>
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
          <h3 className="card-title">Tentang Asesmen Formatif</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Asesmen Formatif</strong> adalah penilaian yang dilakukan selama proses pembelajaran untuk memberikan umpan balik kepada guru dan peserta didik.</p>
          <br />
          <p><strong>Tujuan Asesmen Formatif:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Memantau kemajuan belajar peserta didik</li>
            <li>Memberikan umpan balik untuk perbaikan</li>
            <li>Membantu guru menyesuaikan strategi pembelajaran</li>
            <li>Mengidentifikasi kesulitan belajar sejak dini</li>
          </ul>
          <br />
          <p><strong>Jenis Asesmen Formatif:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Kuis singkat</li>
            <li>Tanya jawab di kelas</li>
            <li>Observasi selama pembelajaran</li>
            <li>Penilaian tugas praktik</li>
            <li>Refleksi pembelajaran</li>
          </ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Asesmen Formatif' : 'Tambah Asesmen Formatif Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Mata Pelajaran *</label>
                    <select name="mataPelajaranId" className="form-select" value={formData.mataPelajaranId} onChange={handleChange} required>
                      <option value="">Pilih Mata Pelajaran</option>
                      {mataPelajaran.map(mapel => (
                        <option key={mapel.id} value={mapel.id}>{mapel.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Siswa *</label>
                    <select name="siswaId" className="form-select" value={formData.siswaId} onChange={handleChange} required>
                      <option value="">Pilih Siswa</option>
                      {dataSiswa.map(siswa => (
                        <option key={siswa.id} value={siswa.id}>{siswa.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal</label>
                    <input type="date" name="tanggal" className="form-input" value={formData.tanggal} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jenis Asesmen</label>
                    <select name="jenis" className="form-select" value={formData.jenis} onChange={handleChange}>
                      <option value="Kuis">Kuis</option>
                      <option value="Tugas">Tugas</option>
                      <option value="Observasi">Observasi</option>
                      <option value="Presentasi">Presentasi</option>
                      <option value="Diskusi">Diskusi</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nilai (0-100)</label>
                    <input type="number" name="nilai" className="form-input" value={formData.nilai} onChange={handleChange} min="0" max="100" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Deskripsi</label>
                    <textarea name="deskripsi" className="form-textarea" value={formData.deskripsi} onChange={handleChange} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Keterangan</label>
                    <textarea name="keterangan" className="form-textarea" value={formData.keterangan} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : editingItem ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
