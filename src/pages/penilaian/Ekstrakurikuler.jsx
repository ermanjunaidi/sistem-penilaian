import { useCallback, useMemo, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, Users, Award, Download, Upload } from 'lucide-react';
import { ekstraAPI, hasPermission } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';
import useTableSort from '../../hooks/useTableSort';
import useBulkSelection from '../../hooks/useBulkSelection';
import AddDataMenu from '../../components/common/AddDataMenu';
import IndeterminateCheckbox from '../../components/common/IndeterminateCheckbox';
import SortableHeader from '../../components/common/SortableHeader';

export default function Ekstrakurikuler() {
  const { ekstrakurikuler, setEkstrakurikuler } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    jenis: 'Wajib',
    pembina: '',
    jadwal: '',
    tempat: '',
    keterangan: ''
  });

  const fetchEkstra = useCallback(async () => {
    try {
      const res = await ekstraAPI.getAll();
      setEkstrakurikuler(res.data || []);
    } catch (err) { console.error(err); }
  }, [setEkstrakurikuler]);

  useEffect(() => {
    fetchEkstra();
  }, [fetchEkstra]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        kode: '',
        nama: '',
        jenis: 'Wajib',
        pembina: '',
        jadwal: '',
        tempat: '',
        keterangan: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      if (editingItem) {
        await ekstraAPI.update(editingItem.id, formData);
      } else {
        await ekstraAPI.create(formData);
      }
      await fetchEkstra();
      handleCloseModal();
    } catch (err) { alert(err.message); } finally { setIsProcessing(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus ekstrakurikuler ini?')) {
      try {
        await ekstraAPI.delete(id);
        await fetchEkstra();
      } catch (err) { alert(err.message); }
    }
  };

  const handleExport = async () => {
    try {
      const blob = await ekstraAPI.export();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ekstrakurikuler_export_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      const res = await ekstraAPI.import(fd);
      alert(res.message);
      await fetchEkstra();
      setShowImportModal(false);
    } catch (err) { alert(err.message); } finally { setIsProcessing(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const ekstraSortAccessors = useMemo(() => ({
    kode: (item) => item.kode || '',
    nama: (item) => item.nama || '',
    jenis: (item) => item.jenis || '',
    pembina: (item) => item.pembina || '',
    jadwal: (item) => item.jadwal || '',
    tempat: (item) => item.tempat || '',
  }), []);

  const { sortedData, sortConfig, requestSort } = useTableSort(
    ekstrakurikuler,
    ekstraSortAccessors,
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

  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleItem,
    toggleAll,
    clearSelection,
  } = useBulkSelection(sortedData);

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} ekstrakurikuler?`)) return;

    try {
      setIsProcessing(true);
      await Promise.all(selectedIds.map((id) => ekstraAPI.delete(id)));
      clearSelection();
      await fetchEkstra();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ekstrakurikuler</h1>
        <AddDataMenu
          label="Tambah Data"
          actions={[
            hasPermission('admin') && { label: 'Tambah Ekstra', icon: <Plus size={18} />, onClick: () => handleOpenModal() },
            { label: 'Export Excel', icon: <Download size={18} />, onClick: handleExport },
            hasPermission('admin') && { label: 'Import Excel', icon: <Upload size={18} />, onClick: () => setShowImportModal(true) },
          ].filter(Boolean)}
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Ekstrakurikuler</div>
          <div className="stat-value">{ekstrakurikuler.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Wajib</div>
          <div className="stat-value">{ekstrakurikuler.filter(e => e.jenis === 'Wajib').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pilihan</div>
          <div className="stat-value">{ekstrakurikuler.filter(e => e.jenis === 'Pilihan').length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Users size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Ekstrakurikuler
          </h3>
        </div>

        <div className="table-toolbar">
          <div className="bulk-actions">
            <span className="bulk-actions-info">{selectedCount} data dipilih</span>
            {hasPermission('admin') && selectedCount > 0 && (
              <button className="btn btn-danger btn-sm" onClick={handleBulkDelete} disabled={isProcessing}>
                <Trash2 size={16} />
                Hapus Terpilih
              </button>
            )}
          </div>
        </div>

        <div className="table-container mobile-card-table">
          <table className="table">
            <thead>
              <tr>
                <th className="table-select-cell">
                  <IndeterminateCheckbox
                    checked={isAllSelected()}
                    indeterminate={selectedCount > 0 && !isAllSelected()}
                    onChange={() => toggleAll()}
                  />
                </th>
                <th>No</th>
                <SortableHeader label="Kode" sortKey="kode" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Nama Ekstrakurikuler" sortKey="nama" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Jenis" sortKey="jenis" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Pembina" sortKey="pembina" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Jadwal" sortKey="jadwal" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Tempat" sortKey="tempat" sortConfig={sortConfig} onSort={requestSort} />
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    <div className="empty-state">
                      <Award size={48} className="empty-state-icon" />
                      <p>Belum ada ekstrakurikuler. Klik "Tambah Data" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((ekstra, index) => (
                  <tr key={ekstra.id}>
                    <td data-label="Pilih" className="table-select-cell">
                      <IndeterminateCheckbox checked={isSelected(ekstra.id)} onChange={() => toggleItem(ekstra.id)} />
                    </td>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Kode">{ekstra.kode}</td>
                    <td data-label="Nama Ekstrakurikuler"><strong>{ekstra.nama}</strong></td>
                    <td data-label="Jenis">
                      <span className={`badge ${ekstra.jenis === 'Wajib' ? 'badge-primary' : 'badge-secondary'}`}>
                        {ekstra.jenis}
                      </span>
                    </td>
                    <td data-label="Pembina">{ekstra.pembina || '-'}</td>
                    <td data-label="Jadwal">{ekstra.jadwal || '-'}</td>
                    <td data-label="Tempat">{ekstra.tempat || '-'}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        {hasPermission('admin') && (
                          <>
                            <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(ekstra)}>
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ekstra.id)}>
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
              <h3 className="modal-title">{editingItem ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Kode</label>
                    <input type="text" name="kode" className="form-input" value={formData.kode} onChange={handleChange} placeholder="Contoh: PRAMUKA" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Nama Ekstrakurikuler *</label>
                    <input type="text" name="nama" className="form-input" value={formData.nama} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jenis</label>
                    <select name="jenis" className="form-select" value={formData.jenis} onChange={handleChange}>
                      <option value="Wajib">Wajib</option>
                      <option value="Pilihan">Pilihan</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pembina</label>
                    <input type="text" name="pembina" className="form-input" value={formData.pembina} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Jadwal</label>
                    <input type="text" name="jadwal" className="form-input" value={formData.jadwal} onChange={handleChange} placeholder="Contoh: Senin, 15.00-17.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tempat</label>
                    <input type="text" name="tempat" className="form-input" value={formData.tempat} onChange={handleChange} />
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
              <h3 className="modal-title">Import Ekstrakurikuler</h3>
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
