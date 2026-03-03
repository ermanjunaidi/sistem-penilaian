import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, Search, UserPlus } from 'lucide-react';

export default function DataSiswa() {
  const { dataSiswa, setDataSiswa, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    nama: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: 'L',
    agama: '',
    alamat: '',
    namaOrtu: '',
    teleponOrtu: '',
    tanggalMasuk: '',
    kelas: ''
  });

  const filteredSiswa = dataSiswa.filter(siswa => 
    siswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    siswa.nisn.includes(searchTerm) ||
    siswa.nis.includes(searchTerm)
  );

  const handleOpenModal = (siswa = null) => {
    if (siswa) {
      setEditingSiswa(siswa);
      setFormData(siswa);
    } else {
      setEditingSiswa(null);
      setFormData({
        nis: '',
        nisn: '',
        nama: '',
        tempatLahir: '',
        tanggalLahir: '',
        jenisKelamin: 'L',
        agama: '',
        alamat: '',
        namaOrtu: '',
        teleponOrtu: '',
        tanggalMasuk: '',
        kelas: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSiswa(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSiswa) {
      setDataSiswa(prev => prev.map(s => s.id === editingSiswa.id ? { ...formData, id: s.id } : s));
    } else {
      setDataSiswa(prev => [...prev, { ...formData, id: generateId() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      setDataSiswa(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Siswa</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Siswa
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Siswa</h3>
          <div className="flex items-center gap-1">
            <Search size={18} color="#64748b" />
            <input
              type="text"
              className="form-input"
              placeholder="Cari siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 250 }}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>NISN</th>
                <th>Nama Siswa</th>
                <th>L/P</th>
                <th>Tanggal Lahir</th>
                <th>Kelas</th>
                <th>Nama Orang Tua</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-state">
                      <UserPlus size={48} className="empty-state-icon" />
                      <p>Belum ada data siswa. Klik "Tambah Siswa" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((siswa, index) => (
                  <tr key={siswa.id}>
                    <td>{index + 1}</td>
                    <td>{siswa.nisn}</td>
                    <td><strong>{siswa.nama}</strong></td>
                    <td>{siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td>{siswa.tanggalLahir}</td>
                    <td>{siswa.kelas}</td>
                    <td>{siswa.namaOrtu}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(siswa)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(siswa.id)}>
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
              <h3 className="modal-title">{editingSiswa ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">NIS</label>
                    <input type="text" name="nis" className="form-input" value={formData.nis} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NISN *</label>
                    <input type="text" name="nisn" className="form-input" value={formData.nisn} onChange={handleChange} required />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Nama Lengkap *</label>
                    <input type="text" name="nama" className="form-input" value={formData.nama} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tempat Lahir</label>
                    <input type="text" name="tempatLahir" className="form-input" value={formData.tempatLahir} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal Lahir</label>
                    <input type="date" name="tanggalLahir" className="form-input" value={formData.tanggalLahir} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jenis Kelamin</label>
                    <select name="jenisKelamin" className="form-select" value={formData.jenisKelamin} onChange={handleChange}>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Agama</label>
                    <select name="agama" className="form-select" value={formData.agama} onChange={handleChange}>
                      <option value="">Pilih</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Alamat</label>
                    <textarea name="alamat" className="form-textarea" value={formData.alamat} onChange={handleChange} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Nama Orang Tua/Wali *</label>
                    <input type="text" name="namaOrtu" className="form-input" value={formData.namaOrtu} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telepon Orang Tua</label>
                    <input type="text" name="teleponOrtu" className="form-input" value={formData.teleponOrtu} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal Masuk</label>
                    <input type="date" name="tanggalMasuk" className="form-input" value={formData.tanggalMasuk} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kelas</label>
                    <input type="text" name="kelas" className="form-input" value={formData.kelas} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary">{editingSiswa ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
