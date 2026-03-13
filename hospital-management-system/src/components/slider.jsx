import React from 'react';
import { Container, Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ImageSlider.css'; // Import the CSS file

// Import local images
import operationTheater from '../assets/slider2.webp';
import icu from '../assets/slider3.webp';
import diagnosticCenter from '../assets/slider2.webp';

const ImageSlider = () => {
  const slides = [
    {
      image: operationTheater,
      alt: "Operation Theater",
      title: "Modern Operation Theater",
      description: "State-of-the-art surgical facilities with advanced equipment for precision care",
      stats: ["98% Success Rate", "500+ Surgeries", "15+ Specialists"]
    },
    {
      image: icu,
      alt: "ICU",
      title: "Intensive Care Unit",
      description: "Round-the-clock critical care with advanced life support systems",
      stats: ["24/7 Monitoring", "Critical Care", "Rapid Response"]
    },
    {
      image: diagnosticCenter,
      alt: "Diagnostic Center",
      title: "Advanced Diagnostic Center",
      description: "Latest technology for accurate and rapid diagnosis",
      stats: ["4K Imaging", "AI Diagnostics", "Same Day Reports"]
    }
  ];

  return (
    <section className="slider-section position-relative">
      <Container fluid className="px-0">
        <Carousel
          fade
          className="modern-carousel"
          indicators={true}
          interval={5000}
          pause="hover"
          prevIcon={<span className="carousel-control-prev-icon modern-control" />}
          nextIcon={<span className="carousel-control-next-icon modern-control" />}
        >
          {slides.map((slide, index) => (
            <Carousel.Item key={index}>
              <div className="slide-container">
                <div className="image-wrapper">
                  <img
                    className="d-block w-100"
                    src={slide.image}
                    alt={slide.alt}
                    style={{
                      height: '90vh',
                      minHeight: '600px',
                      maxHeight: '800px',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="overlay-gradient"></div>
                </div>

                <div className="content-container">
                  <div className="container">
                    <div className="row">
                      <div className="col-lg-8 col-xl-7">
                        <div className="modern-card">
                          <div className="badge-wrapper">
                            <span className="facility-badge">
                              <span className="pulse-dot"></span>
                              {slide.alt}
                            </span>
                          </div>

                          <h1 className="slide-title">
                            {slide.title}
                          </h1>

                          <p className="slide-description">
                            {slide.description}
                          </p>

                         
                          <div className="stats-container" style={{
                            display: 'flex',
                            gap: '2rem',
                            marginBottom: '2.5rem',
                            flexWrap: 'wrap',
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            padding: '10px 15px',
                            borderRadius: '50px'
                          }}>
                            {slide.stats.map((stat, idx) => (
                              <div key={idx} className="stat-item" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                padding: '8px 16px',
                                borderRadius: '30px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}>
                                <div className="stat-line" style={{
                                  width: '40px',
                                  height: '2px',
                                  background: '#3b82f6',
                                  borderRadius: '2px'
                                }}></div>
                                <span style={{
                                  color: 'white !important',
                                  fontWeight: '600',
                                  fontSize: '1rem',
                                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
                                }}>
                                  {stat}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="cta-section">
                            <button className="btn-primary-modern">
                              <span>Book Appointment</span>
                              <svg className="arrow-icon" viewBox="0 0 16 16" fill="currentColor">
                                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                              </svg>
                            </button>
                            <span className="emergency-badge">
                              <span className="emergency-dot"></span>
                              Emergency: 24/7
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>
    </section>
  );
};

export default ImageSlider;