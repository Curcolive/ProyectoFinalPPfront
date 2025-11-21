import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Tabs, Tab, ListGroup, Form, Button, Card, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import './MisPagosPage.css';
import HistorialCuponesTabla from '../components/HistorialCuponesTabla';
import { getCuotasPendientes, generarCupon, getHistorialCupones, anularCuponAlumno, getPasarelasDisponibles, descargarCuponPDF, handleBlobDownload } from '../services/cuponesApi';
import { v4 as uuidv4 } from 'uuid';

function MisPagosPage() {
    // --- Estados ---
    const [cuotas, setCuotas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cuotasSeleccionadas, setCuotasSeleccionadas] = useState([]);
    const [pasarelaSeleccionada, setPasarelaSeleccionada] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState(null);
    const [generatedCoupon, setGeneratedCoupon] = useState(null);
    const [cuponExistente, setCuponExistente] = useState(null);
    const [todosLosCupones, setTodosLosCupones] = useState([]);
    const [isLoadingCupones, setIsLoadingCupones] = useState(false);
    const [errorCupones, setErrorCupones] = useState(null);
    const [showAnularModal, setShowAnularModal] = useState(false);
    const [cuponParaAnular, setCuponParaAnular] = useState(null);
    const [isAnulando, setIsAnulando] = useState(false);
    const [anularError, setAnularError] = useState(null);
    const [pasarelas, setPasarelas] = useState([]);
    const [isLoadingPasarelas, setIsLoadingPasarelas] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);

    // --- Effects ---
    const fetchCuotas = async () => {
        try { setIsLoading(true); setError(null); const data = await getCuotasPendientes(); setCuotas(data); }
        catch (err) { setError(err.message || 'Error al cargar cuotas.'); }
        finally { setIsLoading(false); }
    };
    const fetchTodosLosCupones = async () => {
        try { setIsLoadingCupones(true); setErrorCupones(null); const data = await getHistorialCupones(); setTodosLosCupones(data); }
        catch (err) { setErrorCupones(err.message || 'Error historial.'); }
        finally { setIsLoadingCupones(false); }
    };
    const fetchPasarelas = async () => {
        try { setIsLoadingPasarelas(true); const data = await getPasarelasDisponibles(); setPasarelas(data); }
        catch (err) { console.error(err); }
        finally { setIsLoadingPasarelas(false); }
    };

    useEffect(() => { fetchCuotas(); fetchPasarelas(); }, []);

    // --- Handlers ---
    const handleSelectCuota = (cuotaId) => {
        setCuotasSeleccionadas(prev => prev.includes(cuotaId) ? prev.filter(id => id !== cuotaId) : [...prev, cuotaId]);
    };

    const handleGenerarCupon = async () => {
        if (isGenerarDisabled || isGenerating) return;
        setIsGenerating(true); setGenerationError(null); setGeneratedCoupon(null); setCuponExistente(null);
        const key = uuidv4();
        try {
            const result = await generarCupon(cuotasSeleccionadas, key, pasarelaSeleccionada);
            setGeneratedCoupon(result); fetchCuotas(); setCuotasSeleccionadas([]); setPasarelaSeleccionada(''); fetchTodosLosCupones();
        } catch (err) {
            if (err && err.status === 409 && err.cupon_existente) { setGenerationError(null); setCuponExistente(err.cupon_existente); }
            else { setGenerationError(err.message || 'Error al generar.'); }
        } finally { setIsGenerating(false); }
    };

    const handleOpenAnularModal = (id) => { setCuponParaAnular(id); setAnularError(null); setShowAnularModal(true); };
    const handleCloseAnularModal = () => { setShowAnularModal(false); setCuponParaAnular(null); setAnularError(null); setIsAnulando(false); };
    const handleConfirmAnular = async () => {
        setIsAnulando(true); setAnularError(null);
        try { await anularCuponAlumno(cuponParaAnular); handleCloseAnularModal(); fetchTodosLosCupones(); fetchCuotas(); }
        catch (err) { setAnularError(err.message || "Error al anular."); }
        finally { setIsAnulando(false); }
    };

    const handleDescargar = async (cupon) => {
        if (!cupon) return; setDownloadingId(cupon.id);
        try {
            if (cupon.pasarela?.nombre.toLowerCase() === 'pago fácil') {
                const blob = await descargarCuponPDF(cupon.id); handleBlobDownload(blob, `cupon_pago_${cupon.id}.pdf`);
            } else { window.open('/cupon_ejemplo.pdf', '_blank'); }
        } catch (error) { console.error(error); alert(`Error: ${error.message}`); }
        finally { setDownloadingId(null); }
    };

    // --- Cálculos ---
    const totalAPagar = cuotas.filter(c => cuotasSeleccionadas.includes(c.id)).reduce((sum, c) => sum + (typeof c.monto === 'number' ? c.monto : parseFloat(c.monto || 0)), 0);
    const isGenerarDisabled = cuotasSeleccionadas.length === 0 || !pasarelaSeleccionada;

    const getEstadoBadge = (estadoNombre) => {
        // Mantenemos el estilo redondeado (pill) que se ve bien con el diseño nuevo
        switch (estadoNombre) {
            case 'Vencida': return <Badge bg="danger" className="rounded-pill px-3">Vencida</Badge>;
            case 'Pendiente': return <Badge bg="warning" text="dark" className="rounded-pill px-3">Pendiente</Badge>;
            default: return <Badge bg="secondary" className="rounded-pill px-3">{estadoNombre}</Badge>;
        }
    };
    const cuponesActivos = useMemo(() => todosLosCupones.filter(c => c.estado_cupon?.nombre === 'Activo'), [todosLosCupones]);
    const cuponesFinalizados = useMemo(() => todosLosCupones.filter(c => ['Pagado', 'Vencido', 'Anulado'].includes(c.estado_cupon?.nombre)), [todosLosCupones]);

    // --- Renderizado ---
    return (
        <Container fluid>
            {/* TABS con Iconos (Recuperado del código viejo) */}
            <Tabs
                defaultActiveKey="mis-pagos"
                id="subnav-pagos"
                className="mb-3"
                onSelect={(key) => { if ((key === 'mis-cupones' || key === 'historial') && !isLoadingCupones) fetchTodosLosCupones(); }}
            >
                <Tab eventKey="mis-pagos" title={<><i className="bi bi-wallet2 me-2"></i>Mis Pagos</>}>
                    <Row>
                        {/* Columna Izquierda (Lista con estilo viejo de tarjetas) */}
                        <Col md={8} lg={8}>
                            <h4 className="mb-3"><i className="bi bi-list-check me-2"></i>Cuotas Pendientes</h4>
                            <p className="text-muted">Selecciona las cuotas que deseas pagar</p>

                            {isLoading && <div className="text-center my-5"><Spinner animation="border" /></div>}
                            {error && <Alert variant="danger">{error}</Alert>}
                            {!isLoading && !error && cuotas.length === 0 && <Alert variant="info"><i className="bi bi-info-circle-fill me-2"></i>No hay cuotas pendientes.</Alert>}

                            {!isLoading && !error && cuotas.length > 0 && (
                                <ListGroup>
                                    {cuotas.map((cuota) => (
                                        <ListGroup.Item
                                            key={cuota.id}
                                            as="li"
                                            // Combinamos estilos: d-flex para alinear, pero CSS maneja la tarjeta
                                            className={`d-flex justify-content-between align-items-center p-3 ${cuotasSeleccionadas.includes(cuota.id) ? 'active-cuota' : ''}`}
                                            onClick={() => handleSelectCuota(cuota.id)}
                                            action
                                        >
                                            {/* IZQUIERDA: Checkbox y Textos */}
                                            <div className="d-flex align-items-center">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={cuotasSeleccionadas.includes(cuota.id)}
                                                    readOnly
                                                    className="me-3 custom-checkbox"
                                                    style={{ pointerEvents: 'none', transform: 'scale(1.2)' }}
                                                />
                                                <div>
                                                    <div className="fw-bold fs-6 mb-1">{cuota.periodo}</div>
                                                    <small className="text-muted d-flex align-items-center">
                                                        <i className="bi bi-calendar-event me-2"></i>
                                                        Vence: {new Date(cuota.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')}
                                                    </small>
                                                </div>
                                            </div>

                                            {/* DERECHA: Precio y Badge (Alineados como pediste en el paso anterior) */}
                                            <div className="d-flex align-items-center gap-3">
                                                <span className="fw-bold fs-5 text-dark">
                                                    ${parseFloat(cuota.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </span>
                                                <div style={{ minWidth: '90px', textAlign: 'right' }}>
                                                    {getEstadoBadge(cuota.estado_cuota.nombre)}
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </Col>

                        {/* Columna Derecha (Resumen de Pago - MANTENEMOS EL DISEÑO NUEVO) */}
                        <Col md={4} lg={4}>
                            <Card className="shadow-sm mb-3 card-resumen sticky-top" style={{ top: '20px', zIndex: 1 }}>
                                <Card.Body>
                                    <Card.Title as="h5" className="mb-3 text-center border-bottom pb-2">
                                        <i className="bi bi-receipt me-2"></i>Resumen de Pago
                                    </Card.Title>

                                    <div className={`content-wrapper mb-3 ${cuotasSeleccionadas.length > 0 ? 'animate-fade-in' : ''}`}>
                                        {cuotasSeleccionadas.length === 0 ? (
                                            <div className="py-3 text-center">
                                                <div className="icon-placeholder mb-2">
                                                    <i className="bi bi-cart-x" style={{ fontSize: '3rem', color: '#adb5bd' }}></i>
                                                </div>
                                                <p className="mb-1 placeholder-text fw-bold text-muted">Tu carrito está vacío</p>
                                                <small className="placeholder-subtext text-muted">Selecciona una cuota</small>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <p className="total-label mb-0">TOTAL A PAGAR</p>
                                                <h2 className="total-amount my-2" style={{ whiteSpace: 'nowrap' }}>
                                                    ${totalAPagar.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </h2>
                                                <Badge bg="light" text="dark" className="border selection-count">
                                                    <i className="bi bi-check2-circle text-success me-1"></i>
                                                    {cuotasSeleccionadas.length} cuota(s)
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto">
                                        <hr className="my-3" />
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small text-uppercase text-muted"><i className="bi bi-credit-card-2-front me-2"></i>MEDIO DE PAGO</Form.Label>
                                            <Form.Select value={pasarelaSeleccionada} onChange={(e) => setPasarelaSeleccionada(e.target.value)} disabled={cuotasSeleccionadas.length === 0 || isLoadingPasarelas}>
                                                {isLoadingPasarelas ? <option>Cargando...</option> : (
                                                    <>
                                                        <option value="">Seleccionar...</option>
                                                        {pasarelas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                                    </>
                                                )}
                                            </Form.Select>
                                        </Form.Group>

                                        <div className="d-grid">
                                            <Button variant="danger" size="lg" className="btn-generar" disabled={isGenerarDisabled || isGenerating} onClick={handleGenerarCupon}>
                                                {isGenerating ? <><Spinner size="sm" className="me-2" />Procesando...</> : <><i className="bi bi-qr-code me-2"></i>Generar Cupón</>}
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                            {generationError && <Alert variant="danger" className="mt-2">{generationError}</Alert>}
                        </Col>
                    </Row>

                    {/* --- MODAL DE ÉXITO (Diseño NUEVO Moderno/Glow) --- */}
                    <Modal show={!!generatedCoupon} onHide={() => setGeneratedCoupon(null)} centered className="modern-modal modal-success">
                        <Modal.Header closeButton></Modal.Header>
                        <Modal.Body>
                            <div className="modal-icon-wrapper success animate-fade-in">
                                <i className="bi bi-check-lg"></i>
                            </div>
                            <h3 className="mb-3 fw-bold">¡Cupón Generado!</h3>
                            <p className="text-muted mb-4">Tu cupón de pago se ha generado correctamente.<br />¿Deseas descargarlo ahora?</p>
                            <div className="d-grid gap-2 col-10 mx-auto">
                                {generatedCoupon && generatedCoupon.url_pdf && (
                                    <Button variant="success" size="lg" onClick={() => handleDescargar(generatedCoupon)} disabled={downloadingId === generatedCoupon.id} className="shadow-sm">
                                        {downloadingId === generatedCoupon.id ? <><Spinner as="span" animation="border" size="sm" className="me-2" />Descargando...</> : <><i className="bi bi-file-earmark-arrow-down-fill me-2"></i>Descargar PDF</>}
                                    </Button>
                                )}
                                <Button variant="outline-secondary" onClick={() => setGeneratedCoupon(null)}>Cerrar y ver más tarde</Button>
                            </div>
                        </Modal.Body>
                    </Modal>

                    {/* --- MODAL DE ADVERTENCIA (Diseño NUEVO Moderno/Glow) --- */}
                    <Modal show={!!cuponExistente} onHide={() => setCuponExistente(null)} centered className="modern-modal modal-warning">
                        <Modal.Header closeButton></Modal.Header>
                        <Modal.Body>
                            <div className="modal-icon-wrapper warning animate-pulse">
                                <i className="bi bi-exclamation-lg"></i>
                            </div>
                            <h3 className="mb-3 fw-bold">Cupón ya existente</h3>
                            <p className="text-muted">Ya existe un cupón activo que incluye estas cuotas.</p>
                            {cuponExistente && (
                                <div className="info-card-highlight">
                                    <strong>Cupón #{cuponExistente.id}</strong>
                                    <span className="text-danger fw-bold">Vence: {new Date(cuponExistente.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                                    <div className="mt-1 text-muted small">Monto: ${parseFloat(cuponExistente.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
                                </div>
                            )}
                            <div className="d-grid gap-2 col-10 mx-auto">
                                {cuponExistente && (
                                    <Button variant="primary" size="lg" className="shadow-sm" onClick={() => handleDescargar(cuponExistente)}>
                                        <i className="bi bi-eye-fill me-2"></i>Ver Cupón Actual
                                    </Button>
                                )}
                                <Button variant="link" className="text-muted text-decoration-none" onClick={() => setCuponExistente(null)}>Cancelar</Button>
                            </div>
                        </Modal.Body>
                    </Modal>
                </Tab>

                {/* PESTAÑAS con Iconos (Recuperado del código viejo) */}
                <Tab eventKey="mis-cupones" title={<><i className="bi bi-ticket-detailed me-2"></i>Mis Cupones (Activos)</>}>
                    <div className="py-3">
                        <h4 className="mb-4"><i className="bi bi-list-ol me-2"></i>Cupones Activos</h4>
                        {errorCupones && <Alert variant="danger">{errorCupones}</Alert>}
                        {!isLoadingCupones && !errorCupones && cuponesActivos.length === 0 ?
                            <Alert variant="light" className="border text-center py-5">No tienes cupones activos.</Alert> :
                            !isLoadingCupones && !errorCupones && <HistorialCuponesTabla cupones={cuponesActivos} onAnularClick={handleOpenAnularModal} />
                        }
                        {isLoadingCupones && <div className="text-center"><Spinner animation="border" /></div>}
                    </div>
                </Tab>
                <Tab eventKey="historial" title={<><i className="bi bi-clock-history me-2"></i>Historial</>}>
                    <div className="py-3">
                        <h4 className="mb-4"><i className="bi bi-list-ol me-2"></i>Historial de Pagos</h4>
                        {errorCupones && <Alert variant="danger">{errorCupones}</Alert>}
                        {!isLoadingCupones && !errorCupones && cuponesFinalizados.length === 0 ?
                            <Alert variant="light" className="border text-center py-5">No hay historial disponible.</Alert> :
                            !isLoadingCupones && !errorCupones && <HistorialCuponesTabla cupones={cuponesFinalizados} />
                        }
                        {isLoadingCupones && <div className="text-center"><Spinner animation="border" /></div>}
                    </div>
                </Tab>
            </Tabs>

            <Modal show={showAnularModal} onHide={handleCloseAnularModal} centered className="modern-modal modal-danger">
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    {/* Ícono de Basura con animación y fondo rojo suave */}
                    <div className="modal-icon-wrapper danger animate-pulse">
                        <i className="bi bi-trash3-fill"></i>
                    </div>

                    <h3 className="mb-3 fw-bold">¿Anular Cupón?</h3>

                    {anularError && <Alert variant="danger">{anularError}</Alert>}

                    <p className="text-muted mb-4">
                        Estás a punto de anular el cupón <b>#{cuponParaAnular}</b>.
                        <br />
                        <small className="d-block mt-2">
                            Las cuotas se liberarán inmediatamente para que puedas volver a seleccionarlas.
                        </small>
                    </p>

                    <div className="d-grid gap-2 col-10 mx-auto">
                        <Button
                            variant="danger"
                            size="lg"
                            onClick={handleConfirmAnular}
                            disabled={isAnulando}
                            className="shadow-sm"
                        >
                            {isAnulando ? (
                                <><Spinner as="span" animation="border" size="sm" className="me-2" />Anulando...</>
                            ) : (
                                <><i className="bi bi-x-circle me-2"></i>Sí, Anular Cupón</>
                            )}
                        </Button>

                        <Button variant="link" onClick={handleCloseAnularModal}>
                            Cancelar, mantener cupón
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default MisPagosPage;