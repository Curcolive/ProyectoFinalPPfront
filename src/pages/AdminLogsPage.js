import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Form, Button, InputGroup } from "react-bootstrap";
import { getHistorialLogs } from "../services/logsApi";

function AdminLogsPage() {

    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("");

    // estadísticas simples
    const [stats, setStats] = useState({
        total: 0,
        fallos: 0,
        exitos: 0
    });

    async function fetchLogs() {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getHistorialLogs();
            setLogs(data.results);
            calcularStats(data.results);            

        } catch (err) {
            setError(err.message || "Error cargando logs");
        } finally {
            setIsLoading(false);
        }
    }

    function calcularStats(lista) {
        setStats({
            total: lista.length,
            exitos: lista.filter(l => l.action.toLowerCase().includes("generar") || l.action.toLowerCase().includes("login")).length,
            fallos: lista.filter(l => l.action.toLowerCase().includes("fallo")).length,
        });
    }

    useEffect(() => {
        fetchLogs();
    }, []);

    // === filtrado ===
    const logsFiltrados = useMemo(() => {
        let filtrados = [...logs];
        const term = searchTerm.trim().toLowerCase();

        if (actionFilter) {
            filtrados = filtrados.filter(l => l.action === actionFilter);
        }

        if (term) {
            filtrados = filtrados.filter(l =>
                l.detail.toLowerCase().includes(term) ||
                l.user?.toLowerCase().includes(term)
            );
        }

        return filtrados;

    }, [logs, searchTerm, actionFilter]);

    return (
        <Container fluid>
            <h3><i className="bi bi-clipboard2-data me-2"></i>Logs del Sistema</h3>

            {/* Estadísticas */}
            {isLoading ? (
                <p>Cargando estadísticas...</p>
            ) : (
                <Row className="mb-4">
                    <Col md={4} sm={6} className="mb-2">
                        <Card className="text-center shadow-sm">
                            <Card.Body>
                                <h6>Total</h6>
                                <h3>{stats.total}</h3>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4} sm={6} className="mb-2">
                        <Card className="text-center shadow-sm">
                            <Card.Body>
                                <h6>Éxitos</h6>
                                <h3>{stats.exitos}</h3>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4} sm={6} className="mb-2">
                        <Card className="text-center shadow-sm">
                            <Card.Body>
                                <h6>Fallos</h6>
                                <h3>{stats.fallos}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Tabla Logs */}
            <Card className="shadow-sm mt-4">
                <Card.Header as="h5">Historial de Logs</Card.Header>
                <Card.Body>
                    {/* filtros */}
                    <Form className="mb-3">
                        <Row className="g-2 align-items-center">

                            {/* buscador */}
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-search"></i>
                                    </InputGroup.Text>

                                    <Form.Control
                                        type="text"
                                        placeholder="Buscar por usuario o texto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>

                            {/* filtro acción */}
                            <Col md={4}>
                                <Form.Select
                                    value={actionFilter}
                                    onChange={(e) => setActionFilter(e.target.value)}
                                >
                                    <option value="">Todas las acciones</option>
                                    <option value="GENERAR_CUPON">GENERAR_CUPON</option>
                                    <option value="FALLO_CUPON">FALLO_CUPON</option>
                                    <option value="CUPON_ANULADO">CUPON_ANULADO</option>
                                    <option value="FALLO_LOGIN">FALLO_LOGIN</option>
                                </Form.Select>
                            </Col>

                            {/* limpiar */}
                            <Col md={2} className="d-grid">
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setActionFilter("");
                                    }}
                                >
                                    <i className="bi bi-x-lg me-2"></i>Limpiar
                                </Button>
                            </Col>
                        </Row>
                    </Form>

                    {isLoading && (
                        <div className="text-center my-5">
                            <Spinner animation="border" />
                            <p>Cargando...</p>
                        </div>
                    )}

                    {error && <Alert variant="danger">{error}</Alert>}

                    {/* tabla */}
                    {!isLoading && !error && logsFiltrados.length > 0 && (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Usuario</th>
                                    <th>Acción</th>
                                    <th>Detalle</th>
                                </tr>
                            </thead>

                            <tbody>
                                {logsFiltrados.map(log => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                        <td>{log.user || "-"}</td>
                                        <td>{log.action}</td>
                                        <td>{log.detail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!isLoading && !error && logsFiltrados.length === 0 && (
                        <Alert variant="info">
                            No se encontraron logs con los filtros.
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AdminLogsPage;
