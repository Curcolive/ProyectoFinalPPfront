import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap'; // Importa Spinner
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import MisPagosPage from './pages/MisPagosPage';
import AdminGestionPage from './pages/AdminGestionPage'; // Importa la página de admin
import ConfiguracionPage from './pages/ConfiguracionPage';
import './App.css';
// Importa la librería para decodificar JWT (instálala: npm install jwt-decode)
import { jwtDecode } from 'jwt-decode'; // Cambiado de jwt-decode

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Estado para guardar el rol del usuario
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Función para verificar el token y extraer el rol
    const checkAuth = () => {
      const tokenDataString = localStorage.getItem('authToken');
      if (tokenDataString) {
        try {
          const tokenData = JSON.parse(tokenDataString);
          if (tokenData.access) {
            // Decodifica el token de acceso para obtener la información del usuario
            const decodedToken = jwtDecode(tokenData.access);
            // Simple JWT no incluye roles por defecto. Usaremos 'is_staff' si existe
            // O podemos añadir claims personalizados al token en Django más adelante
            const isStaff = decodedToken.is_staff || false; // Busca el flag 'is_staff'

            setUserRole(isStaff ? 'admin' : 'student'); // Asigna el rol
            setIsAuthenticated(true);
            // TODO: Implementar lógica de refresco de token si el 'access' token está cerca de expirar
          } else {
            // Si no hay token de acceso, limpia
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
            setUserRole(null);
          }
        } catch (e) {
          console.error("Error decoding token:", e);
          localStorage.removeItem('authToken'); // Limpia token inválido
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setIsLoadingAuth(false); // Terminó la verificación inicial
    };
    checkAuth();
  }, []); // Se ejecuta solo una vez al inicio

  // Función llamada por LoginPage después de un login exitoso
  const handleLoginSuccess = () => {
    // Re-ejecuta checkAuth para leer el nuevo token y rol
    const tokenDataString = localStorage.getItem('authToken');
    if (tokenDataString) {
      try {
        const tokenData = JSON.parse(tokenDataString);
        if (tokenData.access) {
          const decodedToken = jwtDecode(tokenData.access);
          const isStaff = decodedToken.is_staff || false;
          setUserRole(isStaff ? 'admin' : 'student');
          setIsAuthenticated(true);
          // Redirige manualmente después del login exitoso
          window.location.href = isStaff ? '/admin/cobranzas' : '/cuotas'; // Redirige según rol
        }
      } catch (e) {
        // Si algo falla al leer el token recién guardado (muy raro)
        handleLogout(); // Fuerza logout
      }
    }
  };


  // Función para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Borra solo el token
    // Ya no borramos 'userRole' porque no lo guardamos ahí
    setIsAuthenticated(false);
    setUserRole(null); // Limpia el rol en el estado
    // Forzamos recarga a /login
    window.location.href = '/login';
  };


  // Muestra spinner mientras se verifica el token al inicio
  if (isLoadingAuth) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Verificando sesión...</span>
        </Spinner>
        <span className="ms-3">Verificando sesión...</span>
      </div>
    );
  }

  // Define isAdmin basado en el estado userRole
  const isAdmin = userRole === 'admin';

  return (
    <Router>
      {/* Pasa isAuthenticated y handleLogout al layout */}
      <MainLayout isAuthenticated={isAuthenticated} handleLogout={handleLogout}>
        <Routes>
          {/* Ruta Login */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                // Si ya está logueado, redirige al panel correspondiente
                <Navigate to={isAdmin ? "/admin/cobranzas" : "/cuotas"} replace />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* Ruta Protegida Cuotas (Alumno) */}
          <Route
            path="/cuotas"
            element={
              isAuthenticated && !isAdmin ? ( // Solo si está logueado Y NO es admin
                <MisPagosPage />
              ) : (
                <Navigate to={isAdmin ? "/admin/cobranzas" : "/login"} replace /> // Si es admin va a cobranzas, si no a login
              )
            }
          />

          {/* Ruta Protegida Admin Cobranzas */}
          <Route
            path="/admin/cobranzas"
            element={
              isAuthenticated && isAdmin ? ( // Solo si está logueado Y ES admin
                <AdminGestionPage />
              ) : (
                <Navigate to={isAuthenticated ? "/cuotas" : "/login"} replace /> // Si es alumno va a cuotas, si no a login
              )
            }
          />

          {/* --- NUEVA RUTA PROTEGIDA PARA CONFIGURACIÓN --- */}
          <Route
            path="/admin/config"
            element={
              isAuthenticated && isAdmin ? (
                <ConfiguracionPage />
              ) : (
                <Navigate to={isAuthenticated ? "/cuotas" : "/login"} replace />
              )
            }
          />
          {/* --- FIN NUEVA RUTA ADMIN --- */}

          {/* Ruta Raíz */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                // Raíz redirige al panel correspondiente
                <Navigate to={isAdmin ? "/admin/cobranzas" : "/cuotas"} replace />
              ) : (
                <Navigate to="/login" replace /> // Si no está logueado, a login
              )
            }
          />

          {/* Placeholder para otras rutas (protegerlas según rol) */}
          <Route path="/inicio" element={isAuthenticated && !isAdmin ? <div>Inicio Alumno</div> : <Navigate to={isAdmin ? "/admin/cobranzas" : "/login"} replace />} />
          <Route path="/mis-datos" element={isAuthenticated && !isAdmin ? <div>Mis Datos</div> : <Navigate to={isAdmin ? "/admin/cobranzas" : "/login"} replace />} />
          <Route path="/academico" element={isAuthenticated && !isAdmin ? <div>Académico</div> : <Navigate to={isAdmin ? "/admin/cobranzas" : "/login"} replace />} />
          {/* Añadir placeholders protegidos para rutas admin */}
          <Route path="/admin/dashboard" element={isAuthenticated && isAdmin ? <div>Admin Dashboard</div> : <Navigate to={isAuthenticated ? "/cuotas" : "/login"} replace />} />
          <Route path="/admin/alumnos" element={isAuthenticated && isAdmin ? <div>Admin Alumnos</div> : <Navigate to={isAuthenticated ? "/cuotas" : "/login"} replace />} />
          <Route path="/admin/reportes" element={isAuthenticated && isAdmin ? <div>Admin Reportes</div> : <Navigate to={isAuthenticated ? "/cuotas" : "/login"} replace />} />
          <Route path="/admin/config" element={isAuthenticated && isAdmin ? <div>Admin Config</div> : <Navigate to={isAuthenticated ? "/cuotas" : "/login"} replace />} />


          {/* Ruta 404 */}
          <Route path="*" element={<div className="text-center p-5"><h2>404 - Página no encontrada</h2></div>} />

        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;