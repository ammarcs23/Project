import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaHeartbeat, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import './NavigationBar.css';

const NavigationBar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState('home');
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Change navbar style on scroll
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }

            // Update active link based on scroll position
            const sections = ['home', 'services', 'about', 'doctors', 'contact'];
            const scrollPosition = window.scrollY + 150;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveLink(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    // Smooth scroll to sections
    const handleNavClick = (e, href) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveLink(href.substring(1));
            setShowMobileMenu(false);
        }
    };

    return (
        <>
            <Navbar
                expand="lg"
                fixed="top"
                expanded={showMobileMenu}
                onToggle={() => setShowMobileMenu(!showMobileMenu)}
                className={`custom-navbar ${scrolled ? 'navbar-scrolled' : ''}`}
            >
                <Container>
                    <Navbar.Brand
                        href="#home"
                        className="brand"
                        onClick={(e) => handleNavClick(e, '#home')}
                    >
                        <div className="brand-icon-wrapper">
                            <FaHeartbeat className="brand-icon" />
                            <span className="brand-pulse"></span>
                        </div>
                        <div className="brand-text">
                            <span className="brand-name">MediCare</span>
                            <span className="brand-plus">+</span>
                        </div>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav">
                        <div className={`hamburger ${showMobileMenu ? 'active' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </Navbar.Toggle>

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mx-auto nav-links">
                            {['home', 'services', 'about', 'doctors', 'contact'].map((item) => (
                                <Nav.Link
                                    key={item}
                                    href={`#${item}`}
                                    className={`nav-link-custom ${activeLink === item ? 'active' : ''}`}
                                    onClick={(e) => handleNavClick(e, `#${item}`)}
                                >
                                    <span className="nav-link-text">{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                                    <span className="nav-link-indicator"></span>
                                </Nav.Link>
                            ))}
                        </Nav>

                        <div className="auth-buttons">
                            <button className="auth-btn login-btn">
                                <FaSignInAlt className="btn-icon" />
                                <span>Login</span>
                            </button>
                            <button className="auth-btn signup-btn">
                                <FaUserPlus className="btn-icon" />
                                <span>Sign Up</span>
                            </button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            
            <style>{`
                body {
                    padding-top: 80px;
                }
                
                @media (max-width: 768px) {
                    body {
                        padding-top: 70px;
                    }
                }
            `}</style>
        </>
    );
};

export default NavigationBar;