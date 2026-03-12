import React, { useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import {
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
    FaPaperPlane,
    FaFacebookF,
    FaTwitter,
    FaLinkedinIn,
    FaInstagram,
    FaAmbulance,
    FaUserMd,
    FaHospital,
    FaHeartbeat
} from 'react-icons/fa';
import './ContactSection.css';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        message: ''
    });

    const [formStatus, setFormStatus] = useState({
        submitting: false,
        submitted: false,
        error: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus({ ...formStatus, submitting: true });

        setTimeout(() => {
            setFormStatus({ submitting: false, submitted: true, error: null });
            setFormData({ name: '', email: '', phone: '', department: '', message: '' });

            setTimeout(() => {
                setFormStatus({ submitting: false, submitted: false, error: null });
            }, 5000);
        }, 1500);
    };

    const contactInfo = [
        {
            icon: <FaPhone />,
            title: "Emergency",
            value: "+1 (800) 123-4567",
            subText: "24/7 Ambulance Service",
            color: "#ef4444",
            bgColor: "#fee2e2"
        },
        {
            icon: <FaEnvelope />,
            title: "Email Us",
            value: "info@medicare.com",
            subText: "info@medicare.com",
            color: "#3b82f6",
            bgColor: "#dbeafe"
        },
        {
            icon: <FaMapMarkerAlt />,
            title: "Visit Us",
            value: "123 Healthcare Ave",
            subText: "New York, NY 10001",
            color: "#10b981",
            bgColor: "#d1fae5"
        },
        {
            icon: <FaClock />,
            title: "Working Hours",
            value: "24/7 Service",
            subText: "Always Open",
            color: "#8b5cf6",
            bgColor: "#ede9fe"
        }
    ];

    const departments = [
        "Cardiology",
        "Neurology",
        "Pediatrics",
        "Orthopedics",
        "Emergency",
        "Radiology"
    ];

    return (
        <section id="contact" className="contact-section">

            <div className="contact-bg">
                <div className="bg-pattern"></div>
                <div className="bg-glow glow-1"></div>
                <div className="bg-glow glow-2"></div>
                <div className="bg-dots"></div>
                <div className="bg-circles"></div>
            </div>

            <Container>
                <div className="section-header text-center">
                    <span className="section-subtitle">Get In Touch</span>
                    <h2 className="section-title">
                        Contact <span className="text-gradient">Us</span>
                    </h2>
                    <p className="section-description">
                        We're here to assist you 24/7 with any questions or concerns
                    </p>
                </div>

                <div className="floating-elements">
                    <FaHospital className="float-icon icon-1" />
                    <FaHeartbeat className="float-icon icon-2" />
                    <FaUserMd className="float-icon icon-3" />
                    <FaAmbulance className="float-icon icon-4" />
                </div>

                <Row className="g-4 mb-5">
                    {contactInfo.map((info, index) => (
                        <Col lg={3} md={6} key={index}>
                            <div className="contact-card">
                                <div className="card-content">
                                    <div className="icon-wrapper" style={{ backgroundColor: info.bgColor }}>
                                        <div className="contact-icon" style={{ color: info.color }}>
                                            {info.icon}
                                        </div>
                                    </div>
                                    <h3 className="card-title">{info.title}</h3>
                                    <p className="card-value">{info.value}</p>
                                    <p className="card-subtext">{info.subText}</p>


                                    {info.title === "Emergency" && (
                                        <span className="emergency-pulse"></span>
                                    )}
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>

                <div className="contact-wrapper">
                    <Row className="g-0">
                        <Col lg={5} className="d-flex">
                            <div className="contact-info-side w-100">
                                <div className="info-header">
                                    <h3 className="info-title">Visit Our Hospital</h3>
                                    <p className="info-subtitle">We'd love to welcome you in person</p>
                                </div>

                                <div className="map-container">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1645564608522!5m2!1sen!2s"
                                        width="100%"
                                        height="300"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        title="hospital-location"
                                        className="map-iframe"
                                    ></iframe>
                                </div>

                                <div className="address-details">
                                    <div className="address-item">
                                        <FaMapMarkerAlt className="address-icon" />
                                        <div>
                                            <h4>Main Hospital</h4>
                                            <p>123 Healthcare Avenue, Medical District<br />New York, NY 10001</p>
                                        </div>
                                    </div>
                                    <div className="address-item">
                                        <FaClock className="address-icon" />
                                        <div>
                                            <h4>Emergency Department</h4>
                                            <p>24/7 - Always Open</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="social-links">
                                    <h4>Follow Us</h4>
                                    <div className="social-icons">
                                        <a href="#" className="social-icon facebook">
                                            <FaFacebookF />
                                        </a>
                                        <a href="#" className="social-icon twitter">
                                            <FaTwitter />
                                        </a>
                                        <a href="#" className="social-icon linkedin">
                                            <FaLinkedinIn />
                                        </a>
                                        <a href="#" className="social-icon instagram">
                                            <FaInstagram />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col lg={7} className="d-flex">
                            <div className="contact-form-side w-100">
                                <div className="form-header">
                                    <h3 className="form-title">Send us a Message</h3>
                                    <p className="form-subtitle">We'll get back to you within 24 hours</p>
                                </div>

                                <Form onSubmit={handleSubmit} className="contact-form">
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="form-group">
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    placeholder="Your Full Name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="form-control-custom"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="form-group">
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    placeholder="Your Email Address"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="form-control-custom"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="form-group">
                                                <Form.Control
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="Your Phone Number"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                    className="form-control-custom"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="form-group">
                                                <Form.Select
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    required
                                                    className="form-control-custom"
                                                >
                                                    <option value="">Select Department</option>
                                                    {departments.map((dept, index) => (
                                                        <option key={index} value={dept}>{dept}</option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="form-group">
                                        <Form.Control
                                            as="textarea"
                                            name="message"
                                            rows={5}
                                            placeholder="Your Message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            className="form-control-custom"
                                        />
                                    </Form.Group>

                                    <div className="form-footer">
                                        <button
                                            type="submit"
                                            className="submit-btn"
                                            disabled={formStatus.submitting}
                                        >
                                            {formStatus.submitting ? (
                                                <>
                                                    <span className="spinner"></span>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPaperPlane className="btn-icon" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>

                                        {formStatus.submitted && (
                                            <div className="success-message">
                                                Thank you! We'll contact you soon.
                                            </div>
                                        )}
                                    </div>
                                </Form>

                                <div className="quick-contact">
                                    <p>
                                        <FaPhone className="quick-icon" />
                                        <span>Emergency Hotline: <strong>1-800-MEDICARE</strong></span>
                                    </p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </section>
    );
};

export default ContactSection;