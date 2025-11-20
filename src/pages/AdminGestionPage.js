import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form, Button, InputGroup } from 'react-bootstrap';
import { getAdminCupones, anularCuponAdmin, updateCuponEstado } from '../services/cuponesApi';
import HistorialCuponesTabla from '../components/HistorialCuponesTabla';
import AnularCuponModal from '../components/AnularCuponModal';

// Componente pequeño para las tarjetas de estadísticas
function StatCard({ titulo, valor, icono, color }) {
    return (
        <Card className="shadow-sm text-center h-100">
            <Card.Body>
                <Row className="align-items-center h-100">
                    <Col xs={4} className={`d-flex align-items-center justify-content-center fs-1 text-${color}`}>
                        <i className={icono}></i>
                    </Col>
                    <Col xs={8} className="text-start">
                        <h6 className="text-muted mb-1">{titulo}</h6>
                        <h4 className="fw-bold mb-0">{valor}</h4>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

function AdminGestionPage() {
    // Estados para la lista y filtros
    const [cupones, setCupones] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [opcionesEstado, setOpcionesEstado] = useState([]);

    // Estados para el modal de anulación
    const [showAnularModal, setShowAnularModal] = useState(false);
    const [cuponParaAnular, setCuponParaAnular] = useState(null);
    const [isAnulando, setIsAnulando] = useState(false);
    const [errorAnulacion, setErrorAnulacion] = useState(null);

    // --- Carga de Datos ---
    const fetchAdminCupones = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getAdminCupones();
            setCupones(data.cupones);
            setEstadisticas(data.estadisticas);
            setOpcionesEstado(data.opciones_estado);
        } catch (err) {
            setError(err.message || 'Error al cargar cupones.');
            console.error("Error cargando cupones de admin:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminCupones();
    }, []);

    // --- Lógica de Filtrado ---
    const cuponesFiltrados = useMemo(() => {
        let cuponesFiltradosTemp = [...cupones];
        const busquedaLower = searchTerm.toLowerCase().trim();

        if (estadoFilter) {
            cuponesFiltradosTemp = cuponesFiltradosTemp.filter(
                (cupon) => cupon.estado_cupon?.nombre === estadoFilter
            );
        }
        if (busquedaLower) {
            cuponesFiltradosTemp = cuponesFiltradosTemp.filter((cupon) => {
                const nombre = String(cupon.alumno?.nombre_completo || cupon.alumno?.username || '').toLowerCase();
                const dni = String(cupon.alumno?.dni || '').toLowerCase();
                const legajo = String(cupon.alumno?.legajo || '').toLowerCase();
                return (
                    nombre.includes(busquedaLower) ||
                    dni.includes(busquedaLower) ||
                    legajo.includes(busquedaLower)
                );
            });
        }
        return cuponesFiltradosTemp;
    }, [cupones, searchTerm, estadoFilter]);

    // --- Handlers Modal Anulación ---
    const handleOpenAnularModal = (cuponId) => {
        setCuponParaAnular(cuponId);
        setErrorAnulacion(null);
        setShowAnularModal(true);
    };
    const handleCloseAnularModal = () => {
        setShowAnularModal(false);
        setCuponParaAnular(null);
        setErrorAnulacion(null);
    };
    const handleConfirmAnular = async (motivo) => {
        if (!cuponParaAnular || !motivo) return;
        setIsAnulando(true);
        setErrorAnulacion(null);
        try {
            await anularCuponAdmin(cuponParaAnular, motivo);
            handleCloseAnularModal();
            fetchAdminCupones();
        } catch (err) {
            setErrorAnulacion(err.message || "Error al anular.");
        } finally {
            setIsAnulando(false);
        }
    };

    // --- Handler Cambio Estado ---
    const handleEstadoChange = async (cuponId, nuevoEstadoId) => {
        const cuponActual = cupones.find(c => c.id === cuponId);
        if (cuponActual.estado_cupon.id === parseInt(nuevoEstadoId)) return;

        console.log(`Cambiando cupón #${cuponId} al estado ID #${nuevoEstadoId}...`);

        try {
            await updateCuponEstado(cuponId, nuevoEstadoId);
            setCupones(prevCupones =>
                prevCupones.map(cupon =>
                    cupon.id === cuponId
                        ? { ...cupon, estado_cupon: opcionesEstado.find(opt => opt.id === parseInt(nuevoEstadoId)) }
                        : cupon
                )
            );
        } catch (err) {
            console.error("Error al cambiar estado:", err);
            fetchAdminCupones();
        }
    };

    return (
        <Container fluid>
            <h3><i className="bi bi-cash-stack me-2"></i>Gestión de Cobranzas</h3>

            {/* Tarjetas de Estadísticas */}
            {isLoading ? (
                <p>Cargando estadísticas...</p>
            ) : estadisticas ? (
                <Row className="mb-4">
                    <Col lg md={4} sm={6} className="mb-3">
                        <StatCard titulo="Total Cupones" valor={estadisticas.total} icono="bi bi-receipt-cutoff" color="primary" />
                    </Col>
                    <Col lg md={4} sm={6} className="mb-3">
                        <StatCard titulo="Activos" valor={estadisticas.activos} icono="bi bi-check-circle-fill" color="success" />
                    </Col>
                    <Col lg md={4} sm={6} className="mb-3">
                        <StatCard titulo="Pagados" valor={estadisticas.pagados} icono="bi bi-cash-coin" color="info" />
                    </Col>
                    <Col lg md={4} sm={6} className="mb-3">
                        <StatCard titulo="Vencidos" valor={estadisticas.vencidos} icono="bi bi-exclamation-triangle-fill" color="danger" />
                    </Col>
                    <Col lg md={4} sm={6} className="mb-3">
                        <StatCard titulo="Anulados" valor={estadisticas.anulados} icono="bi bi-x-circle-fill" color="secondary" />
                    </Col>
                </Row>
            ) : (
                !error && <p>No se pudieron cargar las estadísticas.</p>
            )}

            <Card className="shadow-sm mt-4">
                <Card.Header as="h5">Gestión de Cupones Generados</Card.Header>
                <Card.Body>
                    {/* Filtros */}
                    <Form className="mb-3">
                        {/* --- AQUÍ ESTÁ LA CORRECCIÓN: align-items-center --- */}
                        <Row className="g-2 align-items-center">
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                                    <Form.Control type="text" placeholder="Buscar por DNI, legajo o alumno..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </InputGroup>
                            </Col>
                            <Col md={4}>
                                <Form.Select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
                                    <option value="">Todos los estados</option>
                                    <option value="Activo">Activo</option>
                                    <option value="Pagado">Pagado</option>
                                    <option value="Vencido">Vencido</option>
                                    <option value="Anulado">Anulado</option>
                                </Form.Select>
                            </Col>
                            <Col md={2} className="d-grid">
                                <Button variant="outline-secondary" onClick={() => { setSearchTerm(''); setEstadoFilter(''); }}>
                                    <i className="bi bi-x-lg me-2"></i>Limpiar
                                </Button>
                            </Col>
                        </Row>
                        {/* --------------------------------------------------- */}
                    </Form>

                    {/* Tabla de Cupones */}
                    {isLoading && (<div className="text-center my-5"><Spinner animation="border" /><p className="mt-2">Cargando...</p></div>)}
                    {error && (<Alert variant="danger">Error al cargar la lista: {error}</Alert>)}

                    {!isLoading && !error && (
                        <HistorialCuponesTabla
                            cupones={cuponesFiltrados}
                            isAdminView={true}
                            onAnularClick={handleOpenAnularModal}
                            opcionesEstado={opcionesEstado}
                            onEstadoChange={handleEstadoChange}
                        />
                    )}

                    {!isLoading && !error && cuponesFiltrados.length === 0 && (
                        <Alert variant="info">
                            {searchTerm || estadoFilter ? 'No se encontraron cupones con los filtros aplicados.' : 'No se encontraron cupones.'}
                        </Alert>
                    )}
                </Card.Body>
            </Card>

            {/* Modal de Anulación */}
            <AnularCuponModal
                show={showAnularModal}
                handleClose={handleCloseAnularModal}
                handleConfirm={handleConfirmAnular}
                cuponId={cuponParaAnular}
                isAnulando={isAnulando}
                errorAnulacion={errorAnulacion}
            />
        </Container>
    );
}

export default AdminGestionPage;