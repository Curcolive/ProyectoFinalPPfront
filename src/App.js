import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import MisPagosPage from './pages/MisPagosPage';
import AdminGestionPage from './pages/AdminGestionPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import './App.css';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Función para verificar el token y extraer el rol
    const checkAuth = () => {
      const tokenDataString = localStorage.getItem('authToken');
      if (tokenDataString) {
        try {
          const tokenData = JSON.parse(tokenDataString);
          if (tokenData.access) {
            const decodedToken = jwtDecode(tokenData.access);
            const isStaff = decodedToken.is_staff || false;

            setUserRole(isStaff ? 'admin' : 'student');
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
            setUserRole(null);
          }
        } catch (e) {
          console.error("Error decoding token:", e);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setIsLoadingAuth(false);
    };
    checkAuth();
  }, []);

  // Función llamada por LoginPage después de un login exitoso
  const handleLoginSuccess = () => {
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
          // (Esta parte ya estaba bien, pero ahora el router también redirigirá)
          window.location.href = isStaff ? '/admin/cobranzas' : '/cuotas';
        }
      } catch (e) {
        handleLogout();
      }
    }
  };

  // Función para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUserRole(null);
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
      <Routes>
        {/* --- RUTA DE LOGIN (SIN LAYOUT) --- */}
        {/* Esta ruta se maneja fuera del MainLayout */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              // Si ya está logueado, redirige al panel correspondiente
              <Navigate to={isAdmin ? "/admin/cobranzas" : "/cuotas"} replace />
            ) : (
              // Si no está logueado, muestra la página de login (sin barra azul)
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* --- RUTAS PROTEGIDAS (CON LAYOUT) --- */}
        {/* Usamos un "catch-all" (*) para todas las demás rutas */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              // 1. Si está logueado, muestra el MainLayout (barra azul)...
              <MainLayout isAuthenticated={isAuthenticated} handleLogout={handleLogout}>
                {/* 2. ...y dentro del layout, define las rutas protegidas */}
                <Routes>
                  
                  {/* Ruta Protegida Cuotas (Alumno) */}
                  <Route
                    path="/cuotas"
                    element={
                      !isAdmin ? ( // Solo si NO es admin
                        <MisPagosPage />
                      ) : (
                        <Navigate to="/admin/cobranzas" replace /> // Si es admin va a cobranzas
                      )
                    }
                  />

                  {/* Ruta Protegida Admin Cobranzas */}
                  <Route
                    path="/admin/cobranzas"
                    element={
                      isAdmin ? ( // Solo si ES admin
                        <AdminGestionPage />
                      ) : (
                        <Navigate to="/cuotas" replace /> // Si es alumno va a cuotas
                      )
                    }
                  />

                  {/* Ruta Protegida para Configuración (Admin) */}
                  <Route
                    path="/admin/config"
                    element={
                      isAdmin ? (
                        <ConfiguracionPage />
                      ) : (
                        <Navigate to="/cuotas" replace />
                      )
                    }
                  />

                  {/* Ruta Raíz */}
                  <Route
                    path="/"
                    element={
                      // Raíz redirige al panel correspondiente
                      <Navigate to={isAdmin ? "/admin/cobranzas" : "/cuotas"} replace />
                    }
                  />

                  {/* Placeholders (ya están protegidos por el check de 'isAuthenticated' de la ruta padre) */}
                  <Route path="/inicio" element={!isAdmin ? <div>Inicio Alumno</div> : <Navigate to="/admin/cobranzas" replace />} />
                  <Route path="/mis-datos" element={!isAdmin ? <div>Mis Datos</div> : <Navigate to="/admin/cobranzas" replace />} />
                  <Route path="/academico" element={!isAdmin ? <div>Académico</div> : <Navigate to="/admin/cobranzas" replace />} />
                  
                  <Route path="/admin/dashboard" element={isAdmin ? <div>Admin Dashboard</div> : <Navigate to="/cuotas" replace />} />
                  <Route path="/admin/alumnos" element={isAdmin ? <div>Admin Alumnos</div> : <Navigate to="/cuotas" replace />} />
                  <Route path="/admin/reportes" element={isAdmin ? <div>Admin Reportes</div> : <Navigate to="/cuotas" replace />} />
                  
                  {/* Ruta 404 */}
                  <Route path="*" element={<div className="text-center p-5"><h2>404 - Página no encontrada</h2></div>} />

                </Routes>
              </MainLayout>
            ) : (
              // 3. Si NO está logueado y no es /login, redirige a /login
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;