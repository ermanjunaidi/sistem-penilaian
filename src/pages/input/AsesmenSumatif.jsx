import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, ClipboardList } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';

export default function AsesmenSumatif() {
  const { asesmenSumatif, setAsesmenSumatif, mataPelajaran, dataSiswa, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    mataPelajaranId: '',
    siswaId: '',
    jenis: 'Sumatif Tengah Semester',
    tanggal: '',
    nilai: '',
    kkm: 75,
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
        jenis: 'Sumatif Tengah Semester',
        tanggal: '',
        nilai: '',
        kkm: 75,
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
      setAsesmenSumatif(prev => prev.map(a => a.id === editingItem.id ? { ...formData, id: a.id } : a));
    } else {
      setAsesmenSumatif(prev => [...prev, { ...formData, id: generateId() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus asesmen sumatif ini?')) {
      setAsesmenSumatif(prev => prev.filter(a => a.id !== id));
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

  const getStatus = (nilai, kkm) => {
    if (!nilai) return '-';
    const n = parseInt(nilai);
    const k = parseInt(kkm);
    if (n >= k) return { text: 'Tuntas', color: '#10b981' };
    return { text: 'Remedial', color: '#ef4444' };
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
  } = usePagination(asesmenSumatif);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Asesmen Sumatif</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Asesmen Sumatif
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <ClipboardList size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Asesmen Sumatif
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
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {asesmenSumatif.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-state">
                      <ClipboardList size={48} className="empty-state-icon" />
                      <p>Belum ada asesmen sumatif. Klik "Tambah Asesmen Sumatif" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((asesmen, index) => {
                  const status = getStatus(asesmen.nilai, asesmen.kkm);
                  return (
                    <tr key={asesmen.id}>
                      <td data-label="No">{startIndex + index + 1}</td>
                      <td data-label="Tanggal">{asesmen.tanggal}</td>
                      <td data-label="Mata Pelajaran"><strong>{getMapelName(asesmen.mataPelajaranId)}</strong></td>
                      <td data-label="Siswa">{getSiswaName(asesmen.siswaId)}</td>
                      <td data-label="Jenis">
                        <span className="badge badge-secondary">{asesmen.jenis}</span>
                      </td>
                      <td data-label="Nilai">
                        <strong style={{ color: status.color }}>{asesmen.nilai}</strong>
                      </td>
                      <td data-label="Status">
                        <span style={{ color: status.color, fontWeight: 600 }}>{status.text}</span>
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
                  );
                })
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
          <h3 className="card-title">Tentang Asesmen Sumatif</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Asesmen Sumatif</strong> adalah penilaian yang dilakukan di akhir periode pembelajaran untuk mengukur pencapaian belajar peserta didik.</p>
          <br />
          <p><strong>Tujuan Asesmen Sumatif:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Mengukur pencapaian kompetensi peserta didik</li>
            <li>Menentukan ketuntasan belajar</li>
            <li>Dasar pemberian nilai rapor</li>
            <li>Evaluasi efektivitas pembelajaran</li>
          </ul>
          <br />
          <p><strong>Jenis Asesmen Sumatif:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li><strong>Sumatif Tengah Semester (STS):</strong> Dilakukan di tengah semester</li>
            <li><strong>Sumatif Akhir Semester (SAS):</strong> Dilakukan di akhir semester</li>
            <li><strong>Sumatif Akhir Tahun (SAT):</strong> Dilakukan di akhir tahun ajaran</li>
          </ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Asesmen Sumatif' : 'Tambah Asesmen Sumatif Baru'}</h3>
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
                      <option value="Sumatif Tengah Semester">Sumatif Tengah Semester</option>
                      <option value="Sumatif Akhir Semester">Sumatif Akhir Semester</option>
                      <option value="Sumatif Akhir Tahun">Sumatif Akhir Tahun</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nilai (0-100)</label>
                    <input type="number" name="nilai" className="form-input" value={formData.nilai} onChange={handleChange} min="0" max="100" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">KKM/KKTP</label>
                    <input type="number" name="kkm" className="form-input" value={formData.kkm} onChange={handleChange} min="0" max="100" />
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
