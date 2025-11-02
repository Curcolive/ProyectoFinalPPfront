import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, ListGroup, Form, Button, Card, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import './MisPagosPage.css'; // Importa los estilos CSS
// --- ¡ASEGÚRATE DE QUE ESTA LÍNEA INCLUYA getHistorialCupones! ---
import HistorialCuponesTabla from '../components/HistorialCuponesTabla';
import { getCuotasPendientes, generarCupon, getHistorialCupones } from '../services/cuponesApi';
// -----------------------------------------------------------------
import { v4 as uuidv4 } from 'uuid'; // Para generar la idempotency key


function MisPagosPage() {
    // --- Estados para manejar los datos y la UI ---
    const [cuotas, setCuotas] = useState([]); // Guarda las cuotas de la API
    const [isLoading, setIsLoading] = useState(true); // Indica si se están cargando las cuotas
    const [error, setError] = useState(null); // Guarda errores al cargar cuotas
    const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState([]); // IDs de cuotas seleccionadas
    const [pasarelaSeleccionada, setPasarelaSeleccionada] = useState(''); // Pasarela elegida
    const [isGenerating, setIsGenerating] = useState(false); // Indica si se está generando el cupón
    const [generationError, setGenerationError] = useState(null); // Guarda errores al generar cupón
    const [generatedCoupon, setGeneratedCoupon] = useState(null); // Guarda datos del cupón generado (para modal éxito)
    const [historialCupones, setHistorialCupones] = useState([]); // Guarda el historial de cupones
    const [isLoadingHistorial, setIsLoadingHistorial] = useState(false); // Carga del historial
    const [errorHistorial, setErrorHistorial] = useState(null); // Error al cargar historial

    // --- Función para cargar las cuotas pendientes desde la API ---
    const fetchCuotas = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCuotasPendientes();
            setCuotas(data);
        } catch (err) {
            setError(err.message || 'Ocurrió un error al cargar las cuotas.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Función para cargar el historial de cupones desde la API ---
    const fetchHistorial = async () => {
        try {
            setIsLoadingHistorial(true);
            setErrorHistorial(null);
            const data = await getHistorialCupones(); // Llama a la función importada
            setHistorialCupones(data);
        } catch (err) {
            setErrorHistorial(err.message || 'Ocurrió un error al cargar el historial.');
        } finally {
            setIsLoadingHistorial(false);
        }
    };


    // --- useEffect para cargar cuotas pendientes al inicio ---
    useEffect(() => {
        fetchCuotas(); // Carga las cuotas al montar el componente
    }, []); // Se ejecuta solo una vez

    // --- Handlers para interacciones del usuario ---
    const handleSelectCuota = (cuotaId) => {
        setCuotasSeleccionadas(prev =>
            prev.includes(cuotaId)
                ? prev.filter(id => id !== cuotaId)
                : [...prev, cuotaId]
        );
    };

    const handleGenerarCupon = async () => {
        if (isGenerarDisabled || isGenerating) return;

        setIsGenerating(true);
        setGenerationError(null);
        setGeneratedCoupon(null);

        const key = uuidv4();

        try {
            const result = await generarCupon(cuotasSeleccionadas, key);
            setGeneratedCoupon(result);
            fetchCuotas(); // Recarga cuotas pendientes
            setCuotasSeleccionadas([]);
            setPasarelaSeleccionada('');
            // Opcional: También podríamos recargar el historial si quisiéramos
            // fetchHistorial();
        } catch (err) {
            if (err.message && err.message.includes('409')) {
                setGenerationError("ADVERTENCIA: Una o más de las cuotas seleccionadas ya tienen un cupón activo. No se generó uno nuevo.");
            } else {
                setGenerationError(err.message || 'Ocurrió un error al generar el cupón.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Cálculos derivados del estado ---
    const totalAPagar = cuotas
        .filter(c => cuotasSeleccionadas.includes(c.id))
        .reduce((sum, c) => sum + (typeof c.monto === 'number' ? c.monto : parseFloat(c.monto || 0)), 0);

    const isGenerarDisabled = cuotasSeleccionadas.length === 0 || !pasarelaSeleccionada;

    // --- Función auxiliar para los Badges de estado ---
    const getEstadoBadge = (estadoNombre) => {
        switch (estadoNombre) {
            case 'Vencida': return <Badge bg="danger">Vencida</Badge>;
            case 'Pendiente': return <Badge bg="warning" text="dark">Pendiente</Badge>;
            default: return <Badge bg="secondary">{estadoNombre}</Badge>;
        }
    };


    // --- Renderizado del Componente ---
    return (
        <Container fluid>
            {/* 1. Sub-Navegación con Pestañas */}
            <Tabs
                defaultActiveKey="mis-pagos"
                id="subnav-pagos"
                className="mb-3"
                onSelect={(key) => {
                    // Carga el historial solo la primera vez que se selecciona la pestaña y si no está cargando ya
                    if (key === 'mis-cupones' && historialCupones.length === 0 && !isLoadingHistorial) {
                        fetchHistorial();
                    }
                }}
            >
                {/* Pestaña Mis Pagos */}
                <Tab eventKey="mis-pagos" title={<><i className="bi bi-wallet2 me-2"></i>Mis Pagos</>}>
                    <Row>
                        {/* Columna Izquierda: Lista de Cuotas */}
                        <Col md={9}>
                            <h4><i className="bi bi-list-check me-2"></i>Cuotas Pendientes</h4>
                            <p className="text-muted">Selecciona las cuotas que deseas pagar</p>
                            {isLoading && ( <div className="text-center my-5"><Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner><p className="mt-2">Cargando cuotas...</p></div> )}
                            {error && ( <Alert variant="danger"><Alert.Heading><i className="bi bi-exclamation-octagon-fill me-2"></i>Error</Alert.Heading><p>{error}</p><hr /><p className="mb-0">Revisa la conexión o contacta soporte.</p></Alert> )}
                            {!isLoading && !error && cuotas.length === 0 && ( <Alert variant="info"><i className="bi bi-info-circle-fill me-2"></i>No hay cuotas pendientes.</Alert> )}
                            {!isLoading && !error && cuotas.length > 0 && (
                                <ListGroup>
                                    {cuotas.map((cuota) => (
                                        <ListGroup.Item key={cuota.id} as="li" className={`d-flex justify-content-between align-items-center ${cuotasSeleccionadas.includes(cuota.id) ? 'active-cuota' : ''}`} onClick={() => handleSelectCuota(cuota.id)} action>
                                            <Form.Check type="checkbox" id={`cuota-${cuota.id}`} checked={cuotasSeleccionadas.includes(cuota.id)} onChange={() => {}} aria-label={`Seleccionar ${cuota.periodo}`} className="me-3 flex-shrink-0" style={{ pointerEvents: 'none' }} />
                                            <div className="ms-2 me-auto">
                                                <div className="fw-bold">{cuota.periodo}</div>
                                                <small className="text-muted"><i className="bi bi-calendar-event me-1"></i>Vence: {new Date(cuota.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</small>
                                            </div>
                                            <span className="me-3 fw-bold">${(typeof cuota.monto === 'number' ? cuota.monto : parseFloat(cuota.monto || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            {getEstadoBadge(cuota.estado_cuota.nombre)}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Col> {/* Fin Col Izquierda */}

                        {/* Columna Derecha: Resumen */}
                        <Col md={3}>
                            <Card className="shadow-sm mb-3 card-resumen">
                                <Card.Body>
                                    <Card.Title as="h5"><i className="bi bi-receipt me-2"></i>Resumen de Pago</Card.Title>
                                    <hr />
                                    <div className={`content-wrapper ${cuotasSeleccionadas.length > 0 ? 'selected-content' : ''}`}>
                                        {cuotasSeleccionadas.length === 0 ? (
                                            <div className="py-3 text-center">
                                                <div className="icon-placeholder"><i className="bi bi-cash-coin"></i></div>
                                                <p className="mb-1 placeholder-text">No hay cuotas seleccionadas</p>
                                                <small className="placeholder-subtext">Selecciona al menos una cuota</small>
                                            </div>
                                        ) : (
                                            <div className="py-2 text-center">
                                                <p className="total-label"><small>Total a Pagar</small></p>
                                                <h2 className="total-amount mb-2">${totalAPagar.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                                                <p className="mb-0 selection-count"><small><i className="bi bi-check-circle me-1"></i>{cuotasSeleccionadas.length} cuota(s)</small></p>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Pasarela y Botón */}
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold"><i className="bi bi-credit-card-2-front me-2"></i>Pasarela</Form.Label>
                                <Form.Select value={pasarelaSeleccionada} onChange={(e) => setPasarelaSeleccionada(e.target.value)} required disabled={cuotasSeleccionadas.length === 0}>
                                    <option value="">Seleccionar...</option>
                                    <option value="pago_facil">Pago Fácil</option>
                                    <option value="macro_click">Macro Click</option>
                                </Form.Select>
                            </Form.Group>
                            <div className="d-grid">
                                <Button variant="success" size="lg" disabled={isGenerarDisabled || isGenerating} onClick={handleGenerarCupon}>
                                    {isGenerating ? (<><Spinner size="sm" className="me-2"/>Generando...</>) : (<><i className="bi bi-file-earmark-arrow-down me-2"></i>Generar Cupón</>)}
                                </Button>
                            </div>
                            {isGenerarDisabled && cuotasSeleccionadas.length === 0 && (<small className="text-danger d-block mt-2"><i className="bi bi-exclamation-triangle me-1"></i>Selecciona cuota(s).</small>)}
                            {isGenerarDisabled && cuotasSeleccionadas.length > 0 && !pasarelaSeleccionada && (<small className="text-danger d-block mt-2"><i className="bi bi-exclamation-triangle me-1"></i>Selecciona pasarela.</small>)}
                            {generationError && (<Alert variant={generationError.startsWith('ADVERTENCIA') ? 'warning' : 'danger'} className="mt-3" onClose={() => setGenerationError(null)} dismissible><Alert.Heading>{generationError.startsWith('ADVERTENCIA') ? 'Advertencia' : 'Error'}</Alert.Heading>{generationError}</Alert>)}

                            {/* Modal de Éxito */}
                            <Modal show={!!generatedCoupon} onHide={() => setGeneratedCoupon(null)} centered>
                                <Modal.Header closeButton className="bg-success text-white"><Modal.Title><i className="bi bi-check-circle-fill me-2"></i>Éxito!</Modal.Title></Modal.Header>
                                <Modal.Body>
                                    <p className="lead">Cupón generado.</p>
                                    {generatedCoupon && ( <div className="mt-3"><p><strong>Nro:</strong> <Badge bg="secondary">{generatedCoupon.id}</Badge></p><p><strong>Monto:</strong> ${parseFloat(generatedCoupon.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p><p><strong>Vence:</strong> {new Date(generatedCoupon.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>{generatedCoupon.url_pdf && (<div className="d-grid mt-4"><Button variant="primary" href={generatedCoupon.url_pdf} target="_blank" rel="noopener noreferrer" size="lg"><i className="bi bi-download me-2"></i>Descargar PDF</Button></div>)}</div>)}
                                </Modal.Body>
                                <Modal.Footer><Button variant="secondary" onClick={() => setGeneratedCoupon(null)}>Cerrar</Button></Modal.Footer>
                            </Modal>
                        </Col> {/* Fin Col Derecha */}
                    </Row> {/* Fin Row */}
                </Tab> {/* Fin Tab Mis Pagos */}

                {/* Pestaña Mis Cupones */}
                <Tab eventKey="mis-cupones" title={<><i className="bi bi-ticket-detailed me-2"></i>Mis Cupones</>}>
                    <h4><i className="bi bi-list-ol me-2"></i>Cupones Generados</h4>
                    {isLoadingHistorial && ( <div className="text-center my-5"><Spinner animation="border" role="status" /><p className="mt-2">Cargando historial...</p></div> )}
                    {errorHistorial && ( <Alert variant="danger">Error al cargar: {errorHistorial}</Alert> )}
                    {!isLoadingHistorial && !errorHistorial && historialCupones.length === 0 && ( <Alert variant="info">No has generado cupones.</Alert> )}
                    {!isLoadingHistorial && !errorHistorial && historialCupones.length > 0 && ( <HistorialCuponesTabla cupones={historialCupones} /> /* TODO: Tabla */ )}
                </Tab>

                {/* Pestaña Historial */}
                <Tab eventKey="historial" title={<><i className="bi bi-clock-history me-2"></i>Historial</>}>
                    <Alert variant="info">Contenido de Historial (próximamente)...</Alert>
                </Tab>
            </Tabs> {/* Fin Tabs */}
        </Container> /* Fin Container */
    ); /* Fin return */
} // Fin componente MisPagosPage

export default MisPagosPage;