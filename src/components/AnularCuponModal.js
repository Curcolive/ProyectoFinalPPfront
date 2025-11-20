import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
// Importamos el CSS que crearemos en el paso 2
import './AnularCuponModal.css'; 

function AnularCuponModal({ show, handleClose, handleConfirm, cuponId, isAnulando, errorAnulacion }) {
    const [motivo, setMotivo] = useState('');
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        if (!show) {
            setMotivo('');
            setValidated(false);
        }
    }, [show]);

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false || motivo.trim() === '') {
            event.stopPropagation();
            setValidated(true);
        } else {
            handleConfirm(motivo);
        }
    };

    return (
        <Modal 
            show={show} 
            onHide={handleClose} 
            centered 
            // Clase para el estilo del contenedor (Glow rojo y bordes redondos)
            className="modern-modal modal-danger"
        >
            {/* Header invisible, solo para la X de cerrar */}
            <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>

            <Modal.Body className="px-4 pb-4 pt-0">
                
                {/* 1. ÍCONO FLOTANTE CENTRADO CON ANIMACIÓN */}
                <div className="text-center mb-3">
                    <div className="modal-icon-wrapper danger animate-pulse mx-auto">
                        <i className="bi bi-trash3-fill"></i>
                    </div>
                    <h3 className="fw-bold mt-3">¿Anular Cupón #{cuponId}?</h3>
                </div>

                {/* 2. MENSAJES DE ERROR O ADVERTENCIA */}
                {errorAnulacion && <Alert variant="danger" className="mb-3">{errorAnulacion}</Alert>}
                
                <p className="text-muted text-center mb-4">
                    Esta acción es <strong>irreversible</strong>. El cupón quedará invalidado permanentemente.
                </p>

                {/* 3. FORMULARIO CON ESTILO MODERNO */}
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group controlId="motivoAnulacion" className="mb-4 text-start">
                        <Form.Label className="fw-bold small text-secondary text-uppercase" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>
                            Motivo de la anulación <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Escribe la razón por la cual anulas este cupón..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            required
                            className="modal-input-modern" // Clase nueva para el input
                        />
                        <Form.Control.Feedback type="invalid">
                            El motivo es obligatorio para poder anular.
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* 4. BOTONES GRANDES Y ESTILIZADOS */}
                    <div className="d-grid gap-2 col-12 mx-auto">
                        <Button 
                            variant="danger" 
                            type="submit" 
                            disabled={isAnulando} 
                            className="shadow-sm btn-lg-modern"
                            size="lg"
                        >
                            {isAnulando ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                    Anulando...
                                </>
                            ) : (
                                'Confirmar Anulación'
                            )}
                        </Button>

                        <Button 
                            variant="link" 
                            onClick={handleClose} 
                            disabled={isAnulando}
                            className="text-decoration-none text-muted mt-1"
                        >
                            Cancelar y volver
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default AnularCuponModal;