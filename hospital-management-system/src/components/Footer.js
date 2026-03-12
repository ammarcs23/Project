import React from 'react';
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
    FaHospital
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-section">
            {/* Main Footer */}
            <div className="footer-main py-5">
                <Container>
                    <Row>
                        {/* About Column */}
                        <Col lg={4} md={6} className="mb-4 mb-lg-0">
                            <div className="footer-brand d-flex align-items-center mb-3">
                                <FaHospital className="footer-icon me-2" />
                                <h4 className="mb-0">MediCare+</h4>
                            </div>
                            <p className="footer-about">
                                Providing quality healthcare services with compassion and excellence.
                                Your health and well-being are our top priorities.
                            </p>
                            <div className="social-links mt-4">
                                <a href="#" className="social-link"><FaFacebookF /></a>
                                <a href="#" className="social-link"><FaTwitter /></a>
                                <a href="#" className="social-link"><FaInstagram /></a>
                                <a href="#" className="social-link"><FaLinkedinIn /></a>
                                <a href="#" className="social-link"><FaYoutube /></a>
                            </div>
                        </Col>

                        {/* Quick Links */}
                        <Col lg={2} md={6} className="mb-4 mb-lg-0">
                            <h5 className="footer-title">Quick Links</h5>
                            <ul className="footer-links">
                                <li><a href="#home">Home</a></li>
                                <li><a href="#services">Services</a></li>
                                <li><a href="#about">About Us</a></li>
                                <li><a href="#doctors">Our Doctors</a></li>
                                <li><a href="#contact">Contact</a></li>
                            </ul>
                        </Col>

                        {/* Services Links */}
                        <Col lg={2} md={6} className="mb-4 mb-lg-0">
                            <h5 className="footer-title">Our Services</h5>
                            <ul className="footer-links">
                                <li><a href="#">Emergency Care</a></li>
                                <li><a href="#">Cardiology</a></li>
                                <li><a href="#">Neurology</a></li>
                                <li><a href="#">Pediatrics</a></li>
                                <li><a href="#">Orthopedics</a></li>
                            </ul>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div className="footer-bottom py-3">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
                            <p className="mb-0">
                                © {currentYear} MediCare+. All rights reserved.
                            </p>
                        </Col>
                        <Col md={6} className="text-center text-md-end">
                            <p className="mb-0">
                                Made with <FaHeart className="text-danger mx-1" /> for better healthcare
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>
        </footer>
    );
};

export default Footer;