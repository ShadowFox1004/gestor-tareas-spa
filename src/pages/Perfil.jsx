import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export const Perfil = () => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [subiendo, setSubiendo] = useState(false);

    const obtenerPerfil = async () => {
        try {
            const response = await api.get('/auth/perfil');
            setUsuario(response.data);
        } catch (err) {
            setError('Error al obtener la información de perfil.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerPerfil();
    }, []);

    const handleCambiarImagen = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSubiendo(true);
        setError('');

        const formData = new FormData();
        formData.append('archivo', file);

        try {
            await api.post('/auth/perfil/imagen', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            await obtenerPerfil(); // Refrescar los datos para ver la nueva foto
            alert('¡Imagen de perfil actualizada con éxito!');
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Error al subir la imagen de perfil.');
        } finally {
            setSubiendo(false);
        }
    };

    const urlAvatar = usuario?.imagenPerfil 
        ? `https://localhost:7062${usuario.imagenPerfil}` 
        : null;

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="glass-card card border-0 shadow-lg text-white">
                        <div className="card-header bg-transparent border-0 text-center pt-5">
                            {/* Avatar render container */}
                            <div className="position-relative d-inline-block mb-3">
                                <div className="rounded-circle overflow-hidden bg-primary d-flex align-items-center justify-content-center shadow-lg border border-3 border-light" style={{ width: '120px', height: '120px' }}>
                                    {urlAvatar ? (
                                        <img 
                                            src={urlAvatar} 
                                            alt="Foto de Perfil" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        <span className="fs-1">👤</span>
                                    )}
                                </div>
                                {/* Botón flotante para editar foto */}
                                <label 
                                    className="position-absolute bottom-0 end-0 bg-light text-dark rounded-circle d-flex align-items-center justify-content-center shadow" 
                                    style={{ width: '36px', height: '36px', cursor: 'pointer', border: '2px solid #fff' }}
                                    title="Cambiar Foto"
                                >
                                    📷
                                    <input 
                                        type="file" 
                                        className="d-none" 
                                        accept="image/png, image/jpeg" 
                                        onChange={handleCambiarImagen}
                                        disabled={subiendo}
                                    />
                                </label>
                            </div>
                            
                            <h3 className="fw-bold">{usuario?.usuario || 'Cargando...'}</h3>
                            {subiendo && <div className="text-info small mt-1">Actualizando foto de perfil...</div>}
                        </div>
                        <div className="card-body px-5 pb-5">
                            {cargando ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger py-2" role="alert">
                                    {error}
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4">
                                        <label className="text-muted small uppercase fw-bold mb-1">Nombre Completo</label>
                                        <div className="fs-5 border-bottom border-secondary pb-2">{usuario?.usuario}</div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-muted small uppercase fw-bold mb-1">Correo Electrónico</label>
                                        <div className="fs-5 border-bottom border-secondary pb-2">{usuario?.correo}</div>
                                    </div>
                                    <div className="text-center mt-5">
                                        <Link to="/dashboard" className="btn btn-primary px-4 py-2 me-2">Ir al Tablero</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
