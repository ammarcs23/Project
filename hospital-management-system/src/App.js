import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./components/CustomNavbar.css";
import ContactSection from './components/ContactSection';
import DoctorsSection from './components/DoctorsSection';
import Footer from './components/Footer';
import NavigationBar from './components/Navbar';
import ServicesSection from './components/Services';
import ImageSlider from './components/slider';
import AboutSection from './components/About';
import ChatButton from './components/ChatButton';
import './App.css';

function App() {
    return (
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
    );
}

export default App;