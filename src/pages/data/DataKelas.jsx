import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit, Trash2, School, Search, Users, Download, Upload } from 'lucide-react';
import { usersAPI, kelasAPI, hasPermission } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';
import useTableSort from '../../hooks/useTableSort';
import useBulkSelection from '../../hooks/useBulkSelection';
import AddDataMenu from '../../components/common/AddDataMenu';
import IndeterminateCheckbox from '../../components/common/IndeterminateCheckbox';
import SortableHeader from '../../components/common/SortableHeader';

const INITIAL_FORM = {
  nama: '',
  waliKelasId: '',
  waliKelas: '',
  keterangan: '',
};

export default function DataKelas() {
  const { dataKelas, setDataKelas, dataSiswa } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingKelas, setEditingKelas] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [waliKelasOptions, setWaliKelasOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importFile, setImportFile] = useState(null);

  const fetchKelas = useCallback(async () => {
    try {
      const res = await kelasAPI.getAll();
      setDataKelas(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [setDataKelas]);

  useEffect(() => {
    fetchKelas();
    let active = true;

    const fetchWaliKelas = async () => {
      setLoadingUsers(true);
      try {
        const response = await usersAPI.getAll({ role: 'wali_kelas' });
        if (!active) return;
        setWaliKelasOptions(
          (response.data || []).map((user) => ({
            id: user.id,
            nama: user.nama,
            email: user.email,
          }))
        );
      } catch {
        if (!active) return;
        setWaliKelasOptions([]);
      } finally {
        if (active) setLoadingUsers(false);
      }
    };

    fetchWaliKelas();
    return () => {
      active = false;
    };
  }, [fetchKelas]);

  const filteredKelas = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return dataKelas;

    return dataKelas.filter((kelas) =>
      kelas.nama?.toLowerCase().includes(keyword) ||
      kelas.waliKelas?.toLowerCase().includes(keyword) ||
      kelas.keterangan?.toLowerCase().includes(keyword)
    );
  }, [dataKelas, searchTerm]);

  const jumlahSiswaByKelas = useMemo(() => {
    return dataSiswa.reduce((acc, siswa) => {
      const namaKelas = siswa.kelas || '';
      if (!namaKelas) return acc;
      acc[namaKelas] = (acc[namaKelas] || 0) + 1;
      return acc;
    }, {});
  }, [dataSiswa]);

  const kelasSortAccessors = useMemo(() => ({
    nama: (kelas) => kelas.nama || '',
    waliKelas: (kelas) => kelas.waliKelas || '',
    jumlahSiswa: (kelas) => jumlahSiswaByKelas[kelas.nama] || 0,
    keterangan: (kelas) => kelas.keterangan || '',
  }), [jumlahSiswaByKelas]);

  const { sortedData: sortedKelas, sortConfig, requestSort } = useTableSort(
    filteredKelas,
    kelasSortAccessors,
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
  } = usePagination(sortedKelas);

  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleItem,
    toggleAll,
    clearSelection,
  } = useBulkSelection(sortedKelas);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingKelas(null);
  };

  const handleOpenModal = (kelas = null) => {
    if (kelas) {
      setEditingKelas(kelas);
      setFormData({
        nama: kelas.nama || '',
        waliKelasId: kelas.waliKelasId || '',
        waliKelas: kelas.waliKelas || '',
        keterangan: kelas.keterangan || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nama: formData.nama.trim().toUpperCase(),
      waliKelasId: formData.waliKelasId || null,
      waliKelas: formData.waliKelas || '',
      keterangan: formData.keterangan.trim(),
    };

    if (!payload.nama) return;

    try {
      setIsProcessing(true);
      if (editingKelas) {
        await kelasAPI.update(editingKelas.id, payload);
      } else {
        await kelasAPI.create(payload);
      }
      await fetchKelas();
      handleCloseModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (kelas) => {
    const jumlahSiswa = jumlahSiswaByKelas[kelas.nama] || 0;
    if (jumlahSiswa > 0) {
      window.alert(`Kelas ${kelas.nama} masih dipakai oleh ${jumlahSiswa} siswa.`);
      return;
    }

    if (window.confirm(`Hapus kelas ${kelas.nama}?`)) {
      try {
        await kelasAPI.delete(kelas.id);
        await fetchKelas();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    const selectedKelas = sortedKelas.filter((kelas) => selectedIds.includes(kelas.id));
    const blockedKelas = selectedKelas.filter((kelas) => (jumlahSiswaByKelas[kelas.nama] || 0) > 0);

    if (blockedKelas.length > 0) {
      window.alert(`Kelas berikut masih dipakai siswa: ${blockedKelas.map((kelas) => kelas.nama).join(', ')}`);
      return;
    }

    if (!window.confirm(`Hapus ${selectedKelas.length} kelas terpilih?`)) return;

    try {
      setIsProcessing(true);
      await Promise.all(selectedKelas.map((kelas) => kelasAPI.delete(kelas.id)));
      clearSelection();
      await fetchKelas();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await kelasAPI.export();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_kelas_export_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      const res = await kelasAPI.import(fd);
      alert(res.message);
      await fetchKelas();
      setShowImportModal(false);
    } catch (err) { alert(err.message); } finally { setIsProcessing(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Kelas</h1>
        <div className="flex gap-1">
          <AddDataMenu
            label="Tambah Data"
            actions={[
              hasPermission('admin') && { label: 'Tambah Kelas', icon: <Plus size={18} />, onClick: () => handleOpenModal() },
              { label: 'Export Excel', icon: <Download size={18} />, onClick: handleExport },
              hasPermission('admin') && { label: 'Import Excel', icon: <Upload size={18} />, onClick: () => setShowImportModal(true) },
            ].filter(Boolean)}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <School size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Kelas
          </h3>
          <div className="flex items-center gap-1">
            <Search size={18} color="#64748b" />
            <input
              type="text"
              className="form-input"
              placeholder="Cari kelas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: 250 }}
            />
          </div>
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
                <SortableHeader label="Kelas" sortKey="nama" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Wali Kelas" sortKey="waliKelas" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Jumlah Siswa" sortKey="jumlahSiswa" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Keterangan" sortKey="keterangan" sortConfig={sortConfig} onSort={requestSort} />
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedKelas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <School size={48} className="empty-state-icon" />
                      <p>Belum ada data kelas. Tambahkan kelas terlebih dahulu sebelum input siswa.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((kelas, index) => (
                  <tr key={kelas.id}>
                    <td data-label="Pilih" className="table-select-cell">
                      <IndeterminateCheckbox checked={isSelected(kelas.id)} onChange={() => toggleItem(kelas.id)} />
                    </td>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Kelas">
                      <span className="badge badge-primary">{kelas.nama}</span>
                    </td>
                    <td data-label="Wali Kelas">{kelas.waliKelas || '-'}</td>
                    <td data-label="Jumlah Siswa">
                      <span className="badge badge-success">
                        <Users size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                        {jumlahSiswaByKelas[kelas.nama] || 0}
                      </span>
                    </td>
                    <td data-label="Keterangan">{kelas.keterangan || '-'}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        {hasPermission('admin') && (
                          <>
                            <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(kelas)}>
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(kelas)}>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nama Kelas *</label>
                    <input
                      type="text"
                      name="nama"
                      className="form-input"
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder="Contoh: 7A"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Wali Kelas</label>
                    <select
                      name="waliKelas"
                      className="form-select"
                      value={formData.waliKelas}
                      onChange={handleChange}
                      disabled={loadingUsers}
                    >
                      <option value="">
                        {loadingUsers ? 'Memuat data wali kelas...' : 'Pilih Wali Kelas'}
                      </option>
                      {waliKelasOptions.map((waliKelas) => (
                        <option key={waliKelas.id} value={waliKelas.nama}>
                          {waliKelas.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Keterangan</label>
                    <textarea
                      name="keterangan"
                      className="form-textarea"
                      value={formData.keterangan}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                  {isProcessing ? 'Memproses...' : (editingKelas ? 'Update' : 'Simpan')}
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
              <h3 className="modal-title">Import Data Kelas</h3>
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
