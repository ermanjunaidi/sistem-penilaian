const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// Auth API
export const authAPI = {
  login: (email, password) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (userData) => 
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  getProfile: () => apiCall('/auth/me'),
  
  updateProfile: (data) => 
    apiCall('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  changePassword: (currentPassword, newPassword) => 
    apiCall('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Users API
export const usersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/users${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiCall(`/users/${id}`),
  
  create: (data) => 
    apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id, data) => 
    apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id) => apiCall(`/users/${id}`, { method: 'DELETE' }),
  
  resetPassword: (id, newPassword) => 
    apiCall(`/users/${id}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    }),
};

// Sekolah API
export const sekolahAPI = {
  get: () => apiCall('/sekolah/sekolah'),
  save: (data) => 
    apiCall('/sekolah/sekolah', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getInformasi: () => apiCall('/sekolah/informasi'),
  saveInformasi: (data) => 
    apiCall('/sekolah/informasi', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Siswa API
export const siswaAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/siswa${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiCall(`/siswa/${id}`),
  
  create: (data) => 
    apiCall('/siswa', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id, data) => 
    apiCall(`/siswa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id) => apiCall(`/siswa/${id}`, { method: 'DELETE' }),
  
  bulkImport: (students) => 
    apiCall('/siswa/bulk', {
      method: 'POST',
      body: JSON.stringify({ students }),
    }),
};

// Mata Pelajaran API
export const mapelAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/mapel/mapel${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id) => apiCall(`/mapel/mapel/${id}`),

  create: (data) =>
    apiCall('/mapel/mapel', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiCall(`/mapel/mapel/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) => apiCall(`/mapel/mapel/${id}`, { method: 'DELETE' }),

  // Export/Import
  export: (format = 'json') =>
    apiCall(`/mapel/export?format=${format}`, {
      method: 'GET',
    }),

  import: (formData) =>
    fetch(`${API_URL}/mapel/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then(res => res.json()),

  downloadTemplate: (format = 'csv') => {
    const url = `${API_URL}/mapel/template?format=${format}`;
    const token = localStorage.getItem('token');

    console.log('Downloading template:', { url, tokenExists: !!token, token: token ? token.substring(0, 20) + '...' : null });

    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(async res => {
      console.log('Response status:', res.status, res.headers.get('content-type'));
      if (!res.ok) {
        const err = await res.json();
        console.error('Download error:', err);
        throw new Error(err.message || 'Download failed');
      }
      return res.blob();
    });
  },
  
  // Tujuan Pembelajaran
  getTP: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/mapel/tujuan-pembelajaran${queryString ? `?${queryString}` : ''}`);
  },
  
  createTP: (data) => 
    apiCall('/mapel/tujuan-pembelajaran', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateTP: (id, data) => 
    apiCall(`/mapel/tujuan-pembelajaran/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteTP: (id) => apiCall(`/mapel/tujuan-pembelajaran/${id}`, { method: 'DELETE' }),
  
  // Lingkup Materi
  getMateri: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/mapel/lingkup-materi${queryString ? `?${queryString}` : ''}`);
  },
  
  createMateri: (data) => 
    apiCall('/mapel/lingkup-materi', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateMateri: (id, data) => 
    apiCall(`/mapel/lingkup-materi/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteMateri: (id) => apiCall(`/mapel/lingkup-materi/${id}`, { method: 'DELETE' }),
};

// Ekstrakurikuler API
export const ekstraAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/ekstra${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiCall(`/ekstra/${id}`),
  
  create: (data) => 
    apiCall('/ekstra', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id, data) => 
    apiCall(`/ekstra/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id) => apiCall(`/ekstra/${id}`, { method: 'DELETE' }),
  
  // Penilaian Ekstrakurikuler
  getPenilaian: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/ekstra/penilaian/nilai${queryString ? `?${queryString}` : ''}`);
  },
  
  createPenilaian: (data) => 
    apiCall('/ekstra/penilaian/nilai', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updatePenilaian: (id, data) => 
    apiCall(`/ekstra/penilaian/nilai/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deletePenilaian: (id) => apiCall(`/ekstra/penilaian/nilai/${id}`, { method: 'DELETE' }),
};

// Penilaian API
export const penilaianAPI = {
  // Asesmen Formatif
  getFormatif: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/penilaian/formatif${queryString ? `?${queryString}` : ''}`);
  },
  
  createFormatif: (data) => 
    apiCall('/penilaian/formatif', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateFormatif: (id, data) => 
    apiCall(`/penilaian/formatif/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteFormatif: (id) => apiCall(`/penilaian/formatif/${id}`, { method: 'DELETE' }),
  
  // Asesmen Sumatif
  getSumatif: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/penilaian/sumatif${queryString ? `?${queryString}` : ''}`);
  },
  
  createSumatif: (data) => 
    apiCall('/penilaian/sumatif', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateSumatif: (id, data) => 
    apiCall(`/penilaian/sumatif/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteSumatif: (id) => apiCall(`/penilaian/sumatif/${id}`, { method: 'DELETE' }),
  
  // Nilai Akhir
  getNilaiAkhir: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/penilaian/nilai-akhir${queryString ? `?${queryString}` : ''}`);
  },
  
  calculateNilaiAkhir: (data) => 
    apiCall('/penilaian/nilai-akhir/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  deleteNilaiAkhir: (id) => apiCall(`/penilaian/nilai-akhir/${id}`, { method: 'DELETE' }),
  
  // Mutasi
  getMutasi: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/penilaian/mutasi${queryString ? `?${queryString}` : ''}`);
  },
  
  createMutasi: (data) => 
    apiCall('/penilaian/mutasi', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateMutasi: (id, data) => 
    apiCall(`/penilaian/mutasi/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteMutasi: (id) => apiCall(`/penilaian/mutasi/${id}`, { method: 'DELETE' }),
};

// Role permissions helper
export const hasPermission = (requiredRole) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roleHierarchy = {
    guru: 1,
    wali_kelas: 2,
    admin: 3,
    superadmin: 4,
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

export const canAccess = (allowedRoles) => {
  if (!Array.isArray(allowedRoles)) {
    return hasPermission(allowedRoles);
  }
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return allowedRoles.includes(user.role);
};

export default {
  auth: authAPI,
  users: usersAPI,
  sekolah: sekolahAPI,
  siswa: siswaAPI,
  mapel: mapelAPI,
  ekstra: ekstraAPI,
  penilaian: penilaianAPI,
};
