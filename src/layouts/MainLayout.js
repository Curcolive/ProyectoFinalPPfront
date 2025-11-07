import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

import Footer from './Footer';
import PillNav from '../components/PillNav';
import logoISDM from '../assets/logo-pequeño.png'; 
import './MainLayout.css'; 

// --- ¡CAMBIO! Solo recibe 'children' y 'handleLogout' de App.js ---
function MainLayout({ children, handleLogout }) {
    
    const location = useLocation();
    const activeHref = location.pathname;

    // --- ¡LÓGICA RESTAURADA! (Copiada de tu Header.js original) ---
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Obtenemos 'isAuthenticated' solo para saber si debemos *intentar* leer.
        const tokenDataString = localStorage.getItem('authToken');
        if (tokenDataString) {
            try {
                const tokenData = JSON.parse(tokenDataString);
                if (tokenData.access) {
                    const decoded = jwtDecode(tokenData.access);
                    setUserData({
                        name: decoded.username || 'Usuario',
                        role: decoded.is_staff ? 'Administrador' : 'Estudiante',
                        is_staff: decoded.is_staff || false
                    });
                }
            } catch (e) {
                console.error("Error decoding token in Layout:", e);
                setUserData(null);
            }
        } else {
            setUserData(null);
        }
        // Este useEffect se ejecuta solo una vez al cargar el layout
    }, []); 

    // Esta es ahora la ÚNICA fuente de verdad
    const isAdmin = userData?.is_staff || false;
    // --- FIN DE LA LÓGICA RESTAURADA ---


    let navItems = [];
    if (isAdmin) { // <-- Ahora usa el 'isAdmin' local, que SÍ funciona
        // Menú Admin
        navItems = [
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: 'Alumnos', href: '/admin/alumnos' },
            { label: 'Cobranzas', href: '/admin/cobranzas' },
            { label: 'Reportes', href: '/admin/reportes' },
            { label: 'Config', href: '/admin/config' }
        ];
    } else {
        // Menú Alumno
        navItems = [
            { label: 'Inicio', href: '/inicio' },
            { label: 'Mis Datos', href: '/mis-datos' },
            { label: 'Cuotas', href: '/cuotas' },
            { label: 'Académico', href: '/academico' }
        ];
    }

    const colorRojoISDM = "#8B2530";
    const colorBlanco = "#FFFFFF";

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            <Navbar style={{ backgroundColor: colorRojoISDM }} expand="lg" className="main-navbar py-2">
                <Container fluid>

                    <PillNav 
                        logo={logoISDM}
                        logoHref={isAdmin ? "/admin/cobranzas" : "/cuotas"}
                        items={navItems}
                        activeHref={activeHref}
                        baseColor={colorBlanco}
                        pillColor={colorRojoISDM}
                        pillTextColor={colorBlanco}
                        hoveredPillTextColor={colorRojoISDM}
                    />

                    <Nav className="ms-auto">
                        {/* Ahora 'userData' se define localmente y no fallará */}
                        {userData && (
                            <NavDropdown
                                className="user-dropdown" 
                                title={<>Hola, {userData.name} <span className="d-none d-sm-inline">({userData.role})</span></>}
                                id="user-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item onClick={handleLogout}>
                                    Salir
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>

                </Container>
            </Navbar>

            <main style={{ flexGrow: 1, padding: '1rem', paddingTop: '2rem' }}>
                {children}
            </main>
            
            <Footer />
        </div>
    );
}
export default MainLayout;