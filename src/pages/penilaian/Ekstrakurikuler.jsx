import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, Users, Award } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';

export default function Ekstrakurikuler() {
  const { ekstrakurikuler, setEkstrakurikuler, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    jenis: 'Wajib',
    pembina: '',
    jadwal: '',
    tempat: '',
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
        jenis: 'Wajib',
        pembina: '',
        jadwal: '',
        tempat: '',
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
      setEkstrakurikuler(prev => prev.map(e => e.id === editingItem.id ? { ...formData, id: e.id } : e));
    } else {
      setEkstrakurikuler(prev => [...prev, { ...formData, id: generateId() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus ekstrakurikuler ini?')) {
      setEkstrakurikuler(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
  } = usePagination(ekstrakurikuler);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ekstrakurikuler</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Ekstrakurikuler
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Ekstrakurikuler</div>
          <div className="stat-value">{ekstrakurikuler.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Wajib</div>
          <div className="stat-value">{ekstrakurikuler.filter(e => e.jenis === 'Wajib').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pilihan</div>
          <div className="stat-value">{ekstrakurikuler.filter(e => e.jenis === 'Pilihan').length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Users size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Ekstrakurikuler
          </h3>
        </div>

        <div className="table-container mobile-card-table">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Nama Ekstrakurikuler</th>
                <th>Jenis</th>
                <th>Pembina</th>
                <th>Jadwal</th>
                <th>Tempat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {ekstrakurikuler.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-state">
                      <Award size={48} className="empty-state-icon" />
                      <p>Belum ada ekstrakurikuler. Klik "Tambah Ekstrakurikuler" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((ekstra, index) => (
                  <tr key={ekstra.id}>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Kode">{ekstra.kode}</td>
                    <td data-label="Nama Ekstrakurikuler"><strong>{ekstra.nama}</strong></td>
                    <td data-label="Jenis">
                      <span className={`badge ${ekstra.jenis === 'Wajib' ? 'badge-primary' : 'badge-secondary'}`}>
                        {ekstra.jenis}
                      </span>
                    </td>
                    <td data-label="Pembina">{ekstra.pembina || '-'}</td>
                    <td data-label="Jadwal">{ekstra.jadwal || '-'}</td>
                    <td data-label="Tempat">{ekstra.tempat || '-'}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(ekstra)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ekstra.id)}>
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
          <h3 className="card-title">Tentang Ekstrakurikuler</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Ekstrakurikuler</strong> adalah kegiatan pendidikan di luar mata pelajaran dan pelayanan konseling untuk membantu pengembangan peserta didik sesuai dengan kebutuhan, potensi, bakat, dan minat mereka.</p>
          <br />
          <p><strong>Jenis Ekstrakurikuler:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li><strong>Wajib:</strong> Pramuka (wajib diikuti seluruh siswa)</li>
            <li><strong>Pilihan:</strong> Kegiatan yang dipilih sesuai minat dan bakat siswa</li>
          </ul>
          <br />
          <p><strong>Contoh Ekstrakurikuler Pilihan:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Olahraga (Sepak Bola, Basket, Voli, Badminton, dll)</li>
            <li>Seni (Musik, Tari, Teater, Lukis, dll)</li>
            <li>Ilmiah (KIR, Robotik, Komputer, dll)</li>
            <li>Keagamaan (Rohis, Rohkris, dll)</li>
            <li>Lainnya (PMR, PKS, Paskibra, dll)</li>
          </ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Kode</label>
                    <input type="text" name="kode" className="form-input" value={formData.kode} onChange={handleChange} placeholder="Contoh: PRAMUKA" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Nama Ekstrakurikuler *</label>
                    <input type="text" name="nama" className="form-input" value={formData.nama} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jenis</label>
                    <select name="jenis" className="form-select" value={formData.jenis} onChange={handleChange}>
                      <option value="Wajib">Wajib</option>
                      <option value="Pilihan">Pilihan</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pembina</label>
                    <input type="text" name="pembina" className="form-input" value={formData.pembina} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jadwal</label>
                    <input type="text" name="jadwal" className="form-input" value={formData.jadwal} onChange={handleChange} placeholder="Contoh: Senin, 15.00-17.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tempat</label>
                    <input type="text" name="tempat" className="form-input" value={formData.tempat} onChange={handleChange} />
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
