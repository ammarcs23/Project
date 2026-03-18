import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaUserMd, FaBed, FaAmbulance, FaSmile, FaHeartbeat, FaCheckCircle } from 'react-icons/fa';
import { useHomepage } from '../context/HomepageContext';
import './AboutSection.css';

const iconMap = { "Hospital Beds": <FaBed />, "Expert Doctors": <FaUserMd />, "Emergency Care": <FaAmbulance />, "Happy Patients": <FaSmile /> };
const colorMap = { "Hospital Beds": "#3b82f6", "Expert Doctors": "#8b5cf6", "Emergency Care": "#ef4444", "Happy Patients": "#10b981" };

const achievements = [
    { year: "1998", title: "Founded", description: "Started with 50 beds" },
    { year: "2010", title: "Expansion", description: "Added multi-specialty wing" },
    { year: "2018", title: "NABH Accredited", description: "Quality healthcare certified" },
    { year: "2023", title: "Excellence Award", description: "Best hospital in region" }
];

const AboutSection = () => {
    const { state } = useHomepage();

    const stats = state.aboutStats.map(s => ({
        icon: iconMap[s.label] || <FaHeartbeat />,
        value: s.value,
        label: s.label,
        color: colorMap[s.label] || "#3b82f6",
    }));

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
                        {/* ✅ Dynamic from Admin */}
                        {state.aboutSubtitle.split(' ').slice(0, -1).join(' ')} <span className="text-gradient">{state.aboutSubtitle.split(' ').slice(-1)}</span>
                    </h2>
                    <p className="section-description">{state.aboutDescription}</p>
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
                                {/* ✅ Dynamic title from Admin */}
                                <h3 className="about-subtitle">
                                    {state.aboutTitle.split(' ').slice(0, -1).join(' ')} <span className="text-gradient">{state.aboutTitle.split(' ').slice(-1)}</span>
                                </h3>
                            </div>

                            <div className="stats-grid">
                                {stats.map((stat, index) => (
                                    <div key={index} className="stat-item">
                                        <div className="stat-icon-wrapper" style={{ background: `${stat.color}15` }}>
                                            <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
                                        </div>
                                        <div className="stat-content">
                                            <h4 className="stat-value">{stat.value}</h4>
                                            <p className="stat-label">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ✅ Dynamic features from Admin */}
                            <div className="features-grid">
                                {state.aboutFeatures.map((feature, index) => (
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

                {/* ✅ Offers Section — shown if admin enabled offers */}
                {state.showOffers && state.offers.some(o => o.active) && (
                    <div style={{ marginTop: 60 }}>
                        <h3 style={{ fontWeight: 700, fontSize: '1.6rem', color: '#0f172a', marginBottom: 24, textAlign: 'center' }}>
                            🎁 Current <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Offers</span>
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                            {state.offers.filter(o => o.active).map(offer => (
                                <div key={offer.id} style={{
                                    background: 'white', borderRadius: 16, padding: '20px 22px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    borderLeft: `4px solid ${offer.color}`,
                                    display: 'flex', alignItems: 'flex-start', gap: 14,
                                }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                                        background: `${offer.color}18`, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎁</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{offer.title}</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
                                                borderRadius: 20, background: `${offer.color}20`, color: offer.color }}>
                                                {offer.tag}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{offer.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
