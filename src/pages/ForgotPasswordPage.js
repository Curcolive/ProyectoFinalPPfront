import { useState } from "react";
import { requestPasswordReset } from "../api/auth";

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
        <form onSubmit={handleSubmit}>
            <h1>Recuperar contraseña</h1>
            <input
                type="email"
                placeholder="Email registrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {message && <p style={{ color: "green" }}>{message}</p>}
        </form>
    );
}

export default ForgotPasswordPage;
