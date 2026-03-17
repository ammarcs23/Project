import { useState } from "react";
import { useNavigate } from "react-router-dom";

const patientData = {
  name: "Roger Curtis",
  age: 36,
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  gender: "Male",
  bloodType: "O+ (Positive)",
  allergies: "Milk, Penicillin",
  diseases: "Diabetes, Blood Disorders",
  height: "1.78m",
  weight: "65 kg",
  patientId: "208898786",
  lastVisit: "25th October 2019",
  appointments: [
    { id: 1, doctor: "Dr. Emily Chen", specialty: "Cardiologist", date: "20th March 2024", time: "10:30 AM" },
    { id: 2, doctor: "Dr. Sarah Malik", specialty: "Dermatologist", date: "28th March 2024", time: "3:00 PM" },
  ],
};

const navItems = [
  { icon: "📋", label: "Records" },
  { icon: "📅", label: "Schedule" },
  { icon: "💊", label: "Pharmacy" },
  { icon: "📁", label: "Reports" },
];

const previousAppointments = [
  { doctor: "Dr. James Liu", specialty: "Endocrinologist", date: "5th March 2024", reason: "Diabetes Follow-up", result: "Stable" },
  { doctor: "Dr. Sarah Malik", specialty: "Dermatologist", date: "18th Jan 2024", reason: "Skin Checkup", result: "Improved" },
  { doctor: "Dr. Emily Chen", specialty: "Cardiologist", date: "10th Nov 2023", reason: "Heart Screening", result: "Normal" },
];

