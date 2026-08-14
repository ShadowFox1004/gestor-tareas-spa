import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            // Llamamos al endpoint de la API
            const response = await api.post('/auth/login', { email, password });

            // Extraemos el token y lo guardamos usando nuestro Contexto
            const token = response.data.token;
            login(token);

            // Redirigimos al Tablero
            navigate('/dashboard');
        } catch (err) {
            // Manejo amigable de errores (Evitamos mostrar stack traces)
            if (err.response && err.response.data && err.response.data.mensaje) {
                setError(err.response.data.mensaje);
            } else {
                setError('Error al conectar con el servidor. Intenta más tarde.');
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-card">
                <h3 className="login-title">Sign In</h3>

                {error && <div className="alert alert-danger py-2 mb-4" style={{ borderRadius: '12px', fontSize: '14px', background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Input Correo */}
                    <div className="glass-input-group">
                        <div className="glass-icon-wrapper">
                            <svg viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                        </div>
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="Email ID"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Input Contraseña */}
                    <div className="glass-input-group">
                        <div className="glass-icon-wrapper">
                            <svg viewBox="0 0 24 24">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>
                        </div>
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Botón Entrar */}
                    <button
                        type="submit"
                        className="glass-btn"
                        disabled={cargando}
                    >
                        {cargando ? 'Iniciando...' : 'Sign In'}
                    </button>
                </form>

                <div className="register-link-container">
                    ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
};
