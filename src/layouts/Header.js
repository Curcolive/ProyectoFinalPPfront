import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { jwtDecode } from 'jwt-decode'; // Asegúrate de tenerlo instalado

// Recibe isAuthenticated y handleLogout de App.js
function Header({ isAuthenticated, handleLogout }) {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
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
                    console.error("Error decoding token in Header:", e);
                    setUserData(null);
                }
            }
        } else {
            setUserData(null);
        }
    }, [isAuthenticated]);

    const isAdmin = userData?.is_staff || false;

    return (
        <Navbar bg="white" expand="lg" className="border-bottom shadow-sm py-3">
            <Container fluid>
                <LinkContainer to="/">
                    <Navbar.Brand>
                        <img alt="ISDM Logo" src="/logo192.png" width="30" height="30" className="d-inline-block align-top me-2" />
                        ISDM Sistema de Pagos
                    </Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Menú Principal */}
                    <Nav className="me-auto">
                        {isAuthenticated && isAdmin ? (
                            // Menú Admin
                            <>
                                <LinkContainer to="/admin/dashboard"><Nav.Link>Dashboard</Nav.Link></LinkContainer>
                                <LinkContainer to="/admin/alumnos"><Nav.Link>Gestión Alumnos</Nav.Link></LinkContainer>
                                <LinkContainer to="/admin/cobranzas"><Nav.Link>Cobranzas</Nav.Link></LinkContainer>
                                <LinkContainer to="/admin/reportes"><Nav.Link>Reportes</Nav.Link></LinkContainer>
                                <LinkContainer to="/admin/config"><Nav.Link>Configuración</Nav.Link></LinkContainer>
                            </>
                        ) : isAuthenticated ? (
                            // Menú Alumno
                            <>
                                <LinkContainer to="/inicio"><Nav.Link>Inicio</Nav.Link></LinkContainer>
                                <LinkContainer to="/mis-datos"><Nav.Link>Mis Datos</Nav.Link></LinkContainer>
                                <LinkContainer to="/cuotas"><Nav.Link>Cuotas</Nav.Link></LinkContainer>
                                <LinkContainer to="/academico"><Nav.Link>Académico</Nav.Link></LinkContainer>
                            </>
                        ) : null}
                    </Nav>

                    {/* Sección Derecha */}
                    <Nav className={isAuthenticated ? "" : "ms-auto"}>
                        {userData ? (
                            // Menú Usuario
                            <NavDropdown
                                title={<><i className="bi bi-person-circle me-2"></i>Hola, {userData.name} ({userData.role})</>}
                                id="user-nav-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-2"></i>Salir
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            // Botón Login
                            <LinkContainer to="/login">
                                <Button variant="outline-primary">Iniciar Sesión</Button>
                            </LinkContainer>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;