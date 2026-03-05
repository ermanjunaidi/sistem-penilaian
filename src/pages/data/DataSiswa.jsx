import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, Search, UserPlus, FileDown, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';

const KELAS_OPTIONS = ['7A', '7B', '8A', '8B', '9A', '9B'];

export default function DataSiswa() {
  const { dataSiswa, setDataSiswa, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
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
    siswa.nis.includes(searchTerm) ||
    siswa.kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    paginatedData,
  } = usePagination(filteredSiswa);

  const {
    currentPage: importCurrentPage,
    setCurrentPage: setImportCurrentPage,
    itemsPerPage: importItemsPerPage,
    setItemsPerPage: setImportItemsPerPage,
    totalItems: importTotalItems,
    totalPages: importTotalPages,
    startIndex: importStartIndex,
    paginatedData: paginatedImportData,
  } = usePagination(importData, 5);

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

  // Export to Excel
  const handleExport = () => {
    const headers = [
      'No', 'NIS', 'NISN', 'Nama Lengkap', 'L/P', 'Tempat Lahir', 
      'Tanggal Lahir', 'Agama', 'Alamat', 'Nama Orang Tua', 
      'Telepon Orang Tua', 'Tanggal Masuk', 'Kelas'
    ];

    const worksheetData = [headers];

    filteredSiswa.forEach((siswa, index) => {
      worksheetData.push([
        index + 1,
        siswa.nis || '',
        siswa.nisn || '',
        siswa.nama || '',
        siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        siswa.tempatLahir || '',
        siswa.tanggalLahir || '',
        siswa.agama || '',
        siswa.alamat || '',
        siswa.namaOrtu || '',
        siswa.teleponOrtu || '',
        siswa.tanggalMasuk || '',
        siswa.kelas || ''
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 15 }, // NIS
      { wch: 15 }, // NISN
      { wch: 30 }, // Nama
      { wch: 10 }, // L/P
      { wch: 20 }, // Tempat Lahir
      { wch: 15 }, // Tanggal Lahir
      { wch: 10 }, // Agama
      { wch: 30 }, // Alamat
      { wch: 25 }, // Nama Ortu
      { wch: 15 }, // Telepon
      { wch: 15 }, // Tgl Masuk
      { wch: 8 }   // Kelas
    ];

    // Merge cells for title
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }];
    
    // Combine title and data
    const wb = XLSX.utils.book_new();
    
    // Create formatted worksheet
    const finalData = [
      ['DATA SISWA - KURIKULUM MERDEKA'],
      [],
      headers,
      ...worksheetData.slice(1)
    ];
    
    const finalWs = XLSX.utils.aoa_to_sheet(finalData);
    finalWs['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }];
    finalWs['!cols'] = ws['!cols'];
    
    XLSX.utils.book_append_sheet(wb, finalWs, 'Data Siswa');
    XLSX.writeFile(wb, `Data_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      ['', '', 'Contoh Siswa 3', 'L', 'Surabaya', '2009-03-10', 'Islam', 'Jl. Contoh No. 3', 'Nama Orang Tua 3', '08123456781', '2023-07-01', '8A'],
    ];

    const wsData = [
      ['TEMPLATE IMPORT DATA SISWA'],
      ['KURIKULUM MERDEKA'],
      [],
      ['Keterangan:'],
      ['- L/P: Isi dengan L (Laki-laki) atau P (Perempuan)'],
      ['- Tanggal Lahir & Tanggal Masuk: Format YYYY-MM-DD (contoh: 2010-01-15)'],
      ['- Agama: Islam, Kristen, Katolik, Hindu, Buddha, atau Konghucu'],
      ['- Kelas: 7A, 7B, 8A, 8B, 9A, atau 9B'],
      ['- Kolom yang wajib diisi: NISN, Nama Lengkap, L/P, Nama Orang Tua'],
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
      { s: { r: 7, c: 0 }, e: { r: 7, c: 11 } },
      { s: { r: 8, c: 0 }, e: { r: 8, c: 11 } }
    ];
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 8 },
      { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 30 },
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 8 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_Import_Data_Siswa.xlsx');
  };

  // Import from Excel
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

        // Find the header row (skip title and info rows)
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(15, jsonData.length); i++) {
          if (jsonData[i] && jsonData[i].includes('Nama Lengkap')) {
            headerRowIndex = i;
            break;
          }
        }

        const dataRows = jsonData.slice(headerRowIndex + 1);

        const parsedData = dataRows
          .filter(row => row[2] || row[1]) // Filter empty rows (check Nama or NISN)
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
            kelas: row[11] || ''
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
        <h1 className="page-title">Data Siswa</h1>
        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleDownloadTemplate}>
            <FileSpreadsheet size={18} />
            Download Template
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            <FileDown size={18} />
            Export Excel
          </button>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
            <Upload size={18} />
            Import Excel
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Tambah Siswa
          </button>
        </div>
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: 250 }}
            />
          </div>
        </div>

        <div className="table-container mobile-card-table">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kelas</th>
                <th>NISN</th>
                <th>Nama Siswa</th>
                <th>L/P</th>
                <th>Tanggal Lahir</th>
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
                      <p>Belum ada data siswa. Klik "Tambah Siswa" atau "Import Excel" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((siswa, index) => (
                  <tr key={siswa.id}>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Kelas"><span className="badge badge-primary">{siswa.kelas || '-'}</span></td>
                    <td data-label="NISN">{siswa.nisn}</td>
                    <td data-label="Nama Siswa"><strong>{siswa.nama}</strong></td>
                    <td data-label="L/P">{siswa.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td data-label="Tanggal Lahir">{siswa.tanggalLahir}</td>
                    <td data-label="Nama Orang Tua">{siswa.namaOrtu}</td>
                    <td data-label="Aksi">
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
        <Pagination
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
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
                    <select name="kelas" className="form-select" value={formData.kelas} onChange={handleChange}>
                      <option value="">Pilih Kelas</option>
                      {KELAS_OPTIONS.map(kelas => (
                        <option key={kelas} value={kelas}>{kelas}</option>
                      ))}
                    </select>
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
                  <div className="table-container mobile-card-table" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                        {paginatedImportData.map((siswa, index) => (
                          <tr key={index}>
                            <td data-label="No">{importStartIndex + index + 1}</td>
                            <td data-label="NISN">{siswa.nisn}</td>
                            <td data-label="Nama">{siswa.nama}</td>
                            <td data-label="L/P">{siswa.jenisKelamin === 'L' ? 'L' : 'P'}</td>
                            <td data-label="Kelas">{siswa.kelas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    totalItems={importTotalItems}
                    currentPage={importCurrentPage}
                    totalPages={importTotalPages}
                    itemsPerPage={importItemsPerPage}
                    onPageChange={setImportCurrentPage}
                    onItemsPerPageChange={setImportItemsPerPage}
                  />
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
