import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mapelAPI } from '../../services/api';
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';
import useTableSort from '../../hooks/useTableSort';
import useBulkSelection from '../../hooks/useBulkSelection';
import IndeterminateCheckbox from '../../components/common/IndeterminateCheckbox';
import SortableHeader from '../../components/common/SortableHeader';

export default function TujuanPembelajaran() {
  const { tujuanPembelajaran, refreshTujuanPembelajaran, mataPelajaran } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const [formData, setFormData] = useState({
    mataPelajaranId: '',
    kode: '',
    deskripsi: '',
    elemen: '',
    keterangan: ''
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        mataPelajaranId: '',
        kode: '',
        deskripsi: '',
        elemen: '',
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
    setSaving(true);
    setFeedback({ error: '', success: '' });

    const payload = {
      mataPelajaranId: formData.mataPelajaranId,
      kode: formData.kode.trim(),
      deskripsi: formData.deskripsi.trim(),
      elemen: formData.elemen.trim(),
      keterangan: formData.keterangan.trim(),
    };

    try {
      if (editingItem) {
        await mapelAPI.updateTP(editingItem.id, payload);
      } else {
        await mapelAPI.createTP(payload);
      }
      await refreshTujuanPembelajaran();
      setFeedback({
        error: '',
        success: editingItem ? 'Tujuan pembelajaran berhasil diperbarui.' : 'Tujuan pembelajaran berhasil ditambahkan.',
      });
      handleCloseModal();
    } catch (err) {
      setFeedback({ error: err.message || 'Gagal menyimpan tujuan pembelajaran.', success: '' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tujuan pembelajaran ini?')) {
      setFeedback({ error: '', success: '' });
      try {
        await mapelAPI.deleteTP(id);
        await refreshTujuanPembelajaran();
        setFeedback({ error: '', success: 'Tujuan pembelajaran berhasil dihapus.' });
      } catch (err) {
        setFeedback({ error: err.message || 'Gagal menghapus tujuan pembelajaran.', success: '' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getMapelName = (id) => {
    const mapel = mataPelajaran.find(m => m.id === id);
    return mapel ? mapel.nama : '-';
  };

  const tujuanSortAccessors = {
    kode: (item) => item.kode || '',
    mataPelajaran: (item) => getMapelName(item.mataPelajaranId),
    elemen: (item) => item.elemen || '',
    deskripsi: (item) => item.deskripsi || '',
  };

  const { sortedData, sortConfig, requestSort } = useTableSort(
    tujuanPembelajaran,
    tujuanSortAccessors,
    { key: 'kode', direction: 'asc' }
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
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} tujuan pembelajaran?`)) return;

    setFeedback({ error: '', success: '' });
    try {
      await Promise.all(selectedIds.map((id) => mapelAPI.deleteTP(id)));
      clearSelection();
      await refreshTujuanPembelajaran();
      setFeedback({ error: '', success: `${selectedIds.length} tujuan pembelajaran berhasil dihapus.` });
    } catch (err) {
      setFeedback({ error: err.message || 'Gagal menghapus tujuan pembelajaran.', success: '' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tujuan Pembelajaran</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Tambah Tujuan Pembelajaran
        </button>
      </div>

      {feedback.error && <div className="alert alert-error">{feedback.error}</div>}
      {feedback.success && <div className="alert alert-success">{feedback.success}</div>}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Target size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Tujuan Pembelajaran
          </h3>
        </div>

        <div className="table-toolbar">
          <div className="bulk-actions">
            <span className="bulk-actions-info">{selectedCount} data dipilih</span>
            {selectedCount > 0 && (
              <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
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
                <SortableHeader label="Mata Pelajaran" sortKey="mataPelajaran" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Elemen" sortKey="elemen" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Deskripsi" sortKey="deskripsi" sortConfig={sortConfig} onSort={requestSort} />
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <Target size={48} className="empty-state-icon" />
                      <p>Belum ada tujuan pembelajaran. Klik "Tambah Tujuan Pembelajaran" untuk menambahkan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((tp, index) => (
                  <tr key={tp.id}>
                    <td data-label="Pilih" className="table-select-cell">
                      <IndeterminateCheckbox checked={isSelected(tp.id)} onChange={() => toggleItem(tp.id)} />
                    </td>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Kode">{tp.kode}</td>
                    <td data-label="Mata Pelajaran"><strong>{getMapelName(tp.mataPelajaranId)}</strong></td>
                    <td data-label="Elemen">{tp.elemen}</td>
                    <td data-label="Deskripsi" style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tp.deskripsi}
                    </td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(tp)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(tp.id)}>
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
          <h3 className="card-title">Tentang Tujuan Pembelajaran</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Tujuan Pembelajaran (TP)</strong> adalah pernyataan tentang kemampuan yang perlu dicapai peserta didik pada akhir satu unit pembelajaran.</p>
          <br />
          <p><strong>Karakteristik Tujuan Pembelajaran:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Menggambarkan kompetensi yang ingin dicapai</li>
            <li>Disusun berdasarkan Capaian Pembelajaran (CP)</li>
            <li>Dapat dicapai dalam satu atau lebih pertemuan</li>
            <li>Menjadi acuan dalam menyusun asesmen</li>
          </ul>
          <br />
          <p><strong>Elemen dalam Tujuan Pembelajaran:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li><strong>Kompetensi:</strong> Kemampuan yang harus ditunjukkan</li>
            <li><strong>Konten:</strong> Materi pembelajaran yang akan dikuasai</li>
            <li><strong>Konteks:</strong> Situasi atau kondisi penerapan kompetensi</li>
          </ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran Baru'}</h3>
              <button className="btn btn-sm btn-secondary" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Mata Pelajaran *</label>
                    <select name="mataPelajaranId" className="form-select" value={formData.mataPelajaranId} onChange={handleChange} required>
                      <option value="">Pilih Mata Pelajaran</option>
                      {mataPelajaran.map(mapel => (
                        <option key={mapel.id} value={mapel.id}>{mapel.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kode TP</label>
                    <input type="text" name="kode" className="form-input" value={formData.kode} onChange={handleChange} placeholder="Contoh: TP-001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Elemen</label>
                    <input type="text" name="elemen" className="form-input" value={formData.elemen} onChange={handleChange} placeholder="Contoh: Menyimak, Membaca" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Deskripsi Tujuan Pembelajaran *</label>
                    <textarea name="deskripsi" className="form-textarea" value={formData.deskripsi} onChange={handleChange} required style={{ minHeight: 120 }} />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Keterangan</label>
                    <textarea name="keterangan" className="form-textarea" value={formData.keterangan} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Menyimpan...' : editingItem ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
