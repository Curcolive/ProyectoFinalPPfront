import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './MainLayout.css';

function MainLayout({ children, handleLogout }) {
    const isAuthenticated = !!localStorage.getItem('authToken');

    return (
        <div className="main-layout-wrapper">
            <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
            <main className="main-content">
                <div className="content-container">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default MainLayout;