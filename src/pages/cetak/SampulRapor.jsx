import { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer } from 'lucide-react';

export default function SampulRapor() {
  const { dataSekolah, informasiUmum, dataSiswa } = useApp();
  const [selectedSiswa, setSelectedSiswa] = useState('');
  const printRef = useRef();
  const selectedSiswaData = dataSiswa.find((s) => s.id === selectedSiswa);

  const handlePrint = () => {
    if (!selectedSiswa) {
      alert('Pilih siswa terlebih dahulu!');
      return;
    }

    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <html>
        <head>
          <title>Sampul Rapor - ${dataSekolah.namaSekolah}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 0; 
              padding: 20px;
            }
            .sampul-rapor {
              border: 3px double #000;
              padding: 40px;
              min-height: 95vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header {
              text-align: center;
              border-bottom: 3px double #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 15px;
              border: 2px solid #000;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 40px;
            }
            .school-name {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .school-address {
              font-size: 14px;
              color: #666;
            }
            .title {
              text-align: center;
              margin: 40px 0;
            }
            .title h1 {
              font-size: 28px;
              margin: 0;
              text-transform: uppercase;
            }
            .title h2 {
              font-size: 20px;
              margin: 10px 0;
              font-weight: normal;
            }
            .student-info {
              margin: 30px 0;
            }
            .student-info table {
              width: 100%;
              border-collapse: collapse;
            }
            .student-info td {
              padding: 8px 0;
              font-size: 16px;
            }
            .student-info td:first-child {
              width: 150px;
              font-weight: bold;
            }
            .student-info td:nth-child(2) {
              width: 20px;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
            }
            .signature {
              text-align: center;
              width: 200px;
            }
            .signature-line {
              margin-top: 60px;
              border-top: 1px solid #000;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sampul Rapor</h1>
        <div className="flex gap-1">
          <select
            className="form-select"
            value={selectedSiswa}
            onChange={(e) => setSelectedSiswa(e.target.value)}
            style={{ width: 300 }}
          >
            <option value="">Pilih Siswa</option>
            {dataSiswa.map((siswa) => (
              <option key={siswa.id} value={siswa.id}>{siswa.nama}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handlePrint} disabled={!selectedSiswa}>
            <Printer size={18} />
            Cetak Sampul
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Preview Sampul Rapor</h3>
        </div>
        
        <div ref={printRef} className="sampul-rapor" style={{ 
          border: '3px double #000', 
          padding: '40px',
          minHeight: '700px',
          fontFamily: "'Times New Roman', serif"
        }}>
          <div>
            <div className="header" style={{ 
              textAlign: 'center', 
              borderBottom: '3px double #000',
              paddingBottom: '20px',
              marginBottom: '30px'
            }}>
              <div className="logo" style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 15px',
                border: '2px solid #000',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                🎓
              </div>
              <div className="school-name" style={{ fontSize: '20px', fontWeight: 'bold', margin: '10px 0' }}>
                {dataSekolah.namaSekolah || 'NAMA SEKOLAH'}
              </div>
              <div className="school-address" style={{ fontSize: '14px', color: '#666' }}>
                {dataSekolah.alamat}, {dataSekolah.kelurahan}, {dataSekolah.kecamatan}<br />
                {dataSekolah.kota}, {dataSekolah.provinsi} {dataSekolah.kodePos}<br />
                Telp: {dataSekolah.telepon} | Email: {dataSekolah.email}
              </div>
            </div>

            <div className="title" style={{ textAlign: 'center', margin: '40px 0' }}>
              <h1 style={{ fontSize: '24px', margin: 0, textTransform: 'uppercase' }}>RAPOR</h1>
              <h2 style={{ fontSize: '18px', margin: '10px 0', fontWeight: 'normal' }}>
                Peserta Didik - Kurikulum Merdeka
              </h2>
              <p style={{ fontSize: '16px', marginTop: '20px' }}>
                Tahun Ajaran {informasiUmum.tahunAjaran || '20__/20__'} - Semester {informasiUmum.semester === '1' ? 'Ganjil' : 'Genap'}
              </p>
            </div>

            <div className="student-info" style={{ margin: '30px 0' }}>
              <table>
                <tbody>
                  <tr>
                    <td>Nama Peserta Didik</td>
                    <td>:</td>
                    <td>{selectedSiswaData?.nama || '.............................................................'}</td>
                  </tr>
                  <tr>
                    <td>NISN</td>
                    <td>:</td>
                    <td>{selectedSiswaData?.nisn || '.............................................................'}</td>
                  </tr>
                  <tr>
                    <td>Kelas</td>
                    <td>:</td>
                    <td>{informasiUmum.kelas || '...........'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
            <div className="signature" style={{ textAlign: 'center', width: '200px' }}>
              <p>Orang Tua/Wali,</p>
              <div className="signature-line" style={{ marginTop: '60px', borderTop: '1px solid #000', paddingTop: '5px' }}>
                ( ..................................... )
              </div>
            </div>
            <div className="signature" style={{ textAlign: 'center', width: '200px' }}>
              <p>{dataSekolah.kota || '..................'}, {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
              <p style={{ marginTop: '10px' }}>Kepala Sekolah,</p>
              <div className="signature-line" style={{ marginTop: '60px', borderTop: '1px solid #000', paddingTop: '5px' }}>
                <p style={{ margin: 0 }}>{dataSekolah.kepalaSekolah || '( ..................................... )'}</p>
                {dataSekolah.nipKepalaSekolah && <p style={{ margin: '5px 0 0', fontSize: '14px' }}>NIP. {dataSekolah.nipKepalaSekolah}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Petunjuk</h3>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <ol style={{ marginLeft: 20 }}>
            <li>Pastikan data sekolah sudah diisi dengan lengkap di menu <strong>Data Sekolah</strong></li>
            <li>Isi informasi tahun ajaran di menu <strong>Informasi Umum</strong></li>
            <li>Pilih siswa pada dropdown <strong>Pilih Siswa</strong></li>
            <li>Klik tombol <strong>Cetak Sampul</strong> untuk mencetak</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
