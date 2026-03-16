import { useState } from "react";

const doctor = {
  name: "Dr. Ahmed Khan",
  specialty: "Cardiologist",
  avatar: "https://randomuser.me/api/portraits/men/75.jpg",
};

const stats = [
  { label: "Patients", value: "666", icon: "👥", color: "#eef2ff", iconBg: "#c7d2fe" },
  { label: "Income", value: "$2,111", icon: "💵", color: "#f0fdf4", iconBg: "#bbf7d0" },
  { label: "Appointments", value: "211", icon: "📅", color: "#eff6ff", iconBg: "#bfdbfe" },
  { label: "Treatments", value: "402", icon: "🩺", color: "#fff1f2", iconBg: "#fecdd3" },
];

const todayAppointments = [
  { id: 1, name: "Beth Mccoy", reason: "Scaling", time: "On Going", avatar: "https://randomuser.me/api/portraits/women/44.jpg", status: "ongoing" },
  { id: 2, name: "Evan Henry", reason: "Medical check up", time: "12:00", avatar: "https://randomuser.me/api/portraits/men/32.jpg", status: "pending" },
  { id: 3, name: "Dwight Murphy", reason: "Heart consultation", time: "14:00", avatar: "https://randomuser.me/api/portraits/men/46.jpg", status: "pending" },
  { id: 4, name: "Bessie Alexander", reason: "Follow up", time: "14:00", avatar: "https://randomuser.me/api/portraits/women/65.jpg", status: "pending" },
];

const appointmentRequests = [
  { id: 1, name: "Devon Cooper", reason: "Scaling", date: "29 February", time: "10:00", avatar: "https://randomuser.me/api/portraits/men/22.jpg", status: "pending" },
  { id: 2, name: "Ricardo Russell", reason: "Tambal gigi", date: "1 March", time: "11:00", avatar: "https://randomuser.me/api/portraits/men/55.jpg", status: "accepted" },
  { id: 3, name: "Nadia Sheikh", reason: "General checkup", date: "2 March", time: "09:30", avatar: "https://randomuser.me/api/portraits/women/33.jpg", status: "pending" },
];

const nextPatient = {
  name: "Beth Mccoy",
  address: "2235 Avondale Ave Pasadena, Oklahoma 83900",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  dob: "29 February 1999",
  sex: "Female",
  weight: "56 kg",
  height: "172 cm",
  lastAppointment: "02 Jan 2020",
  registerDate: "19 Des 2018",
  conditions: ["Asthma", "Hypertension", "Diabetes"],
  phone: "(308) 555-0121",
};

const chartData = [65, 40, 80, 55, 70, 45, 90, 60, 75, 50, 85, 65];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const navItems = [
  { icon: "⊞", label: "Dashboard", active: true },
  { icon: "📅", label: "Schedule" },
  { icon: "👤", label: "Patients" },
  { icon: "💬", label: "Messages" },
  { icon: "💊", label: "Medicines" },
];

