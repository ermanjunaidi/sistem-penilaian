import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';

export default function TujuanPembelajaran() {
  const { tujuanPembelajaran, setTujuanPembelajaran, mataPelajaran, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    mataPelajaranId: '',
    kode: '',
    deskripsi: '',
    fase: '',
    elemen: '',
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
        deskripsi: '',
        fase: '',
        elemen: '',
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
      setTujuanPembelajaran(prev => prev.map(t => t.id === editingItem.id ? { ...formData, id: t.id } : t));
    } else {
      setTujuanPembelajaran(prev => [...prev, { ...formData, id: generateId() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tujuan pembelajaran ini?')) {
      setTujuanPembelajaran(prev => prev.filter(t => t.id !== id));
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
  } = usePagination(tujuanPembelajaran);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tujuan Pembelajaran</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Tujuan Pembelajaran
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Target size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Tujuan Pembelajaran
          </h3>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Mata Pelajaran</th>
                <th>Fase</th>
                <th>Elemen</th>
                <th>Deskripsi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tujuanPembelajaran.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <Target size={48} className="empty-state-icon" />
                      <p>Belum ada tujuan pembelajaran. Klik "Tambah Tujuan Pembelajaran" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((tp, index) => (
                  <tr key={tp.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{tp.kode}</td>
                    <td><strong>{getMapelName(tp.mataPelajaranId)}</strong></td>
                    <td>Fase {tp.fase}</td>
                    <td>{tp.elemen}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tp.deskripsi}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(tp)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tp.id)}>
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
          <h3 className="card-title">Tentang Tujuan Pembelajaran</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Tujuan Pembelajaran (TP)</strong> adalah pernyataan tentang kemampuan yang perlu dicapai peserta didik pada akhir satu unit pembelajaran.</p>
          <br />
          <p><strong>Karakteristik Tujuan Pembelajaran:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Menggambarkan kompetensi yang ingin dicapai</li>
            <li>Disusun berdasarkan Capaian Pembelajaran (CP)</li>
            <li>Dapat dicapai dalam satu atau lebih pertemuan</li>
            <li>Menjadi acuan dalam menyusun asesmen</li>
          </ul>
          <br />
          <p><strong>Elemen dalam Tujuan Pembelajaran:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li><strong>Kompetensi:</strong> Kemampuan yang harus ditunjukkan</li>
            <li><strong>Konten:</strong> Materi pembelajaran yang akan dikuasai</li>
            <li><strong>Konteks:</strong> Situasi atau kondisi penerapan kompetensi</li>
          </ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran Baru'}</h3>
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
                    <label className="form-label">Kode TP</label>
                    <input type="text" name="kode" className="form-input" value={formData.kode} onChange={handleChange} placeholder="Contoh: TP-001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fase</label>
                    <select name="fase" className="form-select" value={formData.fase} onChange={handleChange}>
                      <option value="">Pilih Fase</option>
                      <option value="A">Fase A</option>
                      <option value="B">Fase B</option>
                      <option value="C">Fase C</option>
                      <option value="D">Fase D</option>
                      <option value="E">Fase E</option>
                      <option value="F">Fase F</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Elemen</label>
                    <input type="text" name="elemen" className="form-input" value={formData.elemen} onChange={handleChange} placeholder="Contoh: Menyimak, Membaca" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Deskripsi Tujuan Pembelajaran *</label>
                    <textarea name="deskripsi" className="form-textarea" value={formData.deskripsi} onChange={handleChange} required style={{ minHeight: 120 }} />
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
