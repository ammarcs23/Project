import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./components/CustomNavbar.css";
import { Container, Navbar, Nav, Button, Row, Col, Card, Carousel, Form } from 'react-bootstrap';
import {
    FaHeartbeat,
    FaAmbulance,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaFacebook,
    FaTwitter,
    FaLinkedin,
    FaInstagram,
    FaStethoscope,
    FaHospital,
    FaClock
} from 'react-icons/fa';
import './App.css';

function App() {
    return (
        <div className="App">

            <Navbar expand="lg" sticky="top" className="custom-navbar py-3">
                <Container>
                    <Navbar.Brand href="#home" className="fw-bold fs-3 brand">
                        <FaHospital className="me-2 hospital-icon" />
                        MediCare+
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mx-auto">
                            <Nav.Link href="#home" className="nav-link-custom mx-2">Home</Nav.Link>
                            <Nav.Link href="#services" className="nav-link-custom mx-2">Services</Nav.Link>
                            <Nav.Link href="#about" className="nav-link-custom mx-2">About</Nav.Link>
                            <Nav.Link href="#doctors" className="nav-link-custom mx-2">Doctors</Nav.Link>
                            <Nav.Link href="#contact" className="nav-link-custom mx-2">Contact</Nav.Link>
                        </Nav>

                        <div className="d-flex gap-2">
                            <Button className="login-btn">Login</Button>
                            <Button className="signup-btn">Sign Up</Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <section className="slider-section py-5 bg-light">
                <Container>
                    <Carousel fade>
                        <Carousel.Item>
                            <img
                                className="d-block w-100"
                                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1153&q=80"
                                alt="Operation Theater"
                                style={{ height: '500px', objectFit: 'cover' }}
                            />
                            <Carousel.Caption>
                                <h3>Modern Operation Theater</h3>
                                <p>State-of-the-art surgical facilities</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img
                                className="d-block w-100"
                                src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1173&q=80"
                                alt="ICU"
                                style={{ height: '500px', objectFit: 'cover' }}
                            />
                            <Carousel.Caption>
                                <h3>Intensive Care Unit</h3>
                                <p>24/7 monitored ICU</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img
                                className="d-block w-100"
                                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
                                alt="Diagnostic Center"
                                style={{ height: '500px', objectFit: 'cover' }}
                            />
                            <Carousel.Caption>
                                <h3>Advanced Diagnostic Center</h3>
                                <p>Latest technology for accurate diagnosis</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </Container>
            </section>

            {/* Services Section with 3 Cards */}
            <section id="services" className="services-section py-5">
                <Container>
                    <h2 className="text-center fw-bold mb-5">Our Medical Services</h2>
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-lg hover-card">
                                <Card.Body className="text-center p-4">
                                    <FaHeartbeat size={50} className="text-primary mb-3" />
                                    <Card.Title className="fw-bold fs-4 mb-3">Cardiology</Card.Title>
                                    <Card.Text className="text-muted">
                                        Expert heart care with advanced diagnostic tools and treatments.
                                    </Card.Text>
                                    <Button variant="outline-primary" className="mt-3">Learn More</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-lg hover-card">
                                <Card.Body className="text-center p-4">
                                    <FaStethoscope size={50} className="text-success mb-3" />
                                    <Card.Title className="fw-bold fs-4 mb-3">General Medicine</Card.Title>
                                    <Card.Text className="text-muted">
                                        Comprehensive primary care for all ages with preventive care.
                                    </Card.Text>
                                    <Button variant="outline-success" className="mt-3">Learn More</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-lg hover-card">
                                <Card.Body className="text-center p-4">
                                    <FaAmbulance size={50} className="text-warning mb-3" />
                                    <Card.Title className="fw-bold fs-4 mb-3">Emergency Care</Card.Title>
                                    <Card.Text className="text-muted">
                                        24/7 emergency services with rapid response teams.
                                    </Card.Text>
                                    <Button variant="outline-warning" className="mt-3">Learn More</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    {/* Services Dropdown */}
                    <div className="text-center mt-4">
                        <Button variant="primary" size="lg">
                            View All Services <span className="ms-2">▼</span>
                        </Button>
                    </div>
                </Container>
            </section>

            {/* About Section */}
            <section id="about" className="about-section py-5 bg-light">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6}>
                            <img
                                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
                                alt="Our Hospital"
                                className="img-fluid rounded-4 shadow-lg"
                            />
                        </Col>
                        <Col lg={6}>
                            <h2 className="fw-bold mb-4">About MediCare+ Hospital</h2>
                            <p className="lead">With over 25 years of healthcare excellence.</p>
                            <Row className="mb-4">
                                <Col sm={6}>
                                    <h5>500+ Beds</h5>
                                    <h5>150+ Doctors</h5>
                                </Col>
                                <Col sm={6}>
                                    <h5>24/7 Emergency</h5>
                                    <h5>50K+ Patients</h5>
                                </Col>
                            </Row>
                            {/* About Dropdown */}
                            <Button variant="primary">Read More About Us <span className="ms-2">▼</span></Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Doctors Section */}
            <section id="doctors" className="doctors-section py-5">
                <Container>
                    <h2 className="text-center fw-bold mb-5">Our Top Specialists</h2>
                    <Row>
                        {[1, 2, 3, 4].map((doctor) => (
                            <Col lg={3} md={6} className="mb-4" key={doctor}>
                                <Card className="border-0 shadow-lg hover-card">
                                    <Card.Img
                                        variant="top"
                                        src={`https://randomuser.me/api/portraits/${doctor % 2 === 0 ? 'women' : 'men'}/${doctor + 20}.jpg`}
                                        style={{ height: '250px', objectFit: 'cover' }}
                                    />
                                    <Card.Body className="text-center">
                                        <Card.Title>Dr. Sarah Johnson</Card.Title>
                                        <Card.Subtitle className="mb-2 text-primary">Cardiologist</Card.Subtitle>
                                        <Button variant="outline-primary" size="sm">View Profile</Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {/* Doctors Dropdown */}
                    <div className="text-center mt-4">
                        <Button variant="primary" size="lg">
                            View All Doctors <span className="ms-2">▼</span>
                        </Button>
                    </div>
                </Container>
            </section>

            {/* Contact Section */}
            <section id="contact" className="contact-section py-5 bg-light">
                <Container>
                    <h2 className="text-center fw-bold mb-5">Contact Us</h2>
                    <Row>
                        <Col lg={4} className="mb-4">
                            <Card className="border-0 shadow-lg h-100">
                                <Card.Body>
                                    <h4>Get in Touch</h4>
                                    <p><FaMapMarkerAlt className="me-2" /> 123 Healthcare Ave, NY</p>
                                    <p><FaPhone className="me-2 text-danger" /> Emergency: +1 (800) 123-4567</p>
                                    <p><FaEnvelope className="me-2" /> info@medicareplus.com</p>
                                    <p><FaClock className="me-2" /> 24/7 Available</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={8}>
                            <Card className="border-0 shadow-lg">
                                <Card.Body>
                                    <h4>Send Message</h4>
                                    <Form>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Control type="text" placeholder="Your Name" className="mb-3" />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Control type="email" placeholder="Your Email" className="mb-3" />
                                            </Col>
                                        </Row>
                                        <Form.Control type="text" placeholder="Subject" className="mb-3" />
                                        <Form.Control as="textarea" rows={4} placeholder="Message" className="mb-3" />
                                        <Button variant="primary" type="submit">Send Message</Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Footer */}
            <footer className="bg-dark text-white py-4">
                <Container>
                    <Row>
                        <Col md={4}>
                            <h5>MediCare+</h5>
                            <p>Quality healthcare for all.</p>
                        </Col>
                        <Col md={4}>
                            <h5>Quick Links</h5>
                            <ul className="list-unstyled">
                                <li><a href="#home" className="text-white">Home</a></li>
                                <li><a href="#services" className="text-white">Services</a></li>
                                <li><a href="#doctors" className="text-white">Doctors</a></li>
                            </ul>
                        </Col>
                        <Col md={4}>
                            <h5>Follow Us</h5>
                            <FaFacebook className="me-3" size={24} />
                            <FaTwitter className="me-3" size={24} />
                            <FaLinkedin className="me-3" size={24} />
                            <FaInstagram size={24} />
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
}

export default App;