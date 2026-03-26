import { createContext, useContext, useState, useEffect } from 'react';
import { siswaAPI, mapelAPI } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Data Sekolah
  const [dataSekolah, setDataSekolah] = useState(() => {
    const saved = localStorage.getItem('dataSekolah');
    return saved ? JSON.parse(saved) : {
      namaSekolah: '',
      npsn: '',
      alamat: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: '',
      kodePos: '',
      telepon: '',
      email: '',
      website: '',
      kepalaSekolah: '',
      nipKepalaSekolah: ''
    };
  });

  // Data Siswa
  const [dataSiswa, setDataSiswa] = useState([]);

  // Data Kelas
  const [dataKelas, setDataKelas] = useState(() => {
    const saved = localStorage.getItem('dataKelas');
    return saved ? JSON.parse(saved) : [];
  });

  // Mata Pelajaran
  const [mataPelajaran, setMataPelajaran] = useState([]);

  // Ekstrakurikuler
  const [ekstrakurikuler, setEkstrakurikuler] = useState(() => {
    const saved = localStorage.getItem('ekstrakurikuler');
    return saved ? JSON.parse(saved) : [];
  });

  // Tujuan Pembelajaran
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState(() => {
    const saved = localStorage.getItem('tujuanPembelajaran');
    return saved ? JSON.parse(saved) : [];
  });

  // Lingkup Materi
  const [lingkupMateri, setLingkupMateri] = useState(() => {
    const saved = localStorage.getItem('lingkupMateri');
    return saved ? JSON.parse(saved) : [];
  });

  // Asesmen Formatif
  const [asesmenFormatif, setAsesmenFormatif] = useState(() => {
    const saved = localStorage.getItem('asesmenFormatif');
    return saved ? JSON.parse(saved) : [];
  });

  // Asesmen Sumatif
  const [asesmenSumatif, setAsesmenSumatif] = useState(() => {
    const saved = localStorage.getItem('asesmenSumatif');
    return saved ? JSON.parse(saved) : [];
  });

  // Penilaian Ekstrakurikuler
  const [penilaianEkstrakurikuler, setPenilaianEkstrakurikuler] = useState(() => {
    const saved = localStorage.getItem('penilaianEkstrakurikuler');
    return saved ? JSON.parse(saved) : [];
  });

  // Nilai Akhir
  const [nilaiAkhir, setNilaiAkhir] = useState(() => {
    const saved = localStorage.getItem('nilaiAkhir');
    return saved ? JSON.parse(saved) : [];
  });

  // Mutasi
  const [mutasi, setMutasi] = useState(() => {
    const saved = localStorage.getItem('mutasi');
    return saved ? JSON.parse(saved) : [];
  });

  // Buku Induk
  const [bukuInduk, setBukuInduk] = useState(() => {
    const saved = localStorage.getItem('bukuInduk');
    return saved ? JSON.parse(saved) : [];
  });

  // Informasi Umum
  const [informasiUmum, setInformasiUmum] = useState(() => {
    const saved = localStorage.getItem('informasiUmum');
    return saved ? JSON.parse(saved) : {
      tahunAjaran: '',
      semester: '1',
      kelas: ''
    };
  });

  // Save to localStorage whenever data changes
  useEffect(() => { localStorage.setItem('dataSekolah', JSON.stringify(dataSekolah)); }, [dataSekolah]);
  useEffect(() => { localStorage.setItem('dataKelas', JSON.stringify(dataKelas)); }, [dataKelas]);
  useEffect(() => { localStorage.setItem('ekstrakurikuler', JSON.stringify(ekstrakurikuler)); }, [ekstrakurikuler]);
  useEffect(() => { localStorage.setItem('tujuanPembelajaran', JSON.stringify(tujuanPembelajaran)); }, [tujuanPembelajaran]);
  useEffect(() => { localStorage.setItem('lingkupMateri', JSON.stringify(lingkupMateri)); }, [lingkupMateri]);
  useEffect(() => { localStorage.setItem('asesmenFormatif', JSON.stringify(asesmenFormatif)); }, [asesmenFormatif]);
  useEffect(() => { localStorage.setItem('asesmenSumatif', JSON.stringify(asesmenSumatif)); }, [asesmenSumatif]);
  useEffect(() => { localStorage.setItem('penilaianEkstrakurikuler', JSON.stringify(penilaianEkstrakurikuler)); }, [penilaianEkstrakurikuler]);
  useEffect(() => { localStorage.setItem('nilaiAkhir', JSON.stringify(nilaiAkhir)); }, [nilaiAkhir]);
  useEffect(() => { localStorage.setItem('mutasi', JSON.stringify(mutasi)); }, [mutasi]);
  useEffect(() => { localStorage.setItem('bukuInduk', JSON.stringify(bukuInduk)); }, [bukuInduk]);
  useEffect(() => { localStorage.setItem('informasiUmum', JSON.stringify(informasiUmum)); }, [informasiUmum]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let active = true;
    const fetchSiswa = async () => {
      try {
        const response = await siswaAPI.getAll();
        if (active) {
          setDataSiswa(response.data || []);
        }
      } catch {
        if (active) {
          setDataSiswa([]);
        }
      }
    };

    fetchSiswa();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let active = true;
    const fetchMapel = async () => {
      try {
        const response = await mapelAPI.getAll();
        if (active) {
          setMataPelajaran((response.data || []).map(normalizeMapel));
        }
      } catch {
        if (active) {
          setMataPelajaran([]);
        }
      }
    };

    fetchMapel();
    return () => {
      active = false;
    };
  }, []);

  const refreshDataSiswa = async (params = {}) => {
    const response = await siswaAPI.getAll(params);
    setDataSiswa(response.data || []);
    return response.data || [];
  };

  const refreshMataPelajaran = async (params = {}) => {
    const response = await mapelAPI.getAll(params);
    const items = (response.data || []).map(normalizeMapel);
    setMataPelajaran(items);
    return items;
  };

  // Generate ID helper
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  return (
    <AppContext.Provider value={{
      // Informasi Umum
      informasiUmum,
      setInformasiUmum,
      // Data Sekolah
      dataSekolah,
      setDataSekolah,
      // Data Siswa
      dataSiswa,
      setDataSiswa,
      refreshDataSiswa,
      // Data Kelas
      dataKelas,
      setDataKelas,
      // Mata Pelajaran
      mataPelajaran,
      setMataPelajaran,
      refreshMataPelajaran,
      // Ekstrakurikuler
      ekstrakurikuler,
      setEkstrakurikuler,
      // Input
      tujuanPembelajaran,
      setTujuanPembelajaran,
      lingkupMateri,
      setLingkupMateri,
      asesmenFormatif,
      setAsesmenFormatif,
      asesmenSumatif,
      setAsesmenSumatif,
      // Penilaian
      penilaianEkstrakurikuler,
      setPenilaianEkstrakurikuler,
      nilaiAkhir,
      setNilaiAkhir,
      // Laporan
      mutasi,
      setMutasi,
      bukuInduk,
      setBukuInduk,
      // Helper
      generateId
    }}>
      {children}
    </AppContext.Provider>
  );
};

function normalizeMapel(item) {
  if (!item) return item;
  return {
    ...item,
    jpPerMinggu: item.jpPerMinggu ?? item.jp_per_minggu ?? '',
  };
}
