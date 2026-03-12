import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

import doctorSarah from '../assets/Doctor_1.png';
import doctorMichael from '../assets/Doctor_2.png';
import doctorEmily from '../assets/Doctor_3.png';
import doctorJames from '../assets/Doctor_4.png';

const DoctorsSection = () => {
    const doctors = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            specialty: "Cardiologist",
            image: doctorSarah
        },
        {
            id: 2,
            name: "Dr. Michael Chen",
            specialty: "Neurologist",
            image: doctorMichael
        },
        {
            id: 3,
            name: "Dr. Emily Williams",
            specialty: "Pediatrician",
            image: doctorEmily
        },
        {
            id: 4,
            name: "Dr. James Wilson",
            specialty: "Orthopedic Surgeon",
            image: doctorJames
        }
    ];

    return (
        <section id="doctors" className="doctors-section py-5">
            <Container>
                <h2 className="text-center fw-bold mb-5">Our Top Specialists</h2>
                <Row>
                    {doctors.map((doctor) => (
                        <Col lg={3} md={6} className="mb-4" key={doctor.id}>
                            <Card className="border-0 shadow-lg hover-card">
                                <Card.Img
                                    variant="top"
                                    src={doctor.image}
                                    style={{ height: '250px', objectFit: 'cover' }}
                                    alt={doctor.name}
                                />
                                <Card.Body className="text-center">
                                    <Card.Title>{doctor.name}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-primary">{doctor.specialty}</Card.Subtitle>
                                    <Button variant="outline-primary" size="sm">View Profile</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <div className="text-center mt-4">
                    <Button variant="primary" size="lg">
                        View All Doctors <span className="ms-2">▼</span>
                    </Button>
                </div>
            </Container>
        </section>
    );
};

export default DoctorsSection;