import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ── DATA ─────────────────────────────────────── */
const patientData = {
  name: "Roger Curtis", age: 36,
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  gender: "Male", bloodType: "O+ (Positive)",
  allergies: "Milk, Penicillin", diseases: "Diabetes, Blood Disorders",
  height: "1.78m", weight: "65 kg", patientId: "208898786",
  lastVisit: "25th October 2019", email: "roger@email.com", phone: "+92-300-1234567",
};

const vitals = [
  { label: "Heart Rate",   value: "80",    unit: "bpm",   icon: "🫀", color: "#fee2e2", dot: "#ef4444", status: "Normal" },
  { label: "Blood Pressure",value:"120/80",unit: "mmHg",  icon: "💉", color: "#ede9fe", dot: "#7c3aed", status: "Normal" },
  { label: "SpO₂ Level",   value: "98",    unit: "%",     icon: "🫁", color: "#d1fae5", dot: "#10b981", status: "Normal" },
  { label: "Temperature",  value: "36.5",  unit: "°C",    icon: "🌡️", color: "#fef9c3", dot: "#ca8a04", status: "Normal" },
  { label: "BMI",          value: "20.5",  unit: "kg/m²", icon: "⚖️", color: "#dbeafe", dot: "#2563eb", status: "Normal" },
  { label: "Blood Sugar",  value: "110",   unit: "mg/dL", icon: "🩸", color: "#fce7f3", dot: "#db2777", status: "Monitor" },
];

const previousAppointments = [
  { doctor:"Dr. James Liu",  specialty:"Endocrinologist", date:"5th March 2024",  reason:"Diabetes Follow-up", result:"Stable"   },
  { doctor:"Dr. Sarah Malik",specialty:"Dermatologist",   date:"18th Jan 2024",   reason:"Skin Checkup",       result:"Improved" },
  { doctor:"Dr. Emily Chen", specialty:"Cardiologist",    date:"10th Nov 2023",   reason:"Heart Screening",    result:"Normal"   },
  { doctor:"Dr. Hamid Raza", specialty:"General",         date:"3rd Aug 2023",    reason:"Annual Checkup",     result:"Stable"   },
];

const upcomingAppointments = [
  { id:1, doctor:"Dr. Emily Chen",  specialty:"Cardiologist",  date:"20th March 2024", time:"10:30 AM", type:"visit"  },
  { id:2, doctor:"Dr. Sarah Malik", specialty:"Dermatologist", date:"28th March 2024", time:"3:00 PM",  type:"online" },
];

const medicalHistory = [
  { year:"2023", event:"Diagnosed with Type 2 Diabetes", doctor:"Dr. James Liu",  severity:"medium" },
  { year:"2022", event:"Blood Disorder Treatment Started", doctor:"Dr. Emily Chen", severity:"high"   },
  { year:"2021", event:"Skin Allergy Treatment",           doctor:"Dr. Sarah Malik",severity:"low"    },
  { year:"2020", event:"Full Body CT Scan — Clear",        doctor:"Dr. Hamid Raza", severity:"low"    },
  { year:"2019", event:"Annual Checkup — All Stable",      doctor:"Dr. Hamid Raza", severity:"low"    },
];

const records = [
  { name:"Blood Test Report",        date:"12 Feb 2024", type:"Lab",     size:"2.4 MB", icon:"🧪" },
  { name:"CT Scan - Full Body",       date:"10 Jan 2024", type:"Radiology",size:"8.1 MB",icon:"🩻" },
  { name:"Cardiology Report",         date:"5 Dec 2023",  type:"Report",  size:"1.2 MB", icon:"📄" },
  { name:"Prescription — Diabetes",   date:"20 Nov 2023", type:"Rx",      size:"0.4 MB", icon:"💊" },
  { name:"Eye Fluorescein Test",       date:"3 Oct 2023",  type:"Lab",     size:"1.8 MB", icon:"👁️" },
];

const pharmacy = [
  { name:"Metformin 500mg",   frequency:"Twice daily",  refill:"15 days",  status:"Active",   color:"#d1fae5", tc:"#059669" },
  { name:"Aspirin 75mg",      frequency:"Once daily",   refill:"22 days",  status:"Active",   color:"#dbeafe", tc:"#2563eb" },
  { name:"Lisinopril 10mg",   frequency:"Once daily",   refill:"8 days",   status:"Low",      color:"#fef9c3", tc:"#ca8a04" },
  { name:"Atorvastatin 20mg", frequency:"Once at night",refill:"30 days",  status:"Active",   color:"#d1fae5", tc:"#059669" },
  { name:"Vitamin D3",        frequency:"Once weekly",  refill:"Expired",  status:"Expired",  color:"#fee2e2", tc:"#dc2626" },
];

