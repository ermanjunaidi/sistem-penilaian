import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { siswaAPI, hasPermission } from '../../services/api';
import { Plus, Edit, Trash2, Search, UserPlus, FileDown, Upload, FileSpreadsheet, School } from 'lucide-react';
import * as XLSX from 'xlsx';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';
import AddDataMenu from '../../components/common/AddDataMenu';

const INITIAL_FORM = {
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
  kelas: '',
  status: 'Aktif',
};

export default function DataSiswa() {
  const { dataSiswa, refreshDataSiswa, dataKelas } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        await refreshDataSiswa();
      } catch (err) {
        setError(err.message || 'Gagal memuat data siswa.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshDataSiswa]);

  const kelasOptions = useMemo(
    () => [...dataKelas].sort((a, b) => a.nama.localeCompare(b.nama, 'id-ID')),
    [dataKelas]
  );

  const filteredSiswa = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return [...dataSiswa]
      .filter((siswa) => !selectedKelas || siswa.kelas === selectedKelas)
      .filter((siswa) => {
        if (!keyword) return true;
        return (
          siswa.nama?.toLowerCase().includes(keyword) ||
          siswa.nisn?.includes(searchTerm) ||
          (siswa.nis || '').includes(searchTerm) ||
          (siswa.kelas || '').toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const kelasCompare = (a.kelas || '').localeCompare(b.kelas || '', 'id-ID');
        if (kelasCompare !== 0) return kelasCompare;
        return (a.nama || '').localeCompare(b.nama || '', 'id-ID');
      });
  }, [dataSiswa, searchTerm, selectedKelas]);

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
    if (kelasOptions.length === 0) {
      window.alert('Buat data kelas terlebih dahulu sebelum menambahkan siswa.');
      return;
    }

    if (siswa) {
      setEditingSiswa(siswa);
      setFormData({ ...INITIAL_FORM, ...siswa, status: siswa.status || 'Aktif' });
    } else {
      setEditingSiswa(null);
      setFormData({
        ...INITIAL_FORM,
        kelas: selectedKelas || kelasOptions[0]?.nama || '',
      });
    }
    setError('');
    setSuccessMessage('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSiswa(null);
    setFormData(INITIAL_FORM);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!kelasOptions.some((kelas) => kelas.nama === formData.kelas)) {
      setError('Kelas harus dipilih dari data kelas yang sudah dibuat.');
      return;
    }

    const payload = {
      nis: formData.nis.trim(),
      nisn: formData.nisn.trim(),
      nama: formData.nama.trim(),
      tempatLahir: formData.tempatLahir.trim(),
      tanggalLahir: formData.tanggalLahir,
      jenisKelamin: formData.jenisKelamin,
      agama: formData.agama.trim(),
      alamat: formData.alamat.trim(),
      namaOrtu: formData.namaOrtu.trim(),
      teleponOrtu: formData.teleponOrtu.trim(),
      tanggalMasuk: formData.tanggalMasuk,
      kelas: formData.kelas,
      status: formData.status,
    };

    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      if (editingSiswa) {
        await siswaAPI.update(editingSiswa.id, payload);
      } else {
        await siswaAPI.create(payload);
      }
      await refreshDataSiswa();
      setSuccessMessage(editingSiswa ? 'Data siswa berhasil diperbarui.' : 'Data siswa berhasil ditambahkan.');
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data siswa.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return;

    setError('');
    setSuccessMessage('');
    try {
      await siswaAPI.delete(id);
      await refreshDataSiswa();
      setSuccessMessage('Data siswa berhasil dihapus.');
    } catch (err) {
      setError(err.message || 'Gagal menghapus data siswa.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleExport = () => {
    const headers = [
      'No', 'Kelas', 'NIS', 'NISN', 'Nama Lengkap', 'L/P', 'Tempat Lahir',
      'Tanggal Lahir', 'Agama', 'Alamat', 'Nama Orang Tua',
      'Telepon Orang Tua', 'Tanggal Masuk', 'Status'
    ];

    const worksheetData = [headers];

    filteredSiswa.forEach((siswa, index) => {
      worksheetData.push([
        index + 1,
        siswa.kelas || '',
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
        siswa.status || 'Aktif',
      ]);
    });

    const wb = XLSX.utils.book_new();
    const finalData = [
      ['DATA SISWA PER KELAS'],
      [selectedKelas ? `Kelas: ${selectedKelas}` : 'Semua Kelas'],
      [],
      headers,
      ...worksheetData.slice(1),
    ];
    const ws = XLSX.utils.aoa_to_sheet(finalData);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    XLSX.writeFile(wb, `Data_Siswa_${selectedKelas || 'Semua_Kelas'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const sampleKelas = kelasOptions[0]?.nama || '7A';
    const headers = [
      'NIS', 'NISN', 'Nama Lengkap', 'L/P', 'Tempat Lahir',
      'Tanggal Lahir', 'Agama', 'Alamat', 'Nama Orang Tua',
      'Telepon Orang Tua', 'Tanggal Masuk', 'Kelas'
    ];
    const exampleData = [
      ['', '', 'Contoh Siswa 1', 'L', 'Jakarta', '2010-01-15', 'Islam', 'Jl. Contoh No. 1', 'Nama Orang Tua 1', '08123456789', '2024-07-01', sampleKelas],
      ['', '', 'Contoh Siswa 2', 'P', 'Bandung', '2010-02-20', 'Kristen', 'Jl. Contoh No. 2', 'Nama Orang Tua 2', '08123456780', '2024-07-01', sampleKelas],
    ];
    const wsData = [
      ['TEMPLATE IMPORT DATA SISWA'],
      ['Kelas harus sudah dibuat di menu Data Kelas'],
      [],
      ['Keterangan:'],
      ['- L/P: Isi dengan L atau P'],
      ['- Tanggal: gunakan format YYYY-MM-DD'],
      ['- Kelas: wajib sama dengan nama kelas di menu Data Kelas'],
      ['- Kolom wajib: NISN, Nama Lengkap, L/P, Nama Orang Tua, Kelas'],
      [],
      headers,
      ...exampleData,
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(XLSX.utils.book_new(), ws, 'Template');
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Template_Import_Data_Siswa.xlsx');
  };

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
          .filter((row) => row[2] || row[1])
          .map((row) => ({
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
            status: 'Aktif',
          }));

        setImportData(parsedData);
      } catch (err) {
        window.alert(`Error membaca file Excel: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return date;
  };

  const confirmImport = async () => {
    if (importData.length === 0) {
      window.alert('Tidak ada data untuk diimport');
      return;
    }

    const invalidKelas = importData.filter(
      (siswa) => !kelasOptions.some((kelas) => kelas.nama === siswa.kelas)
    );
    if (invalidKelas.length > 0) {
      window.alert(`Ada ${invalidKelas.length} data siswa dengan kelas yang belum dibuat.`);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      await siswaAPI.bulkImport(importData);
      await refreshDataSiswa();
      setImportData([]);
      setShowImportModal(false);
      setSuccessMessage(`Berhasil mengimport ${importData.length} data siswa.`);
    } catch (err) {
      setError(err.message || 'Gagal mengimport data siswa.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Siswa</h1>
        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
          <AddDataMenu
            label="Tambah Data"
            disabled={loading || submitting}
            actions={[
              hasPermission('wali_kelas') && { label: 'Tambah Siswa', icon: <Plus size={18} />, onClick: () => handleOpenModal() },
              { label: 'Download Template', icon: <FileSpreadsheet size={18} />, onClick: handleDownloadTemplate },
              { label: 'Export Excel', icon: <FileDown size={18} />, onClick: handleExport },
              hasPermission('wali_kelas') && { label: 'Import Excel', icon: <Upload size={18} />, onClick: () => setShowImportModal(true) },
            ].filter(Boolean)}
          />
        </div>
      </div>

      {successMessage && (
        <div style={{ background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>
          {successMessage}
        </div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">
            <School size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Filter Kelas
          </h3>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-select" value={selectedKelas} onChange={(e) => { setSelectedKelas(e.target.value); setCurrentPage(1); }} style={{ maxWidth: 260 }}>
            <option value="">Semua Kelas</option>
            {kelasOptions.map((kelas) => (
              <option key={kelas.id} value={kelas.nama}>{kelas.nama}</option>
            ))}
          </select>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {selectedKelas ? `Menampilkan siswa di kelas ${selectedKelas}` : 'Pilih kelas untuk melihat nama anak per kelas'}
          </div>
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
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
              {loading ? (
                <tr><td colSpan="8" className="text-center">Memuat data siswa...</td></tr>
              ) : filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-state">
                      <UserPlus size={48} className="empty-state-icon" />
                      <p>{kelasOptions.length === 0 ? 'Belum ada data kelas. Tambahkan kelas terlebih dahulu.' : 'Belum ada data siswa pada filter ini.'}</p>
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
                    <td data-label="Tanggal Lahir">{siswa.tanggalLahir || '-'}</td>
                    <td data-label="Nama Orang Tua">{siswa.namaOrtu}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(siswa)}><Edit size={16} /></button>
                        {hasPermission('wali_kelas') && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(siswa.id)}><Trash2 size={16} /></button>
                        )}
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
            {error && (
              <div style={{ margin: '16px 24px 0', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 8, fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Kelas *</label>
                    <select name="kelas" className="form-select" value={formData.kelas} onChange={handleChange} required>
                      <option value="">Pilih Kelas</option>
                      {kelasOptions.map((kelas) => <option key={kelas.id} value={kelas.nama}>{kelas.nama}</option>)}
                    </select>
                  </div>
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
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Menyimpan...' : editingSiswa ? 'Update' : 'Simpan'}</button>
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
                <input type="file" accept=".xlsx,.xls" onChange={handleFileImport} className="form-input" />
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '8px' }}>
                  <FileSpreadsheet size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Pastikan nama kelas di file sama persis dengan data pada menu Data Kelas
                </p>
              </div>

              {importData.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '0.9375rem' }}>Preview Data ({importData.length} siswa):</h4>
                  <div className="table-container mobile-card-table" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table">
                      <thead>
                        <tr><th>No</th><th>NISN</th><th>Nama</th><th>L/P</th><th>Kelas</th></tr>
                      </thead>
                      <tbody>
                        {paginatedImportData.map((siswa, index) => (
                          <tr key={`${siswa.nisn}-${index}`}>
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
              <button type="button" className="btn btn-secondary" onClick={() => { setShowImportModal(false); setImportData([]); }}>Batal</button>
              <button type="button" className="btn btn-primary" onClick={confirmImport} disabled={importData.length === 0 || submitting}>
                <Upload size={16} />
                {submitting ? 'Mengimport...' : `Import${importData.length > 0 ? ` (${importData.length} Siswa)` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
