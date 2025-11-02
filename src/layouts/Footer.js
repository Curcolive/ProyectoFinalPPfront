import React from 'react';

function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer style={{ background: '#f8f9fa', padding: '1rem', borderTop: '1px solid #dee2e6', marginTop: 'auto', textAlign: 'center' }}>
            <p>&copy; {year} Instituto Superior Del Milagro. Todos los derechos reservados.</p>
        </footer>
    );
}

export default Footer;