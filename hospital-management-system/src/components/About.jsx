import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
    FaUserMd,
    FaBed,
    FaAmbulance,
    FaSmile,
    FaHeartbeat,
    FaCheckCircle
} from 'react-icons/fa';
import './AboutSection.css';

const AboutSection = () => {
    const stats = [
        { icon: <FaBed />, value: "500+", label: "Hospital Beds", color: "#3b82f6" },
        { icon: <FaUserMd />, value: "150+", label: "Expert Doctors", color: "#8b5cf6" },
        { icon: <FaAmbulance />, value: "24/7", label: "Emergency Care", color: "#ef4444" },
        { icon: <FaSmile />, value: "50K+", label: "Happy Patients", color: "#10b981" }
    ];

    const features = [
        "State-of-the-art Operation Theaters",
        "Advanced Diagnostic Center",
        "Modern Intensive Care Units",
        "24/7 Pharmacy Services",
        "Online Appointment System",
        "Insurance Support"
    ];

    const achievements = [
        { year: "1998", title: "Founded", description: "Started with 50 beds" },
        { year: "2010", title: "Expansion", description: "Added multi-specialty wing" },
        { year: "2018", title: "NABH Accredited", description: "Quality healthcare certified" },
        { year: "2023", title: "Excellence Award", description: "Best hospital in region" }
    ];

    return (
        <section id="about" className="about-section">
            
            <div className="about-bg">
                <div className="bg-pattern"></div>
                <div className="bg-glow glow-left"></div>
                <div className="bg-glow glow-right"></div>
            </div>

            <Container>
                
                <div className="section-header text-center" data-aos="fade-up">
                    <span className="section-subtitle">About Us</span>
                    <h2 className="section-title">
                        Excellence in <span className="text-gradient">Healthcare</span>
                    </h2>
                    <p className="section-description">
                        Providing compassionate care with advanced medical technology for over 25 years
                    </p>
                </div>

                <Row className="align-items-center g-5">
                    
                    <Col lg={6}>
                        <div className="about-image-wrapper" data-aos="fade-right">
                            <div className="image-container">
                                <img
                                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80"
                                    alt="Our Hospital"
                                    className="about-image"
                                />

                                
                                <div className="experience-badge">
                                    <div className="badge-content">
                                        <span className="years">25+</span>
                                        <span className="text">Years of<br />Excellence</span>
                                    </div>
                                </div>

                                
                                <div className="floating-stats">
                                    <div className="stats-card">
                                        <FaHeartbeat className="stats-icon" />
                                        <div className="stats-info">
                                            <span className="stats-value">50K+</span>
                                            <span className="stats-label">Surgeries</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    
                    <Col lg={6}>
                        <div className="about-content" data-aos="fade-left">
                            
                            <div className="description-wrapper">
                                <h3 className="about-subtitle">
                                    We're Committed to Your <span className="text-gradient">Well-being</span>
                                </h3>

                            </div>

                            <div className="stats-grid">
                                {stats.map((stat, index) => (
                                    <div key={index} className="stat-item">
                                        <div className="stat-icon-wrapper" style={{ background: `${stat.color}15` }}>
                                            <div className="stat-icon" style={{ color: stat.color }}>
                                                {stat.icon}
                                            </div>
                                        </div>
                                        <div className="stat-content">
                                            <h4 className="stat-value">{stat.value}</h4>
                                            <p className="stat-label">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            
                            <div className="features-grid">
                                {features.map((feature, index) => (
                                    <div key={index} className="feature-item">
                                        <FaCheckCircle className="feature-check" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            
                            <button className="about-cta">
                                <span>Discover More About Us</span>
                                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </Col>
                </Row>

               
                <div className="achievements-section" data-aos="fade-up">
                    <h3 className="achievements-title text-center">
                        Our Journey of <span className="text-gradient">Excellence</span>
                    </h3>
                    <div className="timeline">
                        {achievements.map((item, index) => (
                            <div key={index} className="timeline-item">
                                <div className="timeline-year">{item.year}</div>
                                <div className="timeline-content">
                                    <h4>{item.title}</h4>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default AboutSection;