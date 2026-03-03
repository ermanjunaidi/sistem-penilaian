import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';

export default function MataPelajaran() {
  const { mataPelajaran, setMataPelajaran, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kelompok: 'A',
    fase: '',
    jpPerMinggu: '',
    guru: '',
    keterangan: ''
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        kode: '',
        nama: '',
        kelompok: 'A',
        fase: '',
        jpPerMinggu: '',
        guru: '',
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
      setMataPelajaran(prev => prev.map(m => m.id === editingItem.id ? { ...formData, id: m.id } : m));
    } else {
      setMataPelajaran(prev => [...prev, { ...formData, id: generateId() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      setMataPelajaran(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mata Pelajaran</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Mata Pelajaran
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Mata Pelajaran</h3>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Nama Mata Pelajaran</th>
                <th>Kelompok</th>
                <th>Fase</th>
                <th>JP/Minggu</th>
                <th>Guru</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mataPelajaran.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-state">
                      <BookOpen size={48} className="empty-state-icon" />
                      <p>Belum ada mata pelajaran. Klik "Tambah Mata Pelajaran" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                mataPelajaran.map((mapel, index) => (
                  <tr key={mapel.id}>
                    <td>{index + 1}</td>
                    <td>{mapel.kode}</td>
                    <td><strong>{mapel.nama}</strong></td>
                    <td>
                      <span className={`badge ${mapel.kelompok === 'A' ? 'badge-primary' : 'badge-secondary'}`}>
                        Kelompok {mapel.kelompok}
                      </span>
                    </td>
                    <td>Fase {mapel.fase}</td>
                    <td>{mapel.jpPerMinggu}</td>
                    <td>{mapel.guru}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(mapel)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(mapel.id)}>
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
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Kode Mapel</label>
                    <input type="text" name="kode" className="form-input" value={formData.kode} onChange={handleChange} placeholder="Contoh: MTK" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Nama Mata Pelajaran *</label>
                    <input type="text" name="nama" className="form-input" value={formData.nama} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kelompok</label>
                    <select name="kelompok" className="form-select" value={formData.kelompok} onChange={handleChange}>
                      <option value="A">Kelompok A (Wajib)</option>
                      <option value="B">Kelompok B (Wajib)</option>
                      <option value="C">Kelompok C (Peminatan)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fase</label>
                    <select name="fase" className="form-select" value={formData.fase} onChange={handleChange}>
                      <option value="">Pilih Fase</option>
                      <option value="A">Fase A (Kelas 1-2)</option>
                      <option value="B">Fase B (Kelas 3-4)</option>
                      <option value="C">Fase C (Kelas 5-6)</option>
                      <option value="D">Fase D (Kelas 7-9)</option>
                      <option value="E">Fase E (Kelas 10)</option>
                      <option value="F">Fase F (Kelas 11-12)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">JP Per Minggu</label>
                    <input type="number" name="jpPerMinggu" className="form-input" value={formData.jpPerMinggu} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nama Guru</label>
                    <input type="text" name="guru" className="form-input" value={formData.guru} onChange={handleChange} />
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
