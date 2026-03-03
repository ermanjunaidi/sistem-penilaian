import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Book, Search, FileDown, Plus, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const KELAS_OPTIONS = ['7A', '7B', '8A', '8B', '9A', '9B'];

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
    kelas: '',
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
    item.nis?.includes(searchTerm) ||
    item.kelas?.toLowerCase().includes(searchTerm.toLowerCase())
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
      kelas: '',
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

  // Export to Excel
  const handleExport = () => {
    const headers = [
      'No', 'NIS', 'NISN', 'Nama Lengkap', 'L/P', 'Tempat Lahir',
      'Tanggal Lahir', 'Agama', 'Alamat', 'Nama Orang Tua',
      'Telepon Orang Tua', 'Tanggal Masuk', 'Kelas', 'Status'
    ];

    const worksheetData = [
      ['BUKU INDUK SISWA'],
      ['KURIKULUM MERDEKA'],
      [],
      headers
    ];

    filteredData.forEach((item, index) => {
      worksheetData.push([
        index + 1,
        item.nis || '',
        item.nisn || '',
        item.nama || '',
        item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        item.tempatLahir || '',
        item.tanggalLahir || '',
        item.agama || '',
        item.alamat || '',
        item.namaOrtu || '',
        item.teleponOrtu || '',
        item.tanggalMasuk || '',
        item.kelas || '',
        item.status || 'Aktif'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } }
    ];
    ws['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 10 },
      { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 30 }, { wch: 25 },
      { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Buku Induk');
    XLSX.writeFile(wb, `Buku_Induk_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Download Excel Template
  const handleDownloadTemplate = () => {
    const headers = [
      'NIS', 'NISN', 'Nama Lengkap', 'L/P', 'Tempat Lahir',
      'Tanggal Lahir', 'Agama', 'Alamat', 'Nama Orang Tua',
      'Telepon Orang Tua', 'Tanggal Masuk', 'Kelas'
    ];

    const exampleData = [
      ['', '', 'Contoh Siswa 1', 'L', 'Jakarta', '2010-01-15', 'Islam', 'Jl. Contoh No. 1', 'Nama Orang Tua 1', '08123456789', '2024-07-01', '7A'],
      ['', '', 'Contoh Siswa 2', 'P', 'Bandung', '2010-02-20', 'Kristen', 'Jl. Contoh No. 2', 'Nama Orang Tua 2', '08123456780', '2024-07-01', '7B'],
    ];

    const wsData = [
      ['TEMPLATE BUKU INDUK SISWA'],
      ['KURIKULUM MERDEKA'],
      [],
      ['Keterangan:'],
      ['- L/P: Isi dengan L (Laki-laki) atau P (Perempuan)'],
      ['- Tanggal Lahir & Tanggal Masuk: Format YYYY-MM-DD (contoh: 2010-01-15)'],
      ['- Agama: Islam, Kristen, Katolik, Hindu, Buddha, atau Konghucu'],
      ['- Kelas: 7A, 7B, 8A, 8B, 9A, atau 9B'],
      [],
      headers,
      ...exampleData
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 11 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 11 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 11 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 11 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 11 } }
    ];
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 8 },
      { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 30 },
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 8 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_Buku_Induk.xlsx');
  };

  // Import from Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(15, jsonData.length); i++) {
          if (jsonData[i] && jsonData[i].includes('Nama Lengkap')) {
            headerRowIndex = i;
            break;
          }
        }

        const dataRows = jsonData.slice(headerRowIndex + 1);

        const parsedData = dataRows
          .filter(row => row[2] || row[1])
          .map((row) => ({
            id: generateId(),
            nis: row[0] || '',
            nisn: row[1] || '',
            nama: row[2] || '',
            jenisKelamin: row[3] === 'P' || row[3] === 'Perempuan' ? 'P' : 'L',
            tempatLahir: row[4] || '',
            tanggalLahir: formatDate(row[5]),
            agama: row[6] || '',
            alamat: row[7] || '',
            namaOrtu: row[8] || '',
            teleponOrtu: row[9] || '',
            tanggalMasuk: formatDate(row[10]),
            kelas: row[11] || '',
            status: 'Aktif'
          }));

        setImportData(parsedData);
      } catch (error) {
        alert('Error membaca file Excel: ' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  };

  const confirmImport = () => {
    if (importData.length === 0) {
      alert('Tidak ada data untuk diimport');
      return;
    }
    setDataSiswa(prev => [...prev, ...importData]);
    setImportData([]);
    setShowImportModal(false);
    alert(`Berhasil mengimport ${importData.length} data siswa`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Buku Induk</h1>
        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleDownloadTemplate}>
            <FileSpreadsheet size={18} />
            Template
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            <FileDown size={18} />
            Export Excel
          </button>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
            <Upload size={18} />
            Import
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
                    <label className="form-label">Kelas</label>
                    <select name="kelas" className="form-select" value={formData.kelas} onChange={handleChange}>
                      <option value="">Pilih Kelas</option>
                      {KELAS_OPTIONS.map(kelas => (
                        <option key={kelas} value={kelas}>{kelas}</option>
                      ))}
                    </select>
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

      {showImportModal && (
        <div className="modal-overlay" onClick={() => { setShowImportModal(false); setImportData([]); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Import Data Siswa dari Excel</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => { setShowImportModal(false); setImportData([]); }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-2">
                <label className="form-label">Pilih File Excel</label>
                <input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={handleFileImport}
                  className="form-input"
                />
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '8px' }}>
                  <FileSpreadsheet size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Download template terlebih dahulu untuk format yang benar
                </p>
              </div>

              {importData.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '0.9375rem' }}>
                    Preview Data ({importData.length} siswa):
                  </h4>
                  <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>NISN</th>
                          <th>Nama</th>
                          <th>L/P</th>
                          <th>Kelas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.map((siswa, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{siswa.nisn}</td>
                            <td>{siswa.nama}</td>
                            <td>{siswa.jenisKelamin === 'L' ? 'L' : 'P'}</td>
                            <td>{siswa.kelas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { setShowImportModal(false); setImportData([]); }}
              >
                Batal
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={confirmImport}
                disabled={importData.length === 0}
              >
                <Upload size={16} />
                Import {importData.length > 0 && `(${importData.length} Siswa)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
