import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api/patient";

/* ── API Helper ── */
const api = async (url, method="GET", body=null, isForm=false) => {
    const token = localStorage.getItem("hospital_token_patient");
    if (!token) { window.location.href = "/login"; return { success:false, message:"Not logged in." }; }
    const opts  = { method, headers: { Authorization:`Bearer ${token}` } };
    if (body) {
        if (isForm) opts.body = body;
        else { opts.headers["Content-Type"]="application/json"; opts.body=JSON.stringify(body); }
    }
    const res  = await fetch(`${API}${url}`, opts);
    const data = await res.json();
    if (res.status === 401) {
        localStorage.removeItem("hospital_token_patient");
        localStorage.removeItem("hospital_user_patient");
        window.location.href = "/login";
        return { success:false, message:"Session expired. Please login again." };
    }
    return data;
};

/* ── Helpers ── */
const fmtDate  = d => d ? new Date(d+"T00:00:00").toLocaleDateString("en-PK",{weekday:"short",day:"numeric",month:"short",year:"numeric"}) : "—";
const fmtTime  = t => { if(!t) return "—"; const [h,m]=t.split(":"); const hh=parseInt(h); return `${hh>12?hh-12:hh||12}:${m} ${hh>=12?"PM":"AM"}`; };
const avatar   = (name,bg="0d4f4f") => `https://ui-avatars.com/api/?name=${encodeURIComponent(name||"P")}&background=${bg}&color=fff`;

const STATUS_COLOR = {
    Confirmed: ["#dbeafe","#1d4ed8"],
    Pending:   ["#fef9c3","#b45309"],
    Cancelled: ["#fee2e2","#dc2626"],
    Completed: ["#dcfce7","#16a34a"],
};
const RISK_COLOR = {
    Low:    ["#dcfce7","#16a34a"],
    Medium: ["#fef9c3","#ca8a04"],
    High:   ["#fee2e2","#dc2626"],
};

const Badge = ({s, map=STATUS_COLOR}) => {
    const [bg,tc] = map[s]||["#f1f5f9","#64748b"];
    return <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:bg,color:tc}}>{s}</span>;
};
const InfoRow = ({label, value}) => (
    <div style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #f1f5f9",padding:"8px 0",fontSize:13}}>
        <span style={{color:"#64748b",fontWeight:600}}>{label}</span>
        <span style={{color:"#1e293b",textAlign:"right",maxWidth:200}}>{value||"—"}</span>
    </div>
);
const SectionTitle = ({children}) => (
    <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:"0 0 18px"}}>{children}</h2>
);

const navItems = [
    {id:"overview",     icon:"🏠", label:"Overview"},
    {id:"appointments", icon:"📅", label:"Appointments"},
    {id:"profile",      icon:"👤", label:"My Profile"},
    {id:"records",      icon:"📋", label:"Records"},
];

const Toast = ({msg, ok}) => (
    <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:ok?"#10b981":"#ef4444",color:"white",padding:"12px 20px",borderRadius:12,fontWeight:700,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>
        {ok?"✅":"❌"} {msg}
    </div>
);

/* ══════════════════════════════════════════════
   EDIT PROFILE MODAL
══════════════════════════════════════════════ */
// ── Reusable field components — defined OUTSIDE any modal/component ──
const PInp = ({label,value,onChange,type="text",placeholder=""}) => (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label>
        <input type={type} value={value||""} placeholder={placeholder} onChange={onChange}
            style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%",boxSizing:"border-box"}}/>
    </div>
);
const PSel = ({label,value,onChange,options}) => (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label>
        <select value={value||""} onChange={onChange}
            style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%"}}>
            {options.map(o=><option key={o}>{o}</option>)}
        </select>
    </div>
);
const PPass = ({label,value,onChange,placeholder=""}) => {
    const [show,setShow] = useState(false);
    return (
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label>
            <div style={{position:"relative"}}>
                <input type={show?"text":"password"} value={value||""} placeholder={placeholder} onChange={onChange}
                    style={{padding:"9px 38px 9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%",boxSizing:"border-box"}}/>
                <button type="button" onClick={()=>setShow(s=>!s)}
                    style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#94a3b8",padding:0}}>
                    {show?"🙈":"👁️"}
                </button>
            </div>
        </div>
    );
};

