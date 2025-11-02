import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

// Recibe:
// - show: boolean, si se muestra
// - handleClose: función para cerrar
// - handleSubmit: función para guardar (recibe el objeto {nombre, descripcion})
// - isSaving: boolean para el spinner del botón
// - error: string con mensaje de error
// - initialData: el objeto {id, nombre, descripcion} si estamos editando (o null si es nuevo)
function EstadoCuponModal({ show, handleClose, handleSubmit, isSaving, error, initialData }) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [validated, setValidated] = useState(false);

    // Cuando 'initialData' cambia (ej. al abrir el modal para editar),
    // rellena el formulario con esos datos.
    useEffect(() => {
        if (initialData) {
            setNombre(initialData.nombre || '');
            setDescripcion(initialData.descripcion || '');
        } else {
            // Si es para 'Crear Nuevo', limpia los campos
            setNombre('');
            setDescripcion('');
        }
        setValidated(false); // Resetea validación al abrir
    }, [initialData, show]); // Se ejecuta cuando 'initialData' o 'show' cambian

    const onFormSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false || nombre.trim() === '') {
            event.stopPropagation();
            setValidated(true);
        } else {
            // Llama a la función del padre con los datos del formulario
            handleSubmit({ nombre, descripcion });
        }
    };

    const isEditing = !!initialData; // ¿Estamos editando? (si hay initialData)

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Form noValidate validated={validated} onSubmit={onFormSubmit}>
                <Modal.Header closeButton className={isEditing ? "bg-primary text-white" : "bg-success text-white"}>
                    <Modal.Title>
                        {isEditing 
                            ? <><i className="bi bi-pencil-fill me-2"></i>Editar Estado de Cupón</>
                            : <><i className="bi bi-plus-lg me-2"></i>Añadir Nuevo Estado de Cupón</>
                        }
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Muestra error de la API si existe */}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form.Group className="mb-3" controlId="formNombre">
                        <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ej. Activo"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            isInvalid={validated && nombre.trim() === ''}
                        />
                        <Form.Control.Feedback type="invalid">
                            El nombre es obligatorio.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formDescripcion">
                        <Form.Label>Descripción (Opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Ej. Cupón vigente y pendiente de pago"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
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

export default EstadoCuponModal;