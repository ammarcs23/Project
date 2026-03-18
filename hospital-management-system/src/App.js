import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./components/CustomNavbar.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { HomepageProvider } from './context/HomepageContext';
import AnnouncementBanner  from './components/AnnouncementBanner';

import ContactSection  from './components/ContactSection';
import DoctorsSection  from './components/DoctorsSection';
import Footer          from './components/Footer';
import NavigationBar   from './components/Navbar';
import ServicesSection from './components/Services';
import ImageSlider     from './components/slider';
import AboutSection    from './components/About';
import ChatButton      from './components/ChatButton';

import PatientModule   from './pages/patient/PatientModule';
import DoctorDashboard from './pages/Doctor/Doctor';
import BookAppointment from './pages/patient/BookAppointment';
import AdminPanel      from './pages/admin/AdminDashboard';

import './App.css';

function App() {
    return (
        <HomepageProvider>
            <Router>
                <Routes>
                    <Route path="/" element={
                        <div className="App">
                            <AnnouncementBanner />
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
                    <Route path="/patient"          element={<PatientModule />} />
                    <Route path="/doctor"           element={<DoctorDashboard />} />
                    <Route path="/book-appointment" element={<BookAppointment />} />
                    <Route path="/admin"            element={<AdminPanel />} />
                </Routes>
            </Router>
        </HomepageProvider>
    );
}

export default App;