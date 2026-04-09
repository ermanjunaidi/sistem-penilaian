import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { mapelAPI } from '../../services/api';
import { Book, Target, FileText, CheckSquare, Edit, Trash2 } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';
import useTableSort from '../../hooks/useTableSort';
import useBulkSelection from '../../hooks/useBulkSelection';
import IndeterminateCheckbox from '../../components/common/IndeterminateCheckbox';
import SortableHeader from '../../components/common/SortableHeader';

export default function Intrakurikuler() {
  const {
    mataPelajaran,
    refreshMataPelajaran,
    tujuanPembelajaran,
    lingkupMateri,
    asesmenFormatif,
    asesmenSumatif,
  } = useApp();

  const mapelSortAccessors = useMemo(() => ({
    kode: (item) => item.kode || '',
    nama: (item) => item.nama || '',
    kelompok: (item) => item.kelompok || '',
    jpPerMinggu: (item) => Number(item.jpPerMinggu) || 0,
    guru: (item) => item.guru || '',
  }), []);

  const { sortedData, sortConfig, requestSort } = useTableSort(
    mataPelajaran,
    mapelSortAccessors,
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

  const handleEditMapel = async (mapel) => {
    const namaBaru = window.prompt('Ubah nama mata pelajaran', mapel.nama);
    if (namaBaru === null) return;

    const guruBaru = window.prompt('Ubah nama guru pengampu', mapel.guru || '');
    if (guruBaru === null) return;

    try {
      await mapelAPI.update(mapel.id, {
        nama: namaBaru.trim() || mapel.nama,
        guru: guruBaru.trim(),
      });
      await refreshMataPelajaran();
    } catch (err) {
      window.alert(err.message || 'Gagal memperbarui mata pelajaran.');
    }
  };

  const handleDeleteMapel = async (id) => {
    if (!window.confirm('Hapus mata pelajaran ini?')) return;
    try {
      await mapelAPI.delete(id);
      await refreshMataPelajaran();
    } catch (err) {
      window.alert(err.message || 'Gagal menghapus mata pelajaran.');
    }
  };

  const handleBulkDeleteMapel = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Hapus ${selectedIds.length} mata pelajaran intrakurikuler terpilih?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => mapelAPI.delete(id)));
      clearSelection();
      await refreshMataPelajaran();
    } catch (err) {
      window.alert(err.message || 'Gagal menghapus mata pelajaran.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Intrakurikuler</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Mata Pelajaran</div>
          <div className="stat-value">{mataPelajaran.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tujuan Pembelajaran</div>
          <div className="stat-value">{tujuanPembelajaran.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Asesmen Formatif</div>
          <div className="stat-value">{asesmenFormatif.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Asesmen Sumatif</div>
          <div className="stat-value">{asesmenSumatif.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Book size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Daftar Mata Pelajaran Intrakurikuler
          </h3>
        </div>
        <div className="table-toolbar">
          <div className="bulk-actions">
            <span className="bulk-actions-info">{selectedCount} data dipilih</span>
            {selectedCount > 0 && (
              <button className="btn btn-danger btn-sm" onClick={handleBulkDeleteMapel}>
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
                <SortableHeader label="Nama Mata Pelajaran" sortKey="nama" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Kelompok" sortKey="kelompok" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="JP/Minggu" sortKey="jpPerMinggu" sortConfig={sortConfig} onSort={requestSort} />
                <SortableHeader label="Guru" sortKey="guru" sortConfig={sortConfig} onSort={requestSort} />
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="empty-state">
                      <p>Belum ada mata pelajaran intrakurikuler.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((mapel, index) => (
                  <tr key={mapel.id}>
                    <td data-label="Pilih" className="table-select-cell">
                      <IndeterminateCheckbox checked={isSelected(mapel.id)} onChange={() => toggleItem(mapel.id)} />
                    </td>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Kode">{mapel.kode}</td>
                    <td data-label="Nama Mata Pelajaran"><strong>{mapel.nama}</strong></td>
                    <td data-label="Kelompok">Kelompok {mapel.kelompok}</td>
                    <td data-label="JP/Minggu">{mapel.jpPerMinggu}</td>
                    <td data-label="Guru">{mapel.guru || '-'}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleEditMapel(mapel)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteMapel(mapel.id)}>
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
          <h3 className="card-title">Komponen Intrakurikuler</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <Target size={32} color="#2563eb" style={{ marginBottom: 12 }} />
            <h4 style={{ marginBottom: 8 }}>Tujuan Pembelajaran</h4>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Capaian pembelajaran yang diharapkan dicapai siswa
            </p>
            <div style={{ marginTop: 12, fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
              {tujuanPembelajaran.length} Item
            </div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <FileText size={32} color="#10b981" style={{ marginBottom: 12 }} />
            <h4 style={{ marginBottom: 8 }}>Lingkup Materi</h4>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Materi pembelajaran yang akan disampaikan
            </p>
            <div style={{ marginTop: 12, fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
              {lingkupMateri.length} Item
            </div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <CheckSquare size={32} color="#f59e0b" style={{ marginBottom: 12 }} />
            <h4 style={{ marginBottom: 8 }}>Asesmen Formatif</h4>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Penilaian selama proses pembelajaran
            </p>
            <div style={{ marginTop: 12, fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
              {asesmenFormatif.length} Item
            </div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <CheckSquare size={32} color="#ef4444" style={{ marginBottom: 12 }} />
            <h4 style={{ marginBottom: 8 }}>Asesmen Sumatif</h4>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Penilaian di akhir periode pembelajaran
            </p>
            <div style={{ marginTop: 12, fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>
              {asesmenSumatif.length} Item
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tentang Pembelajaran Intrakurikuler</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Pembelajaran Intrakurikuler</strong> adalah kegiatan pembelajaran yang dilakukan secara tatap muka atau melalui sistem dalam jaringan (daring) sesuai dengan kurikulum yang ditetapkan.</p>
          <br />
          <p><strong>Karakteristik:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Terstruktur dalam mata pelajaran sesuai kurikulum</li>
            <li>Dilakukan di dalam kelas atau lingkungan sekolah</li>
            <li>Memiliki alokasi waktu (JP) yang jelas</li>
            <li>Dinilai melalui asesmen formatif dan sumatif</li>
            <li>Diampu oleh guru mata pelajaran yang kompeten</li>
          </ul>
          <br />
          <p><strong>Struktur Kurikulum:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li><strong>Kelompok A (Wajib Nasional):</strong> Teori & Akademik yang wajib untuk seluruh siswa (misal: PPKn, Bahasa Indonesia, Matematika, IPA, IPS).</li>
            <li><strong>Kelompok B (Wajib Penyesuaian Sekolah):</strong> Keterampilan praktis, seni, dan jasmani yang bisa disesuaikan dengan kearifan lokal sekolah (misal: Seni Budaya, PJOK, Prakarya/Muatan Lokal).</li>
            <li><strong>Kelompok C (Peminatan/Pilihan):</strong> Pendalaman ilmu yang lebih spesifik sesuai dengan minat, bakat, atau jurusan siswa (misal: Fisika, Ekonomi, Dasar Program Keahlian).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
