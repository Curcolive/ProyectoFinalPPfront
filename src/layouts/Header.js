import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PillNav from '../components/PillNav';
import logo from '../assets/logo-pequeño.png';

function Header({ isAuthenticated, handleLogout }) {
    const [userData, setUserData] = useState(null);
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated) {
            const tokenDataString = localStorage.getItem('authToken');
            if (tokenDataString) {
                try {
                    const tokenData = JSON.parse(tokenDataString);
                    if (tokenData.access) {
                        const decoded = jwtDecode(tokenData.access);
                        setUserData({
                            name: decoded.nombre_completo || decoded.username || 'Usuario',
                            role: decoded.is_staff ? 'Administrador' : 'Estudiante',
                            is_staff: decoded.is_staff || false
                        });
                    }
                } catch (e) {
                    console.error("Error", e);
                    setUserData(null);
                }
            }
        } else {
            setUserData(null);
        }
    }, [isAuthenticated]);

    const isAdmin = userData?.is_staff || false;
    let navItems = [];

    if (isAuthenticated && isAdmin) {
        navItems = [
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: 'Alumnos', href: '/admin/alumnos' },
            { label: 'Cobranzas', href: '/admin/cobranzas' },
            { label: 'Logs', href: '/admin/logs' },
            { label: 'Configuración', href: '/admin/config' }
        ];
    } else if (isAuthenticated) {
        navItems = [
            { label: 'Inicio', href: '/inicio' },
            { label: 'Mis Datos', href: '/mis-datos' },
            { label: 'Cuotas', href: '/cuotas' },
            { label: 'Académico', href: '/academico' }
        ];
    } else {
        navItems = [{ label: 'Portal', href: '/' }];
    }

    return (
        <header className="app-header">
            {/* AJUSTE: Solo container-fluid, quitamos px-4 para acercarlo al borde */}
            <div className="container-fluid">
                <PillNav
                    logo={logo}
                    logoAlt="ISDM Logo"
                    items={navItems}
                    activeHref={location.pathname}
                    baseColor="#FFFFFF"
                    pillColor="transparent"
                    pillTextColor="#FFFFFF"
                    hoveredPillTextColor="var(--primary-color)"
                    userData={userData}
                    onLogout={handleLogout}
                />
            </div>
        </header>
    );
}

export default Header;