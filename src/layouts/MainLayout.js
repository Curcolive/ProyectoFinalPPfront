import React from 'react';
import Header from './Header';
import Footer from './Footer';

// El 'children' representa el contenido específico de cada página
function MainLayout({ children, isAuthenticated, handleLogout }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Pasa las props al Header */}
            <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
            <main style={{ flexGrow: 1, padding: '1rem' }}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
export default MainLayout;