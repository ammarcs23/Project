import { useState } from "react";

const doctor = {
  name: "Dr. Ahmed Khan",
  specialty: "Cardiologist",
  avatar: "https://randomuser.me/api/portraits/men/75.jpg",
};

const stats = [
  { label: "Patients",     value: "666",    icon: "👥", iconBg: "#c7d2fe" },
  { label: "Income",       value: "$2,111", icon: "💵", iconBg: "#bbf7d0" },
  { label: "Appointments", value: "211",    icon: "📅", iconBg: "#bfdbfe" },
  { label: "Treatments",   value: "402",    icon: "🩺", iconBg: "#fecdd3" },
];

const todayAppointments = [
  { id: 1, name: "Beth Mccoy",       reason: "Scaling",           time: "On Going", avatar: "https://randomuser.me/api/portraits/women/44.jpg", status: "ongoing" },
  { id: 2, name: "Evan Henry",       reason: "Medical check up",  time: "12:00",    avatar: "https://randomuser.me/api/portraits/men/32.jpg",   status: "pending" },
  { id: 3, name: "Dwight Murphy",    reason: "Heart consultation", time: "14:00",    avatar: "https://randomuser.me/api/portraits/men/46.jpg",   status: "pending" },
  { id: 4, name: "Bessie Alexander", reason: "Follow up",         time: "14:00",    avatar: "https://randomuser.me/api/portraits/women/65.jpg", status: "pending" },
];

const appointmentRequests = [
  { id: 1, name: "Devon Cooper",   reason: "Scaling",        date: "29 Feb",  time: "10:00", avatar: "https://randomuser.me/api/portraits/men/22.jpg",   status: "pending"  },
  { id: 2, name: "Ricardo Russell",reason: "Tambal gigi",    date: "1 March", time: "11:00", avatar: "https://randomuser.me/api/portraits/men/55.jpg",   status: "accepted" },
  { id: 3, name: "Nadia Sheikh",   reason: "General checkup",date: "2 March", time: "09:30", avatar: "https://randomuser.me/api/portraits/women/33.jpg", status: "pending"  },
];

const nextPatient = {
  name: "Beth Mccoy",
  address: "2235 Avondale Ave Pasadena, Oklahoma 83900",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  dob: "29 Feb 1999", sex: "Female", weight: "56 kg",
  height: "172 cm", lastAppointment: "02 Jan 2020", registerDate: "19 Des 2018",
  conditions: ["Asthma", "Hypertension", "Diabetes"],
  phone: "(308) 555-0121",
};

const chartData = [65, 40, 80, 55, 70, 45, 90, 60, 75, 50, 85, 65];
const months    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const navItems = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "📅", label: "Schedule"  },
  { icon: "👤", label: "Patients"  },
  { icon: "💬", label: "Messages"  },
  { icon: "💊", label: "Medicines" },
];

