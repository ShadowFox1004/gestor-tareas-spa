import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Importamos las páginas
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Dashboard } from './pages/Dashboard';
import { Tablero } from './pages/Tablero';
import { Perfil } from './pages/Perfil';
import { Pagina404 } from './pages/Pagina404';

// Importamos Bootstrap para que los estilos globales funcionen
import 'bootstrap/dist/css/bootstrap.min.css';

import { ThemeToggle } from './components/ThemeToggle';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    {/* Rutas Protegidas */}
                    <Route 
                        path="/dashboard" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/tablero/:id" 
                        element={
                            <ProtectedRoute>
                                <Tablero />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/perfil" 
                        element={
                            <ProtectedRoute>
                                <Perfil />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Redirección por defecto */}
                    <Route path="*" element={<Pagina404 />} />
                </Routes>
                <ThemeToggle />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;