import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPasswordReset } from '../services/authApi';

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
        <form onSubmit={handleSubmit}>
            <h1>Restablecer contraseña</h1>
            <input
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Repetir contraseña"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
            />
            <button type="submit" disabled={loading}>
                {loading ? "Actualizando..." : "Cambiar contraseña"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}
        </form>
    );
}

export default ResetPasswordPage;
