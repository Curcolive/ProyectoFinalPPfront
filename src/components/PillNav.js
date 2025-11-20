import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './PillNav.css';

const PillNav = ({
    logo,
    logoHref = '/',
    logoAlt = 'Logo',
    items = [], // Valor por defecto para evitar errores
    activeHref,
    className = '',
    ease = 'power3.easeOut',
    baseColor = '#fff',
    pillColor = '#060010',
    hoveredPillTextColor = '#060010',
    pillTextColor,
    onMobileMenuClick,
    initialLoadAnimation = true,
    userData, // Nuevo
    onLogout  // Nuevo
}) => {
    const resolvedPillTextColor = pillTextColor ?? baseColor;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const circleRefs = useRef([]);
    const tlRefs = useRef([]);
    const activeTweenRefs = useRef([]);
    const logoImgRef = useRef(null);
    const logoTweenRef = useRef(null);
    const hamburgerRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const navItemsRef = useRef(null);
    const logoRef = useRef(null);

    // --- TU LÓGICA GSAP ORIGINAL ---
    useEffect(() => {
        const layout = () => {
            circleRefs.current.forEach((circle, index) => {
                if (!circle?.parentElement) return;

                const pill = circle.parentElement;
                const rect = pill.getBoundingClientRect();
                const { width: w, height: h } = rect;
                const R = ((w * w) / 4 + h * h) / (2 * h);
                const D = Math.ceil(2 * R) + 2;
                const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
                const originY = D - delta;

                circle.style.width = `${D}px`;
                circle.style.height = `${D}px`;
                circle.style.bottom = `-${delta}px`;

                gsap.set(circle, {
                    xPercent: -50,
                    scale: 0,
                    transformOrigin: `50% ${originY}px`
                });

                const label = pill.querySelector('.pill-label');
                const white = pill.querySelector('.pill-label-hover');

                if (label) gsap.set(label, { y: 0 });
                if (white) gsap.set(white, { y: h + 12, opacity: 0 });

                const indexRef = index;
                tlRefs.current[indexRef]?.kill();
                const tl = gsap.timeline({ paused: true });

                tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

                if (label) {
                    tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
                }

                if (white) {
                    gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
                    tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
                }

                tlRefs.current[indexRef] = tl;
            });
        };

        layout();
        const timer = setTimeout(layout, 100);
        window.addEventListener('resize', layout);

        const menu = mobileMenuRef.current;
        if (menu) {
            gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
        }

        if (initialLoadAnimation) {
            const logo = logoRef.current;
            const navItems = navItemsRef.current;
            if (logo) { gsap.set(logo, { scale: 0 }); gsap.to(logo, { scale: 1, duration: 0.6, ease }); }
            if (navItems) { gsap.set(navItems, { width: 0, overflow: 'hidden' }); gsap.to(navItems, { width: 'auto', duration: 0.6, ease }); }
        }

        return () => {
            window.removeEventListener('resize', layout);
            clearTimeout(timer);
        }
    }, [items, ease, initialLoadAnimation]);

    const handleEnter = i => {
        const tl = tlRefs.current[i];
        if (!tl) return;
        activeTweenRefs.current[i]?.kill();
        activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
            duration: 0.3,
            ease,
            overwrite: 'auto'
        });
    };

    const handleLeave = i => {
        const tl = tlRefs.current[i];
        if (!tl) return;
        activeTweenRefs.current[i]?.kill();
        activeTweenRefs.current[i] = tl.tweenTo(0, {
            duration: 0.2,
            ease,
            overwrite: 'auto'
        });
    };

    const handleLogoEnter = () => {
        const img = logoImgRef.current;
        if (!img) return;
        logoTweenRef.current?.kill();
        gsap.set(img, { rotate: 0 });
        logoTweenRef.current = gsap.to(img, {
            rotate: 360,
            duration: 0.2,
            ease,
            overwrite: 'auto'
        });
    };

    const toggleMobileMenu = () => {
        const newState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newState);
        // ... (Resto lógica hamburguesa igual) ...
        const hamburger = hamburgerRef.current;
        const menu = mobileMenuRef.current;
        if (hamburger) {
            const lines = hamburger.querySelectorAll('.hamburger-line');
            if (newState) {
                gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
                gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
            } else {
                gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
                gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
            }
        }
        if (menu) {
            if (newState) {
                gsap.set(menu, { visibility: 'visible' });
                gsap.fromTo(menu, { opacity: 0, y: 10, scaleY: 1 }, { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease, transformOrigin: 'top center' });
            } else {
                gsap.to(menu, { opacity: 0, y: 10, scaleY: 1, duration: 0.2, ease, transformOrigin: 'top center', onComplete: () => { gsap.set(menu, { visibility: 'hidden' }); } });
            }
        }
        onMobileMenuClick?.();
    };

    const isExternalLink = href => href.startsWith('http') || href.startsWith('#');
    const isRouterLink = href => href && !isExternalLink(href);

    // Helpers Usuario
    const getInitials = (n) => n ? n.substring(0, 2).toUpperCase() : 'US';
    const getFirstName = (n) => n ? n.split(' ')[0] : 'Usuario';

    const cssVars = {
        '--base': baseColor,
        '--pill-bg': pillColor,
        '--hover-text': hoveredPillTextColor,
        '--pill-text': resolvedPillTextColor
    };

    return (
        <div className="pill-nav-container">
            <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>

                {/* --- IZQUIERDA: LOGO Y MENÚ --- */}
                <div className="nav-left-section">
                    <Link
                        className="pill-logo"
                        to={logoHref}
                        onMouseEnter={handleLogoEnter}
                        ref={el => logoRef.current = el}
                    >
                        <img src={logo} alt={logoAlt} ref={logoImgRef} />
                    </Link>

                    <div className="pill-nav-items desktop-only" ref={navItemsRef}>
                        <ul className="pill-list" role="menubar">
                            {items.map((item, i) => (
                                <li key={i} role="none">
                                    {isRouterLink(item.href) ? (
                                        <Link
                                            to={item.href}
                                            className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                                            onMouseEnter={() => handleEnter(i)}
                                            onMouseLeave={() => handleLeave(i)}
                                        >
                                            <span className="hover-circle" ref={el => circleRefs.current[i] = el} />
                                            <span className="label-stack">
                                                <span className="pill-label">{item.label}</span>
                                                <span className="pill-label-hover">{item.label}</span>
                                            </span>
                                        </Link>
                                    ) : (
                                        <a href={item.href} className={`pill${activeHref === item.href ? ' is-active' : ''}`}>
                                            {item.label}
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* --- DERECHA: USUARIO Y HAMBURGUESA --- */}
                <div className="nav-right-section">
                    <div className="user-pill-container desktop-only">
                        {userData ? (
                            <div style={{ position: 'relative' }}>
                                <div className="user-pill-button" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                                    <div className="user-avatar">{getInitials(userData.name)}</div>
                                    <div className="user-info-mini">
                                        <span className="user-name-display">{getFirstName(userData.name)}</span>
                                        <span className="user-role-display">{userData.role}</span>
                                    </div>
                                    <i className="bi bi-chevron-down" style={{ fontSize: '10px', marginLeft: '4px', color: '#fff' }}></i>
                                </div>
                                {isUserMenuOpen && (
                                    <>
                                        <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setIsUserMenuOpen(false)}></div>
                                        <div className="user-dropdown-card">
                                            <div className="dropdown-header">
                                                <div className="dropdown-avatar-large">{getInitials(userData.name)}</div>
                                                <div className="dropdown-user-info">
                                                    <h4>{userData.name}</h4>
                                                    <span>{userData.role}</span>
                                                </div>
                                            </div>
                                            <Link to="/mis-datos" className="dropdown-action-btn" onClick={() => setIsUserMenuOpen(false)}>Mi Perfil</Link>
                                            <button className="dropdown-action-btn logout" onClick={onLogout}>Cerrar Sesión</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="pill" style={{ height: '36px', background: 'rgba(0,0,0,0.2)' }}>Iniciar</Link>
                        )}
                    </div>

                    <button className="mobile-menu-button mobile-only" onClick={toggleMobileMenu} ref={hamburgerRef}>
                        <span className="hamburger-line" />
                        <span className="hamburger-line" />
                    </button>
                </div>

            </nav>

            {/* MOBILE MENU */}
            <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
                <ul className="mobile-menu-list">
                    {items.map((item, i) => (
                        <li key={i}>
                            <Link to={item.href} className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    {userData && (
                        <li style={{ marginTop: '10px' }}>
                            <button className="mobile-menu-link" style={{ color: 'red' }} onClick={onLogout}>Salir</button>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default PillNav;