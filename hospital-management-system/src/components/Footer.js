import React,{Component} from 'react' ;
class Footer extends Component {
  state = {};
  render() {
    return (
      <footer className="bg-dark text-white pt-4">
        <div className="container text-center text-md-start">
          <div className="row">
            {/* About Section */}
            <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold">About Us</h6>
              <p>
                We provide top-notch services and solutions for all your needs.
                Quality and reliability are our priorities.
              </p>
            </div>
            {/* Links Section */}
            <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold">Quick Links</h6>
              <p>
                <a href="#!" className="text-white text-decoration-none">
                  Home
                </a>
              </p>
              <p>
                <a href="#!" className="text-white text-decoration-none">
                  Services
                </a>
              </p>
              <p>
                <a href="#!" className="text-white text-decoration-none">
                  Contact
                </a>
              </p>
              <p>
                <a href="#!" className="text-white text-decoration-none">
                  About
                </a>
              </p>
            </div>
            {/* Contact Section */}
            <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mb-4">
              <h6 className="text-uppercase fw-bold">Contact</h6>
              <p>
                <i className="bi bi-envelope" /> info@example.com
              </p>
              <p>
                <i className="bi bi-phone" /> +92 300 1234567
              </p>
              <p>
                <i className="bi bi-geo-alt" /> Kotli, Azad Kashmir
              </p>
            </div>
          </div>
        </div>
        {/* Footer Bottom */}
        <div
          className="text-center p-3"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          Developed With Love ❤️ By Ammar Jahangir | © 2026 AI-Based Hospital Management System | All rights reserved
        </div>
      </footer>
    );
  }
}

export default Footer;
