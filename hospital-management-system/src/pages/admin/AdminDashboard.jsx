import { useState } from "react";

/* ══════════════════════════════════════════════
   DATA
══════════════════════════════════════════════ */
const initDoctors = [
  { id:"D001", name:"Dr. Emily Chen",   specialty:"Cardiologist",    exp:"8 yrs",  patients:142, status:"Active",   avatar:"https://randomuser.me/api/portraits/women/44.jpg", email:"emily@hospital.com",  phone:"+1-555-0101", fee:"$120" },
  { id:"D002", name:"Dr. James Liu",    specialty:"Endocrinologist", exp:"12 yrs", patients:98,  status:"Active",   avatar:"https://randomuser.me/api/portraits/men/46.jpg",   email:"james@hospital.com",  phone:"+1-555-0102", fee:"$110" },
  { id:"D003", name:"Dr. Sarah Malik",  specialty:"Dermatologist",   exp:"6 yrs",  patients:210, status:"Active",   avatar:"https://randomuser.me/api/portraits/women/65.jpg", email:"sarah@hospital.com",  phone:"+1-555-0103", fee:"$95"  },
  { id:"D004", name:"Dr. Hamid Raza",   specialty:"General",         exp:"15 yrs", patients:320, status:"Active",   avatar:"https://randomuser.me/api/portraits/men/61.jpg",   email:"hamid@hospital.com",  phone:"+1-555-0104", fee:"$80"  },
  { id:"D005", name:"Dr. Ali Nawaz",    specialty:"Neurologist",     exp:"10 yrs", patients:76,  status:"On Leave", avatar:"https://randomuser.me/api/portraits/men/55.jpg",   email:"ali@hospital.com",    phone:"+1-555-0105", fee:"$150" },
  { id:"D006", name:"Dr. Zara Khan",    specialty:"Orthopedic",      exp:"9 yrs",  patients:134, status:"Active",   avatar:"https://randomuser.me/api/portraits/women/11.jpg", email:"zara@hospital.com",   phone:"+1-555-0106", fee:"$130" },
];

const initPatients = [
  { id:"P001", name:"Roger Curtis",     age:36, gender:"Male",   blood:"O+",  condition:"Diabetes",       doctor:"Dr. James Liu",   status:"Active",   lastVisit:"25 Oct 2023", avatar:"https://randomuser.me/api/portraits/men/32.jpg",   email:"roger@email.com",  phone:"+1-555-1001" },
  { id:"P002", name:"Beth Mccoy",       age:25, gender:"Female", blood:"A+",  condition:"Asthma",         doctor:"Dr. Emily Chen",  status:"Active",   lastVisit:"02 Jan 2024", avatar:"https://randomuser.me/api/portraits/women/44.jpg", email:"beth@email.com",   phone:"+1-555-1002" },
  { id:"P003", name:"Evan Henry",       age:34, gender:"Male",   blood:"O+",  condition:"Hypertension",   doctor:"Dr. Hamid Raza",  status:"Active",   lastVisit:"15 Feb 2024", avatar:"https://randomuser.me/api/portraits/men/32.jpg",   email:"evan@email.com",   phone:"+1-555-1003" },
  { id:"P004", name:"Dwight Murphy",    age:45, gender:"Male",   blood:"B+",  condition:"Heart Disease",  doctor:"Dr. Emily Chen",  status:"Critical", lastVisit:"10 Mar 2024", avatar:"https://randomuser.me/api/portraits/men/46.jpg",   email:"dwight@email.com", phone:"+1-555-1004" },
  { id:"P005", name:"Bessie Alexander", age:31, gender:"Female", blood:"AB-", condition:"Diabetes",       doctor:"Dr. James Liu",   status:"Active",   lastVisit:"22 Feb 2024", avatar:"https://randomuser.me/api/portraits/women/65.jpg", email:"bessie@email.com", phone:"+1-555-1005" },
  { id:"P006", name:"Nadia Sheikh",     age:38, gender:"Female", blood:"A-",  condition:"Blood Disorder", doctor:"Dr. Hamid Raza",  status:"Active",   lastVisit:"18 Jan 2024", avatar:"https://randomuser.me/api/portraits/women/33.jpg", email:"nadia@email.com",  phone:"+1-555-1006" },
];

const initHomepage = {
  heroTitle:    "Your Health, Our Priority",
  heroSubtitle: "World-class medical care with compassionate service. Book your appointment today.",
  heroBtn:      "Book Appointment",
  aboutTitle:   "About Our Hospital",
  aboutText:    "We are a leading healthcare provider with over 20 years of excellence. Our team of 50+ specialists is dedicated to your wellbeing.",
  phone:        "+1 (555) 000-1234",
  email:        "info@hospital.com",
  address:      "123 Medical Drive, Health City, HC 45678",
  workingHours: "Mon–Sat: 8AM – 8PM",
  showBanner:   true,
  bannerText:   "🏥 Now offering online consultations! Book yours today.",
};

const monthlyData  = [42,58,74,63,89,95,78,102,88,115,98,124];
const revenueData  = [12,18,22,17,28,31,25,35,30,42,38,47];
const appointData  = [28,35,45,38,55,60,48,65,55,72,62,78];
const months       = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const specialtyCount = [
  { label:"Cardiologist",    count:2, color:"#ef4444" },
  { label:"General",         count:1, color:"#3b82f6" },
  { label:"Dermatologist",   count:1, color:"#f59e0b" },
  { label:"Endocrinologist", count:1, color:"#10b981" },
  { label:"Neurologist",     count:1, color:"#8b5cf6" },
  { label:"Orthopedic",      count:1, color:"#ec4899" },
];

const navItems = [
  { id:"dashboard", icon:"⊞", label:"Dashboard" },
  { id:"homepage",  icon:"🌐", label:"Homepage"  },
  { id:"doctors",   icon:"👨‍⚕️", label:"Doctors"   },
  { id:"patients",  icon:"👥", label:"Patients"   },
];

