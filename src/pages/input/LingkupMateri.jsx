import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';

export default function LingkupMateri() {
  const { lingkupMateri, setLingkupMateri, mataPelajaran, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    mataPelajaranId: '',
    kode: '',
    namaMateri: '',
    deskripsi: '',
    alokasiWaktu: '',
    semester: '1',
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
        kode: '',
        namaMateri: '',
        deskripsi: '',
        alokasiWaktu: '',
        semester: '1',
        keterangan: ''
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
    if (editingItem) {
      setLingkupMateri(prev => prev.map(l => l.id === editingItem.id ? { ...formData, id: l.id } : l));
    } else {
      setLingkupMateri(prev => [...prev, { ...formData, id: generateId() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus lingkup materi ini?')) {
      setLingkupMateri(prev => prev.filter(l => l.id !== id));
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

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    paginatedData,
  } = usePagination(lingkupMateri);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Lingkup Materi</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Lingkup Materi
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <FileText size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Lingkup Materi
          </h3>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Mata Pelajaran</th>
                <th>Nama Materi</th>
                <th>Alokasi Waktu</th>
                <th>Semester</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {lingkupMateri.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <FileText size={48} className="empty-state-icon" />
                      <p>Belum ada lingkup materi. Klik "Tambah Lingkup Materi" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((materi, index) => (
                  <tr key={materi.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{materi.kode}</td>
                    <td><strong>{getMapelName(materi.mataPelajaranId)}</strong></td>
                    <td>{materi.namaMateri}</td>
                    <td>{materi.alokasiWaktu} JP</td>
                    <td>{materi.semester === '1' ? 'Ganjil' : 'Genap'}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(materi)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(materi.id)}>
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
          <h3 className="card-title">Tentang Lingkup Materi</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Lingkup Materi</strong> adalah ruang lingkup materi pembelajaran yang harus dicapai peserta didik untuk mencapai tujuan pembelajaran.</p>
          <br />
          <p><strong>Karakteristik Lingkup Materi:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Relevan dengan tujuan pembelajaran</li>
            <li>Sesuai dengan tingkat perkembangan peserta didik</li>
            <li>Memadai dalam membantu pencapaian kompetensi</li>
            <li>Terstruktur secara sistematis</li>
          </ul>
          <br />
          <p><strong>Pengembangan Materi:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Materi esensial yang wajib dikuasai</li>
            <li>Materi pengayaan untuk pengembangan lebih lanjut</li>
            <li>Materi remedial untuk peserta didik yang membutuhkan</li>
          </ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Lingkup Materi' : 'Tambah Lingkup Materi Baru'}</h3>
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
                    <label className="form-label">Kode Materi</label>
                    <input type="text" name="kode" className="form-input" value={formData.kode} onChange={handleChange} placeholder="Contoh: MAT-001" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Nama Materi *</label>
                    <input type="text" name="namaMateri" className="form-input" value={formData.namaMateri} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alokasi Waktu (JP)</label>
                    <input type="number" name="alokasiWaktu" className="form-input" value={formData.alokasiWaktu} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select name="semester" className="form-select" value={formData.semester} onChange={handleChange}>
                      <option value="1">Ganjil</option>
                      <option value="2">Genap</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Deskripsi Materi</label>
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
                <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
