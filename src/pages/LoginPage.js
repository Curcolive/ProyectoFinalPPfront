import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import './LoginPage.css';
import { loginUser } from '../services/authApi';

// Recibe 'onLoginSuccess' como prop
function LoginPage({ onLoginSuccess }) {
    // --- Estados ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Handler para el envío ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError("Por favor, ingresa tu usuario y contraseña.");
            return;
        }
        setLoading(true);

        try {
            const tokenData = await loginUser(username, password);
            console.log("Tokens recibidos:", tokenData);
            // Guarda el token completo (access y refresh)
            localStorage.setItem('authToken', JSON.stringify(tokenData));

            // --- SIMULACIÓN DE ROL ELIMINADA ---
            // Ya no guardamos 'userRole' aquí

            // Llama a la función del prop para avisar a App.js
            onLoginSuccess();

            // Limpia el formulario (opcional)
            setUsername('');
            setPassword('');

        } catch (err) {
            console.error("Error en handleLogin:", err);
            setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
        } finally {
            setLoading(false);
        }
    };

    // --- Renderizado ---
    return (
        <Container fluid className="login-container d-flex justify-content-center align-items-center">
            <Row className="w-100">
                <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
                    <Card className="shadow-lg login-card">
                        <Card.Body className="p-4 p-md-5">
                            <div className="text-center mb-4">
                                <img src="/logo192.png" alt="Logo ISDM" width="80" className="mb-3" />
                                <h2 className="login-title">Iniciar sesión</h2>
                            </div>

                            <Form onSubmit={handleLogin}>
                                {/* Campo Usuario */}
                                <Form.Group className="mb-3" controlId="formBasicUsername">
                                    <Form.Label>Usuario</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><i className="bi bi-person-fill"></i></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Ingresa tu usuario"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            isInvalid={!!error}
                                            required
                                            autoComplete="username"
                                        />
                                    </InputGroup>
                                </Form.Group>

                                {/* Campo Contraseña */}
                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Contraseña</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><i className="bi bi-lock-fill"></i></InputGroup.Text>
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Ingresa tu contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            isInvalid={!!error}
                                            required
                                            autoComplete="current-password"
                                        />
                                        <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                            <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}></i>
                                        </Button>
                                    </InputGroup>
                                    {error && <Form.Text className="text-danger d-block mt-1">{error}</Form.Text>}
                                </Form.Group>

                                {/* Enlace ¿Olvidaste contraseña? */}
                                <div className="text-end mb-3">
                                    <a href="#forgot" className="forgot-password-link">¿Olvidaste tu contraseña?</a>
                                </div>

                                {/* Botón de Ingresar */}
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={loading} size="lg">
                                        {loading ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                                Ingresando...
                                            </>
                                        ) : (
                                            'Entrar'
                                        )}
                                    </Button>
                                </div>
                            </Form>

                            {/* Enlace de Registro */}
                            <div className="text-center mt-4">
                                <span className="text-muted">¿No tienes cuenta? </span>
                                <a href="#register" className="register-link">Regístrate</a>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginPage;