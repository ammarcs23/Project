import { useState } from "react";

/* ══════════════════════════════════════════════
   DATA
══════════════════════════════════════════════ */
const doctor = {
  name: "Dr. Ahmed Khan",
  specialty: "Cardiologist",
  avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  email: "ahmed.khan@hospital.com",
  phone: "+92-300-9876543",
  experience: "12 years",
  patients: 666,
};

const stats = [
  { label:"Patients",     value:"666",    icon:"👥", bg:"#c7d2fe", color:"#3730a3" },
  { label:"Income",       value:"$2,111", icon:"💵", bg:"#bbf7d0", color:"#065f46" },
  { label:"Appointments", value:"211",    icon:"📅", bg:"#bfdbfe", color:"#1e40af" },
  { label:"Treatments",   value:"402",    icon:"🩺", bg:"#fecdd3", color:"#9f1239" },
];

const todayAppointments = [
  { id:1, name:"Beth Mccoy",       reason:"Scaling",           time:"On Going", avatar:"https://randomuser.me/api/portraits/women/44.jpg", status:"ongoing" },
  { id:2, name:"Evan Henry",       reason:"Medical check up",  time:"12:00",    avatar:"https://randomuser.me/api/portraits/men/32.jpg",   status:"pending" },
  { id:3, name:"Dwight Murphy",    reason:"Heart consultation", time:"14:00",    avatar:"https://randomuser.me/api/portraits/men/46.jpg",   status:"pending" },
  { id:4, name:"Bessie Alexander", reason:"Follow up",         time:"14:00",    avatar:"https://randomuser.me/api/portraits/women/65.jpg", status:"pending" },
];

const initRequests = [
  { id:1, name:"Devon Cooper",    reason:"Scaling",         date:"29 Feb",  time:"10:00", avatar:"https://randomuser.me/api/portraits/men/22.jpg",   status:"pending"  },
  { id:2, name:"Ricardo Russell", reason:"Heart checkup",   date:"1 March", time:"11:00", avatar:"https://randomuser.me/api/portraits/men/55.jpg",   status:"accepted" },
  { id:3, name:"Nadia Sheikh",    reason:"General checkup", date:"2 March", time:"09:30", avatar:"https://randomuser.me/api/portraits/women/33.jpg", status:"pending"  },
];

const nextPatient = {
  name:"Beth Mccoy", address:"2235 Avondale Ave Pasadena, Oklahoma 83900",
  avatar:"https://randomuser.me/api/portraits/women/44.jpg",
  dob:"29 Feb 1999", sex:"Female", weight:"56 kg",
  height:"172 cm", lastAppointment:"02 Jan 2020", registerDate:"19 Des 2018",
  conditions:["Asthma","Hypertension","Diabetes"], phone:"(308) 555-0121",
};

const chartData = [65,40,80,55,70,45,90,60,75,50,85,65];
const months    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ── PATIENTS DATA ── */
const allPatients = [
  { id:"P001", name:"Beth Mccoy",       age:25, gender:"Female", blood:"A+",  condition:"Asthma",         lastVisit:"02 Jan 2024", status:"Active",   avatar:"https://randomuser.me/api/portraits/women/44.jpg" },
  { id:"P002", name:"Evan Henry",       age:34, gender:"Male",   blood:"O+",  condition:"Hypertension",   lastVisit:"15 Feb 2024", status:"Active",   avatar:"https://randomuser.me/api/portraits/men/32.jpg"   },
  { id:"P003", name:"Dwight Murphy",    age:45, gender:"Male",   blood:"B+",  condition:"Heart Disease",  lastVisit:"10 Mar 2024", status:"Critical", avatar:"https://randomuser.me/api/portraits/men/46.jpg"   },
  { id:"P004", name:"Bessie Alexander", age:31, gender:"Female", blood:"AB-", condition:"Diabetes",       lastVisit:"22 Feb 2024", status:"Active",   avatar:"https://randomuser.me/api/portraits/women/65.jpg" },
  { id:"P005", name:"Devon Cooper",     age:28, gender:"Male",   blood:"O-",  condition:"General",        lastVisit:"5 Mar 2024",  status:"New",      avatar:"https://randomuser.me/api/portraits/men/22.jpg"   },
  { id:"P006", name:"Nadia Sheikh",     age:38, gender:"Female", blood:"A-",  condition:"Blood Disorder", lastVisit:"18 Jan 2024", status:"Active",   avatar:"https://randomuser.me/api/portraits/women/33.jpg" },
];

