import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Form, Button, InputGroup } from 'react-bootstrap';
import { getAdminCupones, anularCuponAdmin, updateCuponEstado } from '../services/cuponesApi';
import HistorialCuponesTabla from '../components/HistorialCuponesTabla';
import AnularCuponModal from '../components/AnularCuponModal';

// Componente pequeño para las tarjetas de estadísticas
function StatCard({ titulo, valor, icono, color }) {
    return (
        <Card className="shadow-sm text-center h-100"> {/* h-100 para misma altura */}
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
    const [estadisticas, setEstadisticas] = useState(null); // Estado para las estadísticas
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Estado para errores de carga
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
            const data = await getAdminCupones(); // data es { estadisticas: ..., cupones: [...] }
            setCupones(data.cupones);
            setEstadisticas(data.estadisticas);
            setOpcionesEstado(data.opciones_estado);
        } catch (err) {
            setError(err.message || 'Error al cargar cupones.'); // Guarda error de carga
            console.error("Error cargando cupones de admin:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminCupones(); // Carga al montar
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
    // --- FIN Lógica de Filtrado ---

    // --- Handlers para el Modal de Anulación ---
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
            fetchAdminCupones(); // Recarga la tabla
        } catch (err) {
            setErrorAnulacion(err.message || "Error al anular.");
        } finally {
            setIsAnulando(false);
        }
    };

    // --- NUEVO HANDLER PARA CAMBIO DE ESTADO ---
    const handleEstadoChange = async (cuponId, nuevoEstadoId) => {
        // Evita recargar si el ID es el mismo
        const cuponActual = cupones.find(c => c.id === cuponId);
        if (cuponActual.estado_cupon.id === parseInt(nuevoEstadoId)) {
            return;
        }

        console.log(`Cambiando cupón #${cuponId} al estado ID #${nuevoEstadoId}...`);

        try {
            await updateCuponEstado(cuponId, nuevoEstadoId);
            // Actualiza la lista localmente para una respuesta rápida (Opcional pero recomendado)
            setCupones(prevCupones =>
                prevCupones.map(cupon =>
                    cupon.id === cuponId
                        ? { ...cupon, estado_cupon: opcionesEstado.find(opt => opt.id === parseInt(nuevoEstadoId)) }
                        : cupon
                )
            );
            // O simplemente recarga todo desde la API (más simple)
            // await fetchAdminCupones(); 

        } catch (err) {
            console.error("Error al cambiar estado:", err);
            // Aquí podríamos mostrar una alerta de error
            // Por ahora, recargamos para revertir el cambio visual
            fetchAdminCupones();
        }
    };

    return (
        <Container fluid>
            <h3><i className="bi bi-cash-stack me-2"></i>Gestión de Cobranzas</h3>

            {/* --- Mostrar Tarjetas de Estadísticas (AHORA 5) --- */}
            {isLoading ? (
                <p>Cargando estadísticas...</p>
            ) : estadisticas ? (
                // Ajustamos las columnas para 5 tarjetas:
                // En pantallas grandes (lg) usa 5 columnas (col-lg)
                // En medianas (md) usa 3 columnas (col-md-4) -> (3+2)
                // En chicas (sm) usa 2 columnas (col-sm-6)
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
                    {/* --- TARJETA AÑADIDA --- */}
                    <Col lg md={4} sm={6} className="mb-3">
                        <StatCard titulo="Anulados" valor={estadisticas.anulados} icono="bi bi-x-circle-fill" color="secondary" />
                    </Col>
                    {/* --- FIN TARJETA AÑADIDA --- */}
                </Row>
            ) : (
                !error && <p>No se pudieron cargar las estadísticas.</p> // Muestra si estadisticas es null pero no hay error
            )}
            {/* --- FIN TARJETAS --- */}


            <Card className="shadow-sm mt-4">
                <Card.Header as="h5">Gestión de Cupones Generados</Card.Header>
                <Card.Body>
                    {/* Filtros */}
                    <Form className="mb-3">
                        <Row className="g-2">
                            <Col md={6}><InputGroup><InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text><Form.Control type="text" placeholder="Buscar por DNI, legajo o alumno..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></InputGroup></Col>
                            <Col md={4}><Form.Select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}><option value="">Todos los estados</option><option value="Activo">Activo</option><option value="Pagado">Pagado</option><option value="Vencido">Vencido</option><option value="Anulado">Anulado</option></Form.Select></Col>
                            <Col md={2} className="d-grid"><Button variant="outline-secondary" onClick={() => { setSearchTerm(''); setEstadoFilter(''); }}><i className="bi bi-x-lg me-2"></i>Limpiar</Button></Col>
                        </Row>
                    </Form>

                    {/* Tabla de Cupones */}
                    {isLoading && (<div className="text-center my-5"><Spinner animation="border" /><p className="mt-2">Cargando...</p></div>)}

                    {/* Muestra error de carga si existe */}
                    {error && (<Alert variant="danger">Error al cargar la lista: {error}</Alert>)}

                    {/* Pasa la lista FILTRADA a la tabla */}
                    {!isLoading && !error && (
                        <HistorialCuponesTabla
                            cupones={cuponesFiltrados}
                            isAdminView={true}
                            onAnularClick={handleOpenAnularModal}
                            opcionesEstado={opcionesEstado} // <-- AÑADE ESTO
                            onEstadoChange={handleEstadoChange} // <-- AÑADE ESTO
                        />
                    )}

                    {/* Mensaje si no se encontraron cupones */}
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