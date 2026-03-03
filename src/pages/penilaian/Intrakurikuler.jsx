import { useApp } from '../../context/AppContext';
import { Book, Target, FileText, CheckSquare } from 'lucide-react';

export default function Intrakurikuler() {
  const { mataPelajaran, tujuanPembelajaran, asesmenFormatif, asesmenSumatif } = useApp();

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
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Nama Mata Pelajaran</th>
                <th>Kelompok</th>
                <th>Fase</th>
                <th>JP/Minggu</th>
                <th>Guru</th>
              </tr>
            </thead>
            <tbody>
              {mataPelajaran.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <p>Belum ada mata pelajaran intrakurikuler.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                mataPelajaran.map((mapel, index) => (
                  <tr key={mapel.id}>
                    <td>{index + 1}</td>
                    <td>{mapel.kode}</td>
                    <td><strong>{mapel.nama}</strong></td>
                    <td>Kelompok {mapel.kelompok}</td>
                    <td>Fase {mapel.fase}</td>
                    <td>{mapel.jpPerMinggu}</td>
                    <td>{mapel.guru || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              {/* Placeholder count */}
              0 Item
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
            <li><strong>Kelompok A:</strong> Mata pelajaran wajib (Bahasa Indonesia, Matematika, IPA, IPS, PPKn, dll)</li>
            <li><strong>Kelompok B:</strong> Mata pelajaran wajib (Seni Budaya, PJOK, Prakarya, dll)</li>
            <li><strong>Kelompok C:</strong> Mata pelajaran peminatan sesuai jurusan</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
