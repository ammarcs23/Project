import React from 'react';
import { FaHeartbeat, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { Container, Row, Col } from 'react-bootstrap';
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaYoutube,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaClock,
    FaHeart,
    FaHospital,
    FaAmbulance,
    FaStethoscope,
    FaTooth,
    FaBrain,
    FaBaby,
    FaArrowRight
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: "Home", link: "#home" },
        { name: "Services", link: "#services" },
        { name: "About Us", link: "#about" },
        { name: "Our Doctors", link: "#doctors" },
        { name: "Contact", link: "#contact" },
        { name: "Appointments", link: "#" },
        { name: "Patient Portal", link: "#" }
    ];

    const services = [
        { name: "Emergency Care", icon: <FaAmbulance /> },
        { name: "Cardiology", icon: <FaHeart /> },
        { name: "Neurology", icon: <FaBrain /> },
        { name: "Pediatrics", icon: <FaBaby /> },
        { name: "Dental Care", icon: <FaTooth /> },
        { name: "General Medicine", icon: <FaStethoscope /> }
    ];

    const contactInfo = [
        { icon: <FaMapMarkerAlt />, text: "123 Healthcare Avenue, Medical District, NY 10001" },
        { icon: <FaPhone />, text: "+1 (800) 123-4567" },
        { icon: <FaEnvelope />, text: "info@medicare.com" },
        { icon: <FaClock />, text: "24/7 Emergency Services" }
    ];

    const socialLinks = [
        { icon: <FaFacebookF />, link: "#", color: "#1877f2" },
        { icon: <FaTwitter />, link: "#", color: "#1da1f2" },
        { icon: <FaInstagram />, link: "#", color: "#e4405f" },
        { icon: <FaLinkedinIn />, link: "#", color: "#0077b5" },
        { icon: <FaYoutube />, link: "#", color: "#ff0000" }
    ];

    return (
        <footer className="footer-section">
            <div className="footer-bg">
                <div className="bg-pattern"></div>
                <div className="bg-glow glow-1"></div>
                <div className="bg-glow glow-2"></div>
                <div className="bg-dots"></div>
                <div className="bg-cross"></div>
            </div>

            <div className="newsletter-section">
                <Container>
                    <div className="newsletter-wrapper">
                        <Row className="align-items-center">
                            <Col lg={6}>
                                <h3 className="newsletter-title">Subscribe to Our Newsletter</h3>
                                <p className="newsletter-text">
                                    Get the latest health tips and medical updates directly in your inbox
                                </p>
                            </Col>
                            <Col lg={6}>
                                <form className="newsletter-form">
                                    <div className="input-group">
                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            className="newsletter-input"
                                        />
                                        <button type="submit" className="newsletter-btn">
                                            Subscribe
                                            <FaArrowRight className="arrow-icon" />
                                        </button>
                                    </div>
                                </form>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>

            
            <div className="footer-main py-5">
                <Container>
                    <Row className="g-4">
                        <Col lg={3} md={6}>
                            <div className="footer-brand">
                                <div className="brand-text">
                                    <span className="brand-name">MediCare</span>
                                    <span className="brand-plus">+</span>
                                </div>
                            </div>
                            <p className="footer-about">
                                Providing quality healthcare services with compassion and excellence.
                                Your health and well-being are our top priorities since 1998.
                            </p>

                            <div className="trust-badge">
                                <span className="badge-text">NABH Accredited</span>
                                <span className="badge-year">25+ Years</span>
                            </div>

                            <div className="social-links">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.link}
                                        className="social-link"
                                        style={{ '--social-color': social.color }}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </Col>

                        <Col lg={3} md={6}>
                            <h5 className="footer-title">Quick Links</h5>
                            <ul className="footer-links">
                                {quickLinks.map((link, index) => (
                                    <li key={index}>
                                        <a href={link.link}>
                                            <FaArrowRight className="link-icon" />
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </Col>

                        <Col lg={3} md={6}>
                            <h5 className="footer-title">Our Services</h5>
                            <div className="services-grid">
                                {services.map((service, index) => (
                                    <a key={index} href="#" className="service-item">
                                        <span className="service-icon">{service.icon}</span>
                                        <span className="service-name">{service.name}</span>
                                    </a>
                                ))}
                            </div>
                        </Col>

                    </Row>
                </Container>
            </div>

            <div className="footer-bottom">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6} className="text-center text-md-start">
                            <p className="copyright">
                                © {currentYear} <span className="brand-highlight">MediCare+</span>. All rights reserved.
                            </p>
                        </Col>
                        <Col md={6} className="text-center text-md-end">
                            <div className="footer-bottom-links">
                                <a href="#">Privacy Policy</a>
                                <span className="separator">•</span>
                                <a href="#">Terms of Use</a>
                                <span className="separator">•</span>
                                <a href="#">Sitemap</a>
                            </div>
                            <p className="made-with">
                                Developed with <FaHeart className="heart-icon" /> By Ammar Jahangir | Supervised by Mr.Muhammad Waseem
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>
        </footer>
    );
};

export default Footer;