function EditProfileModal({ patient, onClose, onSave }) {
    const [form, setForm] = useState({
        name:       patient.name||"",
        age:        patient.age||"",
        gender:     patient.gender||"Male",
        blood_type: patient.blood_type||"O+",
        phone:      patient.phone||"",
        address:    patient.address||"",
        condition_: patient.condition_||"",
        newPassword:"",
        confirmPass:"",
    });
    const [img,  setImg]  = useState(null);
    const [prev, setPrev] = useState(patient.avatar ? `http://localhost:5000${patient.avatar}` : null);
    const [loading, setLoading] = useState(false);
    const [passErr, setPassErr] = useState("");
    const ref = useRef();
    const upd = k => e => setForm(p=>({...p,[k]:e.target.value}));

    const save = async () => {
        if(form.newPassword && form.newPassword !== form.confirmPass) {
            setPassErr("Passwords do not match."); return;
        }
        if(form.newPassword && form.newPassword.length < 6) {
            setPassErr("Password must be at least 6 characters."); return;
        }
        setPassErr(""); setLoading(true);
        const fd = new FormData();
        ["name","age","gender","blood_type","phone","address","condition_"].forEach(k=>fd.append(k,form[k]||""));
        if(form.newPassword) fd.append("newPassword", form.newPassword);
        if (img) fd.append("avatar", img);
        await onSave(fd);
        setLoading(false);
    };

    return (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
            <div style={{background:"white",borderRadius:20,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.3)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"white"}}>
                    <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>✏️ Edit Profile</div>
                    <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16}}>✕</button>
                </div>
                <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
                    {/* Photo */}
                    <div style={{display:"flex",alignItems:"center",gap:16,background:"#f0fdfb",borderRadius:14,padding:14}}>
                        <div style={{position:"relative"}}>
                            <img src={prev||avatar(patient.name)} alt="" style={{width:70,height:70,borderRadius:"50%",objectFit:"cover",border:"3px solid #14b8a6",flexShrink:0}}/>
                            <button onClick={()=>ref.current.click()} style={{position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:"#0d4f4f",border:"2px solid white",color:"white",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>📷</button>
                            <input ref={ref} type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setImg(f);setPrev(URL.createObjectURL(f));}}} style={{display:"none"}}/>
                        </div>
                        <div style={{fontSize:12,color:"#64748b"}}>Click camera icon to change photo</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                        <PInp label="Full Name"  value={form.name}       onChange={upd("name")}       placeholder="Your name"/>
                        <PInp label="Age"        value={form.age}        onChange={upd("age")}        type="number" placeholder="25"/>
                        <PSel label="Gender"     value={form.gender}     onChange={upd("gender")}     options={["Male","Female","Other"]}/>
                        <PSel label="Blood Type" value={form.blood_type} onChange={upd("blood_type")} options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]}/>
                        <PInp label="Phone"      value={form.phone}      onChange={upd("phone")}      placeholder="+92-300-0000000"/>
                        <PInp label="Condition"  value={form.condition_} onChange={upd("condition_")} placeholder="e.g. Diabetes..."/>
                    </div>
                    <PInp label="Address" value={form.address} onChange={upd("address")} placeholder="123 Street, City"/>
                    <div style={{borderTop:"1px solid #f1f5f9",paddingTop:14}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:10}}>🔒 Change Password <span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>(leave blank to keep current)</span></div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                            <PPass label="New Password"     value={form.newPassword} onChange={upd("newPassword")} placeholder="Min. 6 characters"/>
                            <PPass label="Confirm Password" value={form.confirmPass} onChange={upd("confirmPass")} placeholder="Repeat password"/>
                        </div>
                        {passErr&&<div style={{fontSize:12,color:"#ef4444",marginTop:6}}>⚠️ {passErr}</div>}
                        {form.newPassword&&form.confirmPass&&form.newPassword===form.confirmPass&&<div style={{fontSize:12,color:"#10b981",marginTop:6}}>✓ Passwords match</div>}
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:4}}>
                        <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:10,border:"2px solid #e2e8f0",background:"white",fontWeight:700,fontSize:13,cursor:"pointer",color:"#64748b"}}>Cancel</button>
                        <button onClick={save} disabled={loading} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",fontWeight:700,fontSize:13,cursor:"pointer",color:"white"}}>
                            {loading?"Saving...":"💾 Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN — PATIENT MODULE
══════════════════════════════════════════════ */
export default function PatientModule() {
    const navigate     = useNavigate();
    const [active,      setActive]      = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast,       setToast]       = useState(null);
    const [loading,     setLoading]     = useState(true);

    const [patient,      setPatient]      = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [editModal,    setEditModal]    = useState(false);
    const [expandedId,   setExpandedId]   = useState(null);
    const [apptFilter,   setApptFilter]   = useState("All");

    const user = JSON.parse(localStorage.getItem("hospital_user_patient")||"{}");
    const showToast = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

    /* ── Load ── */
    const loadAll = async () => {
        setLoading(true);
        const [p,a] = await Promise.all([
            api('/profile'), api('/appointments')
        ]);
        if (p.success) setPatient(p.patient);
        if (a.success) setAppointments(a.appointments);
        setLoading(false);
    };
    useEffect(() => { loadAll(); }, []);

    /* ── Save Profile ── */
    const saveProfile = async (fd) => {
        const data = await api('/profile','PUT',fd,true);
        if (data.success) { showToast(data.message); setEditModal(false); loadAll(); }
        else showToast(data.message,false);
    };

    /* ── Cancel Appointment ── */
    const cancelAppt = async (id) => {
        if (!window.confirm("Cancel this appointment?")) return;
        const data = await api(`/appointments/${id}/cancel`,'PUT',{reason:"Cancelled by patient."});
        if (data.success) { showToast(data.message); loadAll(); }
        else showToast(data.message,false);
    };

    const goto = (id) => { setActive(id); setSidebarOpen(false); };

    /* ── Stats from appointments ── */
    const todayStr     = new Date().toISOString().split('T')[0];
    const upcoming     = appointments.filter(a=>a.status==="Confirmed"||a.status==="Pending");
    const todayAppts   = appointments.filter(a=>a.date===todayStr);
    const completed    = appointments.filter(a=>a.status==="Completed");
    const filtAppts    = apptFilter==="All" ? appointments : appointments.filter(a=>a.status===apptFilter);

    if (loading) return (
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#eaf1f3",fontFamily:"'DM Sans',sans-serif"}}>
            <div style={{textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:12}}>🏥</div>
                <div style={{fontSize:14,color:"#64748b"}}>Loading your health dashboard...</div>
            </div>
        </div>
    );

    return (
        <div style={{display:"flex",minHeight:"100vh",background:"#eaf1f3",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
            {toast && <Toast {...toast}/>}
            {editModal && patient && <EditProfileModal patient={patient} onClose={()=>setEditModal(false)} onSave={saveProfile}/>}

            {/* Mobile overlay */}
            {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:40}}/>}

            {/* ══ SIDEBAR ══ */}
            <div style={{width:210,background:"linear-gradient(180deg,#0d4f4f,#0a3d3d)",flexShrink:0,display:"flex",flexDirection:"column",padding:"20px 0",position:"fixed",top:0,left:0,bottom:0,zIndex:50}} className="pt-sidebar">
                {/* Logo */}
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"0 16px 20px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                    <div style={{width:36,height:36,background:"#14b8a6",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"white"}}>✚</div>
                    <span style={{color:"white",fontWeight:800,fontSize:15}}>MediCare+</span>
                </div>

                {/* Patient card */}
                <div style={{margin:"12px",background:"rgba(255,255,255,0.1)",borderRadius:12,padding:"12px",textAlign:"center"}}>
                    <img src={patient?.avatar?(patient.avatar.startsWith("http")?patient.avatar:`http://localhost:5000${patient.avatar}`):avatar(patient?.name||user.name)} alt="patient"
                        style={{width:50,height:50,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.4)",marginBottom:6}}/>
                    <div style={{color:"white",fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{patient?.name||user.name}</div>
                    <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginTop:2}}>{patient?.blood_type||"Patient"}</div>
                    {upcoming.length>0 && <div style={{marginTop:8,background:"#f59e0b",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:"white"}}>
                        {upcoming.length} upcoming appt{upcoming.length>1?"s":""}
                    </div>}
                </div>

                {/* Nav */}
                <div style={{padding:"0 10px",flex:1,display:"flex",flexDirection:"column",gap:4}}>
                    {navItems.map(item=>(
                        <button key={item.id} onClick={()=>goto(item.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",border:"none",cursor:"pointer",background:active===item.id?"rgba(20,184,166,0.25)":"transparent",borderLeft:active===item.id?"3px solid #14b8a6":"3px solid transparent",color:active===item.id?"white":"rgba(255,255,255,0.65)",fontSize:13,fontWeight:600,textAlign:"left",borderRadius:"0 8px 8px 0",transition:"all 0.2s"}}>
                            <span style={{fontSize:16}}>{item.icon}</span>{item.label}
                            {item.id==="appointments"&&upcoming.length>0&&<span style={{marginLeft:"auto",background:"#f59e0b",borderRadius:"50%",minWidth:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"white",fontWeight:800}}>{upcoming.length}</span>}
                        </button>
                    ))}
                </div>

                <div style={{padding:"0 10px"}}>
                    <button onClick={()=>navigate("/book-appointment")} style={{width:"100%",padding:"11px 14px",border:"1px solid rgba(255,255,255,0.2)",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}>
                        🗓️ Book Appointment
                    </button>
                    <button onClick={()=>{localStorage.removeItem("hospital_token_patient");localStorage.removeItem("hospital_user_patient");navigate("/login");}}
                        style={{width:"100%",marginTop:8,padding:"10px 14px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.5)",borderRadius:12,fontWeight:600,fontSize:13,cursor:"pointer"}}>
                        ↩ Logout
                    </button>
                </div>
            </div>

            {/* ══ MAIN ══ */}
            <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}} className="pt-main">
                {/* Topbar */}
                <div style={{height:56,background:"white",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #e5edf0",position:"sticky",top:0,zIndex:30,boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <button onClick={()=>setSidebarOpen(true)} className="pt-hamburger" style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#0d4f4f",padding:0,lineHeight:1}}>☰</button>
                        <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>
                            {navItems.find(n=>n.id===active)?.icon} {navItems.find(n=>n.id===active)?.label}
                        </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <button onClick={()=>navigate("/book-appointment")} style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:10,padding:"8px 16px",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                            + Book Appointment
                        </button>
                        <img src={patient?.avatar?(patient.avatar.startsWith("http")?patient.avatar:`http://localhost:5000${patient.avatar}`):avatar(patient?.name||user.name)} alt="" style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",border:"2px solid #14b8a6"}}/>
                    </div>
                </div>

                <div style={{flex:1,overflow:"auto",padding:"20px 16px"}} className="pt-body">

                    {/* ══ OVERVIEW ══ */}
                    {active==="overview" && (
                        <div>
                            <SectionTitle>Patient Overview</SectionTitle>

                            {/* Stats row */}
                            <div className="pt-stats" style={{marginBottom:20}}>
                                {[
                                    ["Upcoming",   upcoming.length,   "📅","linear-gradient(135deg,#0d4f4f,#14b8a6)"],
                                    ["Completed",  completed.length,  "✅","linear-gradient(135deg,#1d4ed8,#3b82f6)"],
                                    ["Today",      todayAppts.length, "🗓️","linear-gradient(135deg,#7c3aed,#8b5cf6)"],
                                    ["Total",      appointments.length,"📋","linear-gradient(135deg,#d97706,#f59e0b)"],
                                ].map(([label,val,icon,bg])=>(
                                    <div key={label} style={{background:bg,borderRadius:16,padding:"18px 20px",color:"white",boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
                                        <div style={{display:"flex",justifyContent:"space-between"}}>
                                            <div><div style={{fontSize:11,opacity:0.8,marginBottom:4}}>{label}</div><div style={{fontSize:26,fontWeight:800}}>{val}</div></div>
                                            <div style={{fontSize:24,opacity:0.8}}>{icon}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="ov-grid">
                                {/* Profile Card */}
                                <div style={{background:"white",borderRadius:16,padding:22,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                                        <img src={patient?.avatar?(patient.avatar.startsWith("http")?patient.avatar:`http://localhost:5000${patient.avatar}`):avatar(patient?.name||user.name)} alt="" style={{width:64,height:64,borderRadius:14,objectFit:"cover",border:"2px solid #ccfbf1",flexShrink:0}}/>
                                        <div>
                                            <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>{patient?.name||user.name}</div>
                                            <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{patient?.email||user.email}</div>
                                            <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
                                                {patient?.blood_type&&<span style={{fontSize:11,fontWeight:700,background:"#fee2e2",color:"#dc2626",padding:"2px 8px",borderRadius:20}}>🩸 {patient.blood_type}</span>}
                                                {patient?.gender&&<span style={{fontSize:11,fontWeight:600,background:"#dbeafe",color:"#1d4ed8",padding:"2px 8px",borderRadius:20}}>{patient.gender}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    {[["Age",patient?.age?`${patient.age} years`:"Not set"],
                                      ["Blood Type",patient?.blood_type||"Not set"],
                                      ["Phone",patient?.phone||"Not set"],
                                      ["Condition",patient?.condition_||"None listed"],
                                    ].map(([l,v])=><InfoRow key={l} label={l} value={v}/>)}
                                    <button onClick={()=>setEditModal(true)} style={{marginTop:14,width:"100%",padding:"9px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",color:"#0d4f4f"}}>
                                        ✏️ Edit Profile
                                    </button>
                                </div>

                                {/* Upcoming Appointments */}
                                <div style={{background:"white",borderRadius:16,padding:22,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                                        <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>📅 Upcoming Appointments</div>
                                        <span onClick={()=>setActive("appointments")} style={{fontSize:12,color:"#14b8a6",cursor:"pointer",fontWeight:600}}>See All →</span>
                                    </div>
                                    {upcoming.length===0
                                        ? <div style={{textAlign:"center",padding:"20px",color:"#94a3b8",fontSize:13}}>
                                            No upcoming appointments.<br/>
                                            <button onClick={()=>navigate("/book-appointment")} style={{marginTop:10,background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:10,padding:"8px 18px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Book Now 🗓️</button>
                                          </div>
                                        : upcoming.slice(0,3).map((a,i)=>(
                                            <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<Math.min(upcoming.length,3)-1?"1px solid #f1f5f9":"none"}}>
                                                <img src={a.doctor_avatar?(a.doctor_avatar.startsWith("http")?a.doctor_avatar:`http://localhost:5000${a.doctor_avatar}`):avatar(a.doctor_name,"6366f1")} alt="" style={{width:38,height:38,borderRadius:10,objectFit:"cover",flexShrink:0,border:"1px solid #e2e8f0"}}/>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <div style={{fontWeight:700,fontSize:13,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.doctor_name}</div>
                                                    <div style={{fontSize:11,color:"#94a3b8"}}>{fmtDate(a.date)} · {fmtTime(a.time_slot)}</div>
                                                </div>
                                                <Badge s={a.status}/>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ APPOINTMENTS ══ */}
                    {active==="appointments" && (
                        <div>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:20}}>
                                <SectionTitle>My Appointments</SectionTitle>
                                <button onClick={()=>navigate("/book-appointment")} style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:12,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                                    🗓️ Book New
                                </button>
                            </div>

                            {/* Filter tabs */}
                            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
                                {["All","Pending","Confirmed","Completed","Cancelled"].map(f=>(
                                    <button key={f} onClick={()=>setApptFilter(f)} style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:apptFilter===f?"#0d4f4f":"white",color:apptFilter===f?"white":"#64748b"}}>
                                        {f} <span style={{opacity:0.7}}>({(f==="All"?appointments:appointments.filter(a=>a.status===f)).length})</span>
                                    </button>
                                ))}
                            </div>

                            {filtAppts.length===0
                                ? <div style={{background:"white",borderRadius:16,padding:"40px",textAlign:"center",color:"#94a3b8",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                    No appointments found.<br/>
                                    <button onClick={()=>navigate("/book-appointment")} style={{marginTop:12,background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:10,padding:"9px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Book an Appointment</button>
                                  </div>
                                : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                                    {filtAppts.map(a=>(
                                        <div key={a.id} style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",border:`1px solid ${a.status==="Confirmed"?"#bfdbfe":a.status==="Pending"?"#fde68a":a.status==="Completed"?"#bbf7d0":"#fecaca"}`}}>
                                            {/* Row */}
                                            <div onClick={()=>setExpandedId(expandedId===a.id?null:a.id)}
                                                style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",cursor:"pointer"}}>
                                                <img src={a.doctor_avatar?(a.doctor_avatar.startsWith("http")?a.doctor_avatar:`http://localhost:5000${a.doctor_avatar}`):avatar(a.doctor_name,"6366f1")} alt="" style={{width:46,height:46,borderRadius:12,objectFit:"cover",flexShrink:0,border:"2px solid #e2e8f0"}}/>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{a.doctor_name}</div>
                                                    <div style={{fontSize:12,color:"#64748b"}}>{a.specialty} · {fmtDate(a.date)} · {fmtTime(a.time_slot)}</div>
                                                    <div style={{fontSize:12,color:"#475569",marginTop:2}}><span style={{fontWeight:600}}>Problem:</span> {a.problem}</div>
                                                </div>
                                                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                                                    <Badge s={a.status}/>
                                                    {a.ai_risk&&<Badge s={a.ai_risk} map={RISK_COLOR}/>}
                                                    <span style={{fontSize:12,color:a.visit_type==="online"?"#0284c7":"#0d4f4f",fontWeight:600}}>{a.visit_type==="online"?"💻":"🏥"}</span>
                                                </div>
                                                <span style={{color:"#94a3b8",fontSize:14,marginLeft:4}}>{expandedId===a.id?"▲":"▼"}</span>
                                            </div>

                                            {/* Expanded */}
                                            {expandedId===a.id&&(
                                                <div style={{borderTop:"1px solid #f1f5f9",padding:"14px 18px",background:"#f8fafc"}}>
                                                    <div className="appt-expand-grid">
                                                        <div style={{background:"white",borderRadius:12,padding:14,border:"1px solid #e2e8f0"}}>
                                                            <div style={{fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8}}>
                                                                {a.visit_type==="online"?"💻 Online Consultation":"🏥 Hospital Visit"}
                                                            </div>
                                                            <div style={{fontSize:12,color:"#64748b",lineHeight:1.8}}>
                                                                {a.visit_type==="online"
                                                                    ? <>📱 Chat with AI assistant<br/>💬 Talk with {a.doctor_name}<br/>📋 Get clinical summary</>
                                                                    : <>📍 Arrive 10 mins early<br/>🪪 Bring ID card<br/>📋 Carry previous reports<br/>🚫 No food 2hrs before if blood test</>
                                                                }
                                                            </div>
                                                            {/* Visit Actions */}
                                                            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                                                                {a.visit_type==="online"&&a.status!=="Cancelled"&&(
                                                                    <button onClick={()=>navigate("/book-appointment",{state:{chatAppt:a}})}
                                                                        style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:9,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                                                                        💬 Open Chat
                                                                    </button>
                                                                )}
                                                                {(a.status==="Pending"||a.status==="Confirmed")&&(
                                                                    <button onClick={()=>cancelAppt(a.id)}
                                                                        style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:9,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                                                                        ✕ Cancel
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div style={{background:"white",borderRadius:12,padding:14,border:"1px solid #e2e8f0"}}>
                                                            <div style={{fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8}}>🧠 AI Analysis</div>
                                                            {a.ai_analysis
                                                                ? <div style={{fontSize:12,color:"#475569",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{a.ai_analysis}</div>
                                                                : <div style={{fontSize:12,color:"#94a3b8"}}>No AI analysis yet.{a.visit_type==="online"?" Open chat to generate one.":""}</div>
                                                            }
                                                            {a.cancel_reason&&(
                                                                <div style={{marginTop:8,background:"#fee2e2",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#dc2626"}}>
                                                                    <strong>Cancellation reason:</strong> {a.cancel_reason}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                  </div>
                            }
                        </div>
                    )}

                    {/* ══ PROFILE ══ */}
                    {active==="profile" && (
                        <div>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:20}}>
                                <SectionTitle>My Profile</SectionTitle>
                                <button onClick={()=>setEditModal(true)} style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:12,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                                    ✏️ Edit Profile
                                </button>
                            </div>
                            <div style={{background:"white",borderRadius:20,padding:24,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24,padding:18,background:"linear-gradient(120deg,#f0fdf9,#ccfbf1)",borderRadius:16}}>
                                    <img src={patient?.avatar?(patient.avatar.startsWith("http")?patient.avatar:`http://localhost:5000${patient.avatar}`):avatar(patient?.name||user.name)} alt="" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"4px solid #14b8a6",flexShrink:0}}/>
                                    <div>
                                        <div style={{fontWeight:800,fontSize:18,color:"#0d4f4f"}}>{patient?.name||user.name}</div>
                                        <div style={{fontSize:13,color:"#0d9488",marginTop:2}}>{patient?.email||user.email}</div>
                                        <div style={{marginTop:6,display:"flex",gap:8,flexWrap:"wrap"}}>
                                            {patient?.blood_type&&<span style={{fontSize:11,fontWeight:700,background:"#fee2e2",color:"#dc2626",padding:"3px 10px",borderRadius:20}}>🩸 {patient.blood_type}</span>}
                                            {patient?.gender&&<span style={{fontSize:11,fontWeight:600,background:"#dbeafe",color:"#1d4ed8",padding:"3px 10px",borderRadius:20}}>{patient.gender}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="prof-detail-grid">
                                    {[["Full Name",patient?.name],["Age",patient?.age?`${patient.age} years`:null],
                                      ["Gender",patient?.gender],["Blood Type",patient?.blood_type],
                                      ["Phone",patient?.phone],["Condition",patient?.condition_],
                                      ["Address",patient?.address],["Email",patient?.email],
                                    ].map(([l,v])=>(
                                        <div key={l} style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px"}}>
                                            <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginBottom:4}}>{l}</div>
                                            <div style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>{v||"Not set"}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ RECORDS ══ */}
                    {active==="records" && (
                        <div>
                            <SectionTitle>Medical Records</SectionTitle>
                            {/* Appointment history as records */}
                            <div style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                <div style={{padding:"14px 20px",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:14,color:"#0f172a"}}>
                                    📋 Appointment History ({appointments.length} total)
                                </div>
                                {appointments.length===0
                                    ? <div style={{padding:"40px",textAlign:"center",color:"#94a3b8"}}>No records yet. Book your first appointment!</div>
                                    : appointments.map((a,i)=>(
                                        <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:i<appointments.length-1?"1px solid #f1f5f9":"none"}}>
                                            <div style={{width:38,height:38,borderRadius:10,background:a.status==="Completed"?"#dcfce7":a.status==="Cancelled"?"#fee2e2":"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                                                {a.status==="Completed"?"✅":a.status==="Cancelled"?"❌":"📅"}
                                            </div>
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{a.doctor_name}</div>
                                                <div style={{fontSize:11,color:"#94a3b8"}}>{a.specialty} · {fmtDate(a.date)} · {a.problem?.substring(0,40)}{a.problem?.length>40?"...":""}</div>
                                            </div>
                                            <div style={{textAlign:"right",flexShrink:0}}>
                                                <Badge s={a.status}/>
                                                {a.ai_risk&&<div style={{marginTop:4}}><Badge s={a.ai_risk} map={RISK_COLOR}/></div>}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @media(min-width:769px){
                    .pt-sidebar{position:sticky !important;top:0 !important;height:100vh !important;}
                    .pt-hamburger{display:none !important;}
                    .pt-body{padding:24px 28px !important;}
                    .pt-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
                    .ov-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
                    .appt-expand-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
                    .prof-detail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
                }
                @media(max-width:768px){
                    .pt-sidebar{transform:translateX(-100%);transition:transform 0.25s ease;}
                    .pt-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
                    .ov-grid{display:flex;flex-direction:column;gap:14px;}
                    .appt-expand-grid{display:flex;flex-direction:column;gap:12px;}
                    .prof-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
                }
                @media(max-width:480px){
                    .prof-detail-grid{grid-template-columns:1fr;}
                }
                div::-webkit-scrollbar{width:4px;height:4px;}
                div::-webkit-scrollbar-thumb{background:#ccfbf1;border-radius:4px;}
            `}</style>
        </div>
    );
}