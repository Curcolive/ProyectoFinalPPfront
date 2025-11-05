import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Button, Table, Tabs, Tab, Badge } from 'react-bootstrap';
import {
    getEstadosCupon,
    createEstadoCupon,
    updateEstadoCupon,
    deleteEstadoCupon,
    // --- NUEVO ---
    getPasarelasPago,
    createPasarelaPago,
    updatePasarelaPago,
    deletePasarelaPago
    // --- FIN NUEVO ---
} from '../services/cuponesApi';
import EstadoCuponModal from '../components/EstadoCuponModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
// --- NUEVO ---
import PasarelaPagoModal from '../components/PasarelaPagoModal'; // Importa el nuevo modal
// --- FIN NUEVO ---


function ConfiguracionPage() {
    // --- Estados para Pestaña 1 (Estados de Cupón) ---
    const [estadosCupon, setEstadosCupon] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemParaEliminar, setItemParaEliminar] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- NUEVO: Estados para Pestaña 2 (Pasarelas de Pago) ---
    const [pasarelas, setPasarelas] = useState([]);
    const [isLoadingPasarelas, setIsLoadingPasarelas] = useState(true);
    const [errorPasarelas, setErrorPasarelas] = useState(null);
    const [showPasarelaModal, setShowPasarelaModal] = useState(false);
    const [currentPasarela, setCurrentPasarela] = useState(null);
    const [isSavingPasarela, setIsSavingPasarela] = useState(false);
    const [modalPasarelaError, setModalPasarelaError] = useState(null);
    const [showDeletePasarelaModal, setShowDeletePasarelaModal] = useState(false);
    const [pasarelaParaEliminar, setPasarelaParaEliminar] = useState(null);
    const [isDeletingPasarela, setIsDeletingPasarela] = useState(false);
    // --- FIN NUEVO ---

    // --- Carga de Datos (Pestaña 1) ---
    const fetchEstadosCupon = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getEstadosCupon();
            setEstadosCupon(data);
        } catch (err) {
            setError(err.message || 'Error al cargar los estados de cupón.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- NUEVO: Carga de Datos (Pestaña 2) ---
    const fetchPasarelas = async () => {
        try {
            setIsLoadingPasarelas(true);
            setErrorPasarelas(null);
            const data = await getPasarelasPago();
            setPasarelas(data);
        } catch (err) {
            setErrorPasarelas(err.message || 'Error al cargar las pasarelas.');
        } finally {
            setIsLoadingPasarelas(false);
        }
    };
    // --- FIN NUEVO ---

    useEffect(() => {
        fetchEstadosCupon();
        fetchPasarelas(); // --- NUEVO ---
    }, []);

    // --- Handlers Pestaña 1 (Estados de Cupón) ---
    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setCurrentItem(null);
        setItemParaEliminar(null);
        setModalError(null);
        setIsSaving(false);
        setIsDeleting(false);
    };

    const handleOpenCreateModal = () => {
        setCurrentItem(null);
        setModalError(null);
        setShowEditModal(true);
    };

    const handleOpenEditModal = (item) => {
        setCurrentItem(item);
        setModalError(null);
        setShowEditModal(true);
    };

    const handleSave = async (formData) => {
        setIsSaving(true);
        setModalError(null);
        try {
            if (currentItem && currentItem.id) {
                await updateEstadoCupon(currentItem.id, formData);
            } else {
                await createEstadoCupon(formData);
            }
            handleCloseModals();
            fetchEstadosCupon();
        } catch (err) {
            setModalError(err.message || "Error al guardar. ¿El nombre ya existe?");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenDeleteModal = (id) => {
        setItemParaEliminar(id);
        setModalError(null);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        setModalError(null);
        try {
            await deleteEstadoCupon(itemParaEliminar);
            handleCloseModals();
            fetchEstadosCupon();
        } catch (err) {
            setModalError(err.message || "Error al eliminar. ¿Está en uso?");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- NUEVO: Handlers Pestaña 2 (Pasarelas) ---
    const handleClosePasarelaModals = () => {
        setShowPasarelaModal(false);
        setShowDeletePasarelaModal(false);
        setCurrentPasarela(null);
        setPasarelaParaEliminar(null);
        setModalPasarelaError(null);
        setIsSavingPasarela(false);
        setIsDeletingPasarela(false);
    };

    const handleOpenCreatePasarelaModal = () => {
        setCurrentPasarela(null);
        setModalPasarelaError(null);
        setShowPasarelaModal(true);
    };

    const handleOpenEditPasarelaModal = (item) => {
        setCurrentPasarela(item);
        setModalPasarelaError(null);
        setShowPasarelaModal(true);
    };

    const handleSavePasarela = async (formData) => {
        setIsSavingPasarela(true);
        setModalPasarelaError(null);
        try {
            if (currentPasarela && currentPasarela.id) {
                await updatePasarelaPago(currentPasarela.id, formData);
            } else {
                await createPasarelaPago(formData);
            }
            handleClosePasarelaModals();
            fetchPasarelas();
        } catch (err) {
            setModalPasarelaError(err.message || "Error al guardar. ¿El nombre ya existe?");
        } finally {
            setIsSavingPasarela(false);
        }
    };

    const handleOpenDeletePasarelaModal = (id) => {
        setPasarelaParaEliminar(id);
        setModalPasarelaError(null);
        setShowDeletePasarelaModal(true);
    };

    const handleConfirmDeletePasarela = async () => {
        setIsDeletingPasarela(true);
        setModalPasarelaError(null);
        try {
            await deletePasarelaPago(pasarelaParaEliminar);
            handleClosePasarelaModals();
            fetchPasarelas();
        } catch (err) {
            // El error 409 lo personalizamos en la API, aquí solo lo mostramos
            setModalPasarelaError(err.message || "Error al eliminar.");
        } finally {
            setIsDeletingPasarela(false);
        }
    };
    // --- FIN NUEVO ---


    return (
        <Container fluid>
            <h3><i className="bi bi-gear-fill me-2"></i>Configuración del Sistema</h3>

            <Tabs defaultActiveKey="estado-cupon" id="config-tabs" className="mb-3 mt-4">
                {/* Pestaña 1: Estado de Cupón (Sin cambios) */}
                <Tab eventKey="estado-cupon" title="Estados de Cupón">
                    <Card className="shadow-sm">
                        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                            Gestión de Estados de Cupón
                            <Button variant="primary" onClick={handleOpenCreateModal}>
                                <i className="bi bi-plus-lg me-2"></i>Añadir Nuevo
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Card.Subtitle className="mb-3 text-muted">
                                Define los estados posibles para los cupones de pago (ej. Activo, Pagado).
                            </Card.Subtitle>
                            
                            {isLoading && (<div className="text-center my-5"><Spinner animation="border" /><p className="mt-2">Cargando...</p></div>)}
                            {error && (<Alert variant="danger">Error al cargar: {error}</Alert>)}
                            
                            {!isLoading && !error && (
                                <Table striped bordered hover responsive size="sm">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Descripción</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estadosCupon.map((item) => (
                                            <tr key={item.id}>
                                                <td>#{item.id}</td>
                                                <td><Badge bg="secondary">{item.nombre}</Badge></td>
                                                <td>{item.descripcion || '---'}</td>
                                                <td className="text-center">
                                                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditModal(item)} title="Editar">
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleOpenDeleteModal(item.id)} title="Eliminar">
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                            {!isLoading && !error && estadosCupon.length === 0 && (
                                <Alert variant="info">No se encontraron estados de cupón.</Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="estado-cuota" title="Estados de Cuota">
                    <Alert variant="info">Gestión de Estados de Cuota (próximamente)...</Alert>
                </Tab>

                {/* --- NUEVO: Pestaña 2 (Pasarelas de Pago) --- */}
                <Tab eventKey="pasarelas" title="Pasarelas de Pago">
                    {/* Reemplazamos el "Próximamente" con el CRUD */}
                    <Card className="shadow-sm">
                        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                            Gestión de Pasarelas de Pago
                            <Button variant="primary" onClick={handleOpenCreatePasarelaModal}>
                                <i className="bi bi-plus-lg me-2"></i>Añadir Nueva
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Card.Subtitle className="mb-3 text-muted">
                                Define las pasarelas de pago externas (ej. Pago Fácil, Mercado Pago).
                            </Card.Subtitle>
                            
                            {/* Usamos los nuevos estados 'Pasarela' */}
                            {isLoadingPasarelas && (<div className="text-center my-5"><Spinner animation="border" /><p className="mt-2">Cargando...</p></div>)}
                            {errorPasarelas && (<Alert variant="danger">Error al cargar: {errorPasarelas}</Alert>)}
                            
                            {!isLoadingPasarelas && !errorPasarelas && (
                                <Table striped bordered hover responsive size="sm">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Descripción</th>
                                            <th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Mapeamos el array 'pasarelas' */}
                                        {pasarelas.map((item) => (
                                            <tr key={item.id}>
                                                <td>#{item.id}</td>
                                                <td><Badge bg="info">{item.nombre}</Badge></td>
                                                <td>{item.descripcion || '---'}</td>
                                                <td className="text-center">
                                                    {/* Usamos los nuevos handlers 'Pasarela' */}
                                                    <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditPasarelaModal(item)} title="Editar">
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleOpenDeletePasarelaModal(item.id)} title="Eliminar">
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                            {!isLoadingPasarelas && !errorPasarelas && pasarelas.length === 0 && (
                                <Alert variant="info">No se encontraron pasarelas de pago.</Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>
                {/* --- FIN NUEVO --- */}

            </Tabs>
            
            {/* Modales Pestaña 1 (Estados de Cupón) */}
            <EstadoCuponModal 
                show={showEditModal}
                handleClose={handleCloseModals}
                handleSubmit={handleSave}
                isSaving={isSaving}
                error={modalError}
                initialData={currentItem}
            />

            <ConfirmDeleteModal 
                show={showDeleteModal}
                handleClose={handleCloseModals}
                handleConfirm={handleConfirmDelete}
                title="Confirmar Eliminación (Estado Cupón)"
                body={
                    <>
                        {modalError && <Alert variant="danger">{modalError}</Alert>}
                        ¿Estás seguro de que deseas eliminar este estado? (ID: {itemParaEliminar})
                    </>
                }
                isDeleting={isDeleting}
            />
            
            {/* --- NUEVO: Modales Pestaña 2 (Pasarelas) --- */}
            <PasarelaPagoModal
                show={showPasarelaModal}
                handleClose={handleClosePasarelaModals}
                handleSubmit={handleSavePasarela}
                isSaving={isSavingPasarela}
                error={modalPasarelaError}
                initialData={currentPasarela}
            />

            <ConfirmDeleteModal 
                show={showDeletePasarelaModal}
                handleClose={handleClosePasarelaModals}
                handleConfirm={handleConfirmDeletePasarela}
                title="Confirmar Eliminación (Pasarela)"
                body={
                    <>
                        {/* Muestra el error específico de esta modal */}
                        {modalPasarelaError && <Alert variant="danger">{modalPasarelaError}</Alert>}
                        ¿Estás seguro de que deseas eliminar esta pasarela? (ID: {pasarelaParaEliminar})
                    </>
                }
                isDeleting={isDeletingPasarela}
            />
            {/* --- FIN NUEVO --- */}
            
        </Container>
    );
}

export default ConfiguracionPage;