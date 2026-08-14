import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export const Registro = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [imagen, setImagen] = useState(null);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('email', email);
        formData.append('password', password);
        if (imagen) {
            formData.append('imagenPerfil', imagen);
        }

        try {
            await api.post('/auth/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Si el registro es exitoso, lo mandamos al login para que entre
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.mensaje) {
                setError(err.response.data.mensaje);
            } else {
                setError('Error al registrar usuario.');
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-card">
                <h3 className="login-title">Registro</h3>
                
                {error && <div className="alert alert-danger py-2 mb-4" style={{ borderRadius: '12px', fontSize: '14px', background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    {/* Input Nombre */}
                    <div className="glass-input-group">
                        <div className="glass-icon-wrapper">
                            <svg viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            className="glass-input" 
                            placeholder="Nombre Completo"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required 
                        />
                    </div>

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
                            placeholder="Contraseña (mín. 6 caracteres)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            required 
                        />
                    </div>

                    {/* Foto de Perfil Opcional */}
                    <div className="mb-4 text-start px-2">
                        <label className="form-label text-white-50 small mb-1">Foto de Perfil (Opcional)</label>
                        <input 
                            type="file" 
                            className="form-control form-control-sm text-white-50" 
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                            accept="image/png, image/jpeg"
                            onChange={(e) => setImagen(e.target.files[0])}
                        />
                    </div>

                    {/* Botón Registrarse */}
                    <button 
                        type="submit" 
                        className="glass-btn" 
                        disabled={cargando}
                    >
                        {cargando ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
                
                <div className="register-link-container">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
};