const emptyDoctor  = { name:"", specialty:"Cardiologist", exp:"", patients:0, status:"Active", email:"", phone:"", fee:"", avatar:"https://randomuser.me/api/portraits/men/10.jpg" };
const emptyPatient = { name:"", age:"", gender:"Male", blood:"O+", condition:"", doctor:"Dr. Hamid Raza", status:"Active", lastVisit:"", email:"", phone:"", avatar:"https://randomuser.me/api/portraits/men/10.jpg" };

/* ══════════════════════════════════════════════
   SMALL HELPERS
══════════════════════════════════════════════ */
const Badge = ({ s }) => {
  const map = { Active:["#dcfce7","#16a34a"], Critical:["#fee2e2","#dc2626"],
    "On Leave":["#fef9c3","#ca8a04"], Inactive:["#f1f5f9","#64748b"], New:["#dbeafe","#1d4ed8"] };
  const [bg,tc] = map[s]||["#f1f5f9","#64748b"];
  return <span style={{ fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:bg,color:tc }}>{s}</span>;
};

const Input = ({ label, value, onChange, type="text", placeholder="" }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
    <label style={{ fontSize:12, fontWeight:700, color:"#475569" }}>{label}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #e2e8f0",
        fontSize:13, outline:"none", background:"#f8fafc", color:"#1e293b",
        fontFamily:"inherit", width:"100%", boxSizing:"border-box" }} />
  </div>
);

