// Lee la URL base de la API (igual que en cuponesApi.js)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Función para iniciar sesión
export const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/token/`, { // Llama a la URL de Simple JWT
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }), // Envía username y password
        });

        const data = await response.json();

        if (!response.ok) {
            // Si la respuesta no es 2xx, lanza un error con el detalle de Simple JWT
            throw new Error(data.detail || `Error ${response.status}`);
        }

        // Si es exitoso, devuelve los tokens (access y refresh)
        return data;

    } catch (error) {
        console.error("Error en loginUser:", error);
        // Propaga el error para que el componente lo maneje
        // Si el error ya tiene un mensaje (ej. de !response.ok), lo usa.
        // Si no, pone un mensaje genérico.
        throw new Error(error.message || 'No se pudo conectar al servidor de autenticación.');
    }
};