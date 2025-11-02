// Lee la URL base de la API desde las variables de entorno (o usa localhost por defecto)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Función para obtener el token de autenticación (simulado por ahora)
const getAuthToken = () => {
    const tokenDataString = localStorage.getItem('authToken');
    if (tokenDataString) {
        try {
            const tokenData = JSON.parse(tokenDataString);
            // Simple JWT devuelve 'access' y 'refresh'. Devolvemos el de acceso.
            return tokenData.access || null;
        } catch (e) {
            console.error("Error parsing auth token from localStorage", e);
            // Si está corrupto, lo limpiamos
            localStorage.removeItem('authToken');
            return null;
        }
    }
    return null; // No hay token guardado
};


// Función para obtener la lista de cuotas pendientes
export const getCuotasPendientes = async () => {
    const token = getAuthToken(); // Obtiene el token si existe

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/lista-pendientes/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Si tuviéramos un token JWT, lo añadiríamos aquí:
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
        });

        if (!response.ok) {
            // Si la respuesta no fue exitosa (ej. 401, 403, 500)
            const errorData = await response.json().catch(() => ({})); // Intenta leer el error JSON
            throw new Error(`Error ${response.status}: ${errorData.detail || response.statusText}`);
        }

        const data = await response.json();
        return data; // Devuelve el array de cuotas

    } catch (error) {
        console.error("Error fetching cuotas pendientes:", error);
        throw error; // Propaga el error para que el componente lo maneje
    }
};

// --- FUNCIÓN NUEVA PARA GENERAR EL CUPÓN ---
export const generarCupon = async (cuotasIds, idempotencyKey) => {
    const token = getAuthToken(); // Aunque la API está protegida, por ahora la cookie de sesión del admin debería funcionar

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/generar-cupon/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }) // Para JWT más adelante
            },
            body: JSON.stringify({
                cuotas_ids: cuotasIds,
                idempotency_key: idempotencyKey,
            }),
        });

        // Leemos la respuesta JSON en cualquier caso
        const data = await response.json();

        if (!response.ok) {
            // Si la respuesta no fue 200 o 201
            // Usamos el 'error' que devuelve nuestra API de Django
            throw new Error(`Error ${response.status}: ${data.error || response.statusText}`);
        }

        // Si fue exitosa (200 OK o 201 Created), devuelve los datos del cupón
        return { ...data, status: response.status }; // Añadimos el status para saber si fue re-uso (200) o creación (201)

    } catch (error) {
        console.error("Error al generar cupón:", error);
        throw error; // Propaga el error
    }
};

export const getHistorialCupones = async () => {
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/historial/`, { // Llama a la nueva URL
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error ${response.status}: ${errorData.detail || errorData.error || response.statusText}`);
        }

        const data = await response.json();
        return data; // Devuelve el array de cupones generados

    } catch (error) {
        console.error("Error fetching historial cupones:", error);
        throw error;
    }
};

export const getAdminCupones = async () => {
    const token = getAuthToken();
    if (!token) throw new Error("Se requiere autenticación de administrador."); // Validar token

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/gestion/`, { // Llama a la URL de admin
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Esencial enviar el token
            },
        });

        if (!response.ok) {
            // Manejo específico de 403 Forbidden si el usuario no es admin
            if (response.status === 403) {
                throw new Error(`Error ${response.status}: No tienes permisos de administrador.`);
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error ${response.status}: ${errorData.detail || errorData.error || response.statusText}`);
        }

        const data = await response.json();
        return data; // Devuelve TODOS los cupones

    } catch (error) {
        console.error("Error fetching admin cupones:", error);
        throw error;
    }
};

// --- NUEVA FUNCIÓN PARA ANULAR CUPÓN (ADMIN) ---
export const anularCuponAdmin = async (cuponId, motivo) => {
    const token = getAuthToken(); // Obtiene el token de acceso
    if (!token) {
        // Si no hay token, rechaza la promesa inmediatamente
        return Promise.reject(new Error("Se requiere autenticación de administrador."));
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/anular/${cuponId}/`, { // Llama a la URL PATCH
            method: 'PATCH', // Usamos PATCH para actualizaciones parciales
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Envía el token de autenticación
            },
            body: JSON.stringify({ motivo: motivo }), // Envía el motivo en el cuerpo
        });

        // Intenta leer la respuesta JSON, incluso si es un error
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // Si la respuesta no es 2xx, lanza el error devuelto por la API
            // (ej. "No se puede anular un cupón que ya está pagado.")
            throw new Error(`Error ${response.status}: ${data.error || data.mensaje || response.statusText}`);
        }

        // Si la respuesta es 200 OK, devuelve los datos (el cupón actualizado o el mensaje de éxito)
        return data;

    } catch (error) {
        console.error(`Error anulando cupón ${cuponId}:`, error);
        throw error; // Propaga el error para que el componente React lo maneje
    }
};
// --- FIN NUEVA FUNCIÓN ANULAR ---

// --- FUNCIONES CRUD PARA 'EstadoCupon' ---

// GET (Leer todos)
export const getEstadosCupon = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/config/estados-cupon/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) throw new Error('Error al cargar los estados de cupón');
        return await response.json();
    } catch (error) {
        console.error("Error en getEstadosCupon:", error);
        throw error;
    }
};

// POST (Crear uno nuevo)
export const createEstadoCupon = async (data) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/config/estados-cupon/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data) // data será { nombre: "...", descripcion: "..." }
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || errData.nombre || 'Error al crear el estado');
        }
        return await response.json();
    } catch (error) {
        console.error("Error en createEstadoCupon:", error);
        throw error;
    }
};

// PUT (Actualizar uno existente)
export const updateEstadoCupon = async (id, data) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/config/estados-cupon/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al actualizar el estado');
        return await response.json();
    } catch (error) {
        console.error("Error en updateEstadoCupon:", error);
        throw error;
    }
};

// DELETE (Eliminar uno)
export const deleteEstadoCupon = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/config/estados-cupon/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        // DELETE no devuelve contenido, solo verifica el status 204
        if (response.status !== 204) throw new Error('Error al eliminar el estado');
        return true; // Éxito
    } catch (error) {
        console.error("Error en deleteEstadoCupon:", error);
        throw error;
    }
};
// --- FIN FUNCIONES CRUD ---

// --- NUEVA FUNCIÓN PARA ACTUALIZAR ESTADO DE CUPÓN (ADMIN) ---
export const updateCuponEstado = async (cuponId, nuevoEstadoId) => {
    const token = getAuthToken();
    if (!token) throw new Error("Se requiere autenticación de administrador.");

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/cupon/${cuponId}/estado/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado_cupon_id: nuevoEstadoId }), // Envía el ID del nuevo estado
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${data.error || data.mensaje || response.statusText}`);
        }
        
        return data; // Devuelve el cupón actualizado

    } catch (error) {
        console.error(`Error actualizando estado del cupón ${cuponId}:`, error);
        throw error;
    }
};
// --- FIN NUEVA FUNCIÓN ---