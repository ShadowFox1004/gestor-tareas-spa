import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export const Tablero = () => {
    const { id } = useParams();
    const [tareas, setTareas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Estados para el Modal de Crear Tarea
    const [mostrarModalTarea, setMostrarModalTarea] = useState(false);
    const [guardandoTarea, setGuardandoTarea] = useState(false);
    const [nuevaTarea, setNuevaTarea] = useState({ título: '', descripción: '', prioridad: 0, asignadoAId: '' });
    const [errorTarea, setErrorTarea] = useState(''); // <- NUEVO ESTADO

    // Estados para el Modal de Invitar Miembro
    const [mostrarModalMiembro, setMostrarModalMiembro] = useState(false);
    const [invitando, setInvitando] = useState(false);
    const [nuevoMiembro, setNuevoMiembro] = useState({ email: '', rol: 1 });
    // NUEVOS ESTADOS PARA AUTOCOMPLETADO
    const [sugerencias, setSugerencias] = useState([]);
    const [buscandoSugerencias, setBuscandoSugerencias] = useState(false);
    const [errorMiembro, setErrorMiembro] = useState(''); // <- NUEVO ESTADO

    // NUEVO: Estados para el Modal de Subir Archivo
    const [mostrarModalArchivo, setMostrarModalArchivo] = useState(false);
    const [subiendoArchivo, setSubiendoArchivo] = useState(false);
    const [archivo, setArchivo] = useState(null);
    const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
    const [errorArchivo, setErrorArchivo] = useState(''); // <- NUEVO ESTADO
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [errorComentario, setErrorComentario] = useState(''); // <- NUEVO ESTADO
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewTipo, setPreviewTipo] = useState(null);
    const [mostrarModalPreview, setMostrarModalPreview] = useState(false);
    const [confirmacion, setConfirmacion] = useState({
        visible: false,
        mensaje: '',
        tipo: '',
        id: null
    });

    // Estados para Editar Tarea
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);
    const [tareaAEditar, setTareaAEditar] = useState(null);
    const [formEditar, setFormEditar] = useState({ título: '', descripción: '', prioridad: 0, asignadoAId: '' });
    const [errorEditar, setErrorEditar] = useState('');

    const [proyecto, setProyecto] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [filtroPrioridad, setFiltroPrioridad] = useState('');
    const [filtroAsignado, setFiltroAsignado] = useState('');

    useEffect(() => {
        obtenerTareas();
        obtenerProyectoDetalle();
    }, [id]);

    const obtenerProyectoDetalle = async () => {
        try {
            const response = await api.get(`/proyectos/${id}`);
            setProyecto(response.data);
            setMiembros(response.data.miembros || []);
        } catch (err) {
            console.error("Error al obtener detalle del proyecto:", err);
        }
    };

    const obtenerTareas = async () => {
        try {
            const response = await api.get(`/proyectos/${id}/tareas?pageSize=100`);
            setTareas(response.data.data);
        } catch (err) {
            setError('Error al cargar las tareas del proyecto.');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const moverTarea = async (tareaId, nuevoEstado) => {
        try {
            await api.patch(`/tareas/${tareaId}/estado`, { estado: nuevoEstado });
            obtenerTareas();
        } catch (err) {
            alert('Error al mover la tarea. Revisa tus permisos.');
        }
    };

    const handleCrearTarea = async (e) => {
        e.preventDefault();
        setGuardandoTarea(true);
        setErrorTarea(''); // Limpiamos errores previos al intentar de nuevo
        try {
            const payload = { 
                ...nuevaTarea, 
                prioridad: parseInt(nuevaTarea.prioridad),
                asignadoAId: nuevaTarea.asignadoAId === '' ? null : parseInt(nuevaTarea.asignadoAId)
            };
            await api.post(`/proyectos/${id}/tareas`, payload);

            await obtenerTareas();
            setMostrarModalTarea(false);
            setNuevaTarea({ título: '', descripción: '', prioridad: 0, asignadoAId: '' });
        } catch (err) {
            // Extraemos el mensaje de la API (ej. "No tienes permisos para crear tareas")
            if (err.response && err.response.data && err.response.data.mensaje) {
                setErrorTarea(err.response.data.mensaje);
            } else {
                setErrorTarea('Error al crear la tarea. Verifica tu conexión o permisos.');
            }
        } finally {
            setGuardandoTarea(false);
        }
    };

    const handleInvitarMiembro = async (e) => {
        e.preventDefault();
        setInvitando(true);
        setErrorMiembro(''); // Limpiamos errores previos al intentar de nuevo
        try {
            const payload = { email: nuevoMiembro.email, rol: parseInt(nuevoMiembro.rol) };
            const response = await api.post(`/proyectos/${id}/miembros`, payload);

            // Si tiene éxito, simplemente cerramos y limpiamos todo
            alert(response.data.mensaje);
            setMostrarModalMiembro(false);
            setNuevoMiembro({ email: '', rol: 1 });
            setSugerencias([]); // Limpiamos sugerencias
        } catch (err) {
            // Atrapamos el error 403 (Forbidden) o 404 y lo mandamos al estado
            if (err.response && err.response.data && err.response.data.mensaje) {
                setErrorMiembro(err.response.data.mensaje);
            } else {
                setErrorMiembro('Ocurrió un error al intentar invitar al usuario.');
            }
        } finally {
            setInvitando(false);
        }
    };

    // Función para buscar coincidencias de email en tiempo real
    const handleEscribirEmail = async (texto) => {
        setNuevoMiembro({ ...nuevoMiembro, email: texto }); // Actualizamos el input normal

        if (texto.length < 2) {
            setSugerencias([]); // Si borra o tiene menos de 2 letras, ocultamos sugerencias
            return;
        }

        try {
            setBuscandoSugerencias(true);
            const response = await api.get(`/usuarios/buscar?email=${texto}`);
            setSugerencias(response.data);
        } catch (error) {
            console.error("Error buscando sugerencias", error);
        } finally {
            setBuscandoSugerencias(false);
        }
    };

    // NUEVO: Función para enviar el archivo como FormData
    const handleSubirArchivo = async (e) => {
        e.preventDefault();
        if (!archivo || !tareaSeleccionada) return;

        setSubiendoArchivo(true);
        setErrorArchivo('');

        const formData = new FormData();
        formData.append('archivo', archivo);

        try {
            await api.post(`/tareas/${tareaSeleccionada.id}/adjuntos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Recargamos el listado completo de la API
            const response = await api.get(`/proyectos/${id}/tareas?pageSize=100`);
            const tareasActualizadas = response.data.data;
            setTareas(tareasActualizadas);

            // Actualizamos la tarea que tenemos seleccionada en el modal en tiempo real
            const tareaActualizada = tareasActualizadas.find(t => t.id === tareaSeleccionada.id);
            setTareaSeleccionada(tareaActualizada);

            setArchivo(null); // Limpiamos el input
        } catch (err) {
            if (err.response && err.response.data && err.response.data.mensaje) {
                setErrorArchivo(err.response.data.mensaje);
            } else {
                setErrorArchivo('Error al subir el archivo. Verifica el tamaño (Max 5MB) y formato.');
            }
        } finally {
            setSubiendoArchivo(false);
        }
    };

    const handleAgregarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim() || !tareaSeleccionada) return;

        setEnviandoComentario(true);
        setErrorComentario(''); // Limpiamos errores previos

        try {
            // Mandamos un objeto JSON estándar
            await api.post(`/tareas/${tareaSeleccionada.id}/comentarios`, {
                contenido: nuevoComentario
            });

            await obtenerTareas();

            const response = await api.get(`/proyectos/${id}/tareas?pageSize=100`);
            const tareaActualizada = response.data.data.find(t => t.id === tareaSeleccionada.id);
            setTareaSeleccionada(tareaActualizada);

            setNuevoComentario('');
        } catch (error) {
            // Atrapamos el error sin alert()
            if (error.response && error.response.data && error.response.data.mensaje) {
                setErrorComentario(error.response.data.mensaje);
            } else {
                setErrorComentario("Error al enviar el comentario.");
            }
        } finally {
            setEnviandoComentario(false);
        }
    };

    const handleEliminarComentario = (comentarioId) => {
        setConfirmacion({
            visible: true,
            mensaje: '¿Seguro que deseas eliminar este comentario?',
            tipo: 'eliminar_comentario',
            id: comentarioId
        });
    };

    const handleEliminarTarea = (tareaId) => {
        setConfirmacion({
            visible: true,
            mensaje: '¿ESTÁS SEGURO? Esta acción borrará la tarea, sus archivos y comentarios para siempre.',
            tipo: 'eliminar_tarea',
            id: tareaId
        });
    };

    const handleActualizarRol = async (miembroId, nuevoRol) => {
        try {
            const rolEnum = nuevoRol === "Editor" ? 1 : 2;
            await api.put(`/proyectos/${id}/miembros/${miembroId}`, { rol: rolEnum });
            obtenerProyectoDetalle();
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al actualizar el rol.");
        }
    };

    const handleRemoverMiembro = (miembroId, nombre) => {
        setConfirmacion({
            visible: true,
            mensaje: `¿ESTÁS SEGURO? Esta acción removerá a ${nombre} del proyecto para siempre.`,
            tipo: 'remover_miembro',
            id: miembroId
        });
    };

    const asignarTarea = async (tarea, usuarioId) => {
        try {
            const prioridadEnum = tarea.prioridad === 'Alta' ? 2 : tarea.prioridad === 'Media' ? 1 : 0;
            const payload = {
                título: tarea.título,
                descripción: tarea.descripción,
                prioridad: prioridadEnum,
                asignadoAId: usuarioId === '' ? null : parseInt(usuarioId),
                fechaVencimiento: tarea.fechaVencimiento
            };
            await api.put(`/tareas/${tarea.id}`, payload);
            await obtenerTareas();
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al asignar la tarea. Revisa tus permisos.");
        }
    };

    const handleGuardarEdicionTarea = async (e) => {
        e.preventDefault();
        setGuardandoEdicion(true);
        setErrorEditar('');

        try {
            const payload = {
                título: formEditar.título,
                descripción: formEditar.descripción,
                prioridad: parseInt(formEditar.prioridad),
                asignadoAId: formEditar.asignadoAId === '' ? null : parseInt(formEditar.asignadoAId)
            };
            await api.put(`/tareas/${tareaAEditar.id}`, payload);
            await obtenerTareas();
            setMostrarModalEditar(false);
        } catch (err) {
            setErrorEditar(err.response?.data?.mensaje || 'Error al guardar los cambios.');
        } finally {
            setGuardandoEdicion(false);
        }
    };

    const handleEliminarAdjunto = (adjuntoId) => {
        setConfirmacion({
            visible: true,
            mensaje: '¿Estás seguro de que deseas eliminar este archivo adjunto?',
            tipo: 'eliminar_adjunto',
            id: adjuntoId
        });
    };

    const ejecutarConfirmacion = async () => {
        const { tipo, id: actionId } = confirmacion;
        setConfirmacion({ ...confirmacion, visible: false });

        if (tipo === 'eliminar_comentario') {
            try {
                await api.delete(`/comentarios/${actionId}`);
                await obtenerTareas();

                // Refrescamos el modal
                const response = await api.get(`/proyectos/${id}/tareas?pageSize=100`);
                setTareaSeleccionada(response.data.data.find(t => t.id === tareaSeleccionada.id));
            } catch (error) {
                alert("No tienes permiso para borrar este comentario.");
            }
        } else if (tipo === 'eliminar_tarea') {
            try {
                await api.delete(`/tareas/${actionId}`);
                setMostrarModalArchivo(false); // Cerramos el modal si estaba abierto
                obtenerTareas(); // Recargamos el tablero
            } catch (error) {
                alert("Error al eliminar la tarea. Revisa tus permisos.");
            }
        } else if (tipo === 'remover_miembro') {
            try {
                await api.delete(`/proyectos/${id}/miembros/${actionId}`);
                obtenerProyectoDetalle();
            } catch (err) {
                alert(err.response?.data?.mensaje || "Error al remover miembro.");
            }
        } else if (tipo === 'eliminar_adjunto') {
            try {
                await api.delete(`/adjuntos/${actionId}`);
                await obtenerTareas();
                // Refrescamos el modal
                const response = await api.get(`/proyectos/${id}/tareas?pageSize=100`);
                setTareaSeleccionada(response.data.data.find(t => t.id === tareaSeleccionada.id));
            } catch (error) {
                alert("Error al eliminar el archivo. Revisa tus permisos.");
            }
        }
    };

    const tareasFiltradas = tareas.filter(t => {
        if (filtroPrioridad !== '' && t.prioridad !== filtroPrioridad) return false;
        if (filtroAsignado !== '') {
            if (filtroAsignado === 'unassigned') {
                if (t.asignadoAId !== null && t.asignadoAId !== undefined) return false;
            } else {
                if (t.asignadoAId !== parseInt(filtroAsignado)) return false;
            }
        }
        return true;
    });

    const tareasToDo = tareasFiltradas.filter(t => t.estado === 'ToDo');
    const tareasInProgress = tareasFiltradas.filter(t => t.estado === 'InProgress');
    const tareasDone = tareasFiltradas.filter(t => t.estado === 'Done');

    const TarjetaTarea = ({ tarea }) => {
        const cantidadAdjuntos = tarea.adjuntos ? tarea.adjuntos.length : 0;

        return (
            <div className="card mb-3 shadow-sm border-start border-4 border-primary" style={{ minHeight: '220px' }}>
                <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h6 className="card-title fw-bold">{tarea.título}</h6>
                        <p className="card-text text-muted small mb-2">{tarea.descripción}</p>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                        <span className={`badge ${tarea.prioridad === 'Alta' ? 'bg-danger' : tarea.prioridad === 'Media' ? 'bg-warning text-dark' : 'bg-info'}`} style={{ fontSize: '0.75rem' }}>
                            {tarea.prioridad}
                        </span>
                        
                        <select 
                            className="form-select form-select-sm py-0 px-1 text-muted" 
                            style={{ fontSize: '0.75rem', width: 'auto', maxWidth: '125px', height: '22px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            value={tarea.asignadoAId || ''}
                            onChange={(e) => asignarTarea(tarea, e.target.value)}
                        >
                            <option value="">Sin asignar</option>
                            {miembros.map(m => (
                                <option key={m.usuarioId} value={m.usuarioId}>{m.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Botones de movimiento */}
                    <div className="mt-3 d-flex gap-2">
                        {tarea.estado !== 'ToDo' && (
                            <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => moverTarea(tarea.id, tarea.estado === 'Done' ? 1 : 0)}>
                                ← Volver
                            </button>
                        )}
                        {tarea.estado !== 'Done' && (
                            <button className="btn btn-sm btn-outline-success w-100" onClick={() => moverTarea(tarea.id, tarea.estado === 'ToDo' ? 1 : 2)}>
                                Avanzar →
                            </button>
                        )}
                    </div>

                    {/* Botón Unificado para Adjuntos y Comentarios */}
                    <button className="btn btn-sm btn-outline-info w-100 mt-2 d-flex justify-content-between align-items-center" onClick={() => { setTareaSeleccionada(tarea); setMostrarModalArchivo(true); }}>
                        <span>Ver Comentarios y Adjuntos</span>
                        <div className="d-flex gap-2">
                            <span className="badge bg-secondary" title="Comentarios">{tarea.comentarios ? tarea.comentarios.length : 0}</span>
                            <span className="badge bg-info text-dark" title="Adjuntos">{tarea.adjuntos ? tarea.adjuntos.length : 0}</span>
                        </div>
                    </button>

                    {/* Botones de Gestión */}
                    <div className="d-flex gap-2 mt-2">
                        <button className="btn btn-sm btn-outline-warning w-100" onClick={() => {
                            setTareaAEditar(tarea);
                            setFormEditar({
                                título: tarea.título,
                                descripción: tarea.descripción,
                                prioridad: tarea.prioridad === 'Alta' ? 2 : tarea.prioridad === 'Media' ? 1 : 0,
                                asignadoAId: tarea.asignadoAId || ''
                            });
                            setMostrarModalEditar(true);
                        }}>
                            Editar
                        </button>
                        <button className="btn btn-sm btn-outline-danger w-100" onClick={() => handleEliminarTarea(tarea.id)}>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid mt-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4 position-relative w-100 flex-wrap gap-3">
                <h2 className="position-absolute start-50 translate-middle-x m-0">Tablero del Proyecto</h2>
                
                {/* Filtros a la izquierda */}
                <div className="d-flex gap-2 align-items-center">
                    <select 
                        className="form-select form-select-sm" 
                        style={{ width: '155px' }}
                        value={filtroPrioridad}
                        onChange={(e) => setFiltroPrioridad(e.target.value)}
                    >
                        <option value="">Prioridades: Todas</option>
                        <option value="Baja">Prioridad: Baja</option>
                        <option value="Media">Prioridad: Media</option>
                        <option value="Alta">Prioridad: Alta</option>
                    </select>

                    <select 
                        className="form-select form-select-sm" 
                        style={{ width: '185px' }}
                        value={filtroAsignado}
                        onChange={(e) => setFiltroAsignado(e.target.value)}
                    >
                        <option value="">Asignados: Todos</option>
                        <option value="unassigned">Sin asignar</option>
                        {miembros.map(m => (
                            <option key={m.usuarioId} value={m.usuarioId}>{m.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="ms-auto">
                    <button className="btn btn-outline-primary me-2" onClick={() => setMostrarModalMiembro(true)}>
                        Invitar Miembro
                    </button>
                    <button className="btn btn-primary me-2" onClick={() => setMostrarModalTarea(true)}>
                        + Nueva Tarea
                    </button>
                    <Link to="/dashboard" className="btn btn-outline-secondary">Volver</Link>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {cargando ? (
                <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>
            ) : (
                <div className="row">
                    <div className="col-md-4">
                        <div className="bg-light p-3 rounded-3 h-100">
                            <h5 className="text-center border-bottom pb-2 mb-3">Por Hacer</h5>
                            {tareasToDo.map(tarea => <TarjetaTarea key={tarea.id} tarea={tarea} />)}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-light p-3 rounded-3 h-100">
                            <h5 className="text-center border-bottom pb-2 mb-3">En Progreso</h5>
                            {tareasInProgress.map(tarea => <TarjetaTarea key={tarea.id} tarea={tarea} />)}
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-light p-3 rounded-3 h-100">
                            <h5 className="text-center border-bottom pb-2 mb-3">Completado</h5>
                            {tareasDone.map(tarea => <TarjetaTarea key={tarea.id} tarea={tarea} />)}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Nueva Tarea (Se mantiene igual) */}
            {mostrarModalTarea && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Crear Nueva Tarea</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setMostrarModalTarea(false);
                                    setErrorTarea(''); // Limpiamos al cerrar
                                }}></button>
                            </div>
                            <form onSubmit={handleCrearTarea}>
                                <div className="modal-body">
                                    {/* NUEVO: Mensaje de error integrado en el modal */}
                                    {errorTarea && (
                                        <div className="alert alert-danger py-2" role="alert">
                                            {errorTarea}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label">Título</label>
                                        <input type="text" className="form-control" required maxLength="200" value={nuevaTarea.título} onChange={(e) => setNuevaTarea({ ...nuevaTarea, título: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea className="form-control" rows="3" value={nuevaTarea.descripción} onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripción: e.target.value })}></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Asignar a</label>
                                        <select className="form-select" value={nuevaTarea.asignadoAId} onChange={(e) => setNuevaTarea({ ...nuevaTarea, asignadoAId: e.target.value })}>
                                            <option value="">Sin asignar</option>
                                            {miembros.map(m => (
                                                <option key={m.usuarioId} value={m.usuarioId}>{m.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Prioridad</label>
                                        <select className="form-select" value={nuevaTarea.prioridad} onChange={(e) => setNuevaTarea({ ...nuevaTarea, prioridad: e.target.value })}>
                                            <option value={0}>Baja</option>
                                            <option value={1}>Media</option>
                                            <option value={2}>Alta</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => {
                                        setMostrarModalTarea(false);
                                        setErrorTarea(''); // Limpiamos al cerrar
                                    }}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={guardandoTarea}>
                                        {guardandoTarea ? 'Guardando...' : 'Crear Tarea'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Editar Tarea */}
            {mostrarModalEditar && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Editar Tarea</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setMostrarModalEditar(false);
                                    setErrorEditar('');
                                }}></button>
                            </div>
                            <form onSubmit={handleGuardarEdicionTarea}>
                                <div className="modal-body">
                                    {errorEditar && (
                                        <div className="alert alert-danger py-2" role="alert">
                                            {errorEditar}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label">Título</label>
                                        <input type="text" className="form-control" required maxLength="200" value={formEditar.título} onChange={(e) => setFormEditar({ ...formEditar, título: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea className="form-control" rows="3" value={formEditar.descripción} onChange={(e) => setFormEditar({ ...formEditar, descripción: e.target.value })}></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Asignar a</label>
                                        <select className="form-select" value={formEditar.asignadoAId} onChange={(e) => setFormEditar({ ...formEditar, asignadoAId: e.target.value })}>
                                            <option value="">Sin asignar</option>
                                            {miembros.map(m => (
                                                <option key={m.usuarioId} value={m.usuarioId}>{m.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Prioridad</label>
                                        <select className="form-select" value={formEditar.prioridad} onChange={(e) => setFormEditar({ ...formEditar, prioridad: e.target.value })}>
                                            <option value={0}>Baja</option>
                                            <option value={1}>Media</option>
                                            <option value={2}>Alta</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => {
                                        setMostrarModalEditar(false);
                                        setErrorEditar('');
                                    }}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={guardandoEdicion}>
                                        {guardandoEdicion ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Invitar/Gestionar Miembros */}
            {mostrarModalMiembro && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Gestión de Miembros</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setMostrarModalMiembro(false);
                                    setErrorMiembro(''); // Limpiamos el error al cerrar
                                    setSugerencias([]);
                                }}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    {/* COLUMNA IZQUIERDA: Formulario de Invitación */}
                                    <div className="col-md-5 border-end">
                                        <h6 className="fw-bold mb-3 text-secondary">Invitar nuevo miembro</h6>
                                        {errorMiembro && (
                                            <div className="alert alert-danger py-2" role="alert">
                                                {errorMiembro}
                                            </div>
                                        )}
                                        <form onSubmit={handleInvitarMiembro}>
                                            <div className="mb-3 position-relative">
                                                <label className="form-label">Correo del Usuario</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    required
                                                    placeholder="ejemplo@correo.com"
                                                    autoComplete="off"
                                                    value={nuevoMiembro.email}
                                                    onChange={(e) => handleEscribirEmail(e.target.value)}
                                                />
                                                {sugerencias.length > 0 && (
                                                    <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1050, maxHeight: '150px', overflowY: 'auto' }}>
                                                        {sugerencias.map(user => (
                                                            <li
                                                                key={user.id}
                                                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    setNuevoMiembro({ ...nuevoMiembro, email: user.email });
                                                                    setSugerencias([]);
                                                                }}
                                                            >
                                                                <span>{user.email}</span>
                                                                <small className="text-muted">{user.nombre}</small>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Rol en el Proyecto</label>
                                                <select className="form-select" value={nuevoMiembro.rol} onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, rol: e.target.value })}>
                                                    <option value={1}>Editor</option>
                                                    <option value={2}>Viewer</option>
                                                </select>
                                            </div>
                                            <button type="submit" className="btn btn-primary w-100" disabled={invitando}>
                                                {invitando ? 'Enviando...' : 'Invitar Miembro'}
                                            </button>
                                        </form>
                                    </div>

                                    {/* COLUMNA DERECHA: Listado y Gestión de Miembros */}
                                    <div className="col-md-7">
                                        <h6 className="fw-bold mb-3 text-secondary ps-2">Miembros del Proyecto</h6>
                                        <div className="overflow-auto pe-2" style={{ maxHeight: '300px' }}>
                                            {miembros.length > 0 ? (
                                                <div className="list-group">
                                                    {miembros.map(m => {
                                                        const esOwnerDelProyecto = proyecto?.rolUsuarioActual === 'Owner';
                                                        const esMiembroPropietario = m.rol === 'Owner';

                                                        return (
                                                            <div key={m.usuarioId} className="list-group-item d-flex justify-content-between align-items-center border-0 px-2 py-2 mb-2 rounded bg-light" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <div className="text-truncate" style={{ maxWidth: '60%' }}>
                                                                    <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{m.nombre}</div>
                                                                    <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>{m.email}</div>
                                                                </div>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    {esOwnerDelProyecto && !esMiembroPropietario ? (
                                                                        <>
                                                                            <select 
                                                                                className="form-select form-select-sm" 
                                                                                style={{ width: '105px' }} 
                                                                                value={m.rol} 
                                                                                onChange={(e) => handleActualizarRol(m.usuarioId, e.target.value)}
                                                                            >
                                                                                <option value="Editor">Editor</option>
                                                                                <option value="Viewer">Viewer</option>
                                                                            </select>
                                                                            <button 
                                                                                className="btn btn-sm btn-outline-danger" 
                                                                                title="Remover miembro"
                                                                                onClick={() => handleRemoverMiembro(m.usuarioId, m.nombre)}
                                                                            >
                                                                                🗑️
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <span className={`badge ${esMiembroPropietario ? 'bg-success' : m.rol === 'Editor' ? 'bg-info text-dark' : 'bg-secondary'}`} style={{ fontSize: '0.75rem' }}>
                                                                            {m.rol}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-muted text-center small mt-4">No hay miembros registrados.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => {
                                    setMostrarModalMiembro(false);
                                    setErrorMiembro(''); // Limpiamos el error al cerrar
                                    setSugerencias([]);
                                }}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Unificado de Detalles (Adjuntos y Comentarios) */}
            {mostrarModalArchivo && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable" style={{ maxWidth: '90%', width: '1200px' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{tareaSeleccionada?.título}</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setMostrarModalArchivo(false);
                                    setArchivo(null);
                                    setErrorArchivo('');
                                    setNuevoComentario('');
                                    setErrorComentario('');
                                    setPreviewUrl(null);
                                    setPreviewTipo(null);
                                }}></button>
                            </div>

                            <div className="modal-body bg-light">
                                {errorArchivo && <div className="alert alert-danger py-2">{errorArchivo}</div>}
                                <div className="row h-100">
                                    {/* COLUMNA IZQUIERDA: Archivos Adjuntos */}
                                    <div className="col-md-6 border-end mb-3 mb-md-0">
                                        <h6 className="fw-bold mb-3 text-secondary">Archivos Adjuntos</h6>

                                        <form onSubmit={handleSubirArchivo} className="mb-3 d-flex gap-2">
                                            <input
                                                type="file"
                                                className="form-control form-control-sm"
                                                required
                                                accept=".pdf, image/jpeg, image/png"
                                                onChange={(e) => setArchivo(e.target.files[0])}
                                            />
                                            <button type="submit" className="btn btn-primary" disabled={subiendoArchivo}>
                                                {subiendoArchivo ? '...' : 'Subir'}
                                            </button>
                                        </form>

                                        <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '1000px', minHeight: '400px' }}>
                                            {tareaSeleccionada?.adjuntos && tareaSeleccionada.adjuntos.length > 0 ? (
                                                tareaSeleccionada.adjuntos.map(adjunto => {
                                                    const urlArchivo = `https://localhost:7062${adjunto.rutaRelativa || adjunto.rutaArchivo}`;
                                                    const nombreBajo = adjunto.nombreArchivo?.toLowerCase() || '';
                                                    const esImagen = nombreBajo.endsWith('.png') || nombreBajo.endsWith('.jpg') || nombreBajo.endsWith('.jpeg') || nombreBajo.endsWith('.gif');
                                                    const esPdf = nombreBajo.endsWith('.pdf');

                                                    return (
                                                        <div key={adjunto.id} className="card shadow-sm border-0" style={{ cursor: 'pointer' }} onClick={() => {
                                                            setPreviewUrl(urlArchivo);
                                                            setPreviewTipo(esPdf ? 'pdf' : esImagen ? 'image' : 'other');
                                                            setMostrarModalPreview(true);
                                                        }}>
                                                            <div className="card-body p-2 d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center text-truncate small" title={adjunto.nombreArchivo || 'Documento'}>
                                                                    {esImagen ? (
                                                                        <img
                                                                            src={urlArchivo}
                                                                            alt={adjunto.nombreArchivo}
                                                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }}
                                                                        />
                                                                    ) : esPdf ? (
                                                                        <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>📕</span>
                                                                    ) : (
                                                                        <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>📄</span>
                                                                    )}
                                                                    <span className="text-truncate">{adjunto.nombreArchivo || 'Documento adjunto'}</span>
                                                                </div>
                                                                <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                                    <button type="button" className="btn btn-sm btn-outline-primary p-1 px-2" style={{ fontSize: '0.75rem' }} onClick={() => {
                                                                        setPreviewUrl(urlArchivo);
                                                                        setPreviewTipo(esPdf ? 'pdf' : esImagen ? 'image' : 'other');
                                                                        setMostrarModalPreview(true);
                                                                    }}>
                                                                        Ver
                                                                    </button>
                                                                    <a href={urlArchivo} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info p-1 px-2" style={{ fontSize: '0.75rem' }}>
                                                                        Abrir
                                                                    </a>
                                                                    <button type="button" className="btn btn-sm btn-outline-danger p-1 px-2" style={{ fontSize: '0.75rem' }} onClick={() => handleEliminarAdjunto(adjunto.id)}>
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center text-muted small p-3 border rounded border-dashed">
                                                    No hay archivos adjuntos.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* COLUMNA DERECHA: Comentarios */}
                                    <div className="col-md-6 d-flex flex-column">
                                        <h6 className="fw-bold mb-3 text-secondary">Comentarios</h6>

                                        {errorComentario && (
                                            <div className="alert alert-danger py-1 px-2 small mb-2">
                                                {errorComentario}
                                            </div>
                                        )}

                                        <div className="flex-grow-1 overflow-auto mb-3 pe-2" style={{ maxHeight: '500px', minHeight: '300px' }}>
                                            {tareaSeleccionada?.comentarios && tareaSeleccionada.comentarios.length > 0 ? (
                                                tareaSeleccionada.comentarios.map(comentario => (
                                                    <div key={comentario.id} className="comment-card p-2 rounded shadow-sm mb-2">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <small className="fw-bold text-primary">
                                                                {comentario.nombreUsuario || `Usuario ${comentario.usuarioId}`} ( {comentario.emailUsuario || 'Sin correo'} )
                                                            </small>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                                                                    {new Date(comentario.fechaCreacion).toLocaleDateString()}
                                                                </small>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger border-0 p-0"
                                                                    onClick={() => handleEliminarComentario(comentario.id)}
                                                                    title="Eliminar comentario"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="mb-0 small comment-content">{comentario.contenido}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-muted small p-3 border rounded border-dashed h-100 d-flex align-items-center justify-content-center">
                                                    Sé el primero en comentar.
                                                </div>
                                            )}
                                        </div>

                                        <form onSubmit={handleAgregarComentario} className="mt-auto">
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Escribe un comentario..."
                                                    value={nuevoComentario}
                                                    onChange={(e) => setNuevoComentario(e.target.value)}
                                                    required
                                                    maxLength="500"
                                                />
                                                <button className="btn btn-primary btn-sm" type="submit" disabled={enviandoComentario}>
                                                    {enviandoComentario ? '...' : 'Enviar'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer py-1">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                                    setMostrarModalArchivo(false);
                                    setArchivo(null);
                                    setErrorArchivo('');
                                    setNuevoComentario('');
                                    setErrorComentario('');
                                    setPreviewUrl(null);
                                    setPreviewTipo(null);
                                }}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Vista Previa (Popup Overlay) */}
            {mostrarModalPreview && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: '80%', height: '90vh' }}>
                        <div className="modal-content h-100">
                            <div className="modal-header">
                                <h5 className="modal-title">Vista Previa del Archivo</h5>
                                <button type="button" className="btn-close" onClick={() => {
                                    setMostrarModalPreview(false);
                                    setPreviewUrl(null);
                                    setPreviewTipo(null);
                                }}></button>
                            </div>
                            <div className="modal-body bg-dark d-flex align-items-center justify-content-center p-0" style={{ height: 'calc(100% - 110px)', overflow: 'hidden' }}>
                                {previewUrl ? (
                                    previewTipo === 'pdf' ? (
                                        <iframe
                                            src={previewUrl}
                                            title="Vista previa PDF"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 'none' }}
                                        />
                                    ) : previewTipo === 'image' ? (
                                        <img
                                            src={previewUrl}
                                            alt="Vista previa"
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <div className="text-white text-center p-4">
                                            Formato no compatible para vista previa directa.<br />
                                            <a href={previewUrl} target="_blank" rel="noreferrer" className="btn btn-outline-info mt-2">
                                                Descargar/Abrir archivo
                                            </a>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-white">Cargando...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación Genérico (Popup) */}
            {confirmacion.visible && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1200 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Confirmar Acción</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setConfirmacion({ ...confirmacion, visible: false })}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <p className="mb-0 fs-5">{confirmacion.mensaje}</p>
                            </div>
                            <div className="modal-footer justify-content-center border-0 pb-3">
                                <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setConfirmacion({ ...confirmacion, visible: false })}>
                                    Cancelar
                                </button>
                                <button type="button" className="btn btn-danger px-4" onClick={ejecutarConfirmacion}>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
