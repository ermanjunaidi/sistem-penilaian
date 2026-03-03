import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/layout/MainLayout';
import InformasiUmum from './pages/informasi/InformasiUmum';
import DataSekolah from './pages/informasi/DataSekolah';
import DataSiswa from './pages/data/DataSiswa';
import MataPelajaran from './pages/data/MataPelajaran';
import Intrakurikuler from './pages/penilaian/Intrakurikuler';
import Ekstrakurikuler from './pages/penilaian/Ekstrakurikuler';
import TujuanPembelajaran from './pages/input/TujuanPembelajaran';
import LingkupMateri from './pages/input/LingkupMateri';
import AsesmenFormatif from './pages/input/AsesmenFormatif';
import AsesmenSumatif from './pages/input/AsesmenSumatif';
import PenilaianEkstrakurikuler from './pages/penilaian/PenilaianEkstrakurikuler';
import NilaiAkhir from './pages/penilaian/NilaiAkhir';
import SampulRapor from './pages/cetak/SampulRapor';
import Rapor from './pages/cetak/Rapor';
import Mutasi from './pages/laporan/Mutasi';
import BukuInduk from './pages/laporan/BukuInduk';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<InformasiUmum />} />
            
            {/* Informasi */}
            <Route path="data-sekolah" element={<DataSekolah />} />
            <Route path="data-siswa" element={<DataSiswa />} />
            <Route path="mata-pelajaran" element={<MataPelajaran />} />
            
            {/* Kurikulum */}
            <Route path="intrakurikuler" element={<Intrakurikuler />} />
            <Route path="ekstrakurikuler" element={<Ekstrakurikuler />} />
            
            {/* Input */}
            <Route path="tujuan-pembelajaran" element={<TujuanPembelajaran />} />
            <Route path="lingkup-materi" element={<LingkupMateri />} />
            <Route path="asesmen-formatif" element={<AsesmenFormatif />} />
            <Route path="asesmen-sumatif" element={<AsesmenSumatif />} />
            
            {/* Penilaian */}
            <Route path="penilaian-ekstrakurikuler" element={<PenilaianEkstrakurikuler />} />
            <Route path="nilai-akhir" element={<NilaiAkhir />} />
            
            {/* Cetak */}
            <Route path="sampul-rapor" element={<SampulRapor />} />
            <Route path="rapor" element={<Rapor />} />
            
            {/* Laporan */}
            <Route path="mutasi" element={<Mutasi />} />
            <Route path="buku-induk" element={<BukuInduk />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
