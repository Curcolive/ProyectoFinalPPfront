import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, signupUser, loginWithGoogle } from '../services/authApi';
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

    const [signupUsername, setSignupUsername] = useState('');
    const [signupFirstName, setSignupFirstName] = useState('');
    const [signupLastName, setSignupLastName] = useState('');
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

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const token = credentialResponse.credential;
            const data = await loginWithGoogle(token);

            localStorage.setItem("authToken", JSON.stringify(data));

            if (data.require_password) {
                navigate("/completar-perfil", { state: { user: data.user } });
                return;
            }

            onLoginSuccess();
        } catch (err) {
            setError(err.message || "Error al iniciar sesión con Google.");
        }
    };

    const handleGoogleError = () => {
        setError("No se pudo completar el inicio con Google.");
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!signupUsername || !signupFirstName || !signupLastName || !signupEmail || !signupPassword) {
            setError("Completa todos los campos para registrarte.");
            return;
        }

        setLoading(true);

        try {
            const newUser = await signupUser(
                signupUsername,
                signupFirstName,
                signupLastName,
                signupEmail,
                signupPassword
            );
            console.log("Usuario creado:", newUser);

            const tokenData = await loginUser(signupUsername, signupPassword);
            localStorage.setItem("authToken", JSON.stringify(tokenData));

            onLoginSuccess();
            setSignupUsername('');
            setSignupFirstName('');
            setSignupLastName('');
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
                    <form onSubmit={handleSignup}>
                        <h1>Crear Cuenta</h1>
                        <div className="input-group">
                            <i className="fa-solid fa-id-card"></i>
                            <input
                                type="text"
                                placeholder="Usuario"
                                value={signupUsername}
                                onChange={(e) => setSignupUsername(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <i className="fa-solid fa-user"></i>
                            <input
                                type="text"
                                placeholder="Nombre"
                                value={signupFirstName}
                                onChange={(e) => setSignupFirstName(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <i className="fa-solid fa-user"></i>
                            <input
                                type="text"
                                placeholder="Apellido"
                                value={signupLastName}
                                onChange={(e) => setSignupLastName(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <i className="fa-solid fa-envelope"></i>
                            <input
                                type="email"
                                placeholder="Email"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <i className="fa-solid fa-lock"></i>
                            <input
                                type="password"
                                placeholder="Contraseña"
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
                                placeholder="Usuario"
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
                        <div className="social-login">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                            />
                        </div>
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