const navItems = [
  { id:"overview",    icon:"🏠", label:"Overview"  },
  { id:"vitals",      icon:"💓", label:"Vitals"    },
  { id:"history",     icon:"📜", label:"History"   },
  { id:"appointments",icon:"📅", label:"Appointments"},
  { id:"records",     icon:"📋", label:"Records"   },
  { id:"pharmacy",    icon:"💊", label:"Pharmacy"  },
  { id:"reports",     icon:"📁", label:"Reports"   },
];

/* ══════════════════════════════════════════════ */
export default function PatientModule() {
  const navigate     = useNavigate();
  const [active, setActive]         = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const goto = (id) => { setActive(id); setSidebarOpen(false); };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#eaf1f3",
      fontFamily:"'DM Sans','Segoe UI',sans-serif", position:"relative" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={()=>setSidebarOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:40 }} />
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width:200, background:"#0d4f4f", flexShrink:0,
        display:"flex", flexDirection:"column", alignItems:"stretch",
        padding:"16px 0", gap:2,
        position:"fixed", top:0, left:0, bottom:0, zIndex:50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition:"transform 0.25s ease",
      }} className="sidebar-panel">

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 16px 20px" }}>
          <div style={{ width:34, height:34, background:"#14b8a6", borderRadius:10,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:18, fontWeight:700, color:"white" }}>✚</div>
          <span style={{ color:"white", fontWeight:800, fontSize:15 }}>MediCare</span>
        </div>

        {/* Patient mini card */}
        <div style={{ margin:"0 10px 16px", background:"rgba(255,255,255,0.1)",
          borderRadius:12, padding:"12px 10px", textAlign:"center" }}>
          <img src={patientData.avatar} alt="patient"
            style={{ width:46, height:46, borderRadius:"50%", objectFit:"cover",
              border:"2px solid rgba(255,255,255,0.4)", marginBottom:6 }} />
          <div style={{ color:"white", fontWeight:700, fontSize:13 }}>{patientData.name}</div>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11 }}>ID: {patientData.patientId}</div>
        </div>

        {/* Nav */}
        {navItems.map(item => (
          <button key={item.id} onClick={()=>goto(item.id)} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"10px 16px", border:"none", cursor:"pointer",
            background: active===item.id ? "rgba(20,184,166,0.25)" : "transparent",
            borderLeft: active===item.id ? "3px solid #14b8a6" : "3px solid transparent",
            color: active===item.id ? "#14b8a6" : "rgba(255,255,255,0.75)",
            fontSize:13, fontWeight:600, textAlign:"left", transition:"all 0.2s",
          }}>
            <span style={{ fontSize:16 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <button onClick={()=>navigate("/book-appointment")} style={{
          margin:"auto 10px 10px", padding:"11px 14px", border:"none",
          background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",
          color:"white", borderRadius:12, fontWeight:700, fontSize:13,
          cursor:"pointer", display:"flex", alignItems:"center", gap:8,
          border:"1px solid rgba(255,255,255,0.2)",
        }}>🗓️ Book Appointment</button>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}
        className="main-wrap">

        {/* Topbar */}
        <div style={{ height:56, background:"white", display:"flex", alignItems:"center",
          justifyContent:"space-between", padding:"0 20px",
          borderBottom:"1px solid #e5edf0", position:"sticky", top:0, zIndex:30 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={()=>setSidebarOpen(true)} className="hamburger-btn"
              style={{ background:"none", border:"none", cursor:"pointer",
                fontSize:22, color:"#0d4f4f", padding:0, lineHeight:1 }}>☰</button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {navItems.map(n => n.id===active ? (
                <span key={n.id} style={{ fontWeight:700, fontSize:16, color:"#0f172a" }}>
                  {n.icon} {n.label}
                </span>
              ) : null)}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>🔔</span>
            <div style={{ display:"flex", alignItems:"center", gap:8,
              background:"#f1f5f9", borderRadius:20, padding:"4px 12px 4px 4px" }}>
              <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="doc"
                style={{ width:28, height:28, borderRadius:"50%", objectFit:"cover" }} />
              <span style={{ fontSize:13, color:"#1e293b", fontWeight:600 }}
                className="hide-mobile">Dr. Alex Hess</span>
            </div>
          </div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <div style={{ flex:1, overflow:"auto", padding:"22px 20px" }} className="page-body">

          {/* ════════ OVERVIEW ════════ */}
          {active==="overview" && (
            <div>
              <SectionTitle>Patient Overview</SectionTitle>
              <div className="ov-grid">
                {/* Profile card */}
                <div style={{ background:"white", borderRadius:16, padding:22,
                  boxShadow:"0 1px 8px rgba(0,0,0,0.06)", textAlign:"center" }}>
                  <img src={patientData.avatar} alt="patient"
                    style={{ width:80, height:80, borderRadius:16, objectFit:"cover", marginBottom:12 }} />
                  <div style={{ fontWeight:800, fontSize:18, color:"#0f172a" }}>{patientData.name}</div>
                  <div style={{ color:"#64748b", fontSize:13, marginBottom:16 }}>Age: {patientData.age}</div>
                  <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                    <Tag color="#dbeafe" tc="#1d4ed8">🩸 {patientData.bloodType}</Tag>
                    <Tag color="#fce7f3" tc="#be185d">⚠️ {patientData.allergies.split(",")[0]}</Tag>
                  </div>
                  <button onClick={()=>setActive("vitals")} style={{ marginTop:16, width:"100%",
                    background:"#f1f5f9", border:"none", borderRadius:10, padding:"9px",
                    fontSize:13, fontWeight:600, color:"#0d4f4f", cursor:"pointer" }}>
                    View Vitals →
                  </button>
                </div>

                {/* Info */}
                <div style={{ background:"white", borderRadius:16, padding:22,
                  boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:14 }}>Information</div>
                  {[["Gender",patientData.gender],["Blood Type",patientData.bloodType],
                    ["Allergies",patientData.allergies],["Diseases",patientData.diseases],
                    ["Height",patientData.height],["Weight",patientData.weight],
                    ["Phone",patientData.phone],["Last Visit",patientData.lastVisit],
                  ].map(([l,v])=>(
                    <InfoRow key={l} label={l} value={v} />
                  ))}
                </div>

                {/* Quick vitals */}
                <div style={{ background:"white", borderRadius:16, padding:22,
                  boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>Quick Vitals</div>
                    <span onClick={()=>setActive("vitals")} style={{ fontSize:12, color:"#14b8a6",
                      cursor:"pointer", fontWeight:600 }}>See All →</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {vitals.slice(0,4).map(v=>(
                      <div key={v.label} style={{ background:v.color, borderRadius:12, padding:"12px 14px" }}>
                        <div style={{ fontSize:20, marginBottom:4 }}>{v.icon}</div>
                        <div style={{ fontSize:11, color:"#64748b" }}>{v.label}</div>
                        <div style={{ fontSize:18, fontWeight:800, color:"#0f172a" }}>
                          {v.value} <span style={{ fontSize:11, fontWeight:400 }}>{v.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming */}
                <div style={{ background:"white", borderRadius:16, padding:22,
                  boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>Upcoming Appointments</div>
                    <span onClick={()=>setActive("appointments")} style={{ fontSize:12, color:"#14b8a6", cursor:"pointer", fontWeight:600 }}>See All →</span>
                  </div>
                  {upcomingAppointments.map((a,i)=>(
                    <ApptRow key={a.id} a={a} last={i===upcomingAppointments.length-1} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ VITALS ════════ */}
          {active==="vitals" && (
            <div>
              <SectionTitle>Vitals & Health Metrics</SectionTitle>
              <div className="vitals-grid">
                {vitals.map(v=>(
                  <div key={v.label} style={{ background:"white", borderRadius:16, padding:22,
                    boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:v.color,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{v.icon}</div>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
                        background: v.status==="Normal"?"#dcfce7":"#fef9c3",
                        color: v.status==="Normal"?"#16a34a":"#ca8a04" }}>{v.status}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#64748b", marginTop:14, marginBottom:4 }}>{v.label}</div>
                    <div style={{ fontSize:28, fontWeight:800, color:"#0f172a" }}>
                      {v.value}
                      <span style={{ fontSize:13, fontWeight:500, color:"#94a3b8", marginLeft:4 }}>{v.unit}</span>
                    </div>
                    <div style={{ marginTop:10, height:6, background:"#f1f5f9", borderRadius:10, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:"72%", background:v.dot, borderRadius:10, opacity:0.7 }} />
                    </div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>Last updated: Today</div>
                  </div>
                ))}
              </div>

              {/* Trend note */}
              <div style={{ background:"white", borderRadius:16, padding:20, marginTop:20,
                boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:12 }}>📊 Trends Summary</div>
                <div style={{ display:"grid", gap:10 }}>
                  {[
                    ["🫀 Heart Rate","Stable within normal range for the past 30 days.","#dcfce7","#16a34a"],
                    ["🩸 Blood Sugar","Slightly elevated — monitor diet and medication.","#fef9c3","#ca8a04"],
                    ["💉 Blood Pressure","Well controlled. Continue current medication.","#dcfce7","#16a34a"],
                  ].map(([title,note,bg,tc])=>(
                    <div key={title} style={{ background:bg, borderRadius:10, padding:"10px 14px",
                      display:"flex", gap:12, alignItems:"center" }}>
                      <span style={{ fontWeight:700, fontSize:13, color:tc, minWidth:140 }}>{title}</span>
                      <span style={{ fontSize:12, color:"#475569" }}>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ HISTORY ════════ */}
          {active==="history" && (
            <div>
              <SectionTitle>Medical History</SectionTitle>
              <div style={{ background:"white", borderRadius:16, padding:22,
                boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ position:"relative", paddingLeft:24 }}>
                  {/* Timeline line */}
                  <div style={{ position:"absolute", left:8, top:0, bottom:0,
                    width:2, background:"#e2e8f0", borderRadius:2 }} />
                  {medicalHistory.map((h,i)=>{
                    const severityColors = { high:["#fee2e2","#dc2626"], medium:["#fef9c3","#ca8a04"], low:["#dcfce7","#16a34a"] };
                    const [bg,tc] = severityColors[h.severity];
                    return (
                      <div key={i} style={{ position:"relative", paddingLeft:24, paddingBottom:24 }}>
                        {/* Dot */}
                        <div style={{ position:"absolute", left:-8, top:4, width:16, height:16,
                          borderRadius:"50%", background:tc, border:"3px solid white",
                          boxShadow:"0 0 0 2px "+tc+"40" }} />
                        <div style={{ background:"#f8fafc", borderRadius:12, padding:"14px 16px",
                          border:"1px solid #e2e8f0" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                            <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{h.event}</div>
                            <Tag color={bg} tc={tc}>{h.severity.toUpperCase()}</Tag>
                          </div>
                          <div style={{ fontSize:12, color:"#64748b", marginTop:6 }}>
                            👨‍⚕️ {h.doctor} · 📅 {h.year}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ════════ APPOINTMENTS ════════ */}
          {active==="appointments" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <SectionTitle style={{ margin:0 }}>Appointments</SectionTitle>
                <button onClick={()=>navigate("/book-appointment")}
                  style={{ background:"linear-gradient(120deg,#0d4f4f,#14b8a6)", color:"white",
                    border:"none", borderRadius:12, padding:"10px 20px",
                    fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  🗓️ Book New
                </button>
              </div>

              <div style={{ fontWeight:700, fontSize:13, color:"#64748b",
                marginBottom:10, textTransform:"uppercase", letterSpacing:0.5 }}>Upcoming</div>
              <div style={{ background:"white", borderRadius:16, padding:20,
                boxShadow:"0 1px 8px rgba(0,0,0,0.06)", marginBottom:20 }}>
                {upcomingAppointments.map((a,i)=>(
                  <ApptRow key={a.id} a={a} last={i===upcomingAppointments.length-1} showType />
                ))}
              </div>

              <div style={{ fontWeight:700, fontSize:13, color:"#64748b",
                marginBottom:10, textTransform:"uppercase", letterSpacing:0.5 }}>Previous</div>
              <div style={{ background:"white", borderRadius:16, padding:20,
                boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                {previousAppointments.map((a,i,arr)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                    padding:"11px 0", borderBottom:i<arr.length-1?"1px solid #f1f5f9":"none" }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:"#f1f5f9",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:18, flexShrink:0 }}>👨‍⚕️</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13, color:"#1e293b",
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.doctor}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{a.specialty} · {a.reason}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:11, color:"#64748b" }}>{a.date}</div>
                      <Tag color="#dcfce7" tc="#16a34a">{a.result}</Tag>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ RECORDS ════════ */}
          {active==="records" && (
            <div>
              <SectionTitle>Medical Records</SectionTitle>
              <div style={{ background:"white", borderRadius:16, overflow:"hidden",
                boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                {/* Table header */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 120px 100px 80px 80px",
                  background:"#f1f5f9", padding:"12px 20px",
                  fontSize:11, fontWeight:800, color:"#64748b",
                  textTransform:"uppercase", letterSpacing:0.5, borderBottom:"1px solid #e2e8f0" }}
                  className="rec-header">
                  <span>File Name</span>
                  <span>Date</span>
                  <span>Type</span>
                  <span>Size</span>
                  <span>Action</span>
                </div>
                {records.map((r,i)=>(
                  <div key={i} style={{ display:"grid",
                    gridTemplateColumns:"1fr 120px 100px 80px 80px",
                    padding:"13px 20px", alignItems:"center",
                    borderBottom: i<records.length-1?"1px solid #f1f5f9":"none",
                    background:"white", transition:"background 0.15s" }}
                    className="rec-row">
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:9,
                        background:"#f1f5f9", display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:18, flexShrink:0 }}>{r.icon}</div>
                      <div style={{ fontWeight:600, fontSize:13, color:"#0f172a",
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.name}</div>
                    </div>
                    <div style={{ fontSize:12, color:"#64748b" }}>{r.date}</div>
                    <Tag color="#ede9fe" tc="#7c3aed">{r.type}</Tag>
                    <div style={{ fontSize:12, color:"#94a3b8" }}>{r.size}</div>
                    <button style={{ background:"#f1f5f9", border:"none", borderRadius:8,
                      padding:"6px 12px", fontSize:12, fontWeight:600,
                      color:"#0d4f4f", cursor:"pointer" }}>⬇ View</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ PHARMACY ════════ */}
          {active==="pharmacy" && (
            <div>
              <SectionTitle>Pharmacy & Medications</SectionTitle>
              <div style={{ display:"grid", gap:14 }} className="pharma-grid">
                {pharmacy.map((p,i)=>(
                  <div key={i} style={{ background:"white", borderRadius:16, padding:"16px 20px",
                    boxShadow:"0 1px 8px rgba(0,0,0,0.06)",
                    display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                    <div style={{ width:46, height:46, borderRadius:12, background:p.color,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:24, flexShrink:0 }}>💊</div>
                    <div style={{ flex:1, minWidth:140 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{p.name}</div>
                      <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>🕐 {p.frequency}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:12, color:"#64748b", marginBottom:4 }}>
                        Refill in: <strong>{p.refill}</strong>
                      </div>
                      <Tag color={p.color} tc={p.tc}>{p.status}</Tag>
                    </div>
                    <button style={{ background:"#f1f5f9", border:"none", borderRadius:8,
                      padding:"7px 14px", fontSize:12, fontWeight:600,
                      color:"#0d4f4f", cursor:"pointer", flexShrink:0 }}>Refill</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ REPORTS ════════ */}
          {active==="reports" && (
            <div>
              <SectionTitle>Reports & Analytics</SectionTitle>

              {/* Summary stats */}
              <div className="rep-stats" style={{ marginBottom:20 }}>
                {[
                  ["Total Visits","12","📅","#dbeafe","#1d4ed8"],
                  ["Active Meds","4","💊","#d1fae5","#059669"],
                  ["Upcoming","2","🗓️","#fce7f3","#be185d"],
                  ["Records","5","📋","#ede9fe","#7c3aed"],
                ].map(([label,val,icon,bg,tc])=>(
                  <div key={label} style={{ background:"white", borderRadius:16, padding:"18px 20px",
                    boxShadow:"0 1px 8px rgba(0,0,0,0.06)",
                    display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:bg,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:2 }}>{label}</div>
                      <div style={{ fontSize:24, fontWeight:800, color:"#0f172a" }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Health summary */}
              <div style={{ background:"white", borderRadius:16, padding:22,
                boxShadow:"0 1px 8px rgba(0,0,0,0.06)", marginBottom:20 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:16 }}>
                  📊 Health Report Summary
                </div>
                <div style={{ display:"grid", gap:12 }}>
                  {[
                    ["Cardiovascular","Stable — regular monitoring recommended",78,"#ef4444"],
                    ["Blood Sugar","Slightly elevated — diet control needed",55,"#ca8a04"],
                    ["Kidney Function","Normal — no concerns",90,"#10b981"],
                    ["Liver Function","Normal",88,"#10b981"],
                  ].map(([label,note,pct,color])=>(
                    <div key={label}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:"#1e293b" }}>{label}</span>
                        <span style={{ fontSize:12, color:"#64748b" }}>{note}</span>
                      </div>
                      <div style={{ height:8, background:"#f1f5f9", borderRadius:10, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:pct+"%", background:color, borderRadius:10, opacity:0.8 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Lab Results */}
              <div style={{ background:"white", borderRadius:16, padding:22,
                boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#0f172a", marginBottom:14 }}>
                  🧪 Recent Lab Results
                </div>
                {[
                  ["HbA1c","6.8%","< 5.7% Normal","High","#fee2e2","#dc2626"],
                  ["LDL Cholesterol","105 mg/dL","< 100 mg/dL Optimal","Borderline","#fef9c3","#ca8a04"],
                  ["Hemoglobin","14.2 g/dL","13.5–17.5 Normal","Normal","#dcfce7","#16a34a"],
                  ["Creatinine","0.9 mg/dL","0.7–1.3 Normal","Normal","#dcfce7","#16a34a"],
                ].map(([test,val,ref,status,bg,tc])=>(
                  <div key={test} style={{ display:"flex", alignItems:"center", gap:12,
                    padding:"10px 0", borderBottom:"1px solid #f1f5f9" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:13, color:"#0f172a" }}>{test}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{ref}</div>
                    </div>
                    <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{val}</div>
                    <Tag color={bg} tc={tc}>{status}</Tag>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── RESPONSIVE CSS ── */}
      <style>{`
        @media(min-width:769px){
          .sidebar-panel { position:sticky !important; top:0 !important; height:100vh !important; transform:translateX(0) !important; }
          .hamburger-btn { display:none !important; }
          .hide-mobile   { display:inline !important; }
          .main-wrap     { margin-left:0; }
          .page-body     { padding:24px 28px !important; }
          .ov-grid       { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
          .vitals-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
          .rep-stats     { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
          .rec-header,.rec-row { grid-template-columns:1fr 120px 100px 80px 80px !important; }
          .pharma-grid   { grid-template-columns:1fr; }
        }
        @media(max-width:768px){
          .hamburger-btn { display:block !important; }
          .hide-mobile   { display:none !important; }
          .sidebar-panel { width:200px !important; }
          .ov-grid       { display:flex; flex-direction:column; gap:14px; }
          .vitals-grid   { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
          .rep-stats     { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
          .rec-header    { display:none !important; }
          .rec-row       { grid-template-columns:1fr auto !important; }
          .rec-row > :nth-child(2),
          .rec-row > :nth-child(3),
          .rec-row > :nth-child(4){ display:none; }
        }
        div::-webkit-scrollbar      { width:4px; height:4px; }
        div::-webkit-scrollbar-thumb{ background:#cbd5e1; border-radius:4px; }
      `}</style>
    </div>
  );
}

/* ── SMALL REUSABLE COMPONENTS ── */
function SectionTitle({ children, style={} }) {
  return <h2 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:"0 0 18px", ...style }}>{children}</h2>;
}
function InfoRow({ label, value }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between",
      borderBottom:"1px solid #f1f5f9", padding:"7px 0", fontSize:13 }}>
      <span style={{ color:"#64748b", fontWeight:600 }}>{label}</span>
      <span style={{ color:"#1e293b", textAlign:"right", maxWidth:180 }}>{value}</span>
    </div>
  );
}
function Tag({ color, tc, children }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20,
      background:color, color:tc, display:"inline-block", marginTop:2 }}>{children}</span>
  );
}
function ApptRow({ a, last, showType }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12,
      padding:"11px 0", borderBottom:last?"none":"1px solid #f1f5f9", flexWrap:"wrap" }}>
      <div style={{ width:38, height:38, borderRadius:10,
        background: a.type==="online"?"#eff6ff":"#e0f2fe",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:18, flexShrink:0 }}>
        {a.type==="online"?"💻":"👨‍⚕️"}
      </div>
      <div style={{ flex:1, minWidth:120 }}>
        <div style={{ fontWeight:600, fontSize:13, color:"#1e293b" }}>{a.doctor}</div>
        <div style={{ fontSize:11, color:"#94a3b8" }}>{a.specialty}</div>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:12, color:"#475569", fontWeight:500 }}>{a.date}</div>
        <div style={{ fontSize:11, color:"#94a3b8" }}>{a.time}</div>
      </div>
      <Tag color="#dcfce7" tc="#16a34a">● Upcoming</Tag>
    </div>
  );
}