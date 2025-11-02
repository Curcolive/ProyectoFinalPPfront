import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

// Recibe:
// - show: boolean
// - handleClose: función para cerrar/cancelar
// - handleConfirm: función para confirmar el borrado
// - title: título del modal
// - body: texto del cuerpo
// - isDeleting: boolean para el spinner
function ConfirmDeleteModal({ show, handleClose, handleConfirm, title, body, isDeleting }) {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-danger text-white">
                <Modal.Title>{title || 'Confirmar Eliminación'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {body || '¿Estás seguro de que deseas eliminar este ítem? Esta acción no se puede deshacer.'}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={handleConfirm} disabled={isDeleting}>
                    {isDeleting ? (
                        <><Spinner size="sm" className="me-2"/>Eliminando...</>
                    ) : (
                        'Eliminar'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmDeleteModal;