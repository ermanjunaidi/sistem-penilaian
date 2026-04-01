import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { penilaianAPI } from '../../services/api';
import { Calculator, TrendingUp, Edit, Trash2 } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import usePagination from '../../hooks/usePagination';

export default function NilaiAkhir() {
  const { 
    nilaiAkhir, 
    refreshNilaiAkhir,
    mataPelajaran, 
    dataSiswa, 
    asesmenFormatif, 
    asesmenSumatif,
  } = useApp();
  
  const [selectedSiswa, setSelectedSiswa] = useState('');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [calculationPageByMapel, setCalculationPageByMapel] = useState({});
  const [calculationItemsPerPage, setCalculationItemsPerPage] = useState(10);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const [calculatedPreview, setCalculatedPreview] = useState([]);

  // Calculate average scores per subject per student
  const calculateNilai = useMemo(() => {
    const result = [];
    
    mataPelajaran.forEach(mapel => {
      const siswaNilai = {};
      
      dataSiswa.forEach(siswa => {
        // Get formatif scores
        const formatifScores = asesmenFormatif
          .filter(a => a.mataPelajaranId === mapel.id && a.siswaId === siswa.id)
          .map(a => parseFloat(a.nilai) || 0);
        
        // Get sumatif scores
        const sumatifScores = asesmenSumatif
          .filter(a => a.mataPelajaranId === mapel.id && a.siswaId === siswa.id)
          .map(a => parseFloat(a.nilai) || 0);
        
        // Calculate averages
        const avgFormatif = formatifScores.length > 0 
          ? formatifScores.reduce((a, b) => a + b, 0) / formatifScores.length 
          : 0;
        
        const avgSumatif = sumatifScores.length > 0 
          ? sumatifScores.reduce((a, b) => a + b, 0) / sumatifScores.length 
          : 0;
        
        // Final calculation: 30% formatif + 70% sumatif
        const nilaiAkhir = avgFormatif > 0 || avgSumatif > 0
          ? Math.round((avgFormatif * 0.3) + (avgSumatif * 0.7))
          : 0;
        
        // Determine predicate
        let predikat = '';
        let deskripsi = '';
        
        if (nilaiAkhir >= 90) {
          predikat = 'A';
          deskripsi = 'Sangat Baik';
        } else if (nilaiAkhir >= 80) {
          predikat = 'B';
          deskripsi = 'Baik';
        } else if (nilaiAkhir >= 70) {
          predikat = 'C';
          deskripsi = 'Cukup';
        } else if (nilaiAkhir >= 60) {
          predikat = 'D';
          deskripsi = 'Kurang';
        } else {
          predikat = 'E';
          deskripsi = 'Sangat Kurang';
        }
        
        siswaNilai[siswa.id] = {
          siswa,
          formatif: Math.round(avgFormatif),
          sumatif: Math.round(avgSumatif),
          akhir: nilaiAkhir,
          predikat,
          deskripsi
        };
      });
      
      result.push({ mapel, siswaNilai });
    });
    
    return result;
  }, [mataPelajaran, dataSiswa, asesmenFormatif, asesmenSumatif]);

  const handleSaveNilai = async () => {
    setSaving(true);
    setFeedback({ error: '', success: '' });
    try {
      const response = await penilaianAPI.calculateNilaiAkhir({
        tahunAjaran: selectedTahunAjaran,
        semester: selectedSemester,
      });
      const previewItems = (response.data?.nilai || []).map((item) => ({
        ...item,
        semester: String(item.semester ?? selectedSemester),
      }));
      setCalculatedPreview(previewItems);
      await refreshNilaiAkhir();
      setFeedback({ error: '', success: response.message || 'Nilai akhir berhasil dihitung.' });
    } catch (err) {
      setFeedback({ error: err.message || 'Gagal menghitung nilai akhir.', success: '' });
    } finally {
      setSaving(false);
    }
  };

  const getGradeColor = (nilai) => {
    if (nilai >= 80) return '#10b981';
    if (nilai >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getCalculationPage = (mapelId) => calculationPageByMapel[mapelId] || 1;
  const setCalculationPage = (mapelId, page) => {
    setCalculationPageByMapel((prev) => ({ ...prev, [mapelId]: page }));
  };

  const getPredikatDanDeskripsi = (nilai) => {
    if (nilai >= 90) return { predikat: 'A', deskripsi: 'Sangat Baik' };
    if (nilai >= 80) return { predikat: 'B', deskripsi: 'Baik' };
    if (nilai >= 70) return { predikat: 'C', deskripsi: 'Cukup' };
    if (nilai >= 60) return { predikat: 'D', deskripsi: 'Kurang' };
    return { predikat: 'E', deskripsi: 'Sangat Kurang' };
  };

  const handleEditNilai = async (item) => {
    const inputNilai = window.prompt('Ubah nilai akhir (0-100)', String(item.nilaiAkhir));
    if (inputNilai === null) return;

    const nilaiBaru = Number(inputNilai);
    if (Number.isNaN(nilaiBaru) || nilaiBaru < 0 || nilaiBaru > 100) {
      alert('Nilai harus berupa angka antara 0 sampai 100.');
      return;
    }

    const inputSemester = window.prompt('Ubah semester (1: Ganjil, 2: Genap)', String(item.semester || '1'));
    if (inputSemester === null) return;

    const semesterBaru = inputSemester === '2' ? '2' : '1';
    const { predikat, deskripsi } = getPredikatDanDeskripsi(nilaiBaru);

    try {
      await penilaianAPI.updateNilaiAkhir(item.id, {
        nilaiAkhir: nilaiBaru,
        predikat,
        deskripsi,
        semester: semesterBaru,
      });
      await refreshNilaiAkhir();
      setFeedback({ error: '', success: 'Nilai akhir berhasil diperbarui.' });
    } catch (err) {
      setFeedback({ error: err.message || 'Gagal memperbarui nilai akhir.', success: '' });
    }
  };

  const handleDeleteNilai = async (id) => {
    if (!window.confirm('Hapus data nilai akhir ini?')) return;
    try {
      await penilaianAPI.deleteNilaiAkhir(id);
      await refreshNilaiAkhir();
      setFeedback({ error: '', success: 'Nilai akhir berhasil dihapus.' });
    } catch (err) {
      setFeedback({ error: err.message || 'Gagal menghapus nilai akhir.', success: '' });
    }
  };

  const previewByMapel = useMemo(() => {
    if (!calculatedPreview.length) {
      return calculateNilai;
    }

    return mataPelajaran
      .map((mapel) => {
        const relatedItems = calculatedPreview.filter((item) => item.mataPelajaranId === mapel.id);
        const siswaNilai = relatedItems.reduce((acc, item) => {
          const siswa = dataSiswa.find((entry) => entry.id === item.siswaId);
          if (!siswa) return acc;
          acc[item.siswaId] = {
            siswa,
            formatif: Number(item.nilaiFormatif) || 0,
            sumatif: Number(item.nilaiSumatif) || 0,
            akhir: Number(item.nilaiAkhir) || 0,
            predikat: item.predikat || '',
            deskripsi: item.deskripsi || '',
          };
          return acc;
        }, {});

        return { mapel, siswaNilai };
      })
      .filter(({ siswaNilai }) => Object.keys(siswaNilai).length > 0);
  }, [calculateNilai, calculatedPreview, dataSiswa, mataPelajaran]);

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    paginatedData,
  } = usePagination(nilaiAkhir);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Nilai Akhir</h1>
        <button className="btn btn-primary" onClick={handleSaveNilai} disabled={saving}>
          <Calculator size={18} />
          {saving ? 'Menghitung...' : 'Hitung Nilai Akhir'}
        </button>
      </div>

      {feedback.error && <div className="alert alert-error">{feedback.error}</div>}
      {feedback.success && <div className="alert alert-success">{feedback.success}</div>}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <TrendingUp size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Filter dan Kalkulasi
          </h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Tahun Ajaran</label>
            <input 
              type="text" 
              className="form-input" 
              value={selectedTahunAjaran}
              onChange={(e) => setSelectedTahunAjaran(e.target.value)}
              placeholder="2024/2025"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Semester</label>
            <select 
              className="form-select" 
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="1">Ganjil</option>
              <option value="2">Genap</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Siswa</label>
            <select 
              className="form-select" 
              value={selectedSiswa}
              onChange={(e) => setSelectedSiswa(e.target.value)}
            >
              <option value="">Semua Siswa</option>
              {dataSiswa.map(siswa => (
                <option key={siswa.id} value={siswa.id}>{siswa.nama}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-2">
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            <strong>Rumus Perhitungan:</strong> Nilai Akhir = (30% × Rata-rata Formatif) + (70% × Rata-rata Sumatif)
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Hasil Perhitungan Nilai Akhir</h3>
        </div>

        {previewByMapel.map(({ mapel, siswaNilai }) => {
          const filteredSiswa = selectedSiswa 
            ? { [selectedSiswa]: siswaNilai[selectedSiswa] }
            : siswaNilai;
          
          const rows = Object.values(filteredSiswa).filter(s => s && s.akhir > 0);
          const hasData = rows.length > 0;
          
          if (!hasData) return null;

          const totalMapelPages = Math.max(1, Math.ceil(rows.length / calculationItemsPerPage));
          const currentMapelPage = Math.min(getCalculationPage(mapel.id), totalMapelPages);
          const mapelStartIndex = (currentMapelPage - 1) * calculationItemsPerPage;
          const paginatedRows = rows.slice(mapelStartIndex, mapelStartIndex + calculationItemsPerPage);
          
          return (
            <div key={mapel.id} className="mb-2">
              <h4 style={{ marginBottom: 12, color: '#2563eb' }}>{mapel.nama}</h4>
              <div className="table-container mobile-card-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>NISN</th>
                      <th>Nama Siswa</th>
                      <th>Formatif (30%)</th>
                      <th>Sumatif (70%)</th>
                      <th>Nilai Akhir</th>
                      <th>Predikat</th>
                      <th>Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((data, index) => (
                      <tr key={data.siswa.id}>
                        <td data-label="No">{mapelStartIndex + index + 1}</td>
                        <td data-label="NISN">{data.siswa.nisn}</td>
                        <td data-label="Nama Siswa"><strong>{data.siswa.nama}</strong></td>
                        <td data-label="Formatif (30%)">{data.formatif}</td>
                        <td data-label="Sumatif (70%)">{data.sumatif}</td>
                        <td data-label="Nilai Akhir">
                          <strong style={{ color: getGradeColor(data.akhir), fontSize: '1.1rem' }}>
                            {data.akhir}
                          </strong>
                        </td>
                        <td data-label="Predikat">
                          <span className="badge badge-primary">{data.predikat}</span>
                        </td>
                        <td data-label="Deskripsi">{data.deskripsi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                totalItems={rows.length}
                currentPage={currentMapelPage}
                totalPages={totalMapelPages}
                itemsPerPage={calculationItemsPerPage}
                onPageChange={(page) => setCalculationPage(mapel.id, page)}
                onItemsPerPageChange={setCalculationItemsPerPage}
              />
            </div>
          );
        })}

        {previewByMapel.every(({ siswaNilai }) => 
          !Object.values(siswaNilai).some(s => s && s.akhir > 0)
        ) && (
          <div className="empty-state">
            <Calculator size={48} className="empty-state-icon" />
            <p>Belum ada data nilai. Masukkan asesmen formatif dan sumatif terlebih dahulu, lalu klik "Hitung Nilai Akhir".</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Nilai Akhir Tersimpan</h3>
        </div>
        <div className="table-container mobile-card-table">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Siswa</th>
                <th>Mata Pelajaran</th>
                <th>Nilai Akhir</th>
                <th>Predikat</th>
                <th>Semester</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {nilaiAkhir.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <p>Belum ada nilai akhir yang disimpan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((nilai, index) => (
                  <tr key={nilai.id}>
                    <td data-label="No">{startIndex + index + 1}</td>
                    <td data-label="Siswa"><strong>{nilai.siswa}</strong></td>
                    <td data-label="Mata Pelajaran">{nilai.mataPelajaran}</td>
                    <td data-label="Nilai Akhir">
                      <strong style={{ color: getGradeColor(nilai.nilaiAkhir) }}>
                        {nilai.nilaiAkhir}
                      </strong>
                    </td>
                    <td data-label="Predikat">
                      <span className="badge badge-primary">{nilai.predikat}</span>
                    </td>
                    <td data-label="Semester">{nilai.semester === '1' ? 'Ganjil' : 'Genap'}</td>
                    <td data-label="Aksi">
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => handleEditNilai(nilai)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteNilai(nilai.id)}>
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
    </div>
  );
}
