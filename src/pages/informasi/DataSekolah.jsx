import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sekolahAPI } from '../../services/api';
import { School, Phone, Mail, Globe, MapPin } from 'lucide-react';

export default function DataSekolah() {
  const { dataSekolah, setDataSekolah } = useApp();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await sekolahAPI.get();
        if (response?.data) {
          setDataSekolah((prev) => ({ ...prev, ...response.data }));
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat data sekolah.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setDataSekolah]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataSekolah(prev => ({ ...prev, [name]: value }));
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await sekolahAPI.save(dataSekolah);
      if (response?.data) {
        setDataSekolah((prev) => ({ ...prev, ...response.data }));
      }
      setMessage(response?.message || 'Data sekolah berhasil disimpan.');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data sekolah.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Sekolah</h1>
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

      <form onSubmit={handleSubmit}>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <School size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Informasi Sekolah
          </h3>
        </div>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Nama Sekolah</label>
            <input
              type="text"
              name="namaSekolah"
              className="form-input"
              placeholder="Nama lengkap sekolah"
              value={dataSekolah.namaSekolah}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">NPSN</label>
            <input
              type="text"
              name="npsn"
              className="form-input"
              placeholder="Nomor Pokok Sekolah Nasional"
              value={dataSekolah.npsn}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kepala Sekolah</label>
            <input
              type="text"
              name="kepalaSekolah"
              className="form-input"
              placeholder="Nama kepala sekolah"
              value={dataSekolah.kepalaSekolah}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">NIP Kepala Sekolah</label>
            <input
              type="text"
              name="nipKepalaSekolah"
              className="form-input"
              placeholder="NIP kepala sekolah"
              value={dataSekolah.nipKepalaSekolah}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <MapPin size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Alamat Sekolah
          </h3>
        </div>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Alamat Lengkap</label>
            <input
              type="text"
              name="alamat"
              className="form-input"
              placeholder="Jalan, nomor, RT/RW"
              value={dataSekolah.alamat}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kelurahan</label>
            <input
              type="text"
              name="kelurahan"
              className="form-input"
              value={dataSekolah.kelurahan}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kecamatan</label>
            <input
              type="text"
              name="kecamatan"
              className="form-input"
              value={dataSekolah.kecamatan}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kota/Kabupaten</label>
            <input
              type="text"
              name="kota"
              className="form-input"
              value={dataSekolah.kota}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Provinsi</label>
            <input
              type="text"
              name="provinsi"
              className="form-input"
              value={dataSekolah.provinsi}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Kode Pos</label>
            <input
              type="text"
              name="kodePos"
              className="form-input"
              value={dataSekolah.kodePos}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Kontak Sekolah</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              <Phone size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Telepon
            </label>
            <input
              type="text"
              name="telepon"
              className="form-input"
              placeholder="Nomor telepon sekolah"
              value={dataSekolah.telepon}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Email
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email sekolah"
              value={dataSekolah.email}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <Globe size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Website
            </label>
            <input
              type="text"
              name="website"
              className="form-input"
              placeholder="Website sekolah"
              value={dataSekolah.website}
              onChange={handleChange}
              disabled={loading || saving}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Data Sekolah'}
          </button>
        </div>
      </div>
      </form>
    </div>
  );
}
