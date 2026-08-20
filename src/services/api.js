import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || '';
if (baseURL && !baseURL.endsWith('/api/v1') && !baseURL.endsWith('/api/v1/')) {
    baseURL = baseURL.replace(/\/+$/, '') + '/api/v1';
}

const api = axios.create({
    baseURL: baseURL,
});

// Interceptor de PETICIONES (Requests)
api.interceptors.request.use(
    (config) => {
        // Buscamos el token en el almacenamiento local
        const token = localStorage.getItem('token');

        // Si existe, lo adjuntamos a los headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Interceptor de RESPUESTAS (Responses)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Verificamos si la petición original era hacia la ruta de login o refresh
        const esPeticionDeLogin = originalRequest && originalRequest.url.includes('/auth/login');
        const esPeticionDeRefresh = originalRequest && originalRequest.url.includes('/auth/refresh');

        // Si el token expira o es inválido (401) y no es de login ni refresh
        if (error.response && error.response.status === 401 && !esPeticionDeLogin && !esPeticionDeRefresh) {
            
            // Si ya reintentamos y falló, forzamos logout
            if (originalRequest._retry) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // Si ya se está refrescando el token, encolamos esta petición
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
            }

            isRefreshing = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Hacer el refresh en el backend usando una instancia limpia de Axios para evitar loops
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
                    token: localStorage.getItem('token'),
                    refreshToken: refreshToken
                });

                const { token: nuevoAccessToken, refreshToken: nuevoRefreshToken } = res.data;
                
                // Guardar los nuevos tokens
                localStorage.setItem('token', nuevoAccessToken);
                localStorage.setItem('refreshToken', nuevoRefreshToken);

                // Reintentar las peticiones encoladas
                api.defaults.headers.common['Authorization'] = `Bearer ${nuevoAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${nuevoAccessToken}`;

                processQueue(null, nuevoAccessToken);
                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;