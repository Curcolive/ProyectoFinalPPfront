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
  // --- ¡SIMPLIFICADO! Solo 'isAdmin' para las redirecciones ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const tokenDataString = localStorage.getItem('authToken');
      if (tokenDataString) {
        try {
          const tokenData = JSON.parse(tokenDataString);
          if (tokenData.access) {
            const decodedToken = jwtDecode(tokenData.access);
            const isStaff = decodedToken.is_staff || false;
            
            setIsAdmin(isStaff); // <-- Solo guardamos esto
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } catch (e) {
          console.error("Error decoding token:", e);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setIsLoadingAuth(false);
    };
    checkAuth();
  }, []); 

  const handleLoginSuccess = () => {
    // Solo necesitamos recargar para que el nuevo token sea leído por el layout
    // (O podemos re-decodificar aquí como antes, ambas funcionan)
    const tokenDataString = localStorage.getItem('authToken');
    if (tokenDataString) {
        try {
            const tokenData = JSON.parse(tokenDataString);
            if (tokenData.access) {
                const decodedToken = jwtDecode(tokenData.access);
                const isStaff = decodedToken.is_staff || false;
                // Redirige
                window.location.href = isStaff ? '/admin/cobranzas' : '/cuotas';
            }
        } catch(e) {
            handleLogout();
        }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setIsAdmin(false);
    window.location.href = '/login';
  };

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

  return (
    <Router>
      <Routes>
        {/* --- RUTA DE LOGIN (SIN LAYOUT) --- */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={isAdmin ? "/admin/cobranzas" : "/cuotas"} replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* --- RUTAS PROTEGIDAS (CON LAYOUT) --- */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              // --- ¡CAMBIO AQUÍ! Solo pasamos 'handleLogout' ---
              <MainLayout handleLogout={handleLogout}>
                <Routes>
                  {/* --- ¡IMPORTANTE! 'isAdmin' ahora viene del layout, no de App.js --- */}
                  {/* El layout decidirá qué links mostrar (PillNav) */}
                  {/* Estas rutas solo protegen el contenido de la PÁGINA */}
                  <Route
                    path="/cuotas"
                    element={
                      !isAdmin ? (
                        <MisPagosPage />
                      ) : (
                        <Navigate to="/admin/cobranzas" replace />
                      )
                    }
                  />
                  <Route
                    path="/admin/cobranzas"
                    element={
                      isAdmin ? (
                        <AdminGestionPage />
                      ) : (
                        <Navigate to="/cuotas" replace />
                      )
                    }
                  />
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
                  <Route
                    path="/"
                    element={
                      <Navigate to={isAdmin ? "/admin/cobranzas" : "/cuotas"} replace />
                    }
                  />
                  
                  {/* Tus otras rutas placeholder */}
                  
                  <Route path="*" element={<div className="text-center p-5"><h2>404 - Página no encontrada</h2></div>} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;