import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Book, Search, FileDown, Plus } from 'lucide-react';

export default function BukuInduk() {
  const { bukuInduk, setBukuInduk, dataSiswa, setDataSiswa, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
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
    kelasMasuk: '',
    status: 'Aktif',
    tanggalKeluar: '',
    alasanKeluar: '',
    keterangan: ''
  });

  // Sync with dataSiswa - Buku Induk is the master record
  const syncedBukuInduk = useMemo(() => {
    return dataSiswa.map(siswa => ({
      ...siswa,
      status: siswa.statusMutasi || 'Aktif'
    }));
  }, [dataSiswa]);

  const filteredData = syncedBukuInduk.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nisn.includes(searchTerm) ||
    item.nis?.includes(searchTerm)
  );

  const handleOpenModal = () => {
    setFormData({
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
      kelasMasuk: '',
      status: 'Aktif',
      tanggalKeluar: '',
      alasanKeluar: '',
      keterangan: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = { ...formData, id: generateId() };
    setDataSiswa(prev => [...prev, newEntry]);
    handleCloseModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = () => {
    const headers = ['No', 'NISN', 'Nama', 'L/P', 'Tanggal Lahir', 'Agama', 'Alamat', 'Nama Orang Tua', 'Tanggal Masuk', 'Kelas', 'Status'];
    const csvData = [headers.join(',')];
    
    filteredData.forEach((item, index) => {
      const row = [
        index + 1,
        item.nisn,
        `"${item.nama}"`,
        item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        item.tanggalLahir,
        item.agama,
        `"${item.alamat}"`,
        `"${item.namaOrtu}"`,
        item.tanggalMasuk,
        item.kelas,
        item.status
      ];
      csvData.push(row.join(','));
    });
    
    const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buku-induk-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Buku Induk</h1>
        <div className="flex gap-1">
          <button className="btn btn-secondary" onClick={handleExport}>
            <FileDown size={18} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <Plus size={18} />
            Tambah Siswa
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Siswa</div>
          <div className="stat-value">{syncedBukuInduk.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Siswa Aktif</div>
          <div className="stat-value">{syncedBukuInduk.filter(s => s.status === 'Aktif').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Siswa Lulus</div>
          <div className="stat-value">{syncedBukuInduk.filter(s => s.status === 'Lulus').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Siswa Pindah</div>
          <div className="stat-value">{syncedBukuInduk.filter(s => s.status === 'Pindah').length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Book size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Siswa dalam Buku Induk
          </h3>
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
                <th>Nama Lengkap</th>
                <th>L/P</th>
                <th>TTL</th>
                <th>Agama</th>
                <th>Nama Orang Tua</th>
                <th>Alamat</th>
                <th>Tgl Masuk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center">
                    <div className="empty-state">
                      <Book size={48} className="empty-state-icon" />
                      <p>Belum ada data dalam buku induk.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.nisn}</td>
                    <td><strong>{item.nama}</strong></td>
                    <td>{item.jenisKelamin === 'L' ? 'L' : 'P'}</td>
                    <td>{item.tempatLahir}, {item.tanggalLahir}</td>
                    <td>{item.agama || '-'}</td>
                    <td>{item.namaOrtu}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.alamat}
                    </td>
                    <td>{item.tanggalMasuk || '-'}</td>
                    <td>
                      <span className={`badge ${
                        item.status === 'Aktif' ? 'badge-success' : 
                        item.status === 'Lulus' ? 'badge-primary' : 'badge-secondary'
                      }`}>
                        {item.status}
                      </span>
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
          <h3 className="card-title">Tentang Buku Induk</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Buku Induk</strong> adalah catatan resmi sekolah yang memuat data lengkap seluruh peserta didik yang pernah terdaftar di sekolah tersebut.</p>
          <br />
          <p><strong>Fungsi Buku Induk:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Mencatat semua siswa yang pernah bersekolah</li>
            <li>Sebagai arsip resmi sekolah</li>
            <li>Sumber data untuk berbagai keperluan administrasi</li>
            <li>Dasar penerbitan surat keterangan</li>
          </ul>
          <br />
          <p><strong>Status Siswa:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li><strong>Aktif:</strong> Siswa yang masih terdaftar dan belajar di sekolah</li>
            <li><strong>Lulus:</strong> Siswa yang telah menyelesaikan pendidikan</li>
            <li><strong>Pindah:</strong> Siswa yang pindah ke sekolah lain</li>
            <li><strong>Drop Out:</strong> Siswa yang berhenti sebelum menyelesaikan pendidikan</li>
          </ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Tambah Siswa ke Buku Induk</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">NISN *</label>
                    <input type="text" name="nisn" className="form-input" value={formData.nisn} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NIS</label>
                    <input type="text" name="nis" className="form-input" value={formData.nis} onChange={handleChange} />
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
                    <label className="form-label">Kelas Masuk</label>
                    <input type="text" name="kelasMasuk" className="form-input" value={formData.kelasMasuk} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                      <option value="Aktif">Aktif</option>
                      <option value="Lulus">Lulus</option>
                      <option value="Pindah">Pindah</option>
                      <option value="Drop Out">Drop Out</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Keterangan</label>
                    <textarea name="keterangan" className="form-textarea" value={formData.keterangan} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
