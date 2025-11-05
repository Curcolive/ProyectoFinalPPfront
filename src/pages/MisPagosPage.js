import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Tabs, Tab, ListGroup, Form, Button, Card, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import './MisPagosPage.css';
import HistorialCuponesTabla from '../components/HistorialCuponesTabla';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { getCuotasPendientes, generarCupon, getHistorialCupones, anularCuponAlumno, getPasarelasDisponibles, descargarCuponPDF, handleBlobDownload } from '../services/cuponesApi';
import { v4 as uuidv4 } from 'uuid';


function MisPagosPage() {
    // --- (Estados... sin cambios) ---
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

    // --- (Funciones fetch... sin cambios) ---
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
    const fetchTodosLosCupones = async () => {
        try {
            setIsLoadingCupones(true);
            setErrorCupones(null);
            const data = await getHistorialCupones();
            setTodosLosCupones(data);
        } catch (err) {
            setErrorCupones(err.message || 'Ocurrió un error al cargar el historial.');
        } finally {
            setIsLoadingCupones(false);
        }
    };

    const fetchPasarelas = async () => {
        try {
            setIsLoadingPasarelas(true);
            const data = await getPasarelasDisponibles();
            setPasarelas(data);
        } catch (err) {
            console.error(err); // Solo loguea el error
        } finally {
            setIsLoadingPasarelas(false);
        }
    };

    useEffect(() => {
        fetchCuotas();
        fetchPasarelas();
    }, []);

    // --- (Handlers... sin cambios) ---
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
        setCuponExistente(null);
        const key = uuidv4();
        try {
            const result = await generarCupon(cuotasSeleccionadas, key, pasarelaSeleccionada);
            setGeneratedCoupon(result);
            fetchCuotas();
            setCuotasSeleccionadas([]);
            setPasarelaSeleccionada('');
            fetchTodosLosCupones();
        } catch (err) {
            if (err && err.status === 409 && err.cupon_existente) {
                setGenerationError(null);
                setCuponExistente(err.cupon_existente);
            } else {
                setGenerationError(err.message || 'Ocurrió un error al generar el cupón.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenAnularModal = (id) => {
        setCuponParaAnular(id);
        setAnularError(null);
        setShowAnularModal(true);
    };

    const handleCloseAnularModal = () => {
        setShowAnularModal(false);
        setCuponParaAnular(null);
        setAnularError(null);
        setIsAnulando(false);
    };

    const handleConfirmAnular = async () => {
        setIsAnulando(true);
        setAnularError(null);
        try {
            await anularCuponAlumno(cuponParaAnular);
            handleCloseAnularModal();
            fetchTodosLosCupones();
            fetchCuotas();
        } catch (err) {
            setAnularError(err.message || "Error desconocido al anular.");
        } finally {
            setIsAnulando(false);
        }
    };

    const handleDescargar = async (cupon) => {
        if (!cupon) return;
        setDownloadingId(cupon.id); // Inicia el spinner
        try {
            if (cupon.pasarela?.nombre.toLowerCase() === 'pago fácil') {
                const blob = await descargarCuponPDF(cupon.id);
                handleBlobDownload(blob, `cupon_pago_${cupon.id}.pdf`);
            } else {
                window.open('/cupon_ejemplo.pdf', '_blank');
            }
        } catch (error) {
            console.error("Error en handleDescargar:", error);
            alert(`Error al descargar el cupón: ${error.message}`);
        } finally {
            setDownloadingId(null); // Detiene el spinner
        }
    };

    // --- (Cálculos y Memos... sin cambios) ---
    const totalAPagar = cuotas
        .filter(c => cuotasSeleccionadas.includes(c.id))
        .reduce((sum, c) => sum + (typeof c.monto === 'number' ? c.monto : parseFloat(c.monto || 0)), 0);
    const isGenerarDisabled = cuotasSeleccionadas.length === 0 || !pasarelaSeleccionada;
    const getEstadoBadge = (estadoNombre) => {
        switch (estadoNombre) {
            case 'Vencida': return <Badge bg="danger">Vencida</Badge>;
            case 'Pendiente': return <Badge bg="warning" text="dark">Pendiente</Badge>;
            default: return <Badge bg="secondary">{estadoNombre}</Badge>;
        }
    };
    const cuponesActivos = useMemo(() => {
        return todosLosCupones.filter(c => c.estado_cupon?.nombre === 'Activo');
    }, [todosLosCupones]);
    const cuponesFinalizados = useMemo(() => {
        return todosLosCupones.filter(c =>
            c.estado_cupon?.nombre === 'Pagado' ||
            c.estado_cupon?.nombre === 'Vencido' ||
            c.estado_cupon?.nombre === 'Anulado'
        );
    }, [todosLosCupones]);


    // --- Renderizado ---
    return (
        <Container fluid>
            <Tabs
                defaultActiveKey="mis-pagos"
                id="subnav-pagos"
                className="mb-3"
                // --- INICIO DE LA CORRECCIÓN ---
                onSelect={(key) => {
                    // Si el usuario hace clic en "Mis Cupones" O "Historial",
                    // recarga los datos SIEMPRE, sin importar si la lista está llena o no.
                    // Esto garantiza datos frescos después de un cambio de usuario (admin -> alumno).
                    if ((key === 'mis-cupones' || key === 'historial') && !isLoadingCupones) {
                        fetchTodosLosCupones();
                    }
                }}
            // --- FIN DE LA CORRECCIÓN ---
            >
                {/* === PESTAÑA "MIS PAGOS" === */}
                <Tab eventKey="mis-pagos" title={<><i className="bi bi-wallet2 me-2"></i>Mis Pagos</>}>
                    <Row>
                        {/* Columna Izquierda (Lista de Cuotas) */}
                        <Col md={9}>
                            <h4><i className="bi bi-list-check me-2"></i>Cuotas Pendientes</h4>
                            <p className="text-muted">Selecciona las cuotas que deseas pagar</p>
                            {isLoading && (<div className="text-center my-5"><Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner><p className="mt-2">Cargando cuotas...</p></div>)}
                            {error && (<Alert variant="danger"><Alert.Heading><i className="bi bi-exclamation-octagon-fill me-2"></i>Error</Alert.Heading><p>{error}</p><hr /><p className="mb-0">Revisa la conexión o contacta soporte.</p></Alert>)}
                            {!isLoading && !error && cuotas.length === 0 && (<Alert variant="info"><i className="bi bi-info-circle-fill me-2"></i>No hay cuotas pendientes.</Alert>)}
                            {!isLoading && !error && cuotas.length > 0 && (
                                <ListGroup>
                                    {cuotas.map((cuota) => (
                                        <ListGroup.Item key={cuota.id} as="li" className={`d-flex justify-content-between align-items-center ${cuotasSeleccionadas.includes(cuota.id) ? 'active-cuota' : ''}`} onClick={() => handleSelectCuota(cuota.id)} action>
                                            <Form.Check type="checkbox" id={`cuota-${cuota.id}`} checked={cuotasSeleccionadas.includes(cuota.id)} onChange={() => { }} aria-label={`Seleccionar ${cuota.periodo}`} className="me-3 flex-shrink-0" style={{ pointerEvents: 'none' }} />
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
                        </Col>

                        {/* Columna Derecha (Resumen y Modales) */}
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

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold"><i className="bi bi-credit-card-2-front me-2"></i>Pasarela</Form.Label>
                                <Form.Select
                                    value={pasarelaSeleccionada}
                                    onChange={(e) => setPasarelaSeleccionada(e.target.value)}
                                    required
                                    // Deshabilita si no hay cuotas o si están cargando pasarelas
                                    disabled={cuotasSeleccionadas.length === 0 || isLoadingPasarelas}
                                >
                                    {/* Muestra un estado de carga */}
                                    {isLoadingPasarelas ? (
                                        <option value="">Cargando pasarelas...</option>
                                    ) : (
                                        <>
                                            <option value="">Seleccionar...</option>
                                            {/* Mapea las pasarelas desde el estado */}
                                            {pasarelas.map((p) => (
                                                <option key={p.id} value={p.id}>{p.nombre}</option>
                                            ))}
                                            {/* Si no cargó ninguna, muestra un error */}
                                            {pasarelas.length === 0 && (
                                                <option value="" disabled>Error al cargar</option>
                                            )}
                                        </>
                                    )}
                                </Form.Select>
                            </Form.Group>
                            <div className="d-grid">
                                <Button variant="success" size="lg" disabled={isGenerarDisabled || isGenerating} onClick={handleGenerarCupon}>
                                    {isGenerating ? (<><Spinner size="sm" className="me-2" />Generando...</>) : (<><i className="bi bi-file-earmark-arrow-down me-2"></i>Generar Cupón</>)}
                                </Button>
                            </div>
                            {isGenerarDisabled && cuotasSeleccionadas.length === 0 && (<small className="text-danger d-block mt-2"><i className="bi bi-exclamation-triangle me-1"></i>Selecciona cuota(s).</small>)}
                            {isGenerarDisabled && cuotasSeleccionadas.length > 0 && !pasarelaSeleccionada && (<small className="text-danger d-block mt-2"><i className="bi bi-exclamation-triangle me-1"></i>Selecciona pasarela.</small>)}

                            {generationError && (<Alert variant={'danger'} className="mt-3" onClose={() => setGenerationError(null)} dismissible><Alert.Heading>Error</Alert.Heading>{generationError}</Alert>)}

                            {/* Modal de Éxito */}
                            <Modal show={!!generatedCoupon} onHide={() => setGeneratedCoupon(null)} centered>
                                <Modal.Header closeButton className="bg-success text-white"><Modal.Title><i className="bi bi-check-circle-fill me-2"></i>Éxito!</Modal.Title></Modal.Header>
                                <Modal.Body>
                                    <p className="lead">Cupón generado.</p>
                                    {generatedCoupon && (<div className="mt-3"><p><strong>Nro:</strong> <Badge bg="secondary">{generatedCoupon.id}</Badge></p><p><strong>Monto:</strong> ${parseFloat(generatedCoupon.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p><p><strong>Vence:</strong> {new Date(generatedCoupon.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>{generatedCoupon.url_pdf && (<div className="d-grid mt-4">
                                        <Button
                                            variant="primary"
                                            // --- CAMBIO: de href a onClick ---
                                            onClick={() => handleDescargar(generatedCoupon)}
                                            disabled={downloadingId === generatedCoupon.id}
                                            size="lg"
                                        >
                                            {downloadingId === generatedCoupon.id ? (
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                            ) : (
                                                <i className="bi bi-download me-2"></i>
                                            )}
                                            Descargar PDF
                                        </Button>
                                    </div>)}</div>)}
                                </Modal.Body>
                                <Modal.Footer><Button variant="secondary" onClick={() => setGeneratedCoupon(null)}>Cerrar</Button></Modal.Footer>
                            </Modal>

                            {/* Modal de Advertencia (RF-07) */}
                            <Modal show={!!cuponExistente} onHide={() => setCuponExistente(null)} centered>
                                <Modal.Header closeButton className="bg-warning text-dark">
                                    <Modal.Title><i className="bi bi-exclamation-triangle-fill me-2"></i>Cupón Ya Generado</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Alert variant="warning" className="lead">
                                        <i className="bi bi-info-circle-fill me-2"></i>
                                        ¡Atención!
                                    </Alert>
                                    <p>
                                        Una o más de las cuotas que seleccionaste **ya están incluidas en el siguiente cupón activo**.
                                    </p>
                                    <p className="text-muted">
                                        Para evitar pagos duplicados, no se puede generar un nuevo cupón.
                                        Por favor, utiliza el cupón existente para abonar.
                                    </p>

                                    {cuponExistente && (
                                        <div className="mt-3 p-3 bg-light rounded border">
                                            <p><strong>Nro. Cupón Existente:</strong> <Badge bg="secondary">{cuponExistente.id}</Badge></p>
                                            <p><strong>Monto Total del Cupón:</strong> ${parseFloat(cuponExistente.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                            <p className="mb-0"><strong>Vence:</strong> {new Date(cuponExistente.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                                            {cuponExistente.url_pdf && (
                                                <div className="d-grid mt-4">
                                                    <Button
                                                        variant="primary"
                                                        // --- CAMBIO: de href a onClick ---
                                                        onClick={() => handleDescargar(cuponExistente)}
                                                        disabled={downloadingId === cuponExistente.id}
                                                        size="lg"
                                                    >
                                                        {downloadingId === cuponExistente.id ? (
                                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                        ) : (
                                                            <i className="bi bi-download me-2"></i>
                                                        )}
                                                        Descargar Cupón Existente
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={() => setCuponExistente(null)}>Cerrar</Button>
                                </Modal.Footer>
                            </Modal>
                        </Col>
                    </Row>
                </Tab>

                {/* === PESTAÑA "MIS CUPONES" === */}
                <Tab eventKey="mis-cupones" title={<><i className="bi bi-ticket-detailed me-2"></i>Mis Cupones (Activos)</>}>
                    <h4><i className="bi bi-list-ol me-2"></i>Cupones Activos Pendientes de Pago</h4>
                    {isLoadingCupones && (<div className="text-center my-5"><Spinner animation="border" role="status" /><p className="mt-2">Cargando cupones...</p></div>)}
                    {errorCupones && (<Alert variant="danger">Error al cargar: {errorCupones}</Alert>)}
                    {!isLoadingCupones && !errorCupones && cuponesActivos.length === 0 && (
                        <Alert variant="info">No tienes cupones activos generados.</Alert>
                    )}
                    {!isLoadingCupones && !errorCupones && cuponesActivos.length > 0 && (
                        <HistorialCuponesTabla
                            cupones={cuponesActivos}
                            onAnularClick={handleOpenAnularModal}
                        />
                    )}
                </Tab>

                {/* === PESTAÑA "HISTORIAL" === */}
                <Tab eventKey="historial" title={<><i className="bi bi-clock-history me-2"></i>Historial</>}>
                    <h4><i className="bi bi-list-ol me-2"></i>Historial de Cupones (Pagados, Vencidos)</h4>
                    {isLoadingCupones && (<div className="text-center my-5"><Spinner animation="border" role="status" /><p className="mt-2">Cargando historial...</p></div>)}
                    {errorCupones && (<Alert variant="danger">Error al cargar: {errorCupones}</Alert>)}
                    {!isLoadingCupones && !errorCupones && cuponesFinalizados.length === 0 && (
                        <Alert variant="info">No se encontraron cupones en tu historial (pagados, vencidos o anulados).</Alert>
                    )}
                    {!isLoadingCupones && !errorCupones && cuponesFinalizados.length > 0 && (
                        <HistorialCuponesTabla cupones={cuponesFinalizados} />
                    )}
                </Tab>
            </Tabs>

            {/* === Modal de Confirmación de Anulación === */}
            <ConfirmDeleteModal
                show={showAnularModal}
                handleClose={handleCloseAnularModal}
                handleConfirm={handleConfirmAnular}
                title="Confirmar Anulación"
                body={
                    <>
                        {anularError && <Alert variant="danger">{anularError}</Alert>}
                        <p>¿Estás seguro de que deseas anular el cupón **#{cuponParaAnular}**?</p>
                        <p className="text-muted">
                            Esta acción no se puede deshacer. Las cuotas asociadas volverán a estar disponibles para pagar.
                        </p>
                    </>
                }
                isDeleting={isAnulando}
                confirmText="Sí, anular cupón"
                confirmVariant="danger"
            />
        </Container>
    );
}

export default MisPagosPage;