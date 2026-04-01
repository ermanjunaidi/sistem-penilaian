import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { siswaAPI, mapelAPI, penilaianAPI } from '../services/api';

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
    try {
      const saved = localStorage.getItem('dataKelas');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  // Mata Pelajaran
  const [mataPelajaran, setMataPelajaran] = useState([]);

  // Ekstrakurikuler
  const [ekstrakurikuler, setEkstrakurikuler] = useState(() => {
    try {
      const saved = localStorage.getItem('ekstrakurikuler');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  // Tujuan Pembelajaran
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState([]);

  // Lingkup Materi
  const [lingkupMateri, setLingkupMateri] = useState([]);

  // Asesmen Formatif
  const [asesmenFormatif, setAsesmenFormatif] = useState([]);

  // Asesmen Sumatif
  const [asesmenSumatif, setAsesmenSumatif] = useState([]);

  // Penilaian Ekstrakurikuler
  const [penilaianEkstrakurikuler, setPenilaianEkstrakurikuler] = useState(() => {
    try {
      const saved = localStorage.getItem('penilaianEkstrakurikuler');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  // Nilai Akhir
  const [nilaiAkhir, setNilaiAkhir] = useState([]);

  // Mutasi
  const [mutasi, setMutasi] = useState(() => {
    try {
      const saved = localStorage.getItem('mutasi');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  // Buku Induk
  const [bukuInduk, setBukuInduk] = useState(() => {
    try {
      const saved = localStorage.getItem('bukuInduk');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  // Informasi Umum
  const [informasiUmum, setInformasiUmum] = useState(() => {
    try {
      const saved = localStorage.getItem('informasiUmum');
      return saved ? JSON.parse(saved) : {
        tahunAjaran: '',
        semester: '1',
        kelas: ''
      };
    } catch {
      return { tahunAjaran: '', semester: '1', kelas: '' };
    }
  });

  // Save to localStorage whenever data changes
  useEffect(() => { localStorage.setItem('dataSekolah', JSON.stringify(dataSekolah)); }, [dataSekolah]);
  useEffect(() => { localStorage.setItem('dataKelas', JSON.stringify(dataKelas)); }, [dataKelas]);
  useEffect(() => { localStorage.setItem('ekstrakurikuler', JSON.stringify(ekstrakurikuler)); }, [ekstrakurikuler]);
  useEffect(() => { localStorage.setItem('penilaianEkstrakurikuler', JSON.stringify(penilaianEkstrakurikuler)); }, [penilaianEkstrakurikuler]);
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
          setDataSiswa((response.data || []).map(normalizeSiswa));
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let active = true;
    const fetchTujuanPembelajaran = async () => {
      try {
        const response = await mapelAPI.getTP();
        if (active) {
          setTujuanPembelajaran((response.data || []).map(normalizeTujuanPembelajaran));
        }
      } catch {
        if (active) {
          setTujuanPembelajaran([]);
        }
      }
    };

    fetchTujuanPembelajaran();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let active = true;
    const fetchLingkupMateri = async () => {
      try {
        const response = await mapelAPI.getMateri();
        if (active) {
          setLingkupMateri((response.data || []).map(normalizeLingkupMateri));
        }
      } catch {
        if (active) {
          setLingkupMateri([]);
        }
      }
    };

    fetchLingkupMateri();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let active = true;
    const fetchAsesmenFormatif = async () => {
      try {
        const response = await penilaianAPI.getFormatif();
        if (active) {
          setAsesmenFormatif((response.data || []).map(normalizeAsesmenFormatif));
        }
      } catch {
        if (active) {
          setAsesmenFormatif([]);
        }
      }
    };

    fetchAsesmenFormatif();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let active = true;
    const fetchAsesmenSumatif = async () => {
      try {
        const response = await penilaianAPI.getSumatif();
        if (active) {
          setAsesmenSumatif((response.data || []).map(normalizeAsesmenSumatif));
        }
      } catch {
        if (active) {
          setAsesmenSumatif([]);
        }
      }
    };

    fetchAsesmenSumatif();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let active = true;
    const fetchNilaiAkhir = async () => {
      try {
        const response = await penilaianAPI.getNilaiAkhir();
        if (active) {
          setNilaiAkhir((response.data || []).map(normalizeNilaiAkhir));
        }
      } catch {
        if (active) {
          setNilaiAkhir([]);
        }
      }
    };

    fetchNilaiAkhir();
    return () => {
      active = false;
    };
  }, []);

  const refreshDataSiswa = useCallback(async (params = {}) => {
    const response = await siswaAPI.getAll(params);
    const items = (response.data || []).map(normalizeSiswa);
    setDataSiswa(items);
    return items;
  }, []);

  const refreshMataPelajaran = useCallback(async (params = {}) => {
    const response = await mapelAPI.getAll(params);
    const items = (response.data || []).map(normalizeMapel);
    setMataPelajaran(items);
    return items;
  }, []);

  const refreshTujuanPembelajaran = useCallback(async (params = {}) => {
    const response = await mapelAPI.getTP(params);
    const items = (response.data || []).map(normalizeTujuanPembelajaran);
    setTujuanPembelajaran(items);
    return items;
  }, []);

  const refreshLingkupMateri = useCallback(async (params = {}) => {
    const response = await mapelAPI.getMateri(params);
    const items = (response.data || []).map(normalizeLingkupMateri);
    setLingkupMateri(items);
    return items;
  }, []);

  const refreshAsesmenFormatif = useCallback(async (params = {}) => {
    const response = await penilaianAPI.getFormatif(params);
    const items = (response.data || []).map(normalizeAsesmenFormatif);
    setAsesmenFormatif(items);
    return items;
  }, []);

  const refreshAsesmenSumatif = useCallback(async (params = {}) => {
    const response = await penilaianAPI.getSumatif(params);
    const items = (response.data || []).map(normalizeAsesmenSumatif);
    setAsesmenSumatif(items);
    return items;
  }, []);

  const refreshNilaiAkhir = useCallback(async (params = {}) => {
    const response = await penilaianAPI.getNilaiAkhir(params);
    const items = (response.data || []).map(normalizeNilaiAkhir);
    setNilaiAkhir(items);
    return items;
  }, []);

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
      refreshTujuanPembelajaran,
      lingkupMateri,
      setLingkupMateri,
      refreshLingkupMateri,
      asesmenFormatif,
      setAsesmenFormatif,
      refreshAsesmenFormatif,
      asesmenSumatif,
      setAsesmenSumatif,
      refreshAsesmenSumatif,
      // Penilaian
      penilaianEkstrakurikuler,
      setPenilaianEkstrakurikuler,
      nilaiAkhir,
      setNilaiAkhir,
      refreshNilaiAkhir,
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

function normalizeSiswa(item) {
  if (!item) return item;
  return {
    ...item,
    tempatLahir: item.tempatLahir ?? item.tempat_lahir ?? '',
    tanggalLahir: item.tanggalLahir ?? item.tanggal_lahir ?? '',
    jenisKelamin: item.jenisKelamin ?? item.jenis_kelamin ?? 'L',
    namaOrtu: item.namaOrtu ?? item.nama_ortu ?? '',
    teleponOrtu: item.teleponOrtu ?? item.telepon_ortu ?? '',
    tanggalMasuk: item.tanggalMasuk ?? item.tanggal_masuk ?? '',
  };
}

function normalizeMapel(item) {
  if (!item) return item;
  return {
    ...item,
    jpPerMinggu: item.jpPerMinggu ?? item.jp_per_minggu ?? '',
  };
}

function normalizeTujuanPembelajaran(item) {
  if (!item) return item;
  return {
    ...item,
    mataPelajaranId: item.mataPelajaranId ?? item.mata_pelajaran_id ?? '',
  };
}

function normalizeLingkupMateri(item) {
  if (!item) return item;
  return {
    ...item,
    mataPelajaranId: item.mataPelajaranId ?? item.mata_pelajaran_id ?? '',
    namaMateri: item.namaMateri ?? item.nama_materi ?? '',
    alokasiWaktu: item.alokasiWaktu ?? item.alokasi_waktu ?? '',
    semester: String(item.semester ?? '1'),
  };
}

function normalizeAsesmenFormatif(item) {
  if (!item) return item;
  return {
    ...item,
    mataPelajaranId: item.mataPelajaranId ?? item.mata_pelajaran_id ?? '',
    siswaId: item.siswaId ?? item.siswa_id ?? '',
  };
}

function normalizeAsesmenSumatif(item) {
  if (!item) return item;
  return {
    ...item,
    mataPelajaranId: item.mataPelajaranId ?? item.mata_pelajaran_id ?? '',
    siswaId: item.siswaId ?? item.siswa_id ?? '',
    semester: String(item.semester ?? item.semester ?? '1'),
    kkm: item.kkm ?? item.kktp ?? 75,
  };
}

function normalizeNilaiAkhir(item) {
  if (!item) return item;
  return {
    ...item,
    mataPelajaranId: item.mataPelajaranId ?? item.mata_pelajaran_id ?? '',
    mataPelajaran: item.mataPelajaran ?? item.mata_pelajaran ?? '',
    siswaId: item.siswaId ?? item.siswa_id ?? '',
    nilaiFormatif: item.nilaiFormatif ?? item.nilai_formatif ?? '',
    nilaiSumatif: item.nilaiSumatif ?? item.nilai_sumatif ?? '',
    nilaiAkhir: item.nilaiAkhir ?? item.nilai_akhir ?? '',
    tahunAjaran: item.tahunAjaran ?? item.tahun_ajaran ?? '',
    semester: String(item.semester ?? '1'),
  };
}
