import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// Creamos el contexto
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Al cargar la app, revisamos si ya hay un token guardado
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
        setCargando(false);
    }, []);

    // Función para iniciar sesión (la llamaremos desde la página de Login)
    const login = (newToken, newRefreshToken) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        setToken(newToken);
    };

    // Función para cerrar sesión
    const logout = async () => {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedRefreshToken) {
            try {
                // Revocar el token de refresco en base de datos
                await api.post('/auth/logout', { refreshToken: storedRefreshToken });
            } catch (err) {
                console.error("Error al invalidar sesión en el backend:", err);
            }
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
            {!cargando && children}
        </AuthContext.Provider>
    );
};
