import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./components/CustomNavbar.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { HomepageProvider } from './context/HomepageContext';
import ProtectedRoute      from './components/Protectedroute.jsx';
import AnnouncementBanner  from './components/AnnouncementBanner';
import WelcomePopup        from './components/Welcomepopup.jsx';

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
import Signup1         from './pages/signin/Signup1';

import './App.css';

function App() {
    return (
        <HomepageProvider>
            <Router>
                <Routes>
                    {/* ── Public ── */}
                    <Route path="/" element={
                        <div className="App">
                            <AnnouncementBanner />
                            <WelcomePopup />
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

                    <Route path="/login" element={<Signup1 />} />

                    {/* ── Admin ── */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminPanel />
                        </ProtectedRoute>
                    } />

                    {/* ── Doctor ── */}
                    <Route path="/doctor" element={
                        <ProtectedRoute allowedRole="doctor">
                            <DoctorDashboard />
                        </ProtectedRoute>
                    } />

                    {/* ── Patient ── */}
                    <Route path="/patient" element={
                        <ProtectedRoute allowedRole="patient">
                            <PatientModule />
                        </ProtectedRoute>
                    } />

                    <Route path="/book-appointment" element={
                        <ProtectedRoute allowedRole="patient">
                            <BookAppointment />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </HomepageProvider>
    );
}

export default App;