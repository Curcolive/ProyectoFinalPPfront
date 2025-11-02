import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Button, Table, Tabs, Tab, Badge } from 'react-bootstrap';
import {
    getEstadosCupon,
    createEstadoCupon,
    updateEstadoCupon,
    deleteEstadoCupon
} from '../services/cuponesApi';
import EstadoCuponModal from '../components/EstadoCuponModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

function ConfiguracionPage() {
    // Estados para la PÁGINA
    const [estadosCupon, setEstadosCupon] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los MODALES
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [modalError, setModalError] = useState(null); // Errores para ambos modales

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemParaEliminar, setItemParaEliminar] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Carga de Datos ---
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

    useEffect(() => {
        fetchEstadosCupon();
    }, []);

    // --- Handlers para Modal Crear/Editar ---
    const handleCloseModals = () => {
        setShowEditModal(false);
        setShowDeleteModal(false);
        setCurrentItem(null);
        setItemParaEliminar(null);
        setModalError(null);
        setIsSaving(false); // Asegura reset
        setIsDeleting(false); // Asegura reset
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

    // --- CORREGIDO: 'handleSave' con 'finally' ---
    const handleSave = async (formData) => {
        setIsSaving(true);
        setModalError(null);
        try {
            if (currentItem && currentItem.id) {
                await updateEstadoCupon(currentItem.id, formData);
            } else {
                await createEstadoCupon(formData);
            }
            handleCloseModals(); // Cierra modal SÓLO si hay éxito
            fetchEstadosCupon(); // Recarga la tabla
        } catch (err) {
            setModalError(err.message || "Error al guardar. ¿El nombre ya existe?");
            // No cerramos el modal, para que el usuario vea el error
        } finally {
            // --- ¡LA CORRECCIÓN! ---
            // Apaga el spinner SIEMPRE (en éxito o error)
            setIsSaving(false);
        }
    };

    // --- Handlers para Modal Eliminar ---
    const handleOpenDeleteModal = (id) => {
        setItemParaEliminar(id);
        setModalError(null);
        setShowDeleteModal(true);
    };

    // --- CORREGIDO: 'handleConfirmDelete' con 'finally' ---
    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        setModalError(null);
        try {
            await deleteEstadoCupon(itemParaEliminar);
            handleCloseModals(); // Cierra modal SÓLO si hay éxito
            fetchEstadosCupon(); // Recarga la tabla
        } catch (err) {
            // El backend (views.py) debería enviar un error 409 si está en uso
            setModalError(err.message || "Error al eliminar. ¿Está en uso?");
            // No cerramos el modal, para que el usuario vea el error
        } finally {
            // --- ¡LA CORRECCIÓN! ---
            // Apaga el spinner SIEMPRE (en éxito o error)
            setIsDeleting(false);
        }
    };

    return (
        <Container fluid>
            <h3><i className="bi bi-gear-fill me-2"></i>Configuración del Sistema</h3>

            <Tabs defaultActiveKey="estado-cupon" id="config-tabs" className="mb-3 mt-4">
                {/* Pestaña Estado de Cupón */}
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

                {/* ... (Otras pestañas) ... */}
                 <Tab eventKey="estado-cuota" title="Estados de Cuota">
                    <Alert variant="info">Gestión de Estados de Cuota (próximamente)...</Alert>
                </Tab>
                <Tab eventKey="pasarelas" title="Pasarelas de Pago">
                    <Alert variant="info">Gestión de Pasarelas de Pago (próximamente)...</Alert>
                </Tab>
            </Tabs>
            
            {/* Modales */}
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
                title="Confirmar Eliminación"
                body={
                    <>
                        {/* Muestra error si lo hay */}
                        {modalError && <Alert variant="danger">{modalError}</Alert>}
                        ¿Estás seguro de que deseas eliminar este estado? (ID: {itemParaEliminar})
                    </>
                }
                isDeleting={isDeleting}
            />
            
        </Container>
    );
}

export default ConfiguracionPage;