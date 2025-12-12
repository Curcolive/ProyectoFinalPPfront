import React, { useState } from 'react';
import { Table, Badge, Button, Form, Spinner, Card } from 'react-bootstrap';
import { descargarCuponPDF, handleBlobDownload } from '../services/cuponesApi';
import './HistorialCuponesTabla.css';

const HistorialCuponesTabla = ({ cupones, isAdminView = false, onAnularClick, opcionesEstado, onEstadoChange }) => {

    const [downloadingId, setDownloadingId] = useState(null);
    // Estado para controlar qué filas tienen el selector de estado desbloqueado
    const [unlockedRows, setUnlockedRows] = useState({});

    const toggleLock = (id) => {
        setUnlockedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleDescargar = async (cupon) => {
        setDownloadingId(cupon.id);
        try {
            if (cupon.pasarela?.nombre.toLowerCase() === 'pago fácil') {
                const blob = await descargarCuponPDF(cupon.id);
                handleBlobDownload(blob, `cupon_pago_${cupon.id}.pdf`);
            } else {
                window.open('/cupon_ejemplo.pdf', '_blank');
            }
        } catch (error) {
            console.error("Error en handleDescargar:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setDownloadingId(null);
        }
    };

    const getVariant = (estado) => {
        switch (estado) {
            case 'Activo': return 'success';
            case 'Pagado': return 'info';
            case 'Vencido':
            case 'Vencida': return 'danger';
            case 'Anulado': return 'secondary';
            default: return 'light';
        }
    };

    if (!cupones || cupones.length === 0) return null;

    return (
        <Card className="shadow-sm overflow-auto table-card-container">
            <Table responsive hover className="mb-0 align-middle modern-table">
                <thead>
                    <tr>
                        <th className="ps-4 col-id"># Cupón</th>
                        {isAdminView && (
                            <>
                                <th className="col-date">Nombre</th>
                                <th className="col-date">Apellido</th>
                                <th className="col-id">DNI</th>
                                <th className="col-id">Legajo</th>
                            </>
                        )}
                        <th className="col-date">Generado</th>
                        <th className="col-date">Vence</th>
                        <th className="ps-4 col-monto">Monto</th>
                        <th className="ps-5 col-pasarela">Pasarela</th>
                        <th className="text-center col-estado">Estado</th>
                        <th className="text-end pe-4 col-acciones">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cupones.map((cupon) => {
                        const variant = getVariant(cupon.estado_cupon?.nombre);
                        const isUnlocked = unlockedRows[cupon.id];

                        return (
                            <tr key={cupon.id}>
                                <td className="ps-4 fw-bold text-secondary">#{cupon.id}</td>

                                {isAdminView && (
                                    <>
                                        <td>{cupon.alumno?.first_name || cupon.alumno?.nombre_completo?.split(' ')[0] || 'N/A'}</td>
                                        <td>{cupon.alumno?.last_name || cupon.alumno?.nombre_completo?.split(' ').slice(1).join(' ') || 'N/A'}</td>
                                        <td>{cupon.alumno?.dni || 'N/A'}</td>
                                        <td>{cupon.alumno?.legajo || 'N/A'}</td>
                                    </>
                                )}

                                <td className="text-muted">
                                    <i className="bi bi-calendar3 me-2 small-icon"></i>
                                    {new Date(cupon.fecha_generacion).toLocaleDateString('es-AR')}
                                </td>

                                <td className={cupon.estado_cupon?.nombre === 'Vencido' || cupon.estado_cupon?.nombre === 'Vencida' ? 'text-danger fw-bold' : 'text-muted'}>
                                    <i className="bi bi-calendar-event me-2 small-icon"></i>
                                    {new Date(cupon.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')}
                                </td>

                                <td className="ps-4 fw-bold text-dark fs-6">
                                    ${parseFloat(cupon.monto_total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    {cupon.es_pago_parcial && (
                                        <Badge bg="warning" text="dark" className="ms-2 rounded-pill" style={{ fontSize: '0.7em' }}>
                                            <i className="bi bi-pie-chart-fill me-1"></i>Parcial
                                        </Badge>
                                    )}
                                </td>

                                <td className="ps-5">
                                    <span className="fw-semibold text-dark-emphasis">{cupon.pasarela?.nombre || 'N/A'}</span>
                                </td>

                                <td className="text-center">
                                    {isAdminView ? (
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            {/* Icono de Candado */}
                                            <i
                                                className={`bi ${isUnlocked ? 'bi-unlock-fill text-primary' : 'bi-lock-fill text-secondary'} lock-icon`}
                                                onClick={() => toggleLock(cupon.id)}
                                                title={isUnlocked ? "Bloquear edición" : "Desbloquear para editar"}
                                                style={{ cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s' }}
                                            ></i>

                                            {/* Selector de Estado */}
                                            <Form.Select
                                                size="sm"
                                                value={cupon.estado_cupon?.id || ''}
                                                onChange={(e) => onEstadoChange(cupon.id, e.target.value)}
                                                className={`status-select select-variant-${variant}`}
                                                disabled={!isUnlocked}
                                                style={{ opacity: isUnlocked ? 1 : 0.7 }}
                                            >
                                                <option value="" disabled>...</option>
                                                {opcionesEstado && opcionesEstado.map(op => (
                                                    <option key={op.id} value={op.id}>{op.nombre}</option>
                                                ))}
                                            </Form.Select>
                                        </div>
                                    ) : (
                                        // VISTA ALUMNO: Badge
                                        <Badge bg={variant} className="status-pill">
                                            {cupon.estado_cupon?.nombre}
                                        </Badge>
                                    )}
                                </td>

                                <td className="text-end pe-4">
                                    <div className="d-flex justify-content-end gap-2">
                                        {/* Botón PDF: Siempre visible si hay URL */}
                                        {cupon.url_pdf ? (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="action-btn-icon"
                                                onClick={() => handleDescargar(cupon)}
                                                disabled={downloadingId === cupon.id}
                                                title="Descargar PDF"
                                            >
                                                {downloadingId === cupon.id ? <Spinner animation="border" size="sm" /> : <i className="bi bi-file-earmark-arrow-down"></i>}
                                            </Button>
                                        ) : (
                                            <Button variant="outline-secondary" size="sm" className="action-btn-icon" disabled><i className="bi bi-file-earmark-x"></i></Button>
                                        )}

                                        {/* Botón Anular: 
                                            - ADMIN: Siempre visible (isAdminView = true)
                                            - ALUMNO: Solo si está 'Activo' 
                                        */}
                                        {(isAdminView || (cupon.estado_cupon?.nombre === 'Activo')) && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                className="action-btn-icon"
                                                onClick={() => onAnularClick(cupon.id)}
                                                title="Anular Cupón"
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </Card>
    );
}

export default HistorialCuponesTabla;