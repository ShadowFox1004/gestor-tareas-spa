import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        // Si no está autenticado, lo redirigimos al Login
        return <Navigate to="/login" replace />;
    }

    // Si tiene acceso, mostramos el componente hijo (ej. el Dashboard)
    return children;
};

export default ProtectedRoute;
