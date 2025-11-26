const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || `Error ${response.status}`);
        }
        return data;

    } catch (error) {
        console.error("Error en loginUser:", error);
        throw new Error(error.message || 'No se pudo conectar al servidor de autenticación.');
    }
};

export async function signupUser(username, email, password) {
    const res = await fetch(`${API_URL}/signup/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        const msg =
            data.detail ||
            data.message ||
            (typeof data === "string"
                ? data
                : "Error en el registro. Verifica los datos.");
        throw new Error(msg);
    }
    return data;
}

export async function requestPasswordReset(email) {
    const res = await fetch(`${API_URL}/password-reset/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
        const msg = data.detail || data.message || "Error al solicitar recuperación.";
        throw new Error(msg);
    }
    return data;
}

export async function confirmPasswordReset(uid, token, newPassword) {
    const res = await fetch(`${API_URL}/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            uid,
            token,
            new_password: newPassword,
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        const msg = data.detail || data.message || "Error al restablecer contraseña.";
        throw new Error(msg);
    }
    return data;
}