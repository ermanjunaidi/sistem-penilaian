import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mutasiAPI, hasPermission } from '../../services/api';
import { Plus, Edit, Trash2, UserPlus, FileText, Download, Upload } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';
import useTableSort from '../../hooks/useTableSort';
import AddDataMenu from '../../components/common/AddDataMenu';
import SortableHeader from '../../components/common/SortableHeader';
import DateInput from '../../components/common/DateInput';

export default function Mutasi() {
  const { mutasi, setMutasi, dataSiswa, refreshDataSiswa } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [formData, setFormData] = useState({
    siswaId: '',
    jenis: 'Masuk',
    tanggal: '',
    asalSekolah: '',
    tujuanSekolah: '',
    alasan: '',
    keterangan: '',
    nomorSurat: ''
  });

  const fetchMutasi = useCallback(async () => {
    try {
      const res = await mutasiAPI.getAll();
      setMutasi(res.data || []);
    } catch (err) { console.error(err); }
  }, [setMutasi]);

  useEffect(() => {
    fetchMutasi();
  }, [fetchMutasi]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        siswaId: '',
        jenis: 'Masuk',
        tanggal: '',
        asalSekolah: '',
        tujuanSekolah: '',
        alasan: '',
        keterangan: '',
        nomorSurat: ''
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
    handleSaveMutasi();
  };

  const handleSaveMutasi = async () => {
    try {
      setIsProcessing(true);
      if (editingItem) {
        await mutasiAPI.update(editingItem.id, formData);
      } else {
        await mutasiAPI.create(formData);
      }
      await fetchMutasi();
      await refreshDataSiswa();
      handleCloseModal();
    } catch (err) { alert(err.message); } finally { setIsProcessing(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data mutasi ini?')) {
      try {
        await mutasiAPI.delete(id);
        await fetchMutasi();
        await refreshDataSiswa();
      } catch (err) { alert(err.message); }
    }
  };

  const handleExport = async () => {
    try {
      const blob = await mutasiAPI.export();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mutasi_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) { alert(err.message); }
  };

  const handleImport = async () => {
    if (!importFile) return;
    const fd = new FormData();
    fd.append('file', importFile);
    try {
      setIsProcessing(true);
      const res = await mutasiAPI.import(fd);
      alert(res.message);
      await fetchMutasi();
      await refreshDataSiswa();
      setShowImportModal(false);
    } catch (err) { alert(err.message); } finally { setIsProcessing(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getSiswaName = (id) => {
    const siswa = dataSiswa.find(s => s.id === id);
    return siswa ? `${siswa.nama}${siswa.kelas ? ` (${siswa.kelas})` : ''}` : '-';
  };

  const mutasiSortAccessors = {
    tanggal: (item) => item.tanggal || '',
    siswa: (item) => getSiswaName(item.siswaId),
    jenis: (item) => item.jenis || '',
    sekolah: (item) => (item.jenis === 'Masuk' ? item.asalSekolah : item.tujuanSekolah) || '',
    nomorSurat: (item) => item.nomorSurat || '',
  };

  const { sortedData, sortConfig, requestSort } = useTableSort(
    mutasi,
    mutasiSortAccessors,
    { key: 'tanggal', direction: 'desc' }
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

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mutasi Siswa</h1>
        <AddDataMenu
          label="Tambah Data"
          actions={[
            hasPermission('admin') && { label: 'Tambah Mutasi', icon: <Plus size={18} />, onClick: () => handleOpenModal() },
            { label: 'Export Excel', icon: <Download size={18} />, onClick: handleExport },
            hasPermission('admin') && { label: 'Import Excel', icon: <Upload size={18} />, onClick: () => setShowImportModal(true) },
          ].filter(Boolean)}
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Mutasi</div>
          <div className="stat-value">{mutasi.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Siswa Masuk</div>
          <div className="stat-value">{mutasi.filter(m => m.jenis === 'Masuk').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Siswa Keluar</div>
          <div className="stat-value">{mutasi.filter(m => m.jenis === 'Keluar').length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <UserPlus size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Mutasi Siswa
          </h3>
        </div>

        <div className="table-container mobile-card-table">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <SortableHeader label="Tanggal" sortKey="tanggal" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Nama Siswa" sortKey="siswa" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Jenis" sortKey="jenis" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Asal/Tujuan Sekolah" sortKey="sekolah" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Nomor Surat" sortKey="nomorSurat" sortConfig={sortConfig} onSort={requestSort} />
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <FileText size={48} className="empty-state-icon" />
                      <p>Belum ada data mutasi. Klik "Tambah Data" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.id}>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Tanggal">{item.tanggal}</td>
                    <td data-label="Nama Siswa"><strong>{getSiswaName(item.siswaId)}</strong></td>
                    <td data-label="Jenis">
                      <span className={`badge ${item.jenis === 'Masuk' ? 'badge-success' : 'badge-danger'}`}>
                        {item.jenis}
                      </span>
                    </td>
                    <td data-label="Asal/Tujuan Sekolah">{item.jenis === 'Masuk' ? item.asalSekolah : item.tujuanSekolah || '-'}</td>
                    <td data-label="Nomor Surat">{item.nomorSurat || '-'}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        {hasPermission('admin') && (
                          <>
                            <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(item)}>
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                              <Trash2 size={16} />
                            </button>
                          </>
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
              <h3 className="modal-title">{editingItem ? 'Edit Mutasi' : 'Tambah Mutasi Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Siswa *</label>
                    <select name="siswaId" className="form-select" value={formData.siswaId} onChange={handleChange} required>
                      <option value="">Pilih Siswa</option>
                      {dataSiswa.map(siswa => (
                        <option key={siswa.id} value={siswa.id}>
                          {siswa.nama} ({siswa.nisn}){siswa.kelas ? ` - ${siswa.kelas}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jenis Mutasi *</label>
                    <select name="jenis" className="form-select" value={formData.jenis} onChange={handleChange} required>
                      <option value="Masuk">Mutasi Masuk</option>
                      <option value="Keluar">Mutasi Keluar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal</label>
                    <DateInput name="tanggal" className="form-input" value={formData.tanggal} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Surat</label>
                    <input type="text" name="nomorSurat" className="form-input" value={formData.nomorSurat} onChange={handleChange} placeholder="Nomor surat mutasi" />
                  </div>
                  {formData.jenis === 'Masuk' && (
                    <div className="form-group full-width">
                      <label className="form-label">Asal Sekolah</label>
                      <input type="text" name="asalSekolah" className="form-input" value={formData.asalSekolah} onChange={handleChange} />
                    </div>
                  )}
                  {formData.jenis === 'Keluar' && (
                    <div className="form-group full-width">
                      <label className="form-label">Tujuan Sekolah</label>
                      <input type="text" name="tujuanSekolah" className="form-input" value={formData.tujuanSekolah} onChange={handleChange} />
                    </div>
                  )}
                  <div className="form-group full-width">
                    <label className="form-label">Alasan</label>
                    <textarea name="alasan" className="form-textarea" value={formData.alasan} onChange={handleChange} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Keterangan</label>
                    <textarea name="keterangan" className="form-textarea" value={formData.keterangan} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Memproses...' : (editingItem ? 'Update' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Import Data Mutasi</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowImportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">File Excel (.xlsx) *</label>
                <input type="file" accept=".xlsx" onChange={(e) => setImportFile(e.target.files[0])} className="form-input" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleImport} disabled={!importFile || isProcessing}>
                {isProcessing ? 'Mengimport...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
