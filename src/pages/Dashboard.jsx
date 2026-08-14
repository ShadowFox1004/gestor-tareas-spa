import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export const Dashboard = () => {
    const { logout } = useContext(AuthContext);

    // Estados para la lista de proyectos
    const [proyectos, setProyectos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Estados para el Modal de Crear Proyecto
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: '', descripción: '', color: '#0d6efd' });
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        obtenerProyectos();
    }, []);

    const obtenerProyectos = async () => {
        try {
            const response = await api.get('/proyectos');
            setProyectos(response.data);
        } catch (err) {
            setError('Hubo un problema al cargar los proyectos.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const handleCrearProyecto = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            // 1. Enviamos los datos al backend
            const response = await api.post('/proyectos', nuevoProyecto);

            // 2. Si es exitoso, volvemos a consultar la lista para actualizar la vista
            await obtenerProyectos();

            // 3. Cerramos el modal y limpiamos el formulario
            setMostrarModal(false);
            setNuevoProyecto({ nombre: '', descripción: '', color: '#0d6efd' });
        } catch (err) {
            alert('Error al crear el proyecto. Revisa la consola.');
            console.error(err);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4 position-relative w-100">
                <h2 className="position-absolute start-50 translate-middle-x m-0">Mis Proyectos</h2>
                <div className="ms-auto d-flex gap-2">
                    <Link to="/perfil" className="btn btn-outline-primary">Ver Perfil</Link>
                    <button className="btn btn-outline-danger" onClick={logout}>Cerrar Sesión</button>
                </div>
            </div>


            {error && <div className="alert alert-danger">{error}</div>}

            {cargando ? (
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {/* Tarjeta Botón para crear nuevo proyecto */}
                    <div className="col-md-4 mb-4">
                        <div
                            className="card h-100 shadow-sm border-primary text-center d-flex justify-content-center align-items-center"
                            style={{ minHeight: '200px', cursor: 'pointer', borderStyle: 'dashed' }}
                            onClick={() => setMostrarModal(true)} // Abrimos el modal al hacer clic
                        >
                            <div>
                                <h1 className="text-primary">+</h1>
                                <p className="text-primary mb-0">Crear Nuevo Proyecto</p>
                            </div>
                        </div>
                    </div>

                    {/* Mapeo de la lista de proyectos */}
                    {proyectos.map((proyecto) => (
                        <div className="col-md-4 mb-4" key={proyecto.id}>
                            <div className="card h-100 shadow-sm">
                                <div
                                    className="card-header text-white"
                                    style={{ backgroundColor: proyecto.color || '#0d6efd' }}
                                >
                                    <h5 className="card-title mb-0">{proyecto.nombre}</h5>
                                </div>
                                <div className="card-body">
                                    <p className="card-text text-muted">
                                        {proyecto.descripción || 'Sin descripción'}
                                    </p>
                                    <span className={`badge ${proyecto.rolUsuarioActual === 'Owner' ? 'bg-success' : 'bg-secondary'}`}>
                                        Rol: {proyecto.rolUsuarioActual}
                                    </span>
                                </div>
                                <div className="card-footer bg-white border-top-0">
                                    <Link to={`/tablero/${proyecto.id}`} className="btn btn-primary w-100">
                                        Ver Tablero
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Bootstrap manual (renderizado condicional) */}
            {mostrarModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Crear Nuevo Proyecto</h5>
                                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
                            </div>
                            <form onSubmit={handleCrearProyecto}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Nombre del Proyecto</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            maxLength="150"
                                            value={nuevoProyecto.nombre}
                                            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            maxLength="500"
                                            value={nuevoProyecto.descripción}
                                            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, descripción: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Color de Identificación</label>
                                        <input
                                            type="color"
                                            className="form-control form-control-color w-100"
                                            value={nuevoProyecto.color}
                                            onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, color: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={guardando}>
                                        {guardando ? 'Guardando...' : 'Crear Proyecto'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