export default function PatientModule() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tabs = ["overview", "vitals", "history", "appointments"];

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#eaf1f3",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      position: "relative",
    }}>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 40, display: "block",
          }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 64,
        background: "#0d4f4f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 0",
        gap: 4,
        flexShrink: 0,
        // Mobile: slide in/out
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
      }}
        className="sidebar-panel"
      >
        <div style={{
          width: 38, height: 38, background: "#14b8a6", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24, fontSize: 20, fontWeight: 700, color: "white",
        }}>✚</div>
        {navItems.map((item, i) => (
          <button key={i} onClick={() => { setActiveNav(i); setSidebarOpen(false); }} style={{
            width: 44, height: 44, borderRadius: 10, border: "none", cursor: "pointer",
            background: activeNav === i ? "rgba(20,184,166,0.25)" : "transparent",
            color: activeNav === i ? "#14b8a6" : "#6b9e9e",
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }} title={item.label}>{item.icon}</button>
        ))}
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <div style={{
          height: 56, background: "white", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 16px",
          borderBottom: "1px solid #e5edf0",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 22, color: "#0d4f4f", padding: 0, lineHeight: 1,
              }}
              className="hamburger-btn"
            >☰</button>
            <span style={{ color: "#94a3b8", fontSize: 13, cursor: "pointer" }}
              onClick={() => navigate(-1)}>← Back</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#f1f5f9", borderRadius: 20, padding: "4px 12px 4px 4px",
            }}>
              <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="doc"
                style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
              <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}
                className="hide-mobile">Dr. Alex Hess</span>
            </div>
          </div>
        </div>

        {/* Page Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 16px" }} className="page-body">

          {/* Title row */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap", gap: 12,
            marginBottom: 18,
          }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>Patient Profile</h1>
            <button
              onClick={() => navigate("/book-appointment")}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                background: "linear-gradient(120deg, #0d4f4f, #14b8a6)",
                color: "white", border: "none", borderRadius: 12,
                padding: "10px 18px", fontWeight: 700, fontSize: 13,
                cursor: "pointer", boxShadow: "0 4px 14px rgba(13,79,79,0.28)",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 15 }}>🗓️</span>
              Book an Appointment
            </button>
          </div>

          {/* Tabs — scrollable on mobile */}
          <div style={{
            display: "flex", gap: 6, marginBottom: 20,
            overflowX: "auto", paddingBottom: 4,
          }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, textTransform: "capitalize",
                background: activeTab === tab ? "#0d4f4f" : "white",
                color: activeTab === tab ? "white" : "#64748b",
                transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0,
              }}>{tab}</button>
            ))}
          </div>

          {/* Content Grid — stacks on mobile */}
          <div className="main-grid">

            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Patient Card */}
              <div style={{
                background: "white", borderRadius: 16, padding: 20,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)", textAlign: "center",
              }}>
                <img src={patientData.avatar} alt="patient"
                  style={{ width: 74, height: 74, borderRadius: 14, objectFit: "cover", marginBottom: 10 }} />
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{patientData.name}</div>
                <div style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>Age: {patientData.age}</div>
                <button style={{
                  background: "#14b8a6", color: "white", border: "none",
                  borderRadius: 8, padding: "8px 28px", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>Update</button>
              </div>

              {/* Info Card */}
              <div style={{
                background: "white", borderRadius: 16, padding: 20,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 14 }}>Information</div>
                {[
                  ["Gender", patientData.gender],
                  ["Blood Type", patientData.bloodType],
                  ["Allergies", patientData.allergies],
                  ["Diseases", patientData.diseases],
                  ["Height", patientData.height],
                  ["Weight", patientData.weight],
                  ["Patient ID", patientData.patientId],
                  ["Last Visit", patientData.lastVisit],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between",
                    borderBottom: "1px solid #f1f5f9", padding: "7px 0", fontSize: 13,
                  }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{label}</span>
                    <span style={{ color: "#1e293b", textAlign: "right", maxWidth: 160 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Previous Appointments */}
              <div style={{
                background: "white", borderRadius: 16, padding: 20,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Previous Appointments</div>
                  <span style={{ fontSize: 12, color: "#14b8a6", cursor: "pointer", fontWeight: 600 }}>View All</span>
                </div>
                {previousAppointments.map((a, i, arr) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: "#f1f5f9", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 18, flexShrink: 0,
                    }}>👨‍⚕️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.doctor}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.specialty} · {a.reason}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{a.date}</div>
                      <div style={{
                        fontSize: 11, fontWeight: 600, marginTop: 3,
                        color: "#16a34a", background: "#dcfce7",
                        padding: "2px 8px", borderRadius: 20, display: "inline-block",
                      }}>{a.result}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming Appointments */}
              <div style={{
                background: "white", borderRadius: 16, padding: 20,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Upcoming Appointments</div>
                  <span style={{
                    fontSize: 11, background: "#dcfce7", color: "#16a34a",
                    padding: "3px 10px", borderRadius: 20, fontWeight: 600,
                  }}>{patientData.appointments.length} Scheduled</span>
                </div>
                {patientData.appointments.map((a, i) => (
                  <div key={a.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 0",
                    borderBottom: i < patientData.appointments.length - 1 ? "1px solid #f1f5f9" : "none",
                    flexWrap: "wrap",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: "#e0f2fe", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 18, flexShrink: 0,
                    }}>👨‍⚕️</div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{a.doctor}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.specialty}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{a.date}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.time}</div>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      background: "#dcfce7", color: "#16a34a",
                    }}>● Upcoming</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── RESPONSIVE CSS ── */}
      <style>{`
        /* Desktop: sidebar always visible, push content right */
        @media (min-width: 769px) {
          .sidebar-panel {
            position: sticky !important;
            top: 0 !important;
            transform: translateX(0) !important;
            height: 100vh !important;
          }
          .hamburger-btn {
            display: none !important;
          }
          .hide-mobile {
            display: inline !important;
          }
          .main-grid {
            display: grid;
            grid-template-columns: 270px 1fr;
            gap: 20px;
          }
          .page-body {
            padding: 24px 28px !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hamburger-btn {
            display: block !important;
          }
          .hide-mobile {
            display: none !important;
          }
          .main-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .sidebar-panel {
            width: 180px !important;
          }
        }

        /* Scrollbar hide for tab row */
        div::-webkit-scrollbar { height: 4px; }
        div::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}