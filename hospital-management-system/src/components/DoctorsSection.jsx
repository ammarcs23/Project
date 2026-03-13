import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaCalendarCheck } from 'react-icons/fa';
import './DoctorsSection.css';


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
        <section id="doctors" className="doctors-section">
            
            <div className="doctors-bg">
                <div className="bg-pattern"></div>
                <div className="bg-glow glow-1"></div>
                <div className="bg-glow glow-2"></div>
            </div>

            <Container>
                <div className="section-header text-center">
                    <span className="section-subtitle">Our Medical Team</span>
                    <h2 className="section-title">
                        Meet Our <span className="text-gradient">Specialists</span>
                    </h2>
                    <p className="section-description">
                        Expert doctors dedicated to providing you with the best healthcare experience
                    </p>
                </div>

                
                <Row className="g-4">
                    {doctors.map((doctor) => (
                        <Col lg={3} md={6} key={doctor.id}>
                            <div className="doctor-card">
                                <div className="card-inner">
                                    
                                    <div className="doctor-image-wrapper">
                                        <img
                                            src={doctor.image}
                                            alt={doctor.name}
                                            className="doctor-image"
                                        />
                                        <div className="image-overlay"></div>
                                    </div>

                                    
                                    <div className="doctor-info">
                                        <h3 className="doctor-name">{doctor.name}</h3>
                                        <p className="doctor-specialty">{doctor.specialty}</p>

                                        
                                        <button className="appointment-btn">
                                            <FaCalendarCheck className="btn-icon" />
                                            Book Appointment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>


            </Container>
        </section>
    );
};

export default DoctorsSection;