import React from 'react';
import { Table, Badge, Button, Form } from 'react-bootstrap';

// Función auxiliar para los Badges de estado del cupón
const getEstadoCuponBadge = (estadoNombre) => {
    switch (estadoNombre) {
        case 'Activo': return <Badge bg="success">Activo</Badge>;
        case 'Vencido': return <Badge bg="danger">Vencido</Badge>;
        case 'Pagado': return <Badge bg="info">Pagado</Badge>;
        case 'Anulado': return <Badge bg="secondary">Anulado</Badge>;
        default: return <Badge bg="light" text="dark">{estadoNombre || 'Desconocido'}</Badge>;
    }
};

// --- CORRECCIÓN 1: Recibe 'onAnularClick' como prop ---
function HistorialCuponesTabla({ cupones, isAdminView = false, onAnularClick, opcionesEstado, onEstadoChange }) {
    if (!cupones || cupones.length === 0) {
        return null;
    }

    return (
        <Table striped bordered hover responsive size="sm">
            <thead>
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
                        {isAdminView ? ( // Si es admin, muestra un Dropdown
                            <Form.Select
                                size="sm"
                                value={cupon.estado_cupon?.id || ''} // El ID del estado actual
                                onChange={(e) => onEstadoChange(cupon.id, e.target.value)}
                                // Cambia el color del select según el estado
                                className={
                                    cupon.estado_cupon?.nombre === 'Activo' ? 'border-success text-success' :
                                    cupon.estado_cupon?.nombre === 'Vencido' ? 'border-danger text-danger' :
                                    cupon.estado_cupon?.nombre === 'Anulado' ? 'border-secondary text-secondary' :
                                    ''
                                }
                            >
                                {/* Mapea las opciones de estado recibidas como props */}
                                <option value="" disabled>Seleccionar...</option>
                                {opcionesEstado && opcionesEstado.map(op => (
                                    <option key={op.id} value={op.id}>
                                        {op.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        ) : ( // Si es vista de alumno, muestra solo el Badge
                            getEstadoCuponBadge(cupon.estado_cupon?.nombre)
                        )}
                    </td>
                        <td>
                            {cupon.url_pdf ? (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    href={cupon.url_pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Descargar PDF"
                                >
                                    <i className="bi bi-download"></i>
                                </Button>
                            ) : (
                                <Button variant="outline-secondary" size="sm" disabled title="PDF no disponible">
                                     <i className="bi bi-download"></i>
                                 </Button>
                            )}
                            {isAdminView && (
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    // --- CORRECCIÓN 2: Llama a la función del prop ---
                                    onClick={() => onAnularClick(cupon.id)}
                                    // ----------------------------------------------
                                    className="ms-1"
                                    title="Anular Cupón"
                                    disabled={cupon.estado_cupon?.nombre === 'Anulado' || cupon.estado_cupon?.nombre === 'Pagado'}
                                >
                                    <i className="bi bi-trash"></i>
                                </Button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

export default HistorialCuponesTabla;