import { createContext, useContext, useState, useEffect } from "react";

const defaultState = {
  // ── ANNOUNCEMENT ──
  showBanner: false,
  bannerText: "🏥 Now offering online consultations! Book yours today.",
  bannerBg: "#1e40af",
  bannerLink: "/book-appointment",

  // ── POPUP ──
  showPopup: true,
  popupTitle: "Welcome to MediCare+",
  popupText: "Your health is our priority. Book an appointment today and get 20% off on your first consultation!",
  popupBtn: "Book Now",
  popupBg: "#0d4f4f",

  // ── HERO SLIDES ──
  heroSlides: [
    { title: "Modern Operation Theater", description: "State-of-the-art surgical facilities with advanced equipment for precision care", badge: "Operation Theater", stats: ["98% Success Rate", "500+ Surgeries", "15+ Specialists"], btnText: "Book Appointment" },
    { title: "Intensive Care Unit", description: "Round-the-clock critical care with advanced life support systems", badge: "ICU", stats: ["24/7 Monitoring", "Critical Care", "Rapid Response"], btnText: "Book Appointment" },
    { title: "Advanced Diagnostic Center", description: "Latest technology for accurate and rapid diagnosis", badge: "Diagnostic Center", stats: ["4K Imaging", "AI Diagnostics", "Same Day Reports"], btnText: "Book Appointment" },
  ],

  // ── SERVICES ──
  servicesTitle: "Comprehensive Medical Services",
  servicesSubtitle: "Our Specialties",
  servicesDescription: "We offer a wide range of medical services with experienced specialists dedicated to your health",
  services: [
    { id: 1, title: "Cardiology",    description: "Expert heart care with advanced diagnostic tools",  features: ["ECG & Echo", "Angioplasty", "Heart Surgery"],        color: "#3b82f6", active: true },
    { id: 2, title: "Neurology",     description: "Comprehensive care for brain and nervous system",   features: ["Stroke Care", "Neurosurgery", "EMG/NCS"],             color: "#8b5cf6", active: true },
    { id: 3, title: "Orthopedics",   description: "Advanced joint replacement and sports medicine",    features: ["Joint Replacement", "Spine Surgery", "Sports Injury"], color: "#10b981", active: true },
    { id: 4, title: "Pediatrics",    description: "Specialized care for children and adolescents",     features: ["Newborn Care", "Vaccinations", "Child Development"],   color: "#f59e0b", active: true },
    { id: 5, title: "Ophthalmology", description: "Complete eye care with modern surgical techniques", features: ["Cataract Surgery", "LASIK", "Glaucoma Care"],          color: "#ef4444", active: true },
    { id: 6, title: "Pulmonology",   description: "Expert care for respiratory and lung conditions",   features: ["Bronchoscopy", "Sleep Studies", "Asthma Care"],        color: "#06b6d4", active: true },
  ],

  // ── DOCTORS ──
  doctorsTitle: "Meet Our Specialists",
  doctorsSubtitle: "Our Medical Team",
  doctors: [
    { id: 1, name: "Dr. Sarah Johnson",  specialty: "Cardiologist",        avatar: "https://randomuser.me/api/portraits/women/44.jpg", active: true },
    { id: 2, name: "Dr. Michael Chen",   specialty: "Neurologist",         avatar: "https://randomuser.me/api/portraits/men/46.jpg",   active: true },
    { id: 3, name: "Dr. Emily Williams", specialty: "Pediatrician",        avatar: "https://randomuser.me/api/portraits/women/65.jpg", active: true },
    { id: 4, name: "Dr. James Wilson",   specialty: "Orthopedic Surgeon",  avatar: "https://randomuser.me/api/portraits/men/61.jpg",   active: true },
  ],

  // ── ABOUT ──
  aboutTitle: "We're Committed to Your Well-being",
  aboutSubtitle: "Excellence in Healthcare",
  aboutDescription: "Providing compassionate care with advanced medical technology for over 25 years",
  aboutFeatures: ["State-of-the-art Operation Theaters", "Advanced Diagnostic Center", "Modern Intensive Care Units", "24/7 Pharmacy Services", "Online Appointment System", "Insurance Support"],
  aboutStats: [{ value: "500+", label: "Hospital Beds" }, { value: "150+", label: "Expert Doctors" }, { value: "24/7", label: "Emergency Care" }, { value: "50K+", label: "Happy Patients" }],

  // ── OFFERS ──
  offers: [
    { id: 1, title: "Free Health Checkup", desc: "Complete health checkup worth $200 — FREE this month!", tag: "Limited", color: "#10b981", active: true },
    { id: 2, title: "20% Off Lab Tests",   desc: "Get 20% discount on all laboratory tests this week.",   tag: "Offer",   color: "#3b82f6", active: false },
  ],
  showOffers: true,

  // ── CONTACT ──
  phone: "+1 (800) 123-4567",
  emergencyPhone: "1-800-MEDICARE",
  email: "info@medicare.com",
  address: "123 Healthcare Avenue, Medical District, New York, NY 10001",
  workingHours: "24/7 Emergency Services",
  mapSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1645564608522!5m2!1sen!2s",

  // ── FOOTER ──
  footerAbout: "Providing quality healthcare services with compassion and excellence. Your health and well-being are our top priorities since 1998.",
  brandName: "MediCare",
};

const API = "http://localhost:5000/api/admin";
const HomepageContext = createContext(null);

export function HomepageProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false); // ← loading track karne ke liye

  // ✅ FIX: App open hote hi DB se data load karo
  useEffect(() => {
    const loadFromDB = async () => {
      try {
        const token = localStorage.getItem("hospital_token");
        const res = await fetch(`${API}/homepage`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success && data.content) {
          // DB ka saved data use karo, defaultState ko override karo
          setState(prev => ({ ...prev, ...data.content }));
        }
      } catch (err) {
        console.error("Homepage load error:", err);
        // Error pe defaultState rehne do — koi problem nahi
      } finally {
        setLoaded(true);
      }
    };

    loadFromDB();
  }, []);

  const update = (key, value) =>
    setState(prev => ({ ...prev, [key]: value }));

  const updateNested = (key, index, field, value) =>
    setState(prev => {
      const arr = [...prev[key]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });

  const addItem = (key, item) =>
    setState(prev => ({ ...prev, [key]: [...(prev[key] || []), item] }));

  const removeItem = (key, index) =>
    setState(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

  // Optional: loading hone tak children render mat karo
  if (!loaded) return null;

  return (
    <HomepageContext.Provider value={{ state, update, updateNested, addItem, removeItem }}>
      {children}
    </HomepageContext.Provider>
  );
}

export const useHomepage = () => useContext(HomepageContext);