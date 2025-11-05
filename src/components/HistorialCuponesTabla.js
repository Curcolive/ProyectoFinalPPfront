import React, { useState } from 'react';
import { Table, Badge, Button, Form, Spinner } from 'react-bootstrap';
import { descargarCuponPDF, handleBlobDownload } from '../services/cuponesApi';

// Función auxiliar (sin cambios)
const getEstadoCuponBadge = (estadoNombre) => {
    switch (estadoNombre) {
        case 'Activo': return <Badge bg="success">Activo</Badge>;
        case 'Vencido': return <Badge bg="danger">Vencido</Badge>;
        case 'Pagado': return <Badge bg="info">Pagado</Badge>;
        case 'Anulado': return <Badge bg="secondary">Anulado</Badge>;
        default: return <Badge bg="light" text="dark">{estadoNombre || 'Desconocido'}</Badge>;
    }
};

// Recibe la prop 'onAnularClick' (ya la tenías)
function HistorialCuponesTabla({ cupones, isAdminView = false, onAnularClick, opcionesEstado, onEstadoChange }) {
    
    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    // Faltaba definir el estado para el spinner de descarga en ESTE componente
    const [downloadingId, setDownloadingId] = useState(null);
    // --- FIN DE LA CORRECCIÓN ---

    // --- AÑADIDA: Función handler para la descarga ---
    const handleDescargar = async (cupon) => {
        setDownloadingId(cupon.id); // Inicia el spinner
        try {
            // Lógica condicional (como en el backend)
            if (cupon.pasarela?.nombre.toLowerCase() === 'pago fácil') {
                // 1. Es Pago Fácil: Descargar el PDF dinámico
                const blob = await descargarCuponPDF(cupon.id);
                handleBlobDownload(blob, `cupon_pago_${cupon.id}.pdf`);
            } else {
                // 2. Es otra pasarela: Abrir el PDF estático de simulación
                // (Asumimos que está en tu carpeta /public)
                window.open('/cupon_ejemplo.pdf', '_blank');
            }
        } catch (error) {
            console.error("Error en handleDescargar:", error);
            // Aquí podrías mostrar una alerta al usuario
            alert(`Error al descargar el cupón: ${error.message}`);
        } finally {
            setDownloadingId(null); // Detiene el spinner
        }
    };
    // --- FIN DE LA FUNCIÓN ---
    
    if (!cupones || cupones.length === 0) {
        return null;
    }

    return (
        <Table striped bordered hover responsive size="sm">
            <thead>
                {/* ... (el <thead> no cambia) ... */}
                <tr>
                    <th># Cupón</th>
                    {isAdminView && (
                        <>
                            <th>Alumno</th>
                            <th>DNI</th>
                            <th>Legajo</th>
                        </>
                    )}
                    <th>Generado</th>
                    <th>Vence</th>
                    <th>Monto</th>
                    <th>Pasarela</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {cupones.map((cupon) => (
                    <tr key={cupon.id}>
                        {/* ... (todas las <td> hasta 'Estado' no cambian) ... */}
                        <td>#{cupon.id}</td>
                        {isAdminView && (
                            <>
                                <td>{cupon.alumno?.nombre_completo || cupon.alumno?.username || 'N/A'}</td>
                                <td>{cupon.alumno?.dni || 'N/A'}</td>
                                <td>{cupon.alumno?.legajo || 'N/A'}</td>
                            </>
                        )}
                        <td>
                            {new Date(cupon.fecha_generacion).toLocaleDateString('es-AR')}
                        </td>
                        <td>
                            {new Date(cupon.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')}
                        </td>
                        <td>
                            ${parseFloat(cupon.monto_total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td>{cupon.pasarela?.nombre || 'N/A'}</td>
                        <td>
                            {isAdminView ? ( 
                                <Form.Select
                                    size="sm"
                                    value={cupon.estado_cupon?.id || ''} 
                                    onChange={(e) => onEstadoChange(cupon.id, e.target.value)}
                                    className={
                                        cupon.estado_cupon?.nombre === 'Activo' ? 'border-success text-success' :
                                        cupon.estado_cupon?.nombre === 'Vencido' ? 'border-danger text-danger' :
                                        cupon.estado_cupon?.nombre === 'Anulado' ? 'border-secondary text-secondary' :
                                        ''
                                    }
                                >
                                    <option value="" disabled>Seleccionar...</option>
                                    {opcionesEstado && opcionesEstado.map(op => (
                                        <option key={op.id} value={op.id}>
                                            {op.nombre}
                                        </option>
                                    ))}
                                </Form.Select>
                            ) : ( 
                                getEstadoCuponBadge(cupon.estado_cupon?.nombre)
                            )}
                        </td>

                        {/* --- INICIO DEL CAMBIO EN <td> ACCIONES --- */}
                        <td>
                            {/* Botón de Descarga (Visible para todos) */}
                            {cupon.url_pdf ? (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleDescargar(cupon)}
                                    disabled={downloadingId === cupon.id} // Deshabilita mientras descarga
                                    title="Descargar PDF"
                                >
                                    {downloadingId === cupon.id ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-download"></i>
                                    )}
                                </Button>
                            ) : (
                                <Button variant="outline-secondary" size="sm" disabled title="PDF no disponible">
                                    <i className="bi bi-download"></i>
                                </Button>
                            )}

                            {/* Botón de Anular (ADMIN) */}
                            {isAdminView && (
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => onAnularClick(cupon.id)}
                                    className="ms-1"
                                    title="Anular Cupón (Admin)"
                                    disabled={cupon.estado_cupon?.nombre === 'Anulado' || cupon.estado_cupon?.nombre === 'Pagado'}
                                >
                                    <i className="bi bi-trash"></i>
                                </Button>
                            )}
                            
                            {/* Botón de Anular (ALUMNO) */}
                            {/* Se muestra si NO es admin Y el cupón está "Activo" */}
                            {!isAdminView && cupon.estado_cupon?.nombre === 'Activo' && (
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => onAnularClick(cupon.id)} // Llama a la prop
                                    className="ms-1"
                                    title="Anular Cupón"
                                >
                                    {/* Un ícono de "cancelar" es más claro que una "papelera" */}
                                    <i className="bi bi-x-lg"></i> 
                                </Button>
                            )}
                        </td>
                        {/* --- FIN DEL CAMBIO --- */}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

export default HistorialCuponesTabla;