/* ── SCHEDULE DATA ── */
const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const scheduleData = {
  Mon: [
    { time:"09:00", patient:"Beth Mccoy",    reason:"Follow up",       type:"visit",  avatar:"https://randomuser.me/api/portraits/women/44.jpg", status:"confirmed" },
    { time:"10:30", patient:"Evan Henry",    reason:"BP checkup",      type:"visit",  avatar:"https://randomuser.me/api/portraits/men/32.jpg",   status:"confirmed" },
    { time:"14:00", patient:"Nadia Sheikh",  reason:"Blood test review",type:"online", avatar:"https://randomuser.me/api/portraits/women/33.jpg", status:"pending"   },
  ],
  Tue: [
    { time:"09:30", patient:"Dwight Murphy", reason:"Heart scan review", type:"visit",  avatar:"https://randomuser.me/api/portraits/men/46.jpg",   status:"confirmed" },
    { time:"11:00", patient:"Devon Cooper",  reason:"First consultation",type:"visit",  avatar:"https://randomuser.me/api/portraits/men/22.jpg",   status:"confirmed" },
  ],
  Wed: [
    { time:"10:00", patient:"Bessie Alexander",reason:"Diabetes checkup",type:"online", avatar:"https://randomuser.me/api/portraits/women/65.jpg", status:"confirmed" },
    { time:"15:00", patient:"Beth Mccoy",      reason:"Prescription refill",type:"online",avatar:"https://randomuser.me/api/portraits/women/44.jpg",status:"pending" },
  ],
  Thu: [
    { time:"09:00", patient:"Evan Henry",    reason:"Monthly checkup",  type:"visit",  avatar:"https://randomuser.me/api/portraits/men/32.jpg",   status:"confirmed" },
  ],
  Fri: [
    { time:"11:00", patient:"Nadia Sheikh",  reason:"Follow up",         type:"visit",  avatar:"https://randomuser.me/api/portraits/women/33.jpg", status:"confirmed" },
    { time:"14:30", patient:"Dwight Murphy", reason:"Post surgery check", type:"visit",  avatar:"https://randomuser.me/api/portraits/men/46.jpg",   status:"confirmed" },
  ],
  Sat: [],
  Sun: [],
};

