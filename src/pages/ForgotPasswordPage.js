import { useState } from "react";
import { requestPasswordReset } from '../services/authApi';
import './ForgotPasswordPage.css';

function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email) {
            setError("Ingresa tu correo.");
            return;
        }

        setLoading(true);
        try {
            const data = await requestPasswordReset(email);
            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="recover-container">
            <div className="recover-card">
                <h1 className="recover-title">Recuperar contraseña</h1>
                <p className="recover-text">
                    Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <form onSubmit={handleSubmit} className="recover-form">
                    <div className="input-group">
                        <i className="fa-solid fa-envelope"></i>
                        <input
                            type="email"
                            placeholder="Email registrado"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button className="btn-submit" type="submit" disabled={loading}>
                        {loading ? "Enviando..." : "Enviar enlace"}
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

export default ForgotPasswordPage;
