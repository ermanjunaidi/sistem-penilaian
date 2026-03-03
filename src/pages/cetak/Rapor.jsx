import { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, FileDown } from 'lucide-react';

export default function Rapor() {
  const { 
    dataSekolah, 
    informasiUmum, 
    dataSiswa, 
    nilaiAkhir, 
    penilaianEkstrakurikuler,
    ekstrakurikuler
  } = useApp();
  
  const [selectedSiswa, setSelectedSiswa] = useState('');
  const printRef = useRef();

  const selectedSiswaData = dataSiswa.find(s => s.id === selectedSiswa);
  
  const siswaNilaiAkhir = selectedSiswa 
    ? nilaiAkhir.filter(n => n.siswaId === selectedSiswa)
    : [];
  
  const siswaEkstra = selectedSiswa
    ? penilaianEkstrakurikuler.filter(p => p.siswaId === selectedSiswa)
    : [];

  const getEkstraName = (id) => {
    const ekstra = ekstrakurikuler.find(e => e.id === id);
    return ekstra ? ekstra.nama : '-';
  };

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
          <title>Rapor - ${selectedSiswaData?.nama}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 0; 
              padding: 15px;
              font-size: 12px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 15px 0;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background: #f0f0f0; 
              font-weight: bold;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .section-title {
              background: #e0e0e0;
              padding: 8px;
              font-weight: bold;
              margin: 20px 0 10px 0;
            }
            .identity {
              margin: 15px 0;
            }
            .identity table {
              width: 100%;
            }
            .identity td {
              border: none;
              padding: 4px 0;
            }
            .page-break {
              page-break-after: always;
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
        <h1 className="page-title">Rapor</h1>
        <div className="flex gap-1">
          <select 
            className="form-select" 
            value={selectedSiswa}
            onChange={(e) => setSelectedSiswa(e.target.value)}
            style={{ width: 300 }}
          >
            <option value="">Pilih Siswa</option>
            {dataSiswa.map(siswa => (
              <option key={siswa.id} value={siswa.id}>{siswa.nama}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handlePrint} disabled={!selectedSiswa}>
            <Printer size={18} />
            Cetak Rapor
          </button>
        </div>
      </div>

      {selectedSiswa && selectedSiswaData && (
        <div ref={printRef} style={{ fontFamily: "'Times New Roman', serif", fontSize: '12px' }}>
          {/* Header */}
          <div className="card">
            <div className="header" style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
              <h2 style={{ margin: '5px 0', fontSize: '16px' }}>{dataSekolah.namaSekolah || 'NAMA SEKOLAH'}</h2>
              <p style={{ margin: '5px 0', fontSize: '12px' }}>
                {dataSekolah.alamat}, {dataSekolah.kota}, {dataSekolah.provinsi}
              </p>
              <p style={{ margin: '5px 0', fontSize: '12px' }}>
                Telp: {dataSekolah.telepon} | Email: {dataSekolah.email}
              </p>
            </div>

            <h3 style={{ textAlign: 'center', margin: '20px 0', fontSize: '16px' }}>
              RAPOR PESERTA DIDIK - KURIKULUM MERDEKA
            </h3>

            {/* Identitas Siswa */}
            <div className="section-title">A. KETERANGAN PRIBADI PESERTA DIDIK</div>
            <div className="identity">
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '200px', border: 'none' }}>Nama Peserta Didik</td>
                    <td style={{ width: '20px', border: 'none' }}>:</td>
                    <td style={{ border: 'none' }}><strong>{selectedSiswaData.nama}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ border: 'none' }}>NISN</td>
                    <td style={{ border: 'none' }}>:</td>
                    <td style={{ border: 'none' }}>{selectedSiswaData.nisn}</td>
                  </tr>
                  <tr>
                    <td style={{ border: 'none' }}>Kelas</td>
                    <td style={{ border: 'none' }}>:</td>
                    <td style={{ border: 'none' }}>{informasiUmum.kelas || '-'}</td>
                  </tr>
                  <tr>
                    <td style={{ border: 'none' }}>Semester</td>
                    <td style={{ border: 'none' }}>:</td>
                    <td style={{ border: 'none' }}>{informasiUmum.semester === '1' ? 'Ganjil' : 'Genap'}</td>
                  </tr>
                  <tr>
                    <td style={{ border: 'none' }}>Tahun Ajaran</td>
                    <td style={{ border: 'none' }}>:</td>
                    <td style={{ border: 'none' }}>{informasiUmum.tahunAjaran || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Nilai Intrakurikuler */}
            <div className="section-title">B. NILAI INTRAKURIKULER</div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>No</th>
                  <th>Mata Pelajaran</th>
                  <th style={{ width: '80px' }}>Nilai Akhir</th>
                  <th style={{ width: '80px' }}>Predikat</th>
                  <th>Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {siswaNilaiAkhir.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Belum ada nilai</td>
                  </tr>
                ) : (
                  siswaNilaiAkhir.map((nilai, index) => (
                    <tr key={nilai.id}>
                      <td>{index + 1}</td>
                      <td>{nilai.mataPelajaran}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{nilai.nilaiAkhir}</td>
                      <td style={{ textAlign: 'center' }}>{nilai.predikat}</td>
                      <td>{nilai.deskripsi}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Nilai Ekstrakurikuler */}
            <div className="section-title">C. NILAI EKSTRAKURIKULER</div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>No</th>
                  <th>Ekstrakurikuler</th>
                  <th style={{ width: '80px' }}>Nilai</th>
                  <th style={{ width: '150px' }}>Predikat</th>
                  <th>Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {siswaEkstra.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Belum ada nilai</td>
                  </tr>
                ) : (
                  siswaEkstra.map((penilaian, index) => (
                    <tr key={penilaian.id}>
                      <td>{index + 1}</td>
                      <td>{getEkstraName(penilaian.ekstrakurikulerId)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{penilaian.nilai}</td>
                      <td>{penilaian.predikat}</td>
                      <td>{penilaian.deskripsi || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Catatan Wali Kelas */}
            <div className="section-title">D. CATATAN WALI KELAS</div>
            <div style={{ padding: '15px', border: '1px solid #000', minHeight: '80px' }}>
              {siswaNilaiAkhir.length > 0 ? (
                <p>
                  {selectedSiswaData.nama} telah menunjukkan perkembangan yang baik. 
                  Terus tingkatkan prestasi dan pertahankan semangat belajar.
                </p>
              ) : (
                <p style={{ color: '#999' }}>Belum ada catatan</p>
              )}
            </div>

            {/* Tanda Tangan */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <p>Orang Tua/Wali,</p>
                <div style={{ marginTop: '60px', borderTop: '1px solid #000', paddingTop: '5px' }}>
                  ( ..................................... )
                </div>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <p>{dataSekolah.kota || '..................'}, {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                <p style={{ marginTop: '10px' }}>Wali Kelas,</p>
                <div style={{ marginTop: '60px', borderTop: '1px solid #000', paddingTop: '5px' }}>
                  <p style={{ margin: 0 }}>( ..................................... )</p>
                  <p style={{ margin: '5px 0 0', fontSize: '11px' }}>NIP. ...........................</p>
                </div>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <p>Mengetahui,</p>
                <p style={{ marginTop: '10px' }}>Kepala Sekolah,</p>
                <div style={{ marginTop: '40px', borderTop: '1px solid #000', paddingTop: '5px' }}>
                  <p style={{ margin: 0 }}>{dataSekolah.kepalaSekolah || '( ..................................... )'}</p>
                  {dataSekolah.nipKepalaSekolah && <p style={{ margin: '5px 0 0', fontSize: '11px' }}>NIP. {dataSekolah.nipKepalaSekolah}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedSiswa && (
        <div className="card">
          <div className="empty-state">
            <FileDown size={48} className="empty-state-icon" />
            <p>Pilih siswa dari dropdown di atas untuk melihat dan mencetak rapor.</p>
          </div>
        </div>
      )}
    </div>
  );
}
