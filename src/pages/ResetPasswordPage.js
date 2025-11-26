import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPasswordReset } from '../services/authApi';
import './ForgotPasswordPage.css';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!password || !password2) {
            setError("Completa ambos campos.");
            return;
        }
        if (password !== password2) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            const data = await confirmPasswordReset(uid, token, password);
            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!uid || !token) {
        return <p>Enlace de recuperación inválido.</p>;
    }

    return (
        <div className="recover-container">
            <div className="recover-card">
                <h1 className="recover-title">Restablecer contraseña</h1>
                <p className="recover-text">
                    Ingresá tu nueva contraseña y confirmala para actualizar tu acceso.
                </p>

                <form onSubmit={handleSubmit} className="recover-form">
                    <div className="input-group">
                        <i className="fa-solid fa-lock"></i>
                        <input
                            type="password"
                            placeholder="Nueva contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <i className="fa-solid fa-lock"></i>
                        <input
                            type="password"
                            placeholder="Repetir contraseña"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                        />
                    </div>

                    <button className="btn-submit" type="submit" disabled={loading}>
                        {loading ? "Actualizando..." : "Cambiar contraseña"}
                    </button>

                    {error && <p className="error-text">{error}</p>}
                    {message && <p className="success-text">{message}</p>}
                </form>

                <p className="back-login" onClick={() => navigate("/login")}>
                    ← Volver al inicio de sesión
                </p>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
