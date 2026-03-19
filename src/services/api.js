import axios from 'axios';

// Определяем базовый URL API
const getBaseUrl = () => {
  // В продакшене используем URL сервера
  if (window.location.hostname !== 'localhost') {
    return 'https://s-production-2907.up.railway.app';
  }
  // В разработке используем прокси
  return '';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Важно для CORS с credentials
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 Запрос: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ответов
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Ответ: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ Ошибка ${error.response.status}: ${error.response.config?.url}`);
      console.error('Детали:', error.response.data);
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('❌ Нет ответа от сервера');
    } else {
      console.error('❌ Ошибка запроса:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
