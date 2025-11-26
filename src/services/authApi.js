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

export async function completeProfile(data) {
    const res = await fetch(`${API_BASE_URL}/complete-profile/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.detail || "Error al completar perfil");
    }
    return json;
}

export async function signupUser(username, first_name, last_name, email, password) {
    const res = await fetch(`${API_BASE_URL}/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            first_name,
            last_name,
            email,
            password
        }),
    });

    const data = await res.json();

    if (!res.ok) {
        const msg = data.detail || "Error en el registro.";
        throw new Error(msg);
    }

    return data;
}

export async function requestPasswordReset(email) {
    const res = await fetch(`${API_BASE_URL}/password-reset/request/`, {
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
    const res = await fetch(`${API_BASE_URL}/password-reset/confirm/`, {
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

export async function loginWithGoogle(credential) {
    const res = await fetch(`${API_BASE_URL}/google-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
    });

    const data = await res.json();

    if (!res.ok) {
        const msg = data.detail || data.message || "Error al iniciar sesión con Google.";
        throw new Error(msg);
    }

    return data;
}