const Textarea = ({ label, value, onChange, rows=3 }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
    <label style={{ fontSize:12, fontWeight:700, color:"#475569" }}>{label}</label>
    <textarea value={value} onChange={onChange} rows={rows}
      style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #e2e8f0",
        fontSize:13, outline:"none", background:"#f8fafc", color:"#1e293b",
        fontFamily:"inherit", resize:"vertical", width:"100%", boxSizing:"border-box" }} />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
    <label style={{ fontSize:12, fontWeight:700, color:"#475569" }}>{label}</label>
    <select value={value} onChange={onChange}
      style={{ padding:"9px 12px", borderRadius:10, border:"1.5px solid #e2e8f0",
        fontSize:13, outline:"none", background:"#f8fafc", color:"#1e293b",
        fontFamily:"inherit", cursor:"pointer", width:"100%" }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

/* ── PIE CHART (pure SVG) ── */
function PieChart({ data, size=140 }) {
  const total = data.reduce((s,d)=>s+d.count,0);
  let cumAngle = -90;
  const cx=size/2, cy=size/2, r=size*0.38, ir=size*0.22;
  const slices = data.map(d => {
    const angle = (d.count/total)*360;
    const start = cumAngle; cumAngle += angle;
    return { ...d, startAngle:start, endAngle:cumAngle };
  });
  const polar = (angle, radius) => {
    const rad = (angle*Math.PI)/180;
    return [cx+radius*Math.cos(rad), cy+radius*Math.sin(rad)];
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s,i) => {
        const [x1,y1]=polar(s.startAngle,r), [x2,y2]=polar(s.endAngle,r);
        const [ix1,iy1]=polar(s.startAngle,ir), [ix2,iy2]=polar(s.endAngle,ir);
        const large = (s.endAngle-s.startAngle)>180?1:0;
        const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`;
        return <path key={i} d={path} fill={s.color} stroke="white" strokeWidth={2} />;
      })}
      <circle cx={cx} cy={cy} r={ir-2} fill="white"/>
      <text x={cx} y={cy-6} textAnchor="middle" fontSize="14" fontWeight="800" fill="#1e293b">{total}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="9" fill="#94a3b8">Total</text>
    </svg>
  );
}

/* ── BAR CHART (pure SVG) ── */
function BarChart({ data, color, label, height=120, width="100%" }) {
  const max = Math.max(...data);
  const barW = 100/data.length;
  return (
    <div style={{ width }}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none"
        style={{ width:"100%", height }} xmlns="http://www.w3.org/2000/svg">
        {data.map((v,i) => {
          const bh = (v/max)*(height-16);
          const x  = i*barW + barW*0.15;
          const bw = barW*0.7;
          return (
            <g key={i}>
              <rect x={x} y={height-bh-8} width={bw} height={bh}
                fill={color} rx="2" opacity="0.85" />
            </g>
          );
        })}
      </svg>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        {months.map(m=>(
          <div key={m} style={{ flex:1, textAlign:"center", fontSize:8.5, color:"#94a3b8", fontWeight:600 }}>{m}</div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════ */
function Modal({ title, onClose, children, maxWidth=520 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
      zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"white", borderRadius:20, width:"100%", maxWidth,
        maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"18px 22px", borderBottom:"1px solid #f1f5f9", position:"sticky", top:0,
          background:"white", zIndex:1 }}>
          <div style={{ fontWeight:800, fontSize:16, color:"#0f172a" }}>{title}</div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none",
            borderRadius:"50%", width:32, height:32, cursor:"pointer", fontSize:16,
            display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:"20px 22px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════ */
export default function AdminPanel() {
  const [active,       setActive]       = useState("dashboard");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  /* doctors state */
  const [doctors,      setDoctors]      = useState(initDoctors);
  const [drModal,      setDrModal]      = useState(null);  // null | "add" | doctor obj
  const [drForm,       setDrForm]       = useState(emptyDoctor);
  const [drSearch,     setDrSearch]     = useState("");
  const [drView,       setDrView]       = useState(null);

  /* patients state */
  const [patients,     setPatients]     = useState(initPatients);
  const [ptModal,      setPtModal]      = useState(null);
  const [ptForm,       setPtForm]       = useState(emptyPatient);
  const [ptSearch,     setPtSearch]     = useState("");
  const [ptView,       setPtView]       = useState(null);
  const [ptFilter,     setPtFilter]     = useState("All");

  /* homepage state */
  const [hp,           setHp]           = useState(initHomepage);
  const [hpSaved,      setHpSaved]      = useState(false);
  const [hpTab,        setHpTab]        = useState("hero");

  /* delete confirm */
  const [deleteConfirm,setDeleteConfirm]= useState(null); // {type,id,name}

  const goto = id => { setActive(id); setSidebarOpen(false); };

  /* ── Doctor CRUD ── */
  const openAddDr  = ()  => { setDrForm({...emptyDoctor, id:"D00"+(doctors.length+1)}); setDrModal("add"); };
  const openEditDr = dr  => { setDrForm({...dr}); setDrModal("edit"); };
  const saveDr = () => {
    if (!drForm.name||!drForm.email) { alert("Name and email required."); return; }
    if (drModal==="add") {
      setDoctors(p=>[...p,{...drForm,id:"D00"+(p.length+1),patients:0}]);
    } else {
      setDoctors(p=>p.map(d=>d.id===drForm.id?drForm:d));
    }
    setDrModal(null);
  };
  const deleteDr = id => {
    setDoctors(p=>p.filter(d=>d.id!==id));
    setDeleteConfirm(null);
  };

  /* ── Patient CRUD ── */
  const openAddPt  = ()  => { setPtForm({...emptyPatient,id:"P00"+(patients.length+1)}); setPtModal("add"); };
  const openEditPt = pt  => { setPtForm({...pt}); setPtModal("edit"); };
  const savePt = () => {
    if (!ptForm.name||!ptForm.email) { alert("Name and email required."); return; }
    if (ptModal==="add") {
      setPatients(p=>[...p,{...ptForm,id:"P00"+(p.length+1)}]);
    } else {
      setPatients(p=>p.map(pt=>pt.id===ptForm.id?ptForm:pt));
    }
    setPtModal(null);
  };
  const deletePt = id => {
    setPatients(p=>p.filter(pt=>pt.id!==id));
    setDeleteConfirm(null);
  };

  /* ── Homepage save ── */
  const saveHomepage = () => { setHpSaved(true); setTimeout(()=>setHpSaved(false),2500); };

  const filteredDrs = doctors.filter(d=>
    d.name.toLowerCase().includes(drSearch.toLowerCase())||
    d.specialty.toLowerCase().includes(drSearch.toLowerCase())
  );
  const filteredPts = patients.filter(p=>{
    const ms = p.name.toLowerCase().includes(ptSearch.toLowerCase())||
               p.condition.toLowerCase().includes(ptSearch.toLowerCase());
    const mf = ptFilter==="All"||p.status===ptFilter;
    return ms&&mf;
  });

  const totalAppts = 211;
  const totalRevenue = "$42.8K";

  /* ── pie chart data sets ── */
  const userPie  = [{label:"Doctors",count:doctors.length,color:"#6366f1"},{label:"Patients",count:patients.length,color:"#14b8a6"},{label:"Admins",count:3,color:"#f59e0b"}];
  const statusPie= [{label:"Active",count:doctors.filter(d=>d.status==="Active").length,color:"#10b981"},{label:"On Leave",count:doctors.filter(d=>d.status==="On Leave").length,color:"#f59e0b"},{label:"Inactive",count:1,color:"#ef4444"}];
  const ptPie    = [{label:"Active",count:patients.filter(p=>p.status==="Active").length,color:"#10b981"},{label:"Critical",count:patients.filter(p=>p.status==="Critical").length,color:"#ef4444"},{label:"New",count:patients.filter(p=>p.status==="New").length,color:"#3b82f6"}];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#f0f4ff",
      fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
          zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"white", borderRadius:20, padding:28, maxWidth:380, width:"100%",
            boxShadow:"0 20px 60px rgba(0,0,0,0.3)", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
            <div style={{ fontWeight:800, fontSize:17, color:"#0f172a", marginBottom:8 }}>Confirm Delete</div>
            <div style={{ fontSize:13, color:"#64748b", marginBottom:22 }}>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setDeleteConfirm(null)} style={{ flex:1, padding:"11px",
                borderRadius:10, border:"2px solid #e2e8f0", background:"white",
                fontWeight:700, fontSize:13, cursor:"pointer", color:"#64748b" }}>Cancel</button>
              <button onClick={()=>deleteConfirm.type==="doctor"?deleteDr(deleteConfirm.id):deletePt(deleteConfirm.id)}
                style={{ flex:1, padding:"11px", borderRadius:10, border:"none",
                  background:"#ef4444", fontWeight:700, fontSize:13, cursor:"pointer", color:"white" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCTOR MODAL ── */}
      {drModal && (
        <Modal title={drModal==="add"?"Add New Doctor":"Edit Doctor"} onClose={()=>setDrModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Input label="Full Name *" value={drForm.name} onChange={e=>setDrForm(p=>({...p,name:e.target.value}))} placeholder="Dr. John Smith" />
            <Select label="Specialty" value={drForm.specialty} onChange={e=>setDrForm(p=>({...p,specialty:e.target.value}))}
              options={["Cardiologist","Endocrinologist","Dermatologist","General","Neurologist","Orthopedic","Pediatrician","Surgeon"]} />
            <Input label="Email *" value={drForm.email} onChange={e=>setDrForm(p=>({...p,email:e.target.value}))} placeholder="doctor@hospital.com" />
            <Input label="Phone" value={drForm.phone} onChange={e=>setDrForm(p=>({...p,phone:e.target.value}))} placeholder="+1-555-0000" />
            <Input label="Experience" value={drForm.exp} onChange={e=>setDrForm(p=>({...p,exp:e.target.value}))} placeholder="5 yrs" />
            <Input label="Consultation Fee" value={drForm.fee} onChange={e=>setDrForm(p=>({...p,fee:e.target.value}))} placeholder="$100" />
            <Select label="Status" value={drForm.status} onChange={e=>setDrForm(p=>({...p,status:e.target.value}))}
              options={["Active","On Leave","Inactive"]} />
            <Input label="Avatar URL" value={drForm.avatar} onChange={e=>setDrForm(p=>({...p,avatar:e.target.value}))} placeholder="https://..." />
          </div>
          <div style={{ display:"flex", gap:10, marginTop:18 }}>
            <button onClick={()=>setDrModal(null)} style={{ flex:1, padding:"11px", borderRadius:10,
              border:"2px solid #e2e8f0", background:"white", fontWeight:700, fontSize:13,
              cursor:"pointer", color:"#64748b" }}>Cancel</button>
            <button onClick={saveDr} style={{ flex:2, padding:"11px", borderRadius:10, border:"none",
              background:"linear-gradient(120deg,#4f46e5,#7c3aed)", fontWeight:700,
              fontSize:13, cursor:"pointer", color:"white" }}>
              {drModal==="add"?"✅ Add Doctor":"💾 Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── PATIENT MODAL ── */}
      {ptModal && (
        <Modal title={ptModal==="add"?"Add New Patient":"Edit Patient"} onClose={()=>setPtModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <Input label="Full Name *" value={ptForm.name} onChange={e=>setPtForm(p=>({...p,name:e.target.value}))} placeholder="John Doe" />
            <Input label="Age" value={ptForm.age} onChange={e=>setPtForm(p=>({...p,age:e.target.value}))} placeholder="35" type="number" />
            <Select label="Gender" value={ptForm.gender} onChange={e=>setPtForm(p=>({...p,gender:e.target.value}))}
              options={["Male","Female","Other"]} />
            <Select label="Blood Type" value={ptForm.blood} onChange={e=>setPtForm(p=>({...p,blood:e.target.value}))}
              options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]} />
            <Input label="Email *" value={ptForm.email} onChange={e=>setPtForm(p=>({...p,email:e.target.value}))} placeholder="patient@email.com" />
            <Input label="Phone" value={ptForm.phone} onChange={e=>setPtForm(p=>({...p,phone:e.target.value}))} placeholder="+1-555-0000" />
            <Input label="Condition" value={ptForm.condition} onChange={e=>setPtForm(p=>({...p,condition:e.target.value}))} placeholder="Diabetes, Asthma..." />
            <Select label="Assigned Doctor" value={ptForm.doctor} onChange={e=>setPtForm(p=>({...p,doctor:e.target.value}))}
              options={doctors.map(d=>d.name)} />
            <Select label="Status" value={ptForm.status} onChange={e=>setPtForm(p=>({...p,status:e.target.value}))}
              options={["Active","Critical","New","Inactive"]} />
            <Input label="Last Visit" value={ptForm.lastVisit} onChange={e=>setPtForm(p=>({...p,lastVisit:e.target.value}))} placeholder="01 Jan 2024" />
          </div>
          <div style={{ display:"flex", gap:10, marginTop:18 }}>
            <button onClick={()=>setPtModal(null)} style={{ flex:1, padding:"11px", borderRadius:10,
              border:"2px solid #e2e8f0", background:"white", fontWeight:700,
              fontSize:13, cursor:"pointer", color:"#64748b" }}>Cancel</button>
            <button onClick={savePt} style={{ flex:2, padding:"11px", borderRadius:10, border:"none",
              background:"linear-gradient(120deg,#0d4f4f,#14b8a6)", fontWeight:700,
              fontSize:13, cursor:"pointer", color:"white" }}>
              {ptModal==="add"?"✅ Add Patient":"💾 Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── DOCTOR VIEW ── */}
      {drView && (
        <Modal title="Doctor Profile" onClose={()=>setDrView(null)} maxWidth={420}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <img src={drView.avatar} alt={drView.name}
              style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover",
                border:"3px solid #e2e8f0", marginBottom:10 }} />
            <div style={{ fontWeight:800, fontSize:17, color:"#0f172a" }}>{drView.name}</div>
            <div style={{ fontSize:13, color:"#64748b", marginBottom:8 }}>{drView.specialty}</div>
            <Badge s={drView.status} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 20px" }}>
            {[["ID",drView.id],["Experience",drView.exp],["Patients",drView.patients],
              ["Fee",drView.fee],["Email",drView.email],["Phone",drView.phone]
            ].map(([l,v])=>(
              <div key={l} style={{ borderBottom:"1px solid #f1f5f9", paddingBottom:8 }}>
                <div style={{ fontSize:10, color:"#94a3b8", marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:18 }}>
            <button onClick={()=>{setDrView(null);openEditDr(drView);}} style={{ flex:1, padding:"10px",
              borderRadius:10, border:"none", background:"#4f46e5", color:"white",
              fontWeight:700, fontSize:13, cursor:"pointer" }}>✏️ Edit</button>
            <button onClick={()=>{setDrView(null);setDeleteConfirm({type:"doctor",id:drView.id,name:drView.name});}}
              style={{ flex:1, padding:"10px", borderRadius:10, border:"none",
                background:"#fee2e2", color:"#dc2626", fontWeight:700, fontSize:13, cursor:"pointer" }}>🗑️ Delete</button>
          </div>
        </Modal>
      )}

      {/* ── PATIENT VIEW ── */}
      {ptView && (
        <Modal title="Patient Profile" onClose={()=>setPtView(null)} maxWidth={420}>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <img src={ptView.avatar} alt={ptView.name}
              style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover",
                border:"3px solid #e2e8f0", marginBottom:10 }} />
            <div style={{ fontWeight:800, fontSize:17, color:"#0f172a" }}>{ptView.name}</div>
            <div style={{ fontSize:13, color:"#64748b", marginBottom:8 }}>ID: {ptView.id}</div>
            <Badge s={ptView.status} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 20px" }}>
            {[["Age",ptView.age+" yrs"],["Gender",ptView.gender],["Blood",ptView.blood],
              ["Condition",ptView.condition],["Doctor",ptView.doctor],["Last Visit",ptView.lastVisit],
              ["Email",ptView.email],["Phone",ptView.phone]
            ].map(([l,v])=>(
              <div key={l} style={{ borderBottom:"1px solid #f1f5f9", paddingBottom:8 }}>
                <div style={{ fontSize:10, color:"#94a3b8", marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:18 }}>
            <button onClick={()=>{setPtView(null);openEditPt(ptView);}} style={{ flex:1, padding:"10px",
              borderRadius:10, border:"none", background:"#0d4f4f", color:"white",
              fontWeight:700, fontSize:13, cursor:"pointer" }}>✏️ Edit</button>
            <button onClick={()=>{setPtView(null);setDeleteConfirm({type:"patient",id:ptView.id,name:ptView.name});}}
              style={{ flex:1, padding:"10px", borderRadius:10, border:"none",
                background:"#fee2e2", color:"#dc2626", fontWeight:700, fontSize:13, cursor:"pointer" }}>🗑️ Delete</button>
          </div>
        </Modal>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={()=>setSidebarOpen(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:40 }} />
      )}

      {/* ══════════ SIDEBAR ══════════ */}
      <div style={{
        width:220, flexShrink:0,
        background:"linear-gradient(180deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)",
        display:"flex", flexDirection:"column", padding:"24px 0 20px",
        position:"fixed", top:0, left:0, bottom:0, zIndex:50,
        transform: sidebarOpen?"translateX(0)":"translateX(-100%)",
        transition:"transform 0.25s ease",
      }} className="adm-sidebar">

        <button onClick={()=>setSidebarOpen(false)} className="sidebar-close"
          style={{ position:"absolute", top:12, right:12, background:"none", border:"none",
            color:"rgba(255,255,255,0.6)", fontSize:20, cursor:"pointer" }}>✕</button>

        {/* Logo */}
        <div style={{ padding:"0 20px 24px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:10,
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, boxShadow:"0 4px 12px rgba(99,102,241,0.5)" }}>🏥</div>
            <div>
              <div style={{ color:"white", fontWeight:800, fontSize:15, lineHeight:1.2 }}>MediAdmin</div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10 }}>Hospital Management</div>
            </div>
          </div>
        </div>

        {/* Admin badge */}
        <div style={{ margin:"16px 14px", background:"rgba(255,255,255,0.08)",
          borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>👤</div>
          <div>
            <div style={{ color:"white", fontWeight:700, fontSize:13 }}>Super Admin</div>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>admin@hospital.com</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding:"0 12px", display:"flex", flexDirection:"column", gap:4, flex:1 }}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>goto(item.id)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
              borderRadius:12, border:"none", cursor:"pointer",
              background: active===item.id ? "rgba(99,102,241,0.3)" : "transparent",
              borderLeft: active===item.id ? "3px solid #6366f1" : "3px solid transparent",
              color: active===item.id ? "white" : "rgba(255,255,255,0.6)",
              fontSize:13, fontWeight:600, transition:"all 0.2s", textAlign:"left",
            }}>
              <span style={{ fontSize:17 }}>{item.icon}</span>
              {item.label}
              {item.id==="doctors" && (
                <span style={{ marginLeft:"auto", background:"rgba(99,102,241,0.4)",
                  borderRadius:20, padding:"1px 8px", fontSize:10, color:"#a5b4fc" }}>{doctors.length}</span>
              )}
              {item.id==="patients" && (
                <span style={{ marginLeft:"auto", background:"rgba(20,184,166,0.3)",
                  borderRadius:20, padding:"1px 8px", fontSize:10, color:"#5eead4" }}>{patients.length}</span>
              )}
            </button>
          ))}
        </div>

        <button style={{ margin:"0 12px 4px", display:"flex", alignItems:"center", gap:10,
          padding:"11px 14px", border:"1px solid rgba(255,255,255,0.1)",
          background:"transparent", color:"rgba(255,255,255,0.5)",
          fontSize:13, fontWeight:600, cursor:"pointer", borderRadius:12 }}>↩ Logout</button>
      </div>

      {/* ══════════ MAIN ══════════ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }} className="adm-main">

        {/* Topbar */}
        <div style={{ height:60, background:"white", display:"flex", alignItems:"center",
          justifyContent:"space-between", padding:"0 20px",
          borderBottom:"1px solid #e8ecf4", position:"sticky", top:0, zIndex:30,
          boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={()=>setSidebarOpen(true)} className="hamburger-adm"
              style={{ background:"none", border:"none", fontSize:22, color:"#4f46e5",
                cursor:"pointer", lineHeight:1 }}>☰</button>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:"#0f172a" }}>
                {navItems.find(n=>n.id===active)?.icon} {navItems.find(n=>n.id===active)?.label}
              </div>
              <div style={{ fontSize:11, color:"#94a3b8" }}>Hospital Management System</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ position:"relative" }}>
              <span style={{ fontSize:20, cursor:"pointer" }}>🔔</span>
              <span style={{ position:"absolute", top:-2, right:-2, width:14, height:14,
                background:"#ef4444", borderRadius:"50%", fontSize:8, color:"white",
                display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>5</span>
            </div>
            <div style={{ width:34, height:34, borderRadius:"50%",
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:16, cursor:"pointer" }}>👤</div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex:1, overflow:"auto", padding:"20px 16px" }} className="adm-body">

          {/* ════════ DASHBOARD ════════ */}
          {active==="dashboard" && (
            <div>
              {/* Stat cards */}
              <div className="stat4" style={{ marginBottom:20 }}>
                {[
                  ["Total Doctors",   doctors.length,         "👨‍⚕️","linear-gradient(135deg,#6366f1,#8b5cf6)"],
                  ["Total Patients",  patients.length,        "👥","linear-gradient(135deg,#0d4f4f,#14b8a6)"],
                  ["Appointments",    totalAppts,             "📅","linear-gradient(135deg,#0ea5e9,#38bdf8)"],
                  ["Total Revenue",   totalRevenue,           "💰","linear-gradient(135deg,#f59e0b,#fbbf24)"],
                ].map(([label,val,icon,bg])=>(
                  <div key={label} style={{ background:bg, borderRadius:16, padding:"20px 22px",
                    boxShadow:"0 4px 16px rgba(0,0,0,0.12)", color:"white" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:11, opacity:0.8, marginBottom:6 }}>{label}</div>
                        <div style={{ fontSize:28, fontWeight:800 }}>{val}</div>
                      </div>
                      <div style={{ fontSize:28, opacity:0.8 }}>{icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="chart3" style={{ marginBottom:20 }}>
                {[
                  ["📈 Monthly Patients", monthlyData, "#6366f1"],
                  ["💰 Revenue (K$)",     revenueData,  "#14b8a6"],
                  ["📅 Appointments",     appointData,  "#f59e0b"],
                ].map(([title,data,color])=>(
                  <div key={title} style={{ background:"white", borderRadius:16, padding:18,
                    boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight:800, fontSize:13, color:"#0f172a", marginBottom:12 }}>{title}</div>
                    <BarChart data={data} color={color} />
                  </div>
                ))}
              </div>

              {/* Pie charts row */}
              <div className="pie3" style={{ marginBottom:20 }}>
                {[
                  ["👥 User Distribution", userPie],
                  ["👨‍⚕️ Doctor Status",     statusPie],
                  ["🩺 Patient Status",     ptPie],
                ].map(([title,data])=>(
                  <div key={title} style={{ background:"white", borderRadius:16, padding:20,
                    boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight:800, fontSize:13, color:"#0f172a", marginBottom:14 }}>{title}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                      <PieChart data={data} size={130} />
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {data.map(d=>(
                          <div key={d.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:10, height:10, borderRadius:3, background:d.color, flexShrink:0 }} />
                            <span style={{ fontSize:12, color:"#64748b" }}>{d.label}</span>
                            <span style={{ fontSize:12, fontWeight:800, color:"#0f172a",marginLeft:"auto",paddingLeft:10 }}>{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div style={{ display:"grid", gap:20 }} className="two-col">
                <div style={{ background:"white", borderRadius:16, padding:20,
                  boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0f172a", marginBottom:14 }}>Recent Doctors</div>
                  {doctors.slice(0,4).map(d=>(
                    <div key={d.id} style={{ display:"flex", alignItems:"center", gap:10,
                      padding:"9px 0", borderBottom:"1px solid #f1f5f9" }}>
                      <img src={d.avatar} alt={d.name}
                        style={{ width:34, height:34, borderRadius:"50%", objectFit:"cover" }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{d.name}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>{d.specialty}</div>
                      </div>
                      <Badge s={d.status} />
                    </div>
                  ))}
                </div>
                <div style={{ background:"white", borderRadius:16, padding:20,
                  boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0f172a", marginBottom:14 }}>Recent Patients</div>
                  {patients.slice(0,4).map(p=>(
                    <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10,
                      padding:"9px 0", borderBottom:"1px solid #f1f5f9" }}>
                      <img src={p.avatar} alt={p.name}
                        style={{ width:34, height:34, borderRadius:"50%", objectFit:"cover" }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{p.name}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>{p.condition}</div>
                      </div>
                      <Badge s={p.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ HOMEPAGE EDITOR ════════ */}
          {active==="homepage" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                flexWrap:"wrap", gap:12, marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:0 }}>Homepage Editor</h2>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Edit website content dynamically</div>
                </div>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  {hpSaved && (
                    <span style={{ fontSize:13, color:"#16a34a", fontWeight:700,
                      background:"#dcfce7", padding:"6px 14px", borderRadius:20 }}>✅ Saved!</span>
                  )}
                  <button onClick={saveHomepage} style={{ background:"linear-gradient(120deg,#4f46e5,#7c3aed)",
                    color:"white", border:"none", borderRadius:12, padding:"10px 22px",
                    fontWeight:700, fontSize:13, cursor:"pointer" }}>💾 Save Changes</button>
                </div>
              </div>

              {/* Banner toggle */}
              <div style={{ background:"white", borderRadius:14, padding:"14px 18px",
                marginBottom:16, boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
                display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>📢 Announcement Banner</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Show/hide top banner on website</div>
                </div>
                <div onClick={()=>setHp(p=>({...p,showBanner:!p.showBanner}))} style={{
                  width:46, height:26, borderRadius:20, cursor:"pointer", transition:"all 0.2s",
                  background: hp.showBanner ? "#6366f1" : "#e2e8f0", position:"relative",
                }}>
                  <div style={{ position:"absolute", top:3, width:20, height:20, borderRadius:"50%",
                    background:"white", transition:"all 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)",
                    left: hp.showBanner ? 23 : 3 }} />
                </div>
              </div>
              {hp.showBanner && (
                <div style={{ marginBottom:16 }}>
                  <Input label="Banner Text" value={hp.bannerText}
                    onChange={e=>setHp(p=>({...p,bannerText:e.target.value}))} />
                </div>
              )}

              {/* Section tabs */}
              <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
                {[["hero","🏠 Hero"],["about","ℹ️ About"],["contact","📞 Contact"]].map(([id,label])=>(
                  <button key={id} onClick={()=>setHpTab(id)} style={{
                    flexShrink:0, padding:"8px 16px", borderRadius:20, border:"none", cursor:"pointer",
                    background: hpTab===id?"#4f46e5":"white",
                    color: hpTab===id?"white":"#64748b",
                    fontWeight:700, fontSize:13, transition:"all 0.2s",
                  }}>{label}</button>
                ))}
              </div>

              <div style={{ background:"white", borderRadius:16, padding:22,
                boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>

                {hpTab==="hero" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <h3 style={{ margin:"0 0 4px", fontSize:14, fontWeight:800, color:"#0f172a" }}>🏠 Hero Section</h3>
                    <Input label="Main Heading" value={hp.heroTitle}
                      onChange={e=>setHp(p=>({...p,heroTitle:e.target.value}))} />
                    <Textarea label="Subtitle" value={hp.heroSubtitle}
                      onChange={e=>setHp(p=>({...p,heroSubtitle:e.target.value}))} rows={2} />
                    <Input label="Button Text" value={hp.heroBtn}
                      onChange={e=>setHp(p=>({...p,heroBtn:e.target.value}))} />
                    {/* Live preview */}
                    <div style={{ background:"linear-gradient(135deg,#312e81,#4f46e5)",
                      borderRadius:14, padding:"24px 28px", marginTop:8 }}>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginBottom:8,
                        textTransform:"uppercase", letterSpacing:1 }}>Live Preview</div>
                      <div style={{ fontSize:20, fontWeight:800, color:"white", marginBottom:8 }}>{hp.heroTitle}</div>
                      <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)", marginBottom:14, lineHeight:1.6 }}>{hp.heroSubtitle}</div>
                      <div style={{ background:"white", color:"#4f46e5", borderRadius:10,
                        padding:"9px 20px", display:"inline-block", fontWeight:700, fontSize:13 }}>{hp.heroBtn}</div>
                    </div>
                  </div>
                )}

                {hpTab==="about" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <h3 style={{ margin:"0 0 4px", fontSize:14, fontWeight:800, color:"#0f172a" }}>ℹ️ About Section</h3>
                    <Input label="Section Title" value={hp.aboutTitle}
                      onChange={e=>setHp(p=>({...p,aboutTitle:e.target.value}))} />
                    <Textarea label="About Text" value={hp.aboutText}
                      onChange={e=>setHp(p=>({...p,aboutText:e.target.value}))} rows={4} />
                    <div style={{ background:"#f8fafc", borderRadius:14, padding:"18px 20px", marginTop:8 }}>
                      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:8,
                        textTransform:"uppercase", letterSpacing:1 }}>Live Preview</div>
                      <div style={{ fontWeight:800, fontSize:16, color:"#0f172a", marginBottom:8 }}>{hp.aboutTitle}</div>
                      <div style={{ fontSize:13, color:"#64748b", lineHeight:1.7 }}>{hp.aboutText}</div>
                    </div>
                  </div>
                )}

                {hpTab==="contact" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <h3 style={{ margin:"0 0 4px", fontSize:14, fontWeight:800, color:"#0f172a" }}>📞 Contact Info</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }} className="contact-grid">
                      <Input label="Phone" value={hp.phone} onChange={e=>setHp(p=>({...p,phone:e.target.value}))} />
                      <Input label="Email" value={hp.email} onChange={e=>setHp(p=>({...p,email:e.target.value}))} />
                      <Input label="Address" value={hp.address} onChange={e=>setHp(p=>({...p,address:e.target.value}))} />
                      <Input label="Working Hours" value={hp.workingHours} onChange={e=>setHp(p=>({...p,workingHours:e.target.value}))} />
                    </div>
                    <div style={{ background:"#f8fafc", borderRadius:14, padding:"18px 20px", marginTop:4 }}>
                      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:10,
                        textTransform:"uppercase", letterSpacing:1 }}>Live Preview</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                        {[["📞",hp.phone],["📧",hp.email],["📍",hp.address],["🕐",hp.workingHours]].map(([ic,v])=>(
                          <div key={ic} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                            <span>{ic}</span>
                            <span style={{ fontSize:12, color:"#475569" }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ DOCTORS ════════ */}
          {active==="doctors" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                flexWrap:"wrap", gap:12, marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:0 }}>Manage Doctors</h2>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{doctors.length} doctors registered</div>
                </div>
                <button onClick={openAddDr} style={{ background:"linear-gradient(120deg,#4f46e5,#7c3aed)",
                  color:"white", border:"none", borderRadius:12, padding:"10px 20px",
                  fontWeight:700, fontSize:13, cursor:"pointer" }}>+ Add Doctor</button>
              </div>

              {/* Search */}
              <div style={{ position:"relative", marginBottom:16 }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"#94a3b8" }}>🔍</span>
                <input placeholder="Search by name or specialty..."
                  value={drSearch} onChange={e=>setDrSearch(e.target.value)}
                  style={{ width:"100%", padding:"10px 12px 10px 38px", borderRadius:12,
                    border:"1.5px solid #e2e8f0", fontSize:13, outline:"none",
                    background:"white", boxSizing:"border-box" }} />
              </div>

              {/* Doctors grid */}
              <div className="dr-grid">
                {filteredDrs.map(d=>(
                  <div key={d.id} style={{ background:"white", borderRadius:16, padding:20,
                    boxShadow:"0 1px 8px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <img src={d.avatar} alt={d.name}
                        style={{ width:52, height:52, borderRadius:"50%", objectFit:"cover",
                          border:"2px solid #e2e8f0", flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:800, fontSize:14, color:"#0f172a",
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.name}</div>
                        <div style={{ fontSize:12, color:"#64748b" }}>{d.specialty}</div>
                        <div style={{ marginTop:4 }}><Badge s={d.status} /></div>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 10px",
                      background:"#f8fafc", borderRadius:10, padding:"10px 12px" }}>
                      {[["Exp",d.exp],["Patients",d.patients],["Fee",d.fee],["ID",d.id]].map(([l,v])=>(
                        <div key={l}>
                          <div style={{ fontSize:10, color:"#94a3b8" }}>{l}</div>
                          <div style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>setDrView(d)} style={{ flex:1, padding:"8px",
                        borderRadius:9, border:"none", background:"#ede9fe",
                        color:"#7c3aed", fontWeight:700, fontSize:12, cursor:"pointer" }}>👁 View</button>
                      <button onClick={()=>openEditDr(d)} style={{ flex:1, padding:"8px",
                        borderRadius:9, border:"none", background:"#dbeafe",
                        color:"#1d4ed8", fontWeight:700, fontSize:12, cursor:"pointer" }}>✏️ Edit</button>
                      <button onClick={()=>setDeleteConfirm({type:"doctor",id:d.id,name:d.name})}
                        style={{ flex:1, padding:"8px", borderRadius:9, border:"none",
                          background:"#fee2e2", color:"#dc2626", fontWeight:700, fontSize:12, cursor:"pointer" }}>🗑️ Del</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ PATIENTS ════════ */}
          {active==="patients" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                flexWrap:"wrap", gap:12, marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:0 }}>Manage Patients</h2>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{patients.length} patients registered</div>
                </div>
                <button onClick={openAddPt} style={{ background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",
                  color:"white", border:"none", borderRadius:12, padding:"10px 20px",
                  fontWeight:700, fontSize:13, cursor:"pointer" }}>+ Add Patient</button>
              </div>

              {/* Search + filter */}
              <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:200, position:"relative" }}>
                  <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"#94a3b8" }}>🔍</span>
                  <input placeholder="Search by name or condition..."
                    value={ptSearch} onChange={e=>setPtSearch(e.target.value)}
                    style={{ width:"100%", padding:"10px 12px 10px 38px", borderRadius:12,
                      border:"1.5px solid #e2e8f0", fontSize:13, outline:"none",
                      background:"white", boxSizing:"border-box" }} />
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {["All","Active","Critical","New"].map(s=>(
                    <button key={s} onClick={()=>setPtFilter(s)} style={{
                      padding:"8px 14px", borderRadius:20, border:"none", cursor:"pointer",
                      fontSize:12, fontWeight:600,
                      background: ptFilter===s ? "#0d4f4f" : "#f1f5f9",
                      color: ptFilter===s ? "white" : "#64748b", transition:"all 0.2s",
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div style={{ background:"white", borderRadius:16, overflow:"hidden",
                boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
                <div className="pt-hdr" style={{ display:"grid", background:"#f1f5f9",
                  padding:"12px 20px", fontSize:11, fontWeight:800, color:"#64748b",
                  textTransform:"uppercase", letterSpacing:0.5, borderBottom:"1px solid #e2e8f0" }}>
                  <span>Patient</span><span>Age</span><span>Blood</span>
                  <span>Condition</span><span>Doctor</span><span>Status</span><span>Actions</span>
                </div>
                {filteredPts.length===0 && (
                  <div style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:14 }}>No patients found.</div>
                )}
                {filteredPts.map((p,i)=>(
                  <div key={p.id} className="pt-row" style={{ display:"grid",
                    padding:"12px 20px", alignItems:"center",
                    borderBottom: i<filteredPts.length-1?"1px solid #f1f5f9":"none",
                    background:"white" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <img src={p.avatar} alt={p.name}
                        style={{ width:34, height:34, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{p.name}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>#{p.id}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:13, color:"#475569" }}>{p.age}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{p.blood}</div>
                    <div style={{ fontSize:12, color:"#475569" }}>{p.condition}</div>
                    <div style={{ fontSize:12, color:"#64748b" }}>{p.doctor}</div>
                    <div><Badge s={p.status} /></div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>setPtView(p)} style={{ padding:"5px 10px", borderRadius:7,
                        border:"none", background:"#f0fdfb", color:"#0d4f4f",
                        fontWeight:700, fontSize:11, cursor:"pointer" }}>👁</button>
                      <button onClick={()=>openEditPt(p)} style={{ padding:"5px 10px", borderRadius:7,
                        border:"none", background:"#dbeafe", color:"#1d4ed8",
                        fontWeight:700, fontSize:11, cursor:"pointer" }}>✏️</button>
                      <button onClick={()=>setDeleteConfirm({type:"patient",id:p.id,name:p.name})}
                        style={{ padding:"5px 10px", borderRadius:7, border:"none",
                          background:"#fee2e2", color:"#dc2626",
                          fontWeight:700, fontSize:11, cursor:"pointer" }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── CSS ── */}
      <style>{`
        @media(min-width:769px){
          .adm-sidebar  { position:sticky !important; top:0 !important; height:100vh !important; transform:translateX(0) !important; }
          .hamburger-adm{ display:none !important; }
          .sidebar-close{ display:none !important; }
          .adm-body     { padding:22px 28px !important; }
          .stat4        { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
          .chart3       { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
          .pie3         { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
          .two-col      { grid-template-columns:1fr 1fr; gap:20px; display:grid; }
          .dr-grid      { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
          .pt-hdr,.pt-row{ grid-template-columns:2fr 50px 60px 1fr 1fr 100px 110px !important; }
          .contact-grid { grid-template-columns:1fr 1fr !important; }
        }
        @media(max-width:1024px) and (min-width:769px){
          .chart3{ grid-template-columns:1fr 1fr; }
          .pie3  { grid-template-columns:1fr 1fr; }
          .dr-grid{ grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:768px){
          .hamburger-adm{ display:block !important; }
          .adm-main     { width:100vw; }
          .stat4        { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
          .chart3       { display:flex; flex-direction:column; gap:14px; }
          .pie3         { display:flex; flex-direction:column; gap:14px; }
          .two-col      { display:flex; flex-direction:column; gap:14px; }
          .dr-grid      { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
          .pt-hdr       { display:none !important; }
          .pt-row       { grid-template-columns:1fr auto !important; }
          .pt-row>:nth-child(2),.pt-row>:nth-child(3),
          .pt-row>:nth-child(4),.pt-row>:nth-child(5){ display:none; }
          .contact-grid { grid-template-columns:1fr !important; }
        }
        @media(max-width:480px){
          .dr-grid{ grid-template-columns:1fr; }
          .stat4  { grid-template-columns:1fr 1fr; }
        }
        div::-webkit-scrollbar      { width:4px; height:4px; }
        div::-webkit-scrollbar-thumb{ background:#cbd5e1; border-radius:4px; }
        select,input,textarea       { font-family:inherit; }
      `}</style>
    </div>
  );
}