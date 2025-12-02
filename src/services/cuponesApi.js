// Lee la URL base de la API desde las variables de entorno (o usa localhost por defecto)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Función para obtener el token de autenticación (simulado por ahora)
const getAuthToken = () => {
    const tokenDataString = localStorage.getItem('authToken');
    if (tokenDataString) {
        try {
            const tokenData = JSON.parse(tokenDataString);
            return tokenData.access || null;
        } catch (e) {
            console.error("Error parsing auth token from localStorage", e);
            localStorage.removeItem('authToken');
            return null;
        }
    }
    return null;
};

export const getHistorialLogs = async () => {
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/logs/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` })
            },
            cache: "no-store"
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Error ${response.status}: ${errorData.detail || errorData.error || response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching logs:", error);
        throw error;
    }
};

// Función para obtener la lista de cuotas pendientes
export const getCuotasPendientes = async () => {
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/lista-pendientes/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            // --- ¡AÑADIDO! ---
            // Esto le dice al navegador que NUNCA guarde esta respuesta en caché.
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error ${response.status}: ${errorData.detail || response.statusText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching cuotas pendientes:", error);
        throw error;
    }
};

// --- FUNCIÓN NUEVA PARA GENERAR EL CUPÓN ---
export const generarCupon = async (cuotasIds, idempotencyKey, pasarelaId) => {
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/generar-cupon/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({
                cuotas_ids: cuotasIds,
                idempotency_key: idempotencyKey,
                pasarela_id: pasarelaId
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 409 && data.cupon_existente) {
                const error = new Error(data.error);
                error.status = 409;
                error.cupon_existente = data.cupon_existente;
                throw error;
            }
            throw new Error(`Error ${response.status}: ${data.error || response.statusText}`);
        }

        return { ...data, status: response.status };

    } catch (error) {
        console.error("Error en servicio generarCupon:", error);
        throw error;
    }
};

export const getHistorialCupones = async () => {
    const token = getAuthToken();

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/historial/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            // --- ¡AÑADIDO! ---
            // Esto también es crucial para que las pestañas se actualicen.
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error ${response.status}: ${errorData.detail || errorData.error || response.statusText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching historial cupones:", error);
        throw error;
    }
};

// --- AÑADIR ESTA FUNCIÓN COMPLETA ---
export const getPasarelasDisponibles = async () => {
    const token = getAuthToken();
    try {
        // Llama a la nueva URL que creamos
        const response = await fetch(`${API_BASE_URL}/cupones/pasarelas/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            cache: 'no-store' // Para que siempre traiga datos frescos
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error ${response.status}: ${errorData.detail || 'Error al cargar pasarelas'}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching pasarelas disponibles:", error);
        throw error;
    }
};

// ... (El resto de funciones: getAdminCupones, anularCuponAdmin, CRUDs de config, etc...
// ... no necesitan 'cache: no-store' porque ya usan PATCH/POST/DELETE,
// ... o son solo para el admin que puede hacer hard-refresh si lo necesita)

export const getAdminCupones = async () => {
    const token = getAuthToken();
    if (!token) throw new Error("Se requiere autenticación de administrador.");

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/gestion/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error(`Error ${response.status}: No tienes permisos de administrador.`);
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error ${response.status}: ${errorData.detail || errorData.error || response.statusText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching admin cupones:", error);
        throw error;
    }
};

export const anularCuponAdmin = async (cuponId, motivo) => {
    const token = getAuthToken();
    if (!token) {
        return Promise.reject(new Error("Se requiere autenticación de administrador."));
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/anular/${cuponId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ motivo: motivo }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${data.error || data.mensaje || response.statusText}`);
        }

        return data;

    } catch (error) {
        console.error(`Error anulando cupón ${cuponId}:`, error);
        throw error;
    }
};

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

export const createEstadoCupon = async (data) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/config/estados-cupon/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
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

export const deleteEstadoCupon = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/config/estados-cupon/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        if (response.status !== 204) throw new Error('Error al eliminar el estado');
        return true;
    } catch (error) {
        console.error("Error en deleteEstadoCupon:", error);
        throw error;
    }
};

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
            body: JSON.stringify({ estado_cupon_id: nuevoEstadoId }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${data.error || data.mensaje || response.statusText}`);
        }

        return data;

    } catch (error) {
        console.error(`Error actualizando estado del cupón ${cuponId}:`, error);
        throw error;
    }
};

export const getPasarelasPago = async () => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/config/pasarelas/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) throw new Error('Error al cargar las pasarelas de pago');
        return await response.json();
    } catch (error) {
        console.error("Error en getPasarelasPago:", error);
        throw error;
    }
};

export const createPasarelaPago = async (data) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/config/pasarelas/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || errData.nombre || 'Error al crear la pasarela');
        }
        return await response.json();
    } catch (error) {
        console.error("Error en createPasarelaPago:", error);
        throw error;
    }
};

export const updatePasarelaPago = async (id, data) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/config/pasarelas/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error al actualizar la pasarela');
        return await response.json();
    } catch (error) {
        console.error("Error en updatePasarelaPago:", error);
        throw error;
    }
};

export const deletePasarelaPago = async (id) => {
    const token = getAuthToken();
    try {
        const response = await fetch(`${API_BASE_URL}/cupones/admin/config/pasarelas/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        if (response.status === 409) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Error: La pasarela está en uso.');
        }
        if (response.status !== 204) throw new Error('Error al eliminar la pasarela');
        return true;
    } catch (error) {
        console.error("Error en deletePasarelaPago:", error);
        throw error;
    }
};

export const anularCuponAlumno = async (cuponId) => {
    const token = getAuthToken();
    if (!token) {
        return Promise.reject(new Error("Se requiere autenticación."));
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/cupon/${cuponId}/anular/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (response.status === 204) {
            return true;
        }

        const data = await response.json().catch(() => ({}));
        throw new Error(`Error ${response.status}: ${data.error || data.mensaje || 'Error al anular el cupón.'}`);

    } catch (error) {
        console.error(`Error anulando cupón ${cuponId} (alumno):`, error);
        throw error;
    }
};

/**
 * Descarga el PDF de un cupón específico desde el backend.
 * Esto SÍ envía el token de autenticación.
 */
export const descargarCuponPDF = async (cuponId) => {
    const token = getAuthToken();
    if (!token) {
        return Promise.reject(new Error("Se requiere autenticación."));
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cupones/cupon/${cuponId}/descargar/`, {
            method: 'GET',
            headers: {
                // No mandamos Content-Type, dejamos que el navegador decida
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            // Intenta leer el error como JSON
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error ${response.status}: ${errorData.detail || 'Error al descargar el PDF.'}`);
        }

        // Si la respuesta es exitosa, la devolvemos como un "blob" (archivo binario)
        return await response.blob();

    } catch (error) {
        console.error(`Error descargando PDF del cupón ${cuponId}:`, error);
        throw error;
    }
};

/**
 * Helper que toma un "blob" (archivo) y un nombre, 
 * y simula un clic para descargarlo en el navegador del usuario.
 */
export const handleBlobDownload = (blob, filename) => {
    // 1. Crea una URL temporal en el navegador para el archivo
    const url = window.URL.createObjectURL(blob);

    // 2. Crea un enlace <a> fantasma
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename; // El nombre que tendrá el archivo

    // 3. Añade el enlace al cuerpo y simula un clic
    document.body.appendChild(a);
    a.click();

    // 4. Limpia el enlace y la URL temporal
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};