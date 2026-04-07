import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { siswaAPI } from '../../services/api';
import { Book, Search, FileDown, Plus, Upload, FileSpreadsheet, Edit, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';
import useTableSort from '../../hooks/useTableSort';
import AddDataMenu from '../../components/common/AddDataMenu';
import SortableHeader from '../../components/common/SortableHeader';

const INITIAL_FORM_DATA = {
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
  kelasMasuk: '',
  kelas: '',
  status: 'Aktif',
  tanggalKeluar: '',
  alasanKeluar: '',
  keterangan: ''
};

export default function BukuInduk() {
  const { dataSiswa, refreshDataSiswa, dataKelas, generateId } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);

  const kelasOptions = useMemo(
    () => [...dataKelas].sort((a, b) => a.nama.localeCompare(b.nama, 'id-ID')),
    [dataKelas]
  );

  // Sync with dataSiswa - Buku Induk is the master record
  const syncedBukuInduk = useMemo(() => {
    return dataSiswa.map(siswa => ({
      ...siswa,
      status: siswa.status || 'Aktif'
    }));
  }, [dataSiswa]);

  const filteredData = syncedBukuInduk.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nisn.includes(searchTerm) ||
    item.nis?.includes(searchTerm) ||
    item.kelas?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bukuIndukSortAccessors = useMemo(() => ({
    nisn: (item) => item.nisn || '',
    nama: (item) => item.nama || '',
    jenisKelamin: (item) => item.jenisKelamin || '',
    ttl: (item) => `${item.tempatLahir || ''} ${item.tanggalLahir || ''}`.trim(),
    agama: (item) => item.agama || '',
    namaOrtu: (item) => item.namaOrtu || '',
    alamat: (item) => item.alamat || '',
    tanggalMasuk: (item) => item.tanggalMasuk || '',
    status: (item) => item.status || '',
  }), []);

  const { sortedData, sortConfig, requestSort } = useTableSort(
    filteredData,
    bukuIndukSortAccessors,
    { key: 'nama', direction: 'asc' }
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
  } = usePagination(sortedData);

  const handleOpenModal = (item = null) => {
    if (!item && kelasOptions.length === 0) {
      window.alert('Buat data kelas terlebih dahulu sebelum menambahkan siswa ke Buku Induk.');
      return;
    }

    if (item) {
      setEditingItem(item);
      setFormData({
        nis: item.nis || '',
        nisn: item.nisn || '',
        nama: item.nama || '',
        tempatLahir: item.tempatLahir || '',
        tanggalLahir: item.tanggalLahir || '',
        jenisKelamin: item.jenisKelamin || 'L',
        agama: item.agama || '',
        alamat: item.alamat || '',
        namaOrtu: item.namaOrtu || '',
        teleponOrtu: item.teleponOrtu || '',
        tanggalMasuk: item.tanggalMasuk || '',
        kelasMasuk: item.kelasMasuk || '',
        kelas: item.kelas || '',
        status: item.statusMutasi || item.status || 'Aktif',
        tanggalKeluar: item.tanggalKeluar || '',
        alasanKeluar: item.alasanKeluar || '',
        keterangan: item.keterangan || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        ...INITIAL_FORM_DATA,
        kelas: kelasOptions[0]?.nama || '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveBukuInduk();
  };

  const handleSaveBukuInduk = async () => {
    if (!kelasOptions.some((kelas) => kelas.nama === formData.kelas)) {
      window.alert('Kelas harus dipilih dari data kelas yang sudah dibuat.');
      return;
    }

    const payload = {
      nis: formData.nis,
      nisn: formData.nisn,
      nama: formData.nama,
      tempatLahir: formData.tempatLahir,
      tanggalLahir: formData.tanggalLahir,
      jenisKelamin: formData.jenisKelamin,
      agama: formData.agama,
      alamat: formData.alamat,
      namaOrtu: formData.namaOrtu,
      teleponOrtu: formData.teleponOrtu,
      tanggalMasuk: formData.tanggalMasuk,
      kelas: formData.kelas,
      status: formData.status,
    };

    setSubmitting(true);
    try {
      if (editingItem) {
        await siswaAPI.update(editingItem.id, payload);
      } else {
        await siswaAPI.create(payload);
      }
      await refreshDataSiswa();
      handleCloseModal();
    } catch (err) {
      window.alert(err.message || 'Gagal menyimpan buku induk.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Export to Excel
  const handleExport = () => {
    const headers = [
      'ID', 'No', 'NIS', 'NISN', 'Nama Lengkap', 'L/P', 'Tempat Lahir',
      'Tanggal Lahir', 'Agama', 'Alamat', 'Nama Orang Tua',
      'Telepon Orang Tua', 'Tanggal Masuk', 'Kelas', 'Status'
    ];

    const worksheetData = [
      ['BUKU INDUK SISWA'],
      ['KURIKULUM MERDEKA'],
      [],
      headers
    ];

    sortedData.forEach((item, index) => {
      worksheetData.push([
        item.id || '',
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
      { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } }
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
      ['TEMPLATE BUKU INDUK SISWA'],
      ['KURIKULUM MERDEKA'],
      [],
      ['Keterangan:'],
      ['- L/P: Isi dengan L (Laki-laki) atau P (Perempuan)'],
      ['- Tanggal Lahir & Tanggal Masuk: Format YYYY-MM-DD (contoh: 2010-01-15)'],
      ['- Agama: Islam, Kristen, Katolik, Hindu, Buddha, atau Konghucu'],
      ['- Kelas harus sama dengan data di menu Data Kelas'],
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
  const [importFile, setImportFile] = useState(null);
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

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(15, jsonData.length); i++) {
          const row = (jsonData[i] || []).map((cell) => String(cell || '').trim().toLowerCase());
          if (row.includes('nisn') && (row.includes('nama lengkap') || row.includes('nama siswa') || row.includes('nama'))) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error('Header data siswa tidak ditemukan. Gunakan template yang disediakan aplikasi.');
        }

        const headers = (jsonData[headerRowIndex] || []).map((cell) => String(cell || '').trim().toLowerCase());
        const getColumnIndex = (...aliases) => headers.findIndex((header) => aliases.includes(header));
        const nisIndex = getColumnIndex('nis');
        const nisnIndex = getColumnIndex('nisn');
        const namaIndex = getColumnIndex('nama lengkap', 'nama siswa', 'nama');
        const jkIndex = getColumnIndex('l/p', 'jenis kelamin');
        const tempatIndex = getColumnIndex('tempat lahir');
        const tanggalLahirIndex = getColumnIndex('tanggal lahir');
        const agamaIndex = getColumnIndex('agama');
        const alamatIndex = getColumnIndex('alamat');
        const namaOrtuIndex = getColumnIndex('nama orang tua', 'nama orang tua/wali', 'nama wali');
        const teleponIndex = getColumnIndex('telepon orang tua', 'telepon wali');
        const tanggalMasukIndex = getColumnIndex('tanggal masuk');
        const kelasIndex = getColumnIndex('kelas');

        const dataRows = jsonData.slice(headerRowIndex + 1);

        const parsedData = dataRows
          .filter((row) => {
            const nama = namaIndex >= 0 ? row[namaIndex] : '';
            const nisn = nisnIndex >= 0 ? row[nisnIndex] : '';
            return nama || nisn;
          })
          .map((row) => ({
            id: generateId(),
            nis: nisIndex >= 0 ? row[nisIndex] || '' : '',
            nisn: nisnIndex >= 0 ? row[nisnIndex] || '' : '',
            nama: namaIndex >= 0 ? row[namaIndex] || '' : '',
            jenisKelamin: (() => {
              const nilai = String(jkIndex >= 0 ? row[jkIndex] || '' : '').trim().toUpperCase();
              return nilai === 'P' || nilai.startsWith('PEREMPUAN') ? 'P' : 'L';
            })(),
            tempatLahir: tempatIndex >= 0 ? row[tempatIndex] || '' : '',
            tanggalLahir: formatDate(tanggalLahirIndex >= 0 ? row[tanggalLahirIndex] : ''),
            agama: agamaIndex >= 0 ? row[agamaIndex] || '' : '',
            alamat: alamatIndex >= 0 ? row[alamatIndex] || '' : '',
            namaOrtu: namaOrtuIndex >= 0 ? row[namaOrtuIndex] || '' : '',
            teleponOrtu: teleponIndex >= 0 ? row[teleponIndex] || '' : '',
            tanggalMasuk: formatDate(tanggalMasukIndex >= 0 ? row[tanggalMasukIndex] : ''),
            kelas: kelasIndex >= 0 ? row[kelasIndex] || '' : '',
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

  const confirmImport = async () => {
    if (importData.length === 0) {
      alert('Tidak ada data untuk diimport');
      return;
    }
    if (!importFile) {
      alert('File import tidak ditemukan');
      return;
    }

    const invalidKelas = importData.filter(
      (siswa) => !kelasOptions.some((kelas) => kelas.nama === siswa.kelas)
    );
    if (invalidKelas.length > 0) {
      window.alert(`Ada ${invalidKelas.length} data dengan kelas yang belum dibuat.`);
      return;
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', importFile);
      await siswaAPI.bulkImport(formDataUpload);
      await refreshDataSiswa();
    } catch (err) {
      window.alert(err.message || 'Gagal mengimport buku induk.');
      return;
    }
    setImportData([]);
    setImportFile(null);
    setShowImportModal(false);
    alert(`Berhasil mengimport ${importData.length} data siswa`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data siswa ini dari Buku Induk?')) return;
    try {
      await siswaAPI.delete(id);
      await refreshDataSiswa();
    } catch (err) {
      window.alert(err.message || 'Gagal menghapus data siswa.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Buku Induk</h1>
        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
          <AddDataMenu
            label="Tambah Data"
            actions={[
              {
                label: 'Tambah Siswa',
                icon: <Plus size={18} />,
                onClick: handleOpenModal,
              },
              {
                label: 'Download Template',
                icon: <FileSpreadsheet size={18} />,
                onClick: handleDownloadTemplate,
              },
              {
                label: 'Export Excel',
                icon: <FileDown size={18} />,
                onClick: handleExport,
              },
              {
                label: 'Import Data',
                icon: <Upload size={18} />,
                onClick: () => setShowImportModal(true),
              },
            ]}
          />
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
                <SortableHeader label="NISN" sortKey="nisn" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Nama Lengkap" sortKey="nama" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="L/P" sortKey="jenisKelamin" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="TTL" sortKey="ttl" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Agama" sortKey="agama" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Nama Orang Tua" sortKey="namaOrtu" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Alamat" sortKey="alamat" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Tgl Masuk" sortKey="tanggalMasuk" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Status" sortKey="status" sortConfig={sortConfig} onSort={requestSort} />
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center">
                    <div className="empty-state">
                      <Book size={48} className="empty-state-icon" />
                      <p>Belum ada data dalam buku induk.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id}>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="NISN">{item.nisn}</td>
                    <td data-label="Nama Lengkap"><strong>{item.nama}</strong></td>
                    <td data-label="L/P">{item.jenisKelamin === 'L' ? 'L' : 'P'}</td>
                    <td data-label="TTL">{item.tempatLahir}, {item.tanggalLahir}</td>
                    <td data-label="Agama">{item.agama || '-'}</td>
                    <td data-label="Nama Orang Tua">{item.namaOrtu}</td>
                    <td data-label="Alamat" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.alamat}
                    </td>
                    <td data-label="Tgl Masuk">{item.tanggalMasuk || '-'}</td>
                    <td data-label="Status">
                      <span className={`badge ${
                        item.status === 'Aktif' ? 'badge-success' : 
                        item.status === 'Lulus' ? 'badge-primary' : 'badge-secondary'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(item)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
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
              <h3 className="modal-title">{editingItem ? 'Edit Siswa Buku Induk' : 'Tambah Siswa ke Buku Induk'}</h3>
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
                      {kelasOptions.map((kelas) => (
                        <option key={kelas.id} value={kelas.nama}>{kelas.nama}</option>
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
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Menyimpan...' : editingItem ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={() => { setShowImportModal(false); setImportData([]); setImportFile(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Import Data Siswa dari Excel</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => { setShowImportModal(false); setImportData([]); setImportFile(null); }}>×</button>
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
                onClick={() => { setShowImportModal(false); setImportData([]); setImportFile(null); }}
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
