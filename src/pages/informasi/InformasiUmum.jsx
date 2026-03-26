import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sekolahAPI } from '../../services/api';
import { School, Calendar, User } from 'lucide-react';

export default function InformasiUmum() {
  const { informasiUmum, setInformasiUmum, dataKelas } = useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await sekolahAPI.getInformasi();
        if (response?.data) {
          setInformasiUmum((prev) => ({ ...prev, ...response.data }));
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat informasi umum.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setInformasiUmum]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInformasiUmum((prev) => ({ ...prev, [name]: value }));
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await sekolahAPI.saveInformasi(informasiUmum);
      if (response?.data) {
        setInformasiUmum((prev) => ({ ...prev, ...response.data }));
      }
      setMessage(response?.message || 'Informasi umum berhasil disimpan.');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan informasi umum.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Informasi Umum</h1>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Tahun Ajaran</div>
          <div className="stat-value">{informasiUmum.tahunAjaran || '-'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Semester</div>
          <div className="stat-value">{informasiUmum.semester === '1' ? 'Ganjil' : 'Genap'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Kelas</div>
          <div className="stat-value">{informasiUmum.kelas || '-'}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pengaturan Tahun Ajaran</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Tahun Ajaran
              </label>
              <input
                type="text"
                name="tahunAjaran"
                className="form-input"
                placeholder="Contoh: 2024/2025"
                value={informasiUmum.tahunAjaran}
                onChange={handleChange}
                disabled={loading || saving}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select
                name="semester"
                className="form-select"
                value={informasiUmum.semester}
                onChange={handleChange}
                disabled={loading || saving}
              >
                <option value="1">Ganjil</option>
                <option value="2">Genap</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Kelas
              </label>
              <select
                name="kelas"
                className="form-select"
                value={informasiUmum.kelas}
                onChange={handleChange}
                disabled={loading || saving}
              >
                <option value="">Pilih Kelas</option>
                {dataKelas
                  .slice()
                  .sort((a, b) => a.nama.localeCompare(b.nama, 'id-ID'))
                  .map((kelas) => (
                    <option key={kelas.id} value={kelas.nama}>
                      {kelas.nama}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || saving}>
              {saving ? 'Menyimpan...' : 'Simpan Informasi Umum'}
            </button>
          </div>
        </div>
      </form>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <School size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Tentang Kurikulum Merdeka
          </h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>Kurikulum Merdeka</strong> adalah kurikulum dengan pembelajaran intrakurikuler yang beragam di mana konten akan lebih optimal agar peserta didik memiliki cukup waktu untuk mendalami konsep dan menguatkan kompetensi.</p>
          <br />
          <p><strong>Karakteristik Kurikulum Merdeka:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>Pembelajaran berbasis proyek untuk pengembangan soft skills dan karakter</li>
            <li>Fokus pada materi esensial untuk pendalaman kompetensi</li>
            <li>Fleksibilitas bagi guru untuk pembelajaran yang terdiferensiasi</li>
          </ul>
          <br />
          <p><strong>Asesmen dalam Kurikulum Merdeka:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li><strong>Asesmen Formatif:</strong> Dilakukan selama proses pembelajaran untuk memberikan umpan balik</li>
            <li><strong>Asesmen Sumatif:</strong> Dilakukan di akhir periode untuk mengukur pencapaian belajar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
