import { useState } from "react";

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

export default function PatientModule() {
  const [activeNav, setActiveNav] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = ["overview", "vitals", "history", "appointments"];

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: "#eaf1f3",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      overflow: "hidden",
    }}>

      {/* Sidebar */}
      <div style={{
        width: 64, background: "#0d4f4f",
        display: "flex", flexDirection: "column",
        alignItems: "center", padding: "16px 0", gap: 4, flexShrink: 0,
      }}>
        <div style={{
          width: 38, height: 38, background: "#14b8a6", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24, fontSize: 20, fontWeight: 700, color: "white",
        }}>✚</div>
        {navItems.map((item, i) => (
          <button key={i} onClick={() => setActiveNav(i)} style={{
            width: 44, height: 44, borderRadius: 10, border: "none", cursor: "pointer",
            background: activeNav === i ? "rgba(20,184,166,0.25)" : "transparent",
            color: activeNav === i ? "#14b8a6" : "#6b9e9e",
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }} title={item.label}>{item.icon}</button>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{
          height: 56, background: "white", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 24px",
          borderBottom: "1px solid #e5edf0",
        }}>
          <span style={{ color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>← Back to dashboard</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#f1f5f9", borderRadius: 20, padding: "4px 12px 4px 4px",
            }}>
              <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="doc"
                style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
              <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>Dr. Alex Hess</span>
              <span style={{ color: "#94a3b8", fontSize: 11 }}>▼</span>
            </div>
          </div>
        </div>

        {/* Page Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>

          {/* Title row with button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Patient Profile</h1>
            <button
              src="appointment.jsx"
              onClick={() => alert("Navigate to Book Appointment page")}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                background: "linear-gradient(120deg, #0d4f4f, #14b8a6)",
                color: "white", border: "none", borderRadius: 12,
                padding: "11px 22px", fontWeight: 700, fontSize: 14,
                cursor: "pointer", boxShadow: "0 4px 14px rgba(13,79,79,0.28)",
              }}
            >
              <span style={{ fontSize: 16 }}>🗓️</span>
              Book an Appointment
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 22 }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, textTransform: "capitalize",
                background: activeTab === tab ? "#0d4f4f" : "white",
                color: activeTab === tab ? "white" : "#64748b",
                transition: "all 0.2s",
              }}>{tab}</button>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 20 }}>

            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                    <span style={{ color: "#1e293b", textAlign: "right", maxWidth: 140 }}>{value}</span>
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
                {[
                  { doctor: "Dr. James Liu", specialty: "Endocrinologist", date: "5th March 2024", reason: "Diabetes Follow-up", result: "Stable" },
                  { doctor: "Dr. Sarah Malik", specialty: "Dermatologist", date: "18th Jan 2024", reason: "Skin Checkup", result: "Improved" },
                  { doctor: "Dr. Emily Chen", specialty: "Cardiologist", date: "10th Nov 2023", reason: "Heart Screening", result: "Normal" },
                ].map((a, i, arr) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: "#f1f5f9", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 18, flexShrink: 0,
                    }}>👨‍⚕️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{a.doctor}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.specialty} · {a.reason}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
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
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "11px 0",
                    borderBottom: i < patientData.appointments.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "#e0f2fe", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 18,
                      }}>👨‍⚕️</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{a.doctor}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.specialty}</div>
                      </div>
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
    </div>
  );
}