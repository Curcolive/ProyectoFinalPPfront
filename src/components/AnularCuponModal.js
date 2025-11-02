import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

/**
 * Componente Modal para confirmar la anulación de un cupón.
 * Recibe props para funcionar:
 * - show: (boolean) Controla si el modal es visible.
 * - handleClose: (function) Se llama al cerrar/cancelar.
 * - handleConfirm: (function) Se llama al confirmar. Recibe el 'motivo'.
 * - cuponId: (number) El ID del cupón a anular, para mostrarlo.
 * - isAnulando: (boolean) Muestra un spinner en el botón de confirmar.
 * - errorAnulacion: (string) Un mensaje de error si la API falla.
 */
function AnularCuponModal({ show, handleClose, handleConfirm, cuponId, isAnulando, errorAnulacion }) {
    const [motivo, setMotivo] = useState('');
    const [validated, setValidated] = useState(false); // Para validación de Bootstrap

    // Limpia el motivo cuando el modal se cierra o cambia de cupón
    useEffect(() => {
        if (!show) {
            setMotivo('');
            setValidated(false);
        }
    }, [show]);

    const handleSubmit = (event) => {
        event.preventDefault(); // Evita que el formulario recargue la página
        const form = event.currentTarget;

        // Valida que el motivo no esté vacío
        if (form.checkValidity() === false || motivo.trim() === '') {
            event.stopPropagation();
            setValidated(true); // Muestra el error de validación
        } else {
            handleConfirm(motivo); // Llama a la función del padre con el motivo
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            {/* Usamos Form para habilitar la validación */}
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title><i className="bi bi-exclamation-triangle-fill me-2"></i>Anular Cupón de Pago #{cuponId || '...'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Estás seguro de que deseas anular este cupón? Esta acción no se puede deshacer.</p>

                    {/* Muestra un error si la API falló en el intento anterior */}
                    {errorAnulacion && <Alert variant="danger">{errorAnulacion}</Alert>}

                    <Form.Group controlId="motivoAnulacion">
                        <Form.Label>Motivo de la anulación <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Describe el motivo de la anulación..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            required // El campo es obligatorio
                            // Muestra inválido si se intentó enviar vacío
                            isInvalid={validated && motivo.trim() === ''}
                        />
                        <Form.Control.Feedback type="invalid">
                            El motivo es obligatorio.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={isAnulando}>
                        Cancelar
                    </Button>
                    <Button variant="danger" type="submit" disabled={isAnulando}>
                        {isAnulando ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Anulando...
                            </>
                        ) : (
                            'Confirmar Anulación'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default AnularCuponModal;