import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaCalendarCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useHomepage } from '../context/HomepageContext';
import './DoctorsSection.css';

import doctorSarah   from '../assets/Doctor_1.png';
import doctorMichael from '../assets/Doctor_2.png';
import doctorEmily   from '../assets/Doctor_3.png';
import doctorJames   from '../assets/Doctor_4.png';

// Fallback local images map
const localImages = {
    0: doctorSarah,
    1: doctorMichael,
    2: doctorEmily,
    3: doctorJames,
};

const DoctorsSection = () => {
    const { state } = useHomepage();
    const navigate  = useNavigate();

    const activeDoctors = state.doctors.filter(d => d.active);

    return (
        <section id="doctors" className="doctors-section">
            <div className="doctors-bg">
                <div className="bg-pattern"></div>
                <div className="bg-glow glow-1"></div>
                <div className="bg-glow glow-2"></div>
            </div>

            <Container>
                <div className="section-header text-center">
                    {/* ✅ Dynamic from Admin */}
                    <span className="section-subtitle">{state.doctorsSubtitle}</span>
                    <h2 className="section-title">
                        Meet Our <span className="text-gradient">{state.doctorsTitle.split(' ').slice(-1)}</span>
                    </h2>
                    <p className="section-description">
                        Expert doctors dedicated to providing you with the best healthcare experience
                    </p>
                </div>

                <Row className="g-4">
                    {activeDoctors.map((doctor, idx) => (
                        <Col lg={3} md={6} key={doctor.id}>
                            <div
                                className="doctor-card"
                                onClick={() => navigate('/book-appointment')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card-inner">
                                    <div className="doctor-image-wrapper">
                                        {/* Use local image as fallback for first 4 */}
                                        <img
                                            src={doctor.avatar.startsWith('http')
                                                ? doctor.avatar
                                                : localImages[idx % 4]}
                                            alt={doctor.name}
                                            className="doctor-image"
                                            onError={e => { e.target.src = localImages[idx % 4]; }}
                                        />
                                        <div className="image-overlay"></div>
                                    </div>

                                    <div className="doctor-info">
                                        {/* ✅ Dynamic name + specialty from Admin */}
                                        <h3 className="doctor-name">{doctor.name}</h3>
                                        <p className="doctor-specialty">{doctor.specialty}</p>

                                        <button
                                            className="appointment-btn"
                                            onClick={e => { e.stopPropagation(); navigate('/book-appointment'); }}
                                        >
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