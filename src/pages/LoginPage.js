import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from '../services/authApi';
import logoISDM from '../assets/logo-pequeño.png';
import fondoInstituto from '../assets/fondo-instituto.png';
import './LoginPage.css';


function LoginPage({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isActive, setIsActive] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const navigate = useNavigate();

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
            localStorage.setItem('authToken', JSON.stringify(tokenData));
            onLoginSuccess();
            setUsername('');
            setPassword('');
        } catch (err) {
            console.error("Error en handleLogin:", err);
            setError(err.message || "Error al iniciar sesión. Verifica tus credenciales.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!signupName || !signupEmail || !signupPassword) {
            setError("Por favor, completa nombre, email y contraseña.");
            return;
        }

        setLoading(true);

        try {
            const newUser = await signupUser(signupName, signupEmail, signupPassword);
            console.log("Usuario creado:", newUser);

            const tokenData = await loginUser(signupName, signupPassword);
            localStorage.setItem("authToken", JSON.stringify(tokenData));
            onLoginSuccess();

            setSignupName('');
            setSignupEmail('');
            setSignupPassword('');
        } catch (err) {
            console.error("Error en handleSignup:", err);
            setError(err.message || "Error al registrarse.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="login-page-wrapper"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${fondoInstituto})`
            }}
        >
            <div className={`login-container ${isActive ? 'active' : ''}`} id="container">
                <div className="form-container sign-up">
                    <form>
                        <h1>Crear Cuenta</h1>
                        <div className="social-icons">
                            <a href="#!" onClick={(e) => e.preventDefault()} className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#!" onClick={(e) => e.preventDefault()} className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#!" onClick={(e) => e.preventDefault()} className="icon"><i className="fa-brands fa-github"></i></a>
                            <a href="#!" onClick={(e) => e.preventDefault()} className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        <span>o usa tu email para registrarte</span>
                        <div className="input-group">
                            <i className="fa-solid fa-user"></i>
                            <input
                                type="text"
                                placeholder="Nombre"
                                name="username"
                                value={signupName}
                                onChange={(e) => setSignupName(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <i className="fa-solid fa-envelope"></i>
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <i className="fa-solid fa-lock"></i>
                            <input
                                type="password"
                                placeholder="Contraseña"
                                name="password"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Registrando..." : "Registrarse"}
                        </button>
                    </form>
                </div>

                <div className="form-container sign-in">
                    <form onSubmit={handleLogin}>

                        <img src={logoISDM} alt="Logo ISDM" width="80" className="mb-3" />
                        <h1>Iniciar Sesión</h1>
                        <div className="input-group">
                            <i className="fa-solid fa-user"></i>
                            <input
                                type="text"
                                placeholder="Usuario (Legajo o DNI)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <i className="fa-solid fa-lock"></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <i
                                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                                onClick={() => setShowPassword(!showPassword)}
                            ></i>
                        </div>

                        {error && <span className="text-danger mt-2">{error}</span>}

                        <p className="forgot-link" onClick={() => navigate("/forgot-password")}>
                            ¿Olvidaste tu contraseña?
                        </p>

                        <button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Ingresando...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>
                </div>

                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>¡Bienvenido de nuevo!</h1>
                            <p>Ingresa tus datos personales para usar todas las funciones del sitio</p>
                            <button type="button" className="hidden" id="login" onClick={() => setIsActive(false)}>
                                Iniciar Sesión
                            </button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>¡Hola!</h1>
                            <p>Regístrate con tus datos personales para usar todas las funciones del sitio</p>
                            <button type="button" className="hidden" id="register" onClick={() => setIsActive(true)}>
                                Registrarse
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;