/* ─────────────────────────────────────────────── */
export default function DoctorDashboard() {
  const [requests,    setRequests]    = useState(appointmentRequests);
  const [activeNav,   setActiveNav]   = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAccept = (id) => setRequests(p => p.map(r => r.id === id ? { ...r, status: "accepted" } : r));
  const handleReject = (id) => setRequests(p => p.filter(r => r.id !== id));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#eef0f8", fontFamily: "'Nunito','Segoe UI',sans-serif" }}>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 40 }} />
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 220, background: "#1a3fce", flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "28px 0 20px",
        // mobile: fixed + slide
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
      }} className="doc-sidebar">

        {/* close btn — mobile */}
        <button onClick={() => setSidebarOpen(false)}
          style={{ position:"absolute", top:12, right:12, background:"none", border:"none",
            color:"rgba(255,255,255,0.7)", fontSize:20, cursor:"pointer" }}
          className="sidebar-close">✕</button>

        {/* Doctor profile */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src={doctor.avatar} alt="doctor"
            style={{ width:78, height:78, borderRadius:"50%", objectFit:"cover",
              border:"3px solid rgba(255,255,255,0.4)", marginBottom:10 }} />
          <div style={{ color:"white", fontWeight:800, fontSize:15 }}>{doctor.name}</div>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginTop:2 }}>{doctor.specialty}</div>
        </div>

        {/* Nav */}
        <div style={{ width:"100%", padding:"0 12px", display:"flex", flexDirection:"column", gap:4 }}>
          {navItems.map((item, i) => (
            <button key={i} onClick={() => { setActiveNav(i); setSidebarOpen(false); }} style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 16px",
              borderRadius:12, border:"none", cursor:"pointer", fontSize:14, fontWeight:600,
              background: activeNav===i ? "white" : "transparent",
              color:       activeNav===i ? "#1a3fce" : "rgba(255,255,255,0.75)",
              transition:"all 0.2s",
            }}>
              <span style={{ fontSize:17 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        <button style={{
          marginTop:"auto", display:"flex", alignItems:"center", gap:10,
          padding:"11px 16px", border:"none", background:"transparent",
          color:"rgba(255,255,255,0.6)", fontSize:14, fontWeight:600,
          cursor:"pointer", width:"calc(100% - 24px)", borderRadius:12,
        }}>↩ Logout</button>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}
        className="doc-main">

        {/* Topbar */}
        <div style={{
          height:60, background:"white", display:"flex", alignItems:"center",
          justifyContent:"space-between", padding:"0 20px",
          borderBottom:"1px solid #e8ecf4",
          position:"sticky", top:0, zIndex:30,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Hamburger */}
            <button onClick={() => setSidebarOpen(true)}
              style={{ background:"none", border:"none", fontSize:22,
                color:"#1a3fce", cursor:"pointer", lineHeight:1 }}
              className="hamburger-doc">☰</button>
            <h1 style={{ fontSize:20, fontWeight:800, color:"#1a2340", margin:0 }}>Dashboard</h1>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {[["🔔","Alert","#ef4444"],["❓","Help","#64748b"],["⚙️","Setting","#64748b"]].map(([icon,label,color]) => (
              <button key={label} style={{
                display:"flex", alignItems:"center", gap:5, background:"none",
                border:"none", cursor:"pointer", fontSize:13, color, fontWeight:600,
              }}>
                <span style={{ fontSize:16, position:"relative" }}>
                  {icon}
                  {label==="Alert" && (
                    <span style={{
                      position:"absolute", top:-4, right:-4,
                      width:14, height:14, background:"#ef4444", borderRadius:"50%",
                      fontSize:8, color:"white", display:"flex",
                      alignItems:"center", justifyContent:"center", fontWeight:700,
                    }}>3</span>
                  )}
                </span>
                <span className="topbar-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflow:"auto", padding:"20px 16px" }} className="doc-body">

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom:20 }}>
            {stats.map((s,i) => (
              <div key={i} style={{
                background:"white", borderRadius:14, padding:"16px 18px",
                boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
                display:"flex", alignItems:"center", gap:14,
              }}>
                <div style={{
                  width:44, height:44, borderRadius:12, background:s.iconBg,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0,
                }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:"#1a2340" }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Middle row */}
          <div className="two-col-grid" style={{ marginBottom:20 }}>

            {/* Today Appointments */}
            <div style={{ background:"white", borderRadius:16, padding:20, boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight:800, fontSize:15, color:"#1a2340", marginBottom:14 }}>Today Appointment</div>
              {todayAppointments.map(a => (
                <div key={a.id} style={{
                  display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12,
                  background: a.status==="ongoing" ? "#eff6ff" : "transparent",
                }}>
                  <img src={a.avatar} alt={a.name}
                    style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13,
                      color: a.status==="ongoing" ? "#1a3fce" : "#1a2340",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    }}>{a.name}</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>{a.reason}</div>
                  </div>
                  <div style={{
                    fontSize: a.status==="ongoing" ? 12 : 14,
                    fontWeight:700, flexShrink:0,
                    color: a.status==="ongoing" ? "#1a3fce" : "#1a2340",
                  }}>{a.status==="ongoing" ? "On Going" : a.time}</div>
                </div>
              ))}
            </div>

            {/* Next Patient */}
            <div style={{ background:"white", borderRadius:16, padding:20, boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight:800, fontSize:15, color:"#1a2340", marginBottom:14 }}>Next Patient Details</div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <img src={nextPatient.avatar} alt={nextPatient.name}
                  style={{ width:52, height:52, borderRadius:12, objectFit:"cover", flexShrink:0 }} />
                <div>
                  <div style={{ fontWeight:800, fontSize:15, color:"#1a2340" }}>{nextPatient.name}</div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{nextPatient.address}</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px 8px", marginBottom:12 }}>
                {[["D.O.B",nextPatient.dob],["Sex",nextPatient.sex],["Weight",nextPatient.weight],
                  ["Height",nextPatient.height],["Last Appt.",nextPatient.lastAppointment],["Registered",nextPatient.registerDate]
                ].map(([l,v]) => (
                  <div key={l}>
                    <div style={{ fontSize:10, color:"#94a3b8", marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#1a2340" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                {nextPatient.conditions.map((c,i) => {
                  const cols=[["#fef3c7","#d97706"],["#d1fae5","#059669"],["#ede9fe","#7c3aed"]];
                  return <span key={i} style={{ fontSize:11, fontWeight:700, padding:"4px 12px",
                    borderRadius:20, background:cols[i][0], color:cols[i][1] }}>{c}</span>;
                })}
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[["📞",nextPatient.phone,true],["📄","Documents",false],["💬","Chat",false]].map(([ic,tx,primary]) => (
                  <button key={tx} style={{
                    flex:1, minWidth:80, padding:"9px 6px", borderRadius:10,
                    border: primary ? "none" : "2px solid #e2e8f0",
                    background: primary ? "#1a3fce" : "white",
                    color: primary ? "white" : "#1a2340",
                    fontWeight:700, fontSize:11, cursor:"pointer",
                  }}>{ic} {tx}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="two-col-grid">

            {/* Appointment Requests */}
            <div style={{ background:"white", borderRadius:16, padding:20, boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontWeight:800, fontSize:15, color:"#1a2340" }}>Appointment Requests</div>
                <span style={{ fontSize:12, color:"#1a3fce", fontWeight:700, cursor:"pointer" }}>See All</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {requests.map(r => (
                  <div key={r.id} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                    borderRadius:12, background:"#f8fafc", border:"1px solid #f1f5f9",
                  }}>
                    <img src={r.avatar} alt={r.name}
                      style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:13, color:"#1a2340",
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.name}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{r.reason} · {r.date} · {r.time}</div>
                    </div>
                    {r.status==="accepted" ? (
                      <span style={{ fontSize:11, fontWeight:700, color:"#059669",
                        background:"#d1fae5", padding:"4px 10px", borderRadius:20, flexShrink:0 }}>Accepted</span>
                    ) : (
                      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                        <button onClick={() => handleAccept(r.id)} style={{
                          width:30, height:30, borderRadius:"50%", border:"none",
                          background:"#d1fae5", color:"#059669", fontSize:14,
                          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                        }}>✓</button>
                        <button onClick={() => handleReject(r.id)} style={{
                          width:30, height:30, borderRadius:"50%", border:"none",
                          background:"#fee2e2", color:"#ef4444", fontSize:14,
                          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                        }}>✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div style={{ background:"white", borderRadius:16, padding:20, boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontWeight:800, fontSize:15, color:"#1a2340" }}>Patient Statistics</div>
                <select style={{ fontSize:12, color:"#64748b", border:"1px solid #e2e8f0",
                  borderRadius:8, padding:"4px 8px", outline:"none", cursor:"pointer" }}>
                  <option>2024</option><option>2023</option>
                </select>
              </div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:100, marginBottom:6 }}>
                {chartData.map((val,i) => (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{
                      width:"100%", borderRadius:"4px 4px 0 0",
                      height:`${val}px`,
                      background: i%3===0 ? "#1a3fce" : i%3===1 ? "#10b981" : "#f43f5e",
                      opacity:0.85,
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:4 }}>
                {months.map((m,i) => (
                  <div key={i} style={{ flex:1, textAlign:"center", fontSize:8, color:"#94a3b8", fontWeight:600 }}>{m}</div>
                ))}
              </div>
              <div style={{ display:"flex", gap:14, marginTop:10, justifyContent:"center", flexWrap:"wrap" }}>
                {[["#1a3fce","New Patients"],["#10b981","Recovered"],["#f43f5e","Critical"]].map(([color,label]) => (
                  <div key={label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#64748b" }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:color }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── RESPONSIVE CSS ── */}
      <style>{`
        /* ── DESKTOP: sidebar always visible ── */
        @media (min-width: 769px) {
          .doc-sidebar {
            position: sticky !important;
            top: 0 !important;
            height: 100vh !important;
            transform: translateX(0) !important;
          }
          .hamburger-doc  { display: none !important; }
          .sidebar-close  { display: none !important; }
          .topbar-label   { display: inline !important; }
          .doc-body       { padding: 22px 28px !important; }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .two-col-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .doc-main       { width: 100vw; }
          .hamburger-doc  { display: block !important; }
          .topbar-label   { display: none !important; }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .two-col-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
        }

        ── SMALL MOBILE ── */
        @media (max-width: 400px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        div::-webkit-scrollbar { width: 4px; height: 4px; }
        div::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}