import React, { useState } from 'react';
import './LoginPage.css'; // Importaremos los nuevos estilos
import { Spinner } from 'react-bootstrap'; 
import { loginUser } from '../services/authApi';
import logoISDM from '../assets/logo-pequeño.png'; 

// --- 1. ¡NUEVO! IMPORTA TU IMAGEN DE FONDO ---
// (Asegúrate de que la ruta '../assets/fondo-instituto.png' sea correcta)
import fondoInstituto from '../assets/fondo-instituto.png';


function LoginPage({ onLoginSuccess }) {
    // --- Estados para la lógica de login (de tu código) ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Estado para la animación (del script.js) ---
    const [isActive, setIsActive] = useState(false);

    // --- ¡NUEVO ESTADO para el ojo de la contraseña! ---
    const [showPassword, setShowPassword] = useState(false);

    // --- Handler para el envío (de tu código) ---
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

    return (
        // --- 2. ¡NUEVO! APLICA EL FONDO Y UN OVERLAY OSCURO ---
        <div 
            className="login-page-wrapper"
            style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${fondoInstituto})` 
            }}
        >
            <div className={`login-container ${isActive ? 'active' : ''}`} id="container">
                {/* --- FORMULARIO DE REGISTRO (Panel Izquierdo) --- */}
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
                        
                        {/* --- Input de Registro (También con grupo) --- */}
                        <div className="input-group">
                            <i className="fa-solid fa-user"></i>
                            <input type="text" placeholder="Nombre" />
                        </div>
                        <div className="input-group">
                            <i className="fa-solid fa-envelope"></i>
                            <input type="email" placeholder="Email" />
                        </div>
                        <div className="input-group">
                            <i className="fa-solid fa-lock"></i>
                            <input type="password" placeholder="Contraseña" />
                        </div>
                        <button type="button">Registrarse</button>
                    </form>
                </div>

                {/* --- FORMULARIO DE LOGIN (Panel Derecho) --- */}
                <div className="form-container sign-in">
                    <form onSubmit={handleLogin}>
                        
                        <img src={logoISDM} alt="Logo ISDM" width="80" className="mb-3" />
                        <h1>Iniciar Sesión</h1>
                        
                        {/* --- ¡NUEVO: Input de Usuario con Icono --- */}
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
                        
                        {/* --- ¡NUEVO: Input de Contraseña con Icono y Ojo --- */}
                        <div className="input-group">
                            <i className="fa-solid fa-lock"></i>
                            <input 
                                type={showPassword ? "text" : "password"} // Tipo dinámico
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {/* ¡NUEVO: Ojo para mostrar/ocultar! */}
                            <i 
                                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
                                onClick={() => setShowPassword(!showPassword)}
                            ></i>
                        </div>
                        
                        {error && <span className="text-danger mt-2">{error}</span>}
                        
                        <a href="#!">¿Olvidaste tu contraseña?</a>
                        
                        <button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                    Ingresando...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>
                </div>

                {/* --- PANELES DE ANIMACIÓN (OVERLAY) --- */}
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