import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

// Este componente recibe las mismas props que EstadoCuponModal
function PasarelaPagoModal({ show, handleClose, handleSubmit, isSaving, error, initialData }) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [validated, setValidated] = useState(false);

    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre || '');
            setDescripcion(initialData.descripcion || '');
        } else {
            setNombre('');
            setDescripcion('');
        }
        setValidated(false);
    }, [initialData, show]);

    const onFormSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false || nombre.trim() === '') {
            event.stopPropagation();
            setValidated(true);
        } else {
            handleSubmit({ nombre, descripcion });
        }
    };

    const isEditing = !!initialData;

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Form noValidate validated={validated} onSubmit={onFormSubmit}>
                {/* --- CAMBIOS DE TEXTO --- */}
                <Modal.Header closeButton className={isEditing ? "bg-primary text-white" : "bg-success text-white"}>
                    <Modal.Title>
                        {isEditing
                            ? <><i className="bi bi-pencil-fill me-2"></i>Editar Pasarela de Pago</>
                            : <><i className="bi bi-plus-lg me-2"></i>Añadir Nueva Pasarela</>
                        }
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form.Group className="mb-3" controlId="formNombrePasarela">
                        <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ej. Pago Fácil" 
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            isInvalid={validated && nombre.trim() === ''}
                        />
                        <Form.Control.Feedback type="invalid">
                            El nombre es obligatorio.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formDescripcionPasarela">
                        <Form.Label>Descripción (Opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Ej. Integración para cupones de Pago Fácil"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                {/* --- FIN CAMBIOS DE TEXTO --- */}
                
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button variant={isEditing ? "primary" : "success"} type="submit" disabled={isSaving}>
                        {isSaving ? (
                            <><Spinner size="sm" className="me-2"/>Guardando...</>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default PasarelaPagoModal;