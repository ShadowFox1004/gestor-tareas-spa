import { Link } from 'react-router-dom';

export const Pagina404 = () => {
    return (
        <div className="container mt-5 text-center text-white">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="glass-card card border-0 shadow-lg p-5">
                        <div className="card-body">
                            <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
                            <h3 className="fw-bold mb-4">Página No Encontrada</h3>
                            <p className="text-muted mb-5">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
                            <Link to="/dashboard" className="btn btn-primary px-5 py-3 fs-5">Volver al Inicio</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