const navItems = [
  { id:"dashboard", icon:"⊞", label:"Dashboard" },
  { id:"patients",  icon:"👥", label:"Patients"  },
  { id:"schedule",  icon:"📅", label:"Schedule"  },
];

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function DoctorDashboard() {
  const [active,      setActive]      = useState("dashboard");
  const [requests,    setRequests]    = useState(initRequests);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Patients state
  const [search,         setSearch]         = useState("");
  const [selectedPatient,setSelectedPatient]= useState(null);
  const [filterStatus,   setFilterStatus]   = useState("All");

  // Schedule state
  const [selectedDay,  setSelectedDay]  = useState("Mon");
  const [addSlotOpen,  setAddSlotOpen]  = useState(false);
  const [newSlot,      setNewSlot]      = useState({ time:"09:00", patient:"", reason:"", type:"visit" });
  const [schedule,     setSchedule]     = useState(scheduleData);

  const handleAccept = (id) => setRequests(p => p.map(r => r.id===id ? {...r,status:"accepted"} : r));
  const handleReject = (id) => setRequests(p => p.filter(r => r.id!==id));

  const filteredPatients = allPatients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.condition.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus==="All" || p.status===filterStatus;
    return matchSearch && matchStatus;
  });

  const addScheduleSlot = () => {
    if (!newSlot.patient || !newSlot.reason) { alert("Fill patient and reason."); return; }
    setSchedule(prev => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay]||[]), { ...newSlot, status:"pending",
        avatar:"https://randomuser.me/api/portraits/men/10.jpg" }].sort((a,b)=>a.time.localeCompare(b.time))
    }));
    setNewSlot({ time:"09:00", patient:"", reason:"", type:"visit" });
    setAddSlotOpen(false);
  };

  const statusBadge = (s) => {
    const map = { Active:["#dcfce7","#16a34a"], Critical:["#fee2e2","#dc2626"],
                  New:["#dbeafe","#1d4ed8"], Inactive:["#f1f5f9","#64748b"] };
    const [bg,tc] = map[s] || ["#f1f5f9","#64748b"];
    return <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px",
      borderRadius:20, background:bg, color:tc }}>{s}</span>;
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#eef0f8",
      fontFamily:"'Nunito','Segoe UI',sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={()=>setSidebarOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:40 }} />
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width:220, background:"#1a3fce", flexShrink:0,
        display:"flex", flexDirection:"column", alignItems:"center",
        padding:"28px 0 20px",
        position:"fixed", top:0, left:0, bottom:0, zIndex:50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition:"transform 0.25s ease",
      }} className="doc-sidebar">

        <button onClick={()=>setSidebarOpen(false)}
          style={{ position:"absolute", top:12, right:12, background:"none", border:"none",
            color:"rgba(255,255,255,0.7)", fontSize:20, cursor:"pointer" }}
          className="sidebar-close">✕</button>

        {/* Doctor profile */}
        <div style={{ textAlign:"center", marginBottom:32, padding:"0 16px" }}>
          <img src={doctor.avatar} alt="doctor"
            style={{ width:78, height:78, borderRadius:"50%", objectFit:"cover",
              border:"3px solid rgba(255,255,255,0.4)", marginBottom:10 }} />
          <div style={{ color:"white", fontWeight:800, fontSize:15 }}>{doctor.name}</div>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginTop:2 }}>{doctor.specialty}</div>
          <div style={{ marginTop:8, background:"rgba(255,255,255,0.15)", borderRadius:20,
            padding:"3px 12px", fontSize:11, color:"rgba(255,255,255,0.8)", display:"inline-block" }}>
            🟢 Online
          </div>
        </div>

        {/* Nav */}
        <div style={{ width:"100%", padding:"0 12px", display:"flex", flexDirection:"column", gap:4 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={()=>{ setActive(item.id); setSidebarOpen(false); }} style={{
              display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
              borderRadius:12, border:"none", cursor:"pointer", fontSize:14, fontWeight:600,
              background: active===item.id ? "white" : "transparent",
              color:       active===item.id ? "#1a3fce" : "rgba(255,255,255,0.75)",
              borderLeft:  active===item.id ? "none" : "none",
              transition:"all 0.2s",
            }}>
              <span style={{ fontSize:18 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>

        {/* Doctor info at bottom */}
        <div style={{ marginTop:"auto", padding:"0 14px 10px", width:"100%", boxSizing:"border-box" }}>
          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 14px" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginBottom:4 }}>Experience</div>
            <div style={{ fontSize:13, color:"white", fontWeight:700 }}>{doctor.experience}</div>
          </div>
          <button style={{
            marginTop:10, display:"flex", alignItems:"center", gap:10,
            padding:"11px 16px", border:"1px solid rgba(255,255,255,0.2)",
            background:"transparent", color:"rgba(255,255,255,0.6)",
            fontSize:13, fontWeight:600, cursor:"pointer",
            width:"100%", borderRadius:12,
          }}>↩ Logout</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }} className="doc-main">

        {/* Topbar */}
        <div style={{ height:60, background:"white", display:"flex", alignItems:"center",
          justifyContent:"space-between", padding:"0 20px",
          borderBottom:"1px solid #e8ecf4", position:"sticky", top:0, zIndex:30 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={()=>setSidebarOpen(true)} className="hamburger-doc"
              style={{ background:"none", border:"none", fontSize:22,
                color:"#1a3fce", cursor:"pointer", lineHeight:1 }}>☰</button>
            <h1 style={{ fontSize:19, fontWeight:800, color:"#1a2340", margin:0 }}>
              {navItems.find(n=>n.id===active)?.icon} {navItems.find(n=>n.id===active)?.label}
            </h1>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {[["🔔","Alert","#ef4444"],["⚙️","Setting","#64748b"]].map(([icon,label,color])=>(
              <button key={label} style={{ display:"flex", alignItems:"center", gap:5,
                background:"none", border:"none", cursor:"pointer", fontSize:13, color, fontWeight:600 }}>
                <span style={{ fontSize:16, position:"relative" }}>
                  {icon}
                  {label==="Alert" && (
                    <span style={{ position:"absolute", top:-4, right:-4, width:14, height:14,
                      background:"#ef4444", borderRadius:"50%", fontSize:8, color:"white",
                      display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>3</span>
                  )}
                </span>
                <span className="topbar-label">{label}</span>
              </button>
            ))}
            <img src={doctor.avatar} alt="dr"
              style={{ width:34, height:34, borderRadius:"50%", objectFit:"cover",
                border:"2px solid #e2e8f0", cursor:"pointer" }} />
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex:1, overflow:"auto", padding:"20px 16px" }} className="doc-body">

          {/* ════════ DASHBOARD ════════ */}
          {active==="dashboard" && (
            <div>
              {/* Stats */}
              <div className="stats-grid" style={{ marginBottom:20 }}>
                {stats.map((s,i)=>(
                  <div key={i} style={{ background:"white", borderRadius:14, padding:"16px 18px",
                    boxShadow:"0 1px 8px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:s.bg,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:20, flexShrink:0 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:2 }}>{s.label}</div>
                      <div style={{ fontSize:20, fontWeight:800, color:"#1a2340" }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Middle */}
              <div className="two-col-grid" style={{ marginBottom:20 }}>
                {/* Today Appointments */}
                <div style={{ background:"white", borderRadius:16, padding:20, boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:"#1a2340" }}>Today Appointments</div>
                    <button onClick={()=>setActive("schedule")} style={{ fontSize:12, color:"#1a3fce",
                      fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>See All →</button>
                  </div>
                  {todayAppointments.map(a=>(
                    <div key={a.id} style={{ display:"flex", alignItems:"center", gap:12,
                      padding:"10px 12px", borderRadius:12,
                      background: a.status==="ongoing" ? "#eff6ff" : "transparent" }}>
                      <img src={a.avatar} alt={a.name}
                        style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:13,
                          color: a.status==="ongoing" ? "#1a3fce" : "#1a2340",
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.name}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>{a.reason}</div>
                      </div>
                      <div style={{ fontSize: a.status==="ongoing"?12:14, fontWeight:700, flexShrink:0,
                        color: a.status==="ongoing" ? "#1a3fce" : "#1a2340" }}>
                        {a.status==="ongoing" ? "On Going" : a.time}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Next Patient */}
                <div style={{ background:"white", borderRadius:16, padding:20, boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontWeight:800, fontSize:15, color:"#1a2340", marginBottom:14 }}>Next Patient</div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <img src={nextPatient.avatar} alt={nextPatient.name}
                      style={{ width:52, height:52, borderRadius:12, objectFit:"cover", flexShrink:0 }} />
                    <div>
                      <div style={{ fontWeight:800, fontSize:15, color:"#1a2340" }}>{nextPatient.name}</div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{nextPatient.address}</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:12 }}>
                    {[["D.O.B",nextPatient.dob],["Sex",nextPatient.sex],["Weight",nextPatient.weight],
                      ["Height",nextPatient.height],["Last Appt.",nextPatient.lastAppointment],["Registered",nextPatient.registerDate]
                    ].map(([l,v])=>(
                      <div key={l}>
                        <div style={{ fontSize:10, color:"#94a3b8", marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#1a2340" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                    {nextPatient.conditions.map((c,i)=>{
                      const cols=[["#fef3c7","#d97706"],["#d1fae5","#059669"],["#ede9fe","#7c3aed"]];
                      return <span key={i} style={{ fontSize:11, fontWeight:700, padding:"3px 10px",
                        borderRadius:20, background:cols[i][0], color:cols[i][1] }}>{c}</span>;
                    })}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[["📞",nextPatient.phone,true],["📄","Docs",false],["💬","Chat",false]].map(([ic,tx,primary])=>(
                      <button key={tx} style={{ flex:1, padding:"8px 4px", borderRadius:10,
                        border: primary?"none":"2px solid #e2e8f0",
                        background: primary?"#1a3fce":"white",
                        color: primary?"white":"#1a2340",
                        fontWeight:700, fontSize:11, cursor:"pointer" }}>{ic} {tx}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom */}
              <div className="two-col-grid">
                {/* Requests */}
                <div style={{ background:"white", borderRadius:16, padding:20, boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:"#1a2340" }}>Appointment Requests</div>
                    <span style={{ fontSize:12, color:"#1a3fce", fontWeight:700, cursor:"pointer" }}>See All</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {requests.map(r=>(
                      <div key={r.id} style={{ display:"flex", alignItems:"center", gap:10,
                        padding:"10px 12px", borderRadius:12,
                        background:"#f8fafc", border:"1px solid #f1f5f9" }}>
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
                            <button onClick={()=>handleAccept(r.id)} style={{ width:30, height:30,
                              borderRadius:"50%", border:"none", background:"#d1fae5",
                              color:"#059669", fontSize:14, cursor:"pointer",
                              display:"flex", alignItems:"center", justifyContent:"center" }}>✓</button>
                            <button onClick={()=>handleReject(r.id)} style={{ width:30, height:30,
                              borderRadius:"50%", border:"none", background:"#fee2e2",
                              color:"#ef4444", fontSize:14, cursor:"pointer",
                              display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
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
                    {chartData.map((val,i)=>(
                      <div key={i} style={{ flex:1 }}>
                        <div style={{ width:"100%", borderRadius:"4px 4px 0 0", height:`${val}px`,
                          background: i%3===0?"#1a3fce":i%3===1?"#10b981":"#f43f5e", opacity:0.85 }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:4 }}>
                    {months.map((m,i)=>(
                      <div key={i} style={{ flex:1, textAlign:"center", fontSize:8, color:"#94a3b8", fontWeight:600 }}>{m}</div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:14, marginTop:10, justifyContent:"center", flexWrap:"wrap" }}>
                    {[["#1a3fce","New"],["#10b981","Recovered"],["#f43f5e","Critical"]].map(([color,label])=>(
                      <div key={label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#64748b" }}>
                        <div style={{ width:10, height:10, borderRadius:3, background:color }} />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ PATIENTS ════════ */}
          {active==="patients" && (
            <div>
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                flexWrap:"wrap", gap:12, marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#1a2340", margin:0 }}>All Patients</h2>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{allPatients.length} registered patients</div>
                </div>
                <button style={{ background:"#1a3fce", color:"white", border:"none",
                  borderRadius:12, padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  + Add Patient
                </button>
              </div>

              {/* Search + Filter */}
              <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:200, position:"relative" }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                    fontSize:16, color:"#94a3b8" }}>🔍</span>
                  <input placeholder="Search patient name or condition..."
                    value={search} onChange={e=>setSearch(e.target.value)}
                    style={{ width:"100%", padding:"10px 12px 10px 38px", borderRadius:12,
                      border:"1.5px solid #e2e8f0", fontSize:13, outline:"none",
                      background:"white", boxSizing:"border-box" }} />
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {["All","Active","Critical","New"].map(s=>(
                    <button key={s} onClick={()=>setFilterStatus(s)} style={{
                      padding:"8px 14px", borderRadius:20, border:"none", cursor:"pointer",
                      fontSize:12, fontWeight:600,
                      background: filterStatus===s ? "#1a3fce" : "#f1f5f9",
                      color: filterStatus===s ? "white" : "#64748b",
                      transition:"all 0.2s",
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Patient detail modal */}
              {selectedPatient && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
                  zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
                  <div style={{ background:"white", borderRadius:20, width:"100%", maxWidth:500,
                    padding:28, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <img src={selectedPatient.avatar} alt={selectedPatient.name}
                          style={{ width:60, height:60, borderRadius:14, objectFit:"cover" }} />
                        <div>
                          <div style={{ fontWeight:800, fontSize:17, color:"#1a2340" }}>{selectedPatient.name}</div>
                          <div style={{ fontSize:12, color:"#64748b" }}>ID: {selectedPatient.id}</div>
                          <div style={{ marginTop:4 }}>{statusBadge(selectedPatient.status)}</div>
                        </div>
                      </div>
                      <button onClick={()=>setSelectedPatient(null)} style={{ background:"#f1f5f9",
                        border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer",
                        fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 20px", marginBottom:16 }}>
                      {[["Age",selectedPatient.age+" yrs"],["Gender",selectedPatient.gender],
                        ["Blood Type",selectedPatient.blood],["Condition",selectedPatient.condition],
                        ["Last Visit",selectedPatient.lastVisit],["Status",selectedPatient.status]
                      ].map(([l,v])=>(
                        <div key={l}>
                          <div style={{ fontSize:11, color:"#94a3b8", marginBottom:3 }}>{l}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#1a2340" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:10 }}>
                      <button style={{ flex:1, padding:"10px", borderRadius:10, border:"none",
                        background:"#1a3fce", color:"white", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                        📋 View Full Record
                      </button>
                      <button style={{ flex:1, padding:"10px", borderRadius:10,
                        border:"2px solid #e2e8f0", background:"white",
                        color:"#1a2340", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                        📅 Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Patients table */}
              <div style={{ background:"white", borderRadius:16, overflow:"hidden",
                boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
                {/* Table header */}
                <div className="pat-header" style={{ display:"grid",
                  background:"#f1f5f9", padding:"12px 20px",
                  fontSize:11, fontWeight:800, color:"#64748b",
                  textTransform:"uppercase", letterSpacing:0.5,
                  borderBottom:"1px solid #e2e8f0" }}>
                  <span>Patient</span>
                  <span>Age</span>
                  <span>Blood</span>
                  <span>Condition</span>
                  <span>Last Visit</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>

                {filteredPatients.length === 0 && (
                  <div style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:14 }}>
                    No patients found.
                  </div>
                )}

                {filteredPatients.map((p,i)=>(
                  <div key={p.id} className="pat-row" style={{ display:"grid",
                    padding:"13px 20px", alignItems:"center",
                    borderBottom: i<filteredPatients.length-1 ? "1px solid #f1f5f9" : "none",
                    background:"white" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <img src={p.avatar} alt={p.name}
                        style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:"#1a2340" }}>{p.name}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>#{p.id}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:13, color:"#475569" }}>{p.age}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#1a2340" }}>{p.blood}</div>
                    <div style={{ fontSize:12, color:"#475569" }}>{p.condition}</div>
                    <div style={{ fontSize:12, color:"#64748b" }}>{p.lastVisit}</div>
                    <div>{statusBadge(p.status)}</div>
                    <button onClick={()=>setSelectedPatient(p)} style={{
                      background:"#eff6ff", border:"none", borderRadius:8,
                      padding:"6px 12px", fontSize:12, fontWeight:600,
                      color:"#1a3fce", cursor:"pointer" }}>View</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ SCHEDULE ════════ */}
          {active==="schedule" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                flexWrap:"wrap", gap:12, marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#1a2340", margin:0 }}>Weekly Schedule</h2>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Manage your appointments</div>
                </div>
                <button onClick={()=>setAddSlotOpen(true)} style={{
                  background:"#1a3fce", color:"white", border:"none",
                  borderRadius:12, padding:"10px 20px", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  + Add Slot
                </button>
              </div>

              {/* Day selector */}
              <div style={{ display:"flex", gap:6, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
                {weekDays.map(day=>{
                  const count = (schedule[day]||[]).length;
                  return (
                    <button key={day} onClick={()=>setSelectedDay(day)} style={{
                      flexShrink:0, padding:"10px 16px", borderRadius:14, border:"none", cursor:"pointer",
                      background: selectedDay===day ? "#1a3fce" : "white",
                      color: selectedDay===day ? "white" : "#64748b",
                      fontWeight:700, fontSize:13, transition:"all 0.2s",
                      boxShadow: selectedDay===day ? "0 4px 12px rgba(26,63,206,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                      position:"relative",
                    }}>
                      {day}
                      {count > 0 && (
                        <span style={{ position:"absolute", top:-4, right:-4,
                          width:16, height:16, borderRadius:"50%",
                          background: selectedDay===day ? "white" : "#1a3fce",
                          color: selectedDay===day ? "#1a3fce" : "white",
                          fontSize:9, fontWeight:800,
                          display:"flex", alignItems:"center", justifyContent:"center" }}>{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Add slot modal */}
              {addSlotOpen && (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
                  zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
                  <div style={{ background:"white", borderRadius:20, width:"100%", maxWidth:440,
                    padding:26, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                      <div style={{ fontWeight:800, fontSize:16, color:"#1a2340" }}>Add Schedule Slot</div>
                      <button onClick={()=>setAddSlotOpen(false)} style={{ background:"#f1f5f9",
                        border:"none", borderRadius:"50%", width:32, height:32, cursor:"pointer",
                        fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {[
                        ["Day", <select value={selectedDay} onChange={e=>setSelectedDay(e.target.value)} style={inpSt}>
                          {weekDays.map(d=><option key={d}>{d}</option>)}
                        </select>],
                        ["Time", <input type="time" value={newSlot.time}
                          onChange={e=>setNewSlot(p=>({...p,time:e.target.value}))} style={inpSt} />],
                        ["Patient Name", <input placeholder="Patient name" value={newSlot.patient}
                          onChange={e=>setNewSlot(p=>({...p,patient:e.target.value}))} style={inpSt} />],
                        ["Reason", <input placeholder="Reason for visit" value={newSlot.reason}
                          onChange={e=>setNewSlot(p=>({...p,reason:e.target.value}))} style={inpSt} />],
                        ["Type", <select value={newSlot.type} onChange={e=>setNewSlot(p=>({...p,type:e.target.value}))} style={inpSt}>
                          <option value="visit">🏥 Hospital Visit</option>
                          <option value="online">💻 Online</option>
                        </select>],
                      ].map(([label, input])=>(
                        <div key={label}>
                          <label style={{ fontSize:12, fontWeight:700, color:"#475569",
                            marginBottom:5, display:"block" }}>{label}</label>
                          {input}
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:10, marginTop:18 }}>
                      <button onClick={()=>setAddSlotOpen(false)} style={{ flex:1, padding:"11px",
                        borderRadius:10, border:"2px solid #e2e8f0", background:"white",
                        fontWeight:700, fontSize:13, cursor:"pointer", color:"#64748b" }}>Cancel</button>
                      <button onClick={addScheduleSlot} style={{ flex:1, padding:"11px",
                        borderRadius:10, border:"none", background:"#1a3fce",
                        fontWeight:700, fontSize:13, cursor:"pointer", color:"white" }}>Add Slot</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule slots */}
              {(schedule[selectedDay]||[]).length === 0 ? (
                <div style={{ background:"white", borderRadius:16, padding:40,
                  textAlign:"center", boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>📅</div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#1a2340" }}>No appointments on {selectedDay}</div>
                  <div style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>Click "+ Add Slot" to schedule one</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {(schedule[selectedDay]||[]).map((slot,i)=>(
                    <div key={i} style={{ background:"white", borderRadius:16, padding:"16px 20px",
                      boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
                      display:"flex", alignItems:"center", gap:14, flexWrap:"wrap",
                      borderLeft: `4px solid ${slot.type==="online"?"#1a3fce":"#10b981"}` }}>
                      {/* Time */}
                      <div style={{ minWidth:54, textAlign:"center", flexShrink:0 }}>
                        <div style={{ fontWeight:800, fontSize:16, color:"#1a2340" }}>{slot.time}</div>
                        <div style={{ fontSize:10, color:"#94a3b8" }}>
                          {slot.type==="online"?"💻":"🏥"}
                        </div>
                      </div>
                      <div style={{ width:1, height:40, background:"#f1f5f9", flexShrink:0 }} />
                      {/* Patient */}
                      <img src={slot.avatar} alt={slot.patient}
                        style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:120 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:"#1a2340" }}>{slot.patient}</div>
                        <div style={{ fontSize:12, color:"#64748b" }}>{slot.reason}</div>
                      </div>
                      {/* Type + status */}
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
                          background: slot.type==="online"?"#eff6ff":"#f0fdf4",
                          color: slot.type==="online"?"#1d4ed8":"#15803d" }}>
                          {slot.type==="online"?"💻 Online":"🏥 Visit"}
                        </span>
                        <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
                          background: slot.status==="confirmed"?"#dcfce7":"#fef9c3",
                          color: slot.status==="confirmed"?"#16a34a":"#ca8a04" }}>
                          {slot.status==="confirmed"?"✓ Confirmed":"⏳ Pending"}
                        </span>
                      </div>
                      {/* Actions */}
                      <div style={{ display:"flex", gap:8 }}>
                        {slot.type==="online" && (
                          <button style={{ background:"#1a3fce", color:"white", border:"none",
                            borderRadius:8, padding:"7px 14px", fontSize:12,
                            fontWeight:700, cursor:"pointer" }}>🎥 Start</button>
                        )}
                        <button style={{ background:"#f1f5f9", color:"#1a2340", border:"none",
                          borderRadius:8, padding:"7px 14px", fontSize:12,
                          fontWeight:600, cursor:"pointer" }}>📋 Notes</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Weekly summary */}
              <div style={{ background:"white", borderRadius:16, padding:20, marginTop:20,
                boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ fontWeight:800, fontSize:14, color:"#1a2340", marginBottom:14 }}>
                  📊 Weekly Overview
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {weekDays.map(day=>{
                    const count = (schedule[day]||[]).length;
                    const online = (schedule[day]||[]).filter(s=>s.type==="online").length;
                    return (
                      <div key={day} onClick={()=>setSelectedDay(day)} style={{
                        flex:1, minWidth:70, background: selectedDay===day?"#eff6ff":"#f8fafc",
                        borderRadius:12, padding:"10px 8px", textAlign:"center", cursor:"pointer",
                        border: selectedDay===day?"2px solid #1a3fce":"2px solid transparent",
                        transition:"all 0.15s",
                      }}>
                        <div style={{ fontSize:12, fontWeight:700,
                          color: selectedDay===day?"#1a3fce":"#64748b" }}>{day}</div>
                        <div style={{ fontSize:20, fontWeight:800,
                          color: selectedDay===day?"#1a3fce":"#1a2340", margin:"4px 0" }}>{count}</div>
                        <div style={{ fontSize:10, color:"#94a3b8" }}>
                          {count===0?"Free":`${online} online`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── CSS ── */}
      <style>{`
        @media(min-width:769px){
          .doc-sidebar   { position:sticky !important; top:0 !important; height:100vh !important; transform:translateX(0) !important; }
          .hamburger-doc { display:none !important; }
          .sidebar-close { display:none !important; }
          .topbar-label  { display:inline !important; }
          .doc-body      { padding:22px 28px !important; }
          .stats-grid    { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
          .two-col-grid  { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
          .pat-header,.pat-row { grid-template-columns:2fr 60px 60px 1fr 120px 100px 70px !important; }
        }
        @media(max-width:768px){
          .doc-main      { width:100vw; }
          .hamburger-doc { display:block !important; }
          .topbar-label  { display:none !important; }
          .stats-grid    { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
          .two-col-grid  { display:flex; flex-direction:column; gap:16px; }
          .pat-header    { display:none !important; }
          .pat-row       { grid-template-columns:1fr auto !important; }
          .pat-row > :nth-child(2),
          .pat-row > :nth-child(3),
          .pat-row > :nth-child(4),
          .pat-row > :nth-child(5) { display:none; }
        }
        div::-webkit-scrollbar      { width:4px; height:4px; }
        div::-webkit-scrollbar-thumb{ background:#cbd5e1; border-radius:4px; }
        select,input{ font-family:inherit; }
      `}</style>
    </div>
  );
}

const inpSt = {
  width:"100%", padding:"10px 12px", borderRadius:10,
  border:"1.5px solid #e2e8f0", fontSize:13, outline:"none",
  background:"#f8fafc", color:"#1a2340", boxSizing:"border-box",
};