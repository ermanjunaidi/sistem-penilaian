import { useApp } from '../../context/AppContext';
import { School, Phone, Mail, Globe, MapPin } from 'lucide-react';

export default function DataSekolah() {
  const { dataSekolah, setDataSekolah } = useApp();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataSekolah(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Sekolah</h1>
      </div>

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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
