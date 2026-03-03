import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, Award } from 'lucide-react';

export default function PenilaianEkstrakurikuler() {
  const { penilaianEkstrakurikuler, setPenilaianEkstrakurikuler, ekstrakurikuler, dataSiswa, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    ekstrakurikulerId: '',
    siswaId: '',
    semester: '1',
    tahunAjaran: '',
    nilai: 'A',
    deskripsi: '',
    predikat: 'Sangat Baik'
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        ekstrakurikulerId: '',
        siswaId: '',
        semester: '1',
        tahunAjaran: '',
        nilai: 'A',
        deskripsi: '',
        predikat: 'Sangat Baik'
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
      setPenilaianEkstrakurikuler(prev => prev.map(p => p.id === editingItem.id ? { ...formData, id: p.id } : p));
    } else {
      setPenilaianEkstrakurikuler(prev => [...prev, { ...formData, id: generateId() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus penilaian ini?')) {
      setPenilaianEkstrakurikuler(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getEkstraName = (id) => {
    const ekstra = ekstrakurikuler.find(e => e.id === id);
    return ekstra ? ekstra.nama : '-';
  };

  const getSiswaName = (id) => {
    const siswa = dataSiswa.find(s => s.id === id);
    return siswa ? siswa.nama : '-';
  };

  const getPredikatFromNilai = (nilai) => {
    const predikatMap = {
      'A': 'Sangat Baik',
      'B': 'Baik',
      'C': 'Cukup',
      'D': 'Kurang'
    };
    return predikatMap[nilai] || '-';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Penilaian Ekstrakurikuler</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Penilaian
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Award size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Penilaian Ekstrakurikuler
          </h3>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Siswa</th>
                <th>Ekstrakurikuler</th>
                <th>Tahun Ajaran</th>
                <th>Semester</th>
                <th>Nilai</th>
                <th>Predikat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {penilaianEkstrakurikuler.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-state">
                      <Award size={48} className="empty-state-icon" />
                      <p>Belum ada penilaian ekstrakurikuler. Klik "Tambah Penilaian" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                penilaianEkstrakurikuler.map((penilaian, index) => (
                  <tr key={penilaian.id}>
                    <td>{index + 1}</td>
                    <td><strong>{getSiswaName(penilaian.siswaId)}</strong></td>
                    <td>{getEkstraName(penilaian.ekstrakurikulerId)}</td>
                    <td>{penilaian.tahunAjaran}</td>
                    <td>{penilaian.semester === '1' ? 'Ganjil' : 'Genap'}</td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: '1.1rem', padding: '4px 12px' }}>
                        {penilaian.nilai}
                      </span>
                    </td>
                    <td>{penilaian.predikat}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(penilaian)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(penilaian.id)}>
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

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pedoman Penilaian Ekstrakurikuler</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Penilaian Ekstrakurikuler</strong> dilakukan untuk mengukur pencapaian kompetensi peserta didik dalam kegiatan ekstrakurikuler.</p>
          <br />
          <p><strong>Kriteria Penilaian:</strong></p>
          <div className="table-container mt-2">
            <table className="table">
              <thead>
                <tr>
                  <th>Nilai</th>
                  <th>Predikat</th>
                  <th>Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>A</strong></td>
                  <td>Sangat Baik</td>
                  <td>Sangat aktif berpartisipasi, menunjukkan kepemimpinan, dan mencapai prestasi</td>
                </tr>
                <tr>
                  <td><strong>B</strong></td>
                  <td>Baik</td>
                  <td>Aktif berpartisipasi dan menunjukkan perkembangan yang baik</td>
                </tr>
                <tr>
                  <td><strong>C</strong></td>
                  <td>Cukup</td>
                  <td>Cukup aktif berpartisipasi dengan perkembangan yang memadai</td>
                </tr>
                <tr>
                  <td><strong>D</strong></td>
                  <td>Kurang</td>
                  <td>Kurang aktif berpartisipasi dan perlu peningkatan</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Penilaian' : 'Tambah Penilaian Ekstrakurikuler Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Ekstrakurikuler *</label>
                    <select name="ekstrakurikulerId" className="form-select" value={formData.ekstrakurikulerId} onChange={handleChange} required>
                      <option value="">Pilih Ekstrakurikuler</option>
                      {ekstrakurikuler.map(ekstra => (
                        <option key={ekstra.id} value={ekstra.id}>{ekstra.nama}</option>
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
                    <label className="form-label">Tahun Ajaran</label>
                    <input type="text" name="tahunAjaran" className="form-input" value={formData.tahunAjaran} onChange={handleChange} placeholder="2024/2025" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select name="semester" className="form-select" value={formData.semester} onChange={handleChange}>
                      <option value="1">Ganjil</option>
                      <option value="2">Genap</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nilai</label>
                    <select name="nilai" className="form-select" value={formData.nilai} onChange={(e) => {
                      handleChange(e);
                      setFormData(prev => ({ ...prev, predikat: getPredikatFromNilai(e.target.value) }));
                    }}>
                      <option value="A">A - Sangat Baik</option>
                      <option value="B">B - Baik</option>
                      <option value="C">C - Cukup</option>
                      <option value="D">D - Kurang</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Predikat</label>
                    <input type="text" name="predikat" className="form-input" value={formData.predikat} onChange={handleChange} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Deskripsi</label>
                    <textarea name="deskripsi" className="form-textarea" value={formData.deskripsi} onChange={handleChange} placeholder="Deskripsi capaian siswa..." />
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
