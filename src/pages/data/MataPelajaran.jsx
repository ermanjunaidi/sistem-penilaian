import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, BookOpen, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { mapelAPI, hasPermission } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';
import AddDataMenu from '../../components/common/AddDataMenu';

export default function MataPelajaran() {
  const { mataPelajaran, refreshMataPelajaran } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kelompok: 'A',
    jpPerMinggu: '',
    guru: '',
    keterangan: ''
  });

  useEffect(() => {
    const load = async () => {
      setIsProcessing(true);
      setError('');
      try {
        await refreshMataPelajaran();
      } catch (err) {
        setError(err.message || 'Gagal memuat mata pelajaran.');
      } finally {
        setIsProcessing(false);
      }
    };
    load();
  }, [refreshMataPelajaran]);

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
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveMapel();
  };

  const handleSaveMapel = async () => {
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');
    try {
      if (editingItem) {
        await mapelAPI.update(editingItem.id, formData);
      } else {
        await mapelAPI.create(formData);
      }
      await refreshMataPelajaran();
      setSuccessMessage(editingItem ? 'Mata pelajaran berhasil diperbarui.' : 'Mata pelajaran berhasil ditambahkan.');
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan mata pelajaran.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) return;
    setIsProcessing(true);
    setError('');
    setSuccessMessage('');
    try {
      await mapelAPI.delete(id);
      await refreshMataPelajaran();
      setSuccessMessage('Mata pelajaran berhasil dihapus.');
    } catch (err) {
      setError(err.message || 'Gagal menghapus mata pelajaran.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Export functions
  const handleExport = async () => {
    try {
      const blob = await mapelAPI.export('xlsx');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mata_pelajaran_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMessage('Data mata pelajaran berhasil diexport.');
    } catch (error) {
      setError('Gagal export data: ' + error.message);
    }
  };

  const handleDownloadTemplate = async (format = 'xlsx') => {
    try {
      console.log('Downloading template:', format);
      const blob = await mapelAPI.downloadTemplate(format);
      console.log('Blob received:', blob.type, blob.size);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_mata_pelajaran.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Gagal download template: ' + error.message);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    setIsProcessing(true);

    try {
      let preview = [];

      if (file.name.endsWith('.xlsx')) {
        // For XLSX, we'll just show a message that preview is not available
        // The actual parsing will be done on the server
        setImportPreview([{ _info: 'Preview tidak tersedia untuk file Excel. Data akan diproses di server.' }]);
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text);
        preview = json.data || json;
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length === headers.length) {
              const row = {};
              headers.forEach((h, idx) => {
                row[h] = values[idx];
              });
              if (row.nama) preview.push(row);
            }
          }
        }
      }

      setImportPreview(preview);
    } catch (error) {
      alert('Gagal membaca file: ' + error.message);
      setImportPreview([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importFile || importPreview.length === 0) {
      alert('Pilih file dan pastikan ada data untuk diimport');
      return;
    }

    if (!window.confirm(`Import ${importPreview.length} mata pelajaran? Data yang duplikat akan diupdate.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', importFile);

      const result = await mapelAPI.import(formDataUpload);

      if (result.success) {
        alert(`Berhasil import ${result.data?.imported || importPreview.length} mata pelajaran!`);
        await refreshMataPelajaran();
      } else {
        alert('Gagal import: ' + result.message);
      }
    } catch (error) {
      alert('Gagal import: ' + error.message);
    } finally {
      setIsProcessing(false);
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
    }
  };

  const handleOpenImportModal = () => {
    setImportFile(null);
    setImportPreview([]);
    setShowImportModal(true);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview([]);
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
  } = usePagination(mataPelajaran);

  return (
    <div>
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
      <div className="page-header">
        <h1 className="page-title">Mata Pelajaran</h1>
        <div className="header-actions">
          <AddDataMenu
            label="Tambah Data"
            disabled={isProcessing}
            actions={[
              hasPermission('wali_kelas') && {
                label: 'Tambah Mata Pelajaran',
                icon: <Plus size={18} />,
                onClick: () => handleOpenModal(),
              },
              {
                label: 'Download Template',
                icon: <FileSpreadsheet size={18} />,
                onClick: () => handleDownloadTemplate('xlsx'),
              },
              {
                label: 'Export Excel',
                icon: <Download size={18} />,
                onClick: handleExport,
              },
              hasPermission('wali_kelas') && {
                label: 'Import Data',
                icon: <Upload size={18} />,
                onClick: handleOpenImportModal,
              },
            ].filter(Boolean)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Daftar Mata Pelajaran</h3>
        </div>

        <div className="table-container mobile-card-table">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Nama Mata Pelajaran</th>
                <th>Kelompok</th>
                <th>JP/Minggu</th>
                <th>Guru</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {mataPelajaran.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <BookOpen size={48} className="empty-state-icon" />
                      <p>Belum ada mata pelajaran. Klik "Tambah Mata Pelajaran" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((mapel, index) => (
                  <tr key={mapel.id}>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Kode">{mapel.kode}</td>
                    <td data-label="Nama Mata Pelajaran"><strong>{mapel.nama}</strong></td>
                    <td data-label="Kelompok">
                      <span className={`badge ${mapel.kelompok === 'A' ? 'badge-primary' : 'badge-secondary'}`}>
                        Kelompok {mapel.kelompok}
                      </span>
                    </td>
                    <td data-label="JP/Minggu">{mapel.jpPerMinggu}</td>
                    <td data-label="Guru">{mapel.guru}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        {hasPermission('wali_kelas') && (
                          <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(mapel)}>
                            <Edit size={16} />
                          </button>
                        )}
                        {hasPermission('admin') && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(mapel.id)}>
                            <Trash2 size={16} />
                          </button>
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
              <h3 className="modal-title">{editingItem ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</h3>
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
                      <option value="A">Kelompok A (Wajib Nasional)</option>
                      <option value="B">Kelompok B (Wajib Penyesuaian Sekolah)</option>
                      <option value="C">Kelompok C (Peminatan/Pilihan)</option>
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
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>{isProcessing ? 'Menyimpan...' : editingItem ? 'Update' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={handleCloseImportModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Import Mata Pelajaran</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseImportModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Download Template</label>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Download template Excel untuk format import
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleDownloadTemplate('xlsx')}
                    disabled={isProcessing}
                  >
                    <FileSpreadsheet size={16} />
                    Excel
                  </button>
                </div>              </div>

              <div className="form-group">
                <label className="form-label">Upload File</label>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Format yang didukung: Excel (.xlsx)
                </p>
                <input 
                  type="file" 
                  accept=".xlsx" 
                  onChange={handleFileChange}
                  className="form-input"
                  disabled={isProcessing}
                />
              </div>

              {importPreview.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Preview Data ({importPreview.length} items)</label>
                  {importPreview[0]._info ? (
                    <div className="alert alert-info" style={{ padding: '12px', borderRadius: '8px', background: '#dbeafe', color: '#1e40af' }}>
                      {importPreview[0]._info}
                    </div>
                  ) : (
                    <>
                      <div style={{ 
                        maxHeight: '200px', 
                        overflow: 'auto', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px' 
                      }}>
                        <table className="table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Kode</th>
                              <th>Nama</th>
                              <th>Kelompok</th>
                              <th>JP</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.slice(0, 10).map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.kode || '-'}</td>
                                <td><strong>{item.nama}</strong></td>
                                <td>{item.kelompok || 'A'}</td>
                                <td>{item.jp_per_minggu || item.jpPerMinggu || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {importPreview.length > 10 && (
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                          ... dan {importPreview.length - 10} data lainnya
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {isProcessing && (
                <div className="alert alert-info">
                  Memproses file...
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseImportModal}>Batal</button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleImport}
                disabled={!importFile || importPreview.length === 0 || isProcessing}
              >
                {isProcessing ? 'Mengimport...' : 'Import Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
