import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./components/CustomNavbar.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContactSection from './components/ContactSection';
import DoctorsSection from './components/DoctorsSection';
import Footer from './components/Footer';
import NavigationBar from './components/Navbar';
import ServicesSection from './components/Services';
import ImageSlider from './components/slider';
import AboutSection from './components/About';
import ChatButton from './components/ChatButton';
import PatientModule from './pages/patient/PatientModule';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>

                {/* Home Page */}
                <Route path="/" element={
                    <div className="App">
                        <NavigationBar />
                        <ImageSlider />
                        <ServicesSection />
                        <AboutSection />
                        <DoctorsSection />
                        <ContactSection />
                        <Footer />
                        <ChatButton />
                    </div>
                } />

                {/* Patient Page */}
                <Route path="/patient" element={<PatientModule />} />

            </Routes>
        </Router>
    );
}
export default App;


