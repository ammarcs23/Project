import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaHeartbeat,
  FaBrain,
  FaBone,
  FaBaby,
  FaEye,
  FaLungs
} from 'react-icons/fa';

const ServicesSection = () => {
  const services = [
    {
      icon: <FaHeartbeat className="service-icon" />,
      title: "Cardiology",
      description: "Expert heart care with advanced diagnostic tools and treatments",
      color: "#3b82f6",
      features: ["ECG & Echo", "Angioplasty", "Heart Surgery"]
    },
    {
      icon: <FaBrain className="service-icon" />,
      title: "Neurology",
      description: "Comprehensive care for brain and nervous system disorders",
      color: "#8b5cf6",
      features: ["Stroke Care", "Neurosurgery", "EMG/NCS"]
    },
    {
      icon: <FaBone className="service-icon" />,
      title: "Orthopedics",
      description: "Advanced joint replacement and sports medicine",
      color: "#10b981",
      features: ["Joint Replacement", "Spine Surgery", "Sports Injury"]
    },
    {
      icon: <FaBaby className="service-icon" />,
      title: "Pediatrics",
      description: "Specialized care for infants, children, and adolescents",
      color: "#f59e0b",
      features: ["Newborn Care", "Vaccinations", "Child Development"]
    },
    {
      icon: <FaEye className="service-icon" />,
      title: "Ophthalmology",
      description: "Complete eye care with modern surgical techniques",
      color: "#ef4444",
      features: ["Cataract Surgery", "LASIK", "Glaucoma Care"]
    },
    {
      icon: <FaLungs className="service-icon" />,
      title: "Pulmonology",
      description: "Expert care for respiratory and lung conditions",
      color: "#06b6d4",
      features: ["Bronchoscopy", "Sleep Studies", "Asthma Care"]
    }
  ];

  return (
    <section id="services" className="services-section">

      <div className="section-bg">
        <div className="bg-grid"></div>
        <div className="bg-glow glow-1"></div>
        <div className="bg-glow glow-2"></div>
      </div>

      <Container>

        <div className="section-header text-center">
          <span className="section-subtitle">Our Specialties</span>
          <h2 className="section-title">
            Comprehensive Medical <span className="text-gradient">Services</span>
          </h2>
          <p className="section-description">
            We offer a wide range of medical services with state-of-the-art facilities
            and experienced specialists dedicated to your health
          </p>
        </div>


        <Row className="g-4">
          {services.map((service, index) => (
            <Col lg={4} md={6} key={index}>
              <div className="service-card-wrapper">
                <div
                  className="service-card"
                  style={{ '--service-color': service.color }}
                >

                  <div className="card-inner">

                    <div className="icon-wrapper">
                      <div className="icon-bg" style={{ background: `linear-gradient(135deg, ${service.color}20, ${service.color}40)` }}></div>
                      <div className="icon-content" style={{ color: service.color }}>
                        {service.icon}
                      </div>
                    </div>


                    <div className="card-content">
                      <h3 className="service-title">{service.title}</h3>
                      <p className="service-description">{service.description}</p>


                      <div className="service-features">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="feature-item">
                            <svg className="feature-check" viewBox="0 0 24 24" fill="none">
                              <path d="M20 6L9 17L4 12" stroke={service.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <a href="#" className="learn-more" style={{ color: service.color }}>
                        <span>Learn More</span>
                        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </div>

                    <div className="card-dots"></div>
                    <div className="card-shine"></div>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="services-cta">
          <Row className="align-items-center">
            <Col lg={8}>
              <h3 className="cta-title">Need a different medical service?</h3>
              <p className="cta-text">
                We offer over 50+ specialized medical services. Contact us to learn more about our comprehensive healthcare solutions.
              </p>
            </Col>

          </Row>
        </div>
      </Container>

      <style jsx>{`
        .services-section {
          padding: 100px 0;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

            
        .section-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .bg-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .bg-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
        }

        .glow-1 {
          top: -100px;
          right: -100px;
          background: #3b82f6;
        }

        .glow-2 {
          bottom: -100px;
          left: -100px;
          background: #8b5cf6;
        }

            
        .section-header {
          margin-bottom: 60px;
          position: relative;
          z-index: 2;
        }

        .section-subtitle {
          display: inline-block;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          padding: 8px 20px;
          border-radius: 100px;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .text-gradient {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-description {
          font-size: 1.125rem;
          color: #475569;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .service-card-wrapper {
          height: 100%;
          perspective: 1000px;
        }

        .service-card {
          height: 100%;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
        }

        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 30px 40px -15px rgba(0, 0, 0, 0.2);
        }

        .card-inner {
          padding: 40px 30px;
          position: relative;
          z-index: 2;
        }

            
        .icon-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 30px;
        }

        .icon-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          transform: rotate(45deg);
          transition: all 0.3s ease;
        }

        .service-card:hover .icon-bg {
          transform: rotate(0deg);
          border-radius: 50%;
        }

        .icon-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          z-index: 2;
        }

            
        .card-content {
          position: relative;
        }

        .service-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 15px;
        }

        .service-description {
          color: #475569;
          line-height: 1.6;
          margin-bottom: 20px;
        }

       
        .service-features {
          margin-bottom: 25px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .feature-check {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .feature-item span {
          color: #334155;
          font-size: 0.95rem;
        }

            
        .learn-more {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .learn-more .arrow-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .learn-more:hover .arrow-icon {
          transform: translateX(5px);
        }

            
        .card-dots {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background-image: radial-gradient(circle, rgba(0,0,0,0.05) 2px, transparent 2px);
          background-size: 10px 10px;
          opacity: 0.5;
          z-index: 1;
        }

        .card-shine {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent 50%, rgba(255,255,255,0.03) 100%);
          pointer-events: none;
        }

           
        .services-cta {
          margin-top: 80px;
          padding: 50px;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          border-radius: 30px;
          position: relative;
          overflow: hidden;
        }

        .services-cta::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        .cta-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: white;
          margin-bottom: 15px;
        }

        .cta-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.125rem;
          line-height: 1.6;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          background: #3b82f6;
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cta-button:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 20px 30px -10px rgba(59, 130, 246, 0.4);
        }

        .cta-button .arrow-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .cta-button:hover .arrow-icon {
          transform: translateX(5px);
        }

          
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

            
        @media (max-width: 991px) {
          .services-section {
            padding: 80px 0;
          }

          .services-cta {
            padding: 40px;
          }

          .cta-title {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .services-section {
            padding: 60px 0;
          }

          .section-header {
            margin-bottom: 40px;
          }

          .card-inner {
            padding: 30px 20px;
          }

          .services-cta {
            padding: 30px;
            text-align: center;
          }

          .text-lg-end {
            text-align: center !important;
            margin-top: 20px;
          }

          .cta-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
};

export default ServicesSection;