export default function DoctorDashboard() {
  const [requests, setRequests] = useState(appointmentRequests);
  const [activeNav, setActiveNav] = useState(0);

  const handleAccept = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "accepted" } : r));
  };
  const handleReject = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: "#eef0f8",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      overflow: "hidden",
    }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 220, background: "#1a3fce",
        display: "flex", flexDirection: "column",
        alignItems: "center", padding: "30px 0 20px",
        flexShrink: 0, borderRadius: "0 0 0 0",
      }}>
        {/* Doctor profile */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src={doctor.avatar} alt="doctor"
            style={{
              width: 80, height: 80, borderRadius: "50%", objectFit: "cover",
              border: "3px solid rgba(255,255,255,0.4)", marginBottom: 10,
            }} />
          <div style={{ color: "white", fontWeight: 800, fontSize: 15 }}>{doctor.name}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>{doctor.specialty}</div>
        </div>

        {/* Nav items */}
        <div style={{ width: "100%", padding: "0 14px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item, i) => (
            <button key={i} onClick={() => setActiveNav(i)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 16px", borderRadius: 12, border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 600,
              background: activeNav === i ? "white" : "transparent",
              color: activeNav === i ? "#1a3fce" : "rgba(255,255,255,0.75)",
              transition: "all 0.2s",
            }}>
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Logout */}
        <button style={{
          marginTop: "auto", display: "flex", alignItems: "center", gap: 10,
          padding: "11px 16px", border: "none", background: "transparent",
          color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600,
          cursor: "pointer", width: "calc(100% - 28px)", borderRadius: 12,
        }}>
          <span>↩</span> Logout
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <div style={{
          height: 60, background: "white", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 28px",
          borderBottom: "1px solid #e8ecf4",
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a2340", margin: 0 }}>Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {[["🔔", "Alert", "#ef4444"], ["❓", "Help", "#64748b"], ["⚙️", "Setting", "#64748b"]].map(([icon, label, color]) => (
              <button key={label} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, color, fontWeight: 600,
              }}>
                <span style={{ fontSize: 16, position: "relative" }}>
                  {icon}
                  {label === "Alert" && (
                    <span style={{
                      position: "absolute", top: -4, right: -4,
                      width: 14, height: 14, background: "#ef4444", borderRadius: "50%",
                      fontSize: 8, color: "white", display: "flex",
                      alignItems: "center", justifyContent: "center", fontWeight: 700,
                    }}>3</span>
                  )}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflow: "auto", padding: "22px 28px" }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: "white", borderRadius: 14, padding: "18px 20px",
                boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: s.iconBg, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#1a2340" }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Middle row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

            {/* Today Appointments */}
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1a2340", marginBottom: 16 }}>Today Appointment</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {todayAppointments.map((a) => (
                  <div key={a.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 12,
                    background: a.status === "ongoing" ? "#eff6ff" : "transparent",
                  }}>
                    <img src={a.avatar} alt={a.name}
                      style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: a.status === "ongoing" ? "#1a3fce" : "#1a2340" }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{a.reason}</div>
                    </div>
                    <div style={{
                      fontSize: a.status === "ongoing" ? 12 : 15,
                      fontWeight: 700,
                      color: a.status === "ongoing" ? "#1a3fce" : "#1a2340",
                    }}>
                      {a.status === "ongoing" ? "On Going" : a.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Patient Details */}
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#1a2340", marginBottom: 16 }}>Next Patient Details</div>
              {/* Patient header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <img src={nextPatient.avatar} alt={nextPatient.name}
                  style={{ width: 54, height: 54, borderRadius: 12, objectFit: "cover" }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#1a2340" }}>{nextPatient.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{nextPatient.address}</div>
                </div>
              </div>
              {/* Info grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 6px", marginBottom: 14 }}>
                {[
                  ["D.O.B", nextPatient.dob],
                  ["Sex", nextPatient.sex],
                  ["Weight", nextPatient.weight],
                  ["Height", nextPatient.height],
                  ["Last Appt.", nextPatient.lastAppointment],
                  ["Registered", nextPatient.registerDate],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1a2340" }}>{value}</div>
                  </div>
                ))}
              </div>
              {/* Condition tags */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {nextPatient.conditions.map((c, i) => {
                  const colors = [["#fef3c7","#d97706"],["#d1fae5","#059669"],["#ede9fe","#7c3aed"]];
                  return (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                      background: colors[i][0], color: colors[i][1],
                    }}>{c}</span>
                  );
                })}
              </div>
              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{
                  flex: 1, padding: "9px 6px", borderRadius: 10, border: "none",
                  background: "#1a3fce", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}>📞 {nextPatient.phone}</button>
                <button style={{
                  flex: 1, padding: "9px 6px", borderRadius: 10,
                  border: "2px solid #e2e8f0", background: "white",
                  color: "#1a2340", fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}>📄 Documents</button>
                <button style={{
                  flex: 1, padding: "9px 6px", borderRadius: 10,
                  border: "2px solid #e2e8f0", background: "white",
                  color: "#1a2340", fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}>💬 Chat</button>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Appointment Requests */}
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1a2340" }}>Appointment Requests</div>
                <span style={{ fontSize: 12, color: "#1a3fce", fontWeight: 700, cursor: "pointer" }}>See All</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {requests.map((r) => (
                  <div key={r.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 12,
                    background: "#f8fafc", border: "1px solid #f1f5f9",
                  }}>
                    <img src={r.avatar} alt={r.name}
                      style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1a2340" }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.reason} · {r.date} · {r.time}</div>
                    </div>
                    {r.status === "accepted" ? (
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "#059669",
                        background: "#d1fae5", padding: "4px 12px", borderRadius: 20,
                      }}>Accepted</span>
                    ) : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleAccept(r.id)} style={{
                          width: 30, height: 30, borderRadius: "50%", border: "none",
                          background: "#d1fae5", color: "#059669", fontSize: 14,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>✓</button>
                        <button onClick={() => handleReject(r.id)} style={{
                          width: 30, height: 30, borderRadius: "50%", border: "none",
                          background: "#fee2e2", color: "#ef4444", fontSize: 14,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Patient Chart */}
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1a2340" }}>Patient Statistics</div>
                <select style={{
                  fontSize: 12, color: "#64748b", border: "1px solid #e2e8f0",
                  borderRadius: 8, padding: "4px 8px", outline: "none", cursor: "pointer",
                }}>
                  <option>2024</option>
                  <option>2023</option>
                </select>
              </div>
              {/* Bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110, marginBottom: 8 }}>
                {chartData.map((val, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      height: `${(val / 100) * 100}px`,
                      background: i % 3 === 0 ? "#1a3fce" : i % 3 === 1 ? "#10b981" : "#f43f5e",
                      opacity: 0.85,
                      transition: "height 0.3s",
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {months.map((m, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>{m}</div>
                ))}
              </div>
              {/* Legend */}
              <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
                {[["#1a3fce","New Patients"],["#10b981","Recovered"],["#f43f5e","Critical"]].map(([color, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                    {label}
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