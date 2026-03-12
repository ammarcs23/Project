import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';

const ContactSection = () => {
    return (
        <section id="contact" className="contact-section py-5 bg-light">
            <Container>
                <div className="text-center mb-5">
                    <h2 className="fw-bold">Contact Us</h2>
                    <p className="text-muted">We're here to help you 24/7</p>
                </div>

                <Row className="g-4 mb-5">
                    <Col md={3}>
                        <Card className="text-center border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-block mb-3">
                                    <FaPhone className="text-primary" size={24} />
                                </div>
                                <h5>Emergency</h5>
                                <p className="text-muted mb-0">+1 (800) 123-4567</p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="text-center border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="rounded-circle bg-info bg-opacity-10 p-3 d-inline-block mb-3">
                                    <FaEnvelope className="text-info" size={24} />
                                </div>
                                <h5>Email</h5>
                                <p className="text-muted mb-0">info@medicare.com</p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="text-center border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="rounded-circle bg-success bg-opacity-10 p-3 d-inline-block mb-3">
                                    <FaMapMarkerAlt className="text-success" size={24} />
                                </div>
                                <h5>Location</h5>
                                <p className="text-muted mb-0">123 Healthcare Ave, NY</p>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={3}>
                        <Card className="text-center border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="rounded-circle bg-warning bg-opacity-10 p-3 d-inline-block mb-3">
                                    <FaClock className="text-warning" size={24} />
                                </div>
                                <h5>24/7 Service</h5>
                                <p className="text-muted mb-0">Always Open</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default ContactSection;