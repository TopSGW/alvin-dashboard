import axios from 'axios';

const API_URL = 'http://3.106.129.114:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const login = async (email, password) => {
  try {
    const response = await api.post('/token', {
      username: email,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCaseLength = async () => {
  try{
    const response = await api.get('/case_details_all');
    return response.data
  } catch(error) {
    console.error('get case length error', error)
  } 
}
// export const register = async (email, password) => {
//   try {
//     const response = await api.post('/register', { email, password });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

export const logout = async () => {
  try {
    await api.post('/logout');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCaseDetails = async (skip = 0, limit = 10) => {
  try {
    const response = await api.get(`/case_details?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCaseDetail = async (caseDetail) => {
  try {
    const response = await api.post('/case_details', caseDetail);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCaseDetail = async (id, caseDetail) => {
  try {
    const response = await api.put(`/case_details/${id}`, caseDetail);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCaseDetail = async (id) => {
  try {
    const response = await api.delete(`/case_details/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;