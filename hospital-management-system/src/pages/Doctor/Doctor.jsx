import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api/doctor";
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

/* ── API Helper ── */
const api = async (url, method="GET", body=null, isForm=false) =>{
    const token = localStorage.getItem("hospital_token");
    const opts  = { method, headers: { Authorization: `Bearer ${token}` } };
    if (body) {
        if (isForm) opts.body = body;
        else { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
    }
    const res = await fetch(`${API}${url}`, opts);
    return res.json();
};

/* ── AI Analysis via Anthropic ── */
const runAIAnalysis = async (patient, appointment) => {
    const prompt = `You are a clinical AI assistant. Analyze this patient appointment and provide a brief, structured medical assessment.

Patient Info:
- Name: ${patient.patient_name}
- Age: ${patient.age || 'Unknown'}
- Gender: ${patient.gender || 'Unknown'}
- Blood Type: ${patient.blood_type || 'Unknown'}
- Known Condition: ${patient.condition || 'None listed'}
- Visit Count: ${patient.visit_count || 1}

Appointment:
- Problem Described: ${appointment.problem || 'Not specified'}
- Visit Type: ${appointment.visit_type}
- Date: ${appointment.date}

Please provide:
1. **Risk Level**: Low / Medium / High (one word only on first line after this label)
2. **Summary**: Brief clinical summary (2-3 sentences)
3. **Observations**: 2-3 key clinical observations
4. **Recommendations**: 2-3 suggested next steps for the doctor

Keep response concise and professional. Start directly with "Risk Level: Low/Medium/High"`;

    const response = await fetch(ANTHROPIC_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }]
        })
    });
    const data = await response.json();
    return data.content?.[0]?.text || "AI analysis unavailable.";
};

/* ── Small Components ── */
const Toast = ({msg, ok}) => (
    <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:ok?"#10b981":"#ef4444",color:"white",padding:"12px 20px",borderRadius:12,fontWeight:700,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)",animation:"slideIn 0.3s ease"}}>
        {ok?"✅":"❌"} {msg}
    </div>
);

const Badge = ({s}) => {
    const m={Active:["#dcfce7","#16a34a"],"On Leave":["#fef9c3","#ca8a04"],Inactive:["#fee2e2","#dc2626"],Confirmed:["#dbeafe","#1d4ed8"],Pending:["#fef9c3","#b45309"],Completed:["#dcfce7","#16a34a"],Cancelled:["#fee2e2","#dc2626"],Low:["#dcfce7","#16a34a"],Medium:["#fef9c3","#b45309"],High:["#fee2e2","#dc2626"]};
    const [bg,tc]=m[s]||["#f1f5f9","#64748b"];
    return <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:bg,color:tc}}>{s}</span>;
};

const Modal = ({title, onClose, children, maxWidth=560}) => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"white",borderRadius:20,width:"100%",maxWidth,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.3)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"white",zIndex:1}}>
                <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>{title}</div>
                <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
            <div style={{padding:"20px 22px"}}>{children}</div>
        </div>
    </div>
);

const Inp = ({label, value, onChange, type="text", placeholder="", hint=""}) => (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}{hint&&<span style={{fontWeight:400,color:"#94a3b8",fontSize:11}}> {hint}</span>}</label>
        <input type={type} value={value||""} onChange={onChange} placeholder={placeholder}
            style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%",boxSizing:"border-box"}}/>
    </div>
);

const Sel = ({label, value, onChange, options}) => (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label>
        <select value={value||""} onChange={onChange} style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%"}}>
            {options.map(o=><option key={o}>{o}</option>)}
        </select>
    </div>
);

const Toggle = ({val, onToggle, label}) => (
    <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={onToggle}>
        <div style={{width:44,height:24,borderRadius:20,background:val?"#0d9488":"#e2e8f0",position:"relative",transition:"all 0.2s",flexShrink:0}}>
            <div style={{position:"absolute",top:2,width:20,height:20,borderRadius:"50%",background:"white",transition:"all 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",left:val?22:2}}/>
        </div>
        {label&&<span style={{fontSize:13,fontWeight:600,color:"#475569"}}>{label}</span>}
    </div>
);

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const navItems = [
    {id:"dashboard", icon:"⊞",  label:"Dashboard"},
    {id:"schedule",  icon:"📅", label:"My Schedule"},
    {id:"appointments",icon:"🗂️",label:"Appointments"},
    {id:"patients",  icon:"👥", label:"My Patients"},
    {id:"profile",   icon:"👤", label:"Profile"},
];

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function DoctorDashboard() {
    const navigate = useNavigate();
    const [active, setActive] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    const [doctor,       setDoctor]       = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [patients,     setPatients]     = useState([]);
    const [schedule,     setSchedule]     = useState([]);

    // Schedule state
    const [schEdit, setSchEdit] = useState([]);

    // Profile state
    const [profForm, setProfForm] = useState({});
    const [profImg,  setProfImg]  = useState(null);
    const [profPrev, setProfPrev] = useState(null);
    const profRef = useRef();

    // Appointment filters
    const [apptFilter, setApptFilter] = useState("All");
    const [apptDate,   setApptDate]   = useState("");

    // AI Analysis modal
    const [aiModal,     setAiModal]     = useState(null);
    const [aiText,      setAiText]      = useState("");
    const [aiRisk,      setAiRisk]      = useState("Low");
    const [aiLoading,   setAiLoading]   = useState(false);

    // Status modal
    const [statusModal, setStatusModal] = useState(false);

    // Patient detail modal
    const [ptDetail, setPtDetail] = useState(null);

    const user     = JSON.parse(localStorage.getItem("hospital_user")||"{}");
    const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

    /* ── Load ── */
    const loadAll = async () => {
        const [d,a,p,s] = await Promise.all([
            api('/profile'), api('/appointments'), api('/patients'), api('/schedule')
        ]);
        if(d.success) { setDoctor(d.doctor); setProfForm({name:d.doctor.name,specialty:d.doctor.specialty,experience:d.doctor.experience||"",fee:d.doctor.fee||"",phone:d.doctor.phone||""}); setProfPrev(d.doctor.avatar); }
        if(a.success) setAppointments(a.appointments);
        if(p.success) setPatients(p.patients);
        // Always init all 7 days — merge DB data on top
        const existing = {};
        if(s.success) { setSchedule(s.schedule); s.schedule.forEach(r => existing[r.day]=r); }
        setSchEdit(DAYS.map(day => existing[day]
            ? { ...existing[day] }
            : { day, start_time:"09:00", end_time:"17:00", break_start:"13:00", break_end:"14:00", slot_duration:30, is_available:false }
        ));
    };
    useEffect(() => { loadAll(); }, []);

    /* ── Save Schedule ── */
    const saveSchedule = async () => {
        setLoading(true);
        const data = await api('/schedule','POST',{schedule:schEdit});
        setLoading(false);
        if(data.success) { showToast(data.message); loadAll(); }
        else showToast(data.message,false);
    };

    /* ── Save Profile ── */
    const saveProfile = async () => {
        setLoading(true);
        const fd = new FormData();
        Object.entries(profForm).forEach(([k,v])=>{ if(v!==null&&v!=="") fd.append(k,v); });
        if(profImg) fd.append("avatar",profImg);
        const data = await api('/profile','PUT',fd,true);
        setLoading(false);
        if(data.success) { showToast(data.message); loadAll(); }
        else showToast(data.message,false);
    };

    /* ── Toggle Status ── */
    const setDoctorStatus = async (status) => {
        const data = await api('/status','PUT',{status});
        setStatusModal(false);
        if(data.success) { showToast(data.message); loadAll(); }
        else showToast(data.message,false);
    };

    /* ── Update Appointment ── */
    const updateAppt = async (id, status, cancel_reason="") => {
        const data = await api(`/appointments/${id}/status`,'PUT',{status,cancel_reason});
        if(data.success) { showToast(data.message); loadAll(); }
        else showToast(data.message,false);
    };

    /* ── AI Analysis ── */
    const openAI = (appt) => {
        setAiModal(appt);
        setAiText(appt.ai_analysis||"");
        setAiRisk(appt.ai_risk||"Low");
    };
    const runAI = async () => {
        setAiLoading(true);
        try {
            const text = await runAIAnalysis(aiModal, aiModal);
            // Parse risk level from response
            const riskMatch = text.match(/Risk Level:\s*(Low|Medium|High)/i);
            const risk = riskMatch ? riskMatch[1] : "Low";
            setAiText(text); setAiRisk(risk);
        } catch(e) { showToast("AI analysis failed. Check API.",false); }
        setAiLoading(false);
    };
    const saveAI = async () => {
        const data = await api(`/appointments/${aiModal.id}/analysis`,'PUT',{ai_analysis:aiText,ai_risk:aiRisk});
        if(data.success) { showToast("Analysis saved!"); setAiModal(null); loadAll(); }
        else showToast(data.message,false);
    };

    /* ── Filtered Appointments ── */
    const filtAppts = appointments.filter(a => {
        const ms = apptFilter==="All" || a.status===apptFilter;
        const md = !apptDate || a.date===apptDate;
        return ms && md;
    });

    const stats = {
        today:    appointments.filter(a=>a.date===new Date().toISOString().split('T')[0]).length,
        pending:  appointments.filter(a=>a.status==="Pending").length,
        confirmed:appointments.filter(a=>a.status==="Confirmed").length,
        total:    appointments.length,
    };

    /* ── Schedule Edit Helper ── */
    const updSch = (i, key, val) => {
        setSchEdit(prev => { const n=[...prev]; n[i]={...n[i],[key]:val}; return n; });
    };

    return (
        <div style={{display:"flex",minHeight:"100vh",background:"#f0f7f6",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
            {toast&&<Toast {...toast}/>}

            {/* Status Modal */}
            {statusModal&&(
                <Modal title="🔄 Change Availability" onClose={()=>setStatusModal(false)} maxWidth={400}>
                    <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>⚠️ Setting to <strong>Inactive</strong> or <strong>On Leave</strong> will auto-cancel all future appointments.</p>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {["Active","On Leave","Inactive"].map(s=>(
                            <button key={s} onClick={()=>setDoctorStatus(s)} style={{padding:"12px",borderRadius:12,border:`2px solid ${doctor?.status===s?"#0d4f4f":"#e2e8f0"}`,background:doctor?.status===s?"#0d4f4f":"white",color:doctor?.status===s?"white":"#374151",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                                <span>{s==="Active"?"🟢":s==="On Leave"?"🟡":"🔴"}</span>{s}
                                {doctor?.status===s&&<span style={{marginLeft:"auto",fontSize:11}}>Current</span>}
                            </button>
                        ))}
                    </div>
                </Modal>
            )}

            {/* AI Analysis Modal */}
            {aiModal&&(
                <Modal title="🤖 AI Patient Analysis" onClose={()=>setAiModal(null)} maxWidth={620}>
                    <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px 16px",marginBottom:16,border:"1px solid #bbf7d0"}}>
                        <div style={{fontWeight:700,fontSize:13,color:"#065f46"}}>{aiModal.patient_name}</div>
                        <div style={{fontSize:12,color:"#6b7280",marginTop:4}}>
                            Age {aiModal.age||"?"} · {aiModal.gender||"?"} · Blood {aiModal.blood_type||"?"} · {aiModal.condition||"No prior condition"}
                        </div>
                        <div style={{fontSize:12,color:"#374151",marginTop:6}}>
                            <strong>Problem:</strong> {aiModal.problem||"Not specified"}
                        </div>
                    </div>
                    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
                        <div style={{flex:1,fontWeight:700,fontSize:13,color:"#0f172a"}}>Risk Level</div>
                        <div style={{display:"flex",gap:6}}>
                            {["Low","Medium","High"].map(r=>(
                                <button key={r} onClick={()=>setAiRisk(r)} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,background:aiRisk===r?(r==="Low"?"#16a34a":r==="Medium"?"#d97706":"#dc2626"):"#f1f5f9",color:aiRisk===r?"white":"#64748b"}}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{marginBottom:12}}>
                        <label style={{fontSize:12,fontWeight:700,color:"#475569",display:"block",marginBottom:6}}>AI Analysis</label>
                        <textarea value={aiText} onChange={e=>setAiText(e.target.value)} rows={8}
                            placeholder="Click 'Run AI Analysis' to generate, or type manually..."
                            style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box",background:"#f8fafc"}}/>
                    </div>
                    <div style={{display:"flex",gap:10}}>
                        <button onClick={runAI} disabled={aiLoading} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#6366f1,#8b5cf6)",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                            {aiLoading?"🔄 Analyzing...":"🤖 Run AI Analysis"}
                        </button>
                        <button onClick={saveAI} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                            💾 Save Analysis
                        </button>
                    </div>
                </Modal>
            )}

            {/* Patient Detail Modal */}
            {ptDetail&&(
                <Modal title="👤 Patient Detail" onClose={()=>setPtDetail(null)} maxWidth={480}>
                    <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
                        <img src={ptDetail.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(ptDetail.name)}&background=14b8a6&color=fff`} alt={ptDetail.name}
                            style={{width:70,height:70,borderRadius:"50%",objectFit:"cover",border:"3px solid #ccfbf1",flexShrink:0}}/>
                        <div>
                            <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>{ptDetail.name}</div>
                            <div style={{fontSize:13,color:"#64748b",marginTop:2}}>{ptDetail.email}</div>
                            <div style={{marginTop:6,display:"flex",gap:8,flexWrap:"wrap"}}>
                                <Badge s={ptDetail.latest_risk||"Low"}/>
                                <span style={{fontSize:11,fontWeight:600,color:"#0d4f4f",background:"#ccfbf1",padding:"2px 8px",borderRadius:20}}>{ptDetail.visit_count||0} visits</span>
                            </div>
                        </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                        {[["Age",ptDetail.age||"N/A"],["Gender",ptDetail.gender||"N/A"],["Blood Type",ptDetail.blood_type||"N/A"],["Phone",ptDetail.phone||"N/A"],["Last Visit",ptDetail.last_visit?.split('T')[0]||"N/A"],["Condition",ptDetail.condition_||"None"]].map(([l,v])=>(
                            <div key={l} style={{background:"#f8fafc",borderRadius:10,padding:"10px 14px"}}>
                                <div style={{fontSize:10,color:"#94a3b8",fontWeight:600}}>{l}</div>
                                <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginTop:2}}>{v}</div>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}

            {/* Mobile overlay */}
            {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:40}}/>}

            {/* ══ SIDEBAR ══ */}
            <div style={{width:220,flexShrink:0,background:"linear-gradient(180deg,#0d4f4f 0%,#0d5c52 60%,#0d4f4f 100%)",display:"flex",flexDirection:"column",padding:"24px 0 20px",position:"fixed",top:0,left:0,bottom:0,zIndex:50}} className="dr-sidebar">
                <div style={{padding:"0 20px 20px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#14b8a6,#0d9488)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏥</div>
                        <div><div style={{color:"white",fontWeight:800,fontSize:15}}>DocPortal</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:10}}>Hospital System</div></div>
                    </div>
                </div>
                <div style={{margin:"12px",background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <img src={doctor?.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.name||"Dr")}&background=14b8a6&color=fff`} alt=""
                            style={{width:38,height:38,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid rgba(255,255,255,0.2)"}}/>
                        <div style={{minWidth:0}}>
                            <div style={{color:"white",fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{doctor?.name||"Doctor"}</div>
                            <div style={{color:"rgba(255,255,255,0.5)",fontSize:10}}>{doctor?.specialty||"Specialist"}</div>
                        </div>
                    </div>
                    <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <Badge s={doctor?.status||"Active"}/>
                        <button onClick={()=>setStatusModal(true)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"4px 8px",color:"rgba(255,255,255,0.6)",fontSize:11,cursor:"pointer",fontWeight:600}}>Change</button>
                    </div>
                </div>
                <div style={{padding:"0 12px",display:"flex",flexDirection:"column",gap:4,flex:1}}>
                    {navItems.map(item=>(
                        <button key={item.id} onClick={()=>{setActive(item.id);setSidebarOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:"none",cursor:"pointer",background:active===item.id?"rgba(20,184,166,0.25)":"transparent",borderLeft:active===item.id?"3px solid #14b8a6":"3px solid transparent",color:active===item.id?"white":"rgba(255,255,255,0.6)",fontSize:13,fontWeight:600,transition:"all 0.2s",textAlign:"left"}}>
                            <span style={{fontSize:17}}>{item.icon}</span>{item.label}
                            {item.id==="appointments"&&stats.pending>0&&<span style={{marginLeft:"auto",background:"#f59e0b",borderRadius:"50%",minWidth:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"white",fontWeight:800}}>{stats.pending}</span>}
                        </button>
                    ))}
                </div>
                <button onClick={()=>{localStorage.removeItem("hospital_token");localStorage.removeItem("hospital_user");navigate("/login");}} style={{margin:"0 12px",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:12}}>↩ Logout</button>
            </div>

            {/* ══ MAIN ══ */}
            <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}} className="dr-main">
                {/* Topbar */}
                <div style={{height:60,background:"white",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #e8ecf4",position:"sticky",top:0,zIndex:30,boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <button onClick={()=>setSidebarOpen(true)} className="hamburger-dr" style={{background:"none",border:"none",fontSize:22,color:"#0d4f4f",cursor:"pointer"}}>☰</button>
                        <div>
                            <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>{navItems.find(n=>n.id===active)?.icon} {navItems.find(n=>n.id===active)?.label}</div>
                            <div style={{fontSize:11,color:"#94a3b8"}}>ID: {doctor?.doctor_id||"..."}</div>
                        </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <div style={{fontSize:12,color:"#64748b",background:"#f1f5f9",padding:"6px 14px",borderRadius:20,fontWeight:600}}>📅 Today: {stats.today} appts</div>
                    </div>
                </div>

                <div style={{flex:1,overflow:"auto",padding:"20px 16px"}} className="dr-body">

                    {/* ══ DASHBOARD ══ */}
                    {active==="dashboard"&&(
                        <div>
                            <div className="stat4" style={{marginBottom:20}}>
                                {[
                                    ["Today",    stats.today,     "📅","linear-gradient(135deg,#0d4f4f,#14b8a6)"],
                                    ["Pending",  stats.pending,   "⏳","linear-gradient(135deg,#d97706,#f59e0b)"],
                                    ["Confirmed",stats.confirmed, "✅","linear-gradient(135deg,#1d4ed8,#3b82f6)"],
                                    ["Patients", patients.length, "👥","linear-gradient(135deg,#7c3aed,#8b5cf6)"],
                                ].map(([label,val,icon,bg])=>(
                                    <div key={label} style={{background:bg,borderRadius:16,padding:"20px 22px",boxShadow:"0 4px 16px rgba(0,0,0,0.12)",color:"white"}}>
                                        <div style={{display:"flex",justifyContent:"space-between"}}>
                                            <div><div style={{fontSize:11,opacity:0.8,marginBottom:6}}>{label}</div><div style={{fontSize:28,fontWeight:800}}>{val}</div></div>
                                            <div style={{fontSize:26,opacity:0.8}}>{icon}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Today's Appointments */}
                            <div style={{background:"white",borderRadius:16,padding:22,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                <div style={{fontWeight:800,fontSize:15,color:"#0f172a",marginBottom:14}}>📋 Today's Appointments</div>
                                {appointments.filter(a=>a.date===new Date().toISOString().split('T')[0]).length===0
                                    ? <div style={{textAlign:"center",padding:"24px",color:"#94a3b8",fontSize:13}}>No appointments today. Enjoy the day! 🌿</div>
                                    : appointments.filter(a=>a.date===new Date().toISOString().split('T')[0]).map(a=>(
                                        <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,background:"#f8fafc",marginBottom:8,border:"1px solid #f1f5f9"}}>
                                            <img src={a.patient_avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(a.patient_name)}&background=14b8a6&color=fff`} alt="" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                                            <div style={{flex:1}}>
                                                <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{a.patient_name}</div>
                                                <div style={{fontSize:11,color:"#94a3b8"}}>{a.time_slot} · {a.visit_type}</div>
                                            </div>
                                            <Badge s={a.status}/>
                                            {a.ai_risk&&<Badge s={a.ai_risk}/>}
                                            <button onClick={()=>openAI(a)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"linear-gradient(120deg,#6366f1,#8b5cf6)",color:"white",fontSize:11,fontWeight:700,cursor:"pointer"}}>🤖 AI</button>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                    {/* ══ SCHEDULE ══ */}
                    {active==="schedule"&&(
                        <div>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:20}}>
                                <div><h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>My Schedule</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>Set your working days, hours and break times</div></div>
                                <button onClick={saveSchedule} disabled={loading} style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:12,padding:"10px 22px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                                    {loading?"Saving...":"💾 Save Schedule"}
                                </button>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:14}}>
                                {schEdit.map((row,i)=>(
                                    <div key={row.day} style={{background:"white",borderRadius:16,padding:"18px 20px",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",border:`2px solid ${row.is_available?"#14b8a6":"#e2e8f0"}`,opacity:row.is_available?1:0.7}}>
                                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:row.is_available?16:0}}>
                                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                                                <Toggle val={row.is_available} onToggle={()=>updSch(i,"is_available",!row.is_available)}/>
                                                <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{row.day}</div>
                                                {!row.is_available&&<span style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>Day Off</span>}
                                            </div>
                                            {row.is_available&&<div style={{fontSize:12,color:"#0d4f4f",fontWeight:700,background:"#ccfbf1",padding:"4px 12px",borderRadius:20}}>
                                                {row.start_time} → {row.end_time} · Break {row.break_start||"N/A"}–{row.break_end||"N/A"}
                                            </div>}
                                        </div>
                                        {row.is_available&&(
                                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}} className="sch-grid">
                                                <div style={{gridColumn:"span 1"}}>
                                                    <Inp label="Start Time" type="time" value={row.start_time} onChange={e=>updSch(i,"start_time",e.target.value)}/>
                                                </div>
                                                <div style={{gridColumn:"span 1"}}>
                                                    <Inp label="End Time" type="time" value={row.end_time} onChange={e=>updSch(i,"end_time",e.target.value)}/>
                                                </div>
                                                <div style={{gridColumn:"span 1"}}>
                                                    <Sel label="Slot Duration" value={String(row.slot_duration)} onChange={e=>updSch(i,"slot_duration",parseInt(e.target.value))} options={["15","20","30","45","60"]}/>
                                                </div>
                                                <div style={{gridColumn:"span 1"}}>
                                                    <Inp label="Break Start" type="time" value={row.break_start||""} onChange={e=>updSch(i,"break_start",e.target.value)} hint="(optional)"/>
                                                </div>
                                                <div style={{gridColumn:"span 1"}}>
                                                    <Inp label="Break End" type="time" value={row.break_end||""} onChange={e=>updSch(i,"break_end",e.target.value)} hint="(optional)"/>
                                                </div>
                                                <div style={{gridColumn:"span 1",display:"flex",alignItems:"flex-end"}}>
                                                    <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"9px 12px",fontSize:12,color:"#065f46",fontWeight:600,width:"100%",boxSizing:"border-box"}}>
                                                        ~{Math.floor((()=>{
                                                            const toM=t=>{if(!t)return 0;const[h,m]=t.split(':').map(Number);return h*60+m;};
                                                            const total=toM(row.end_time)-toM(row.start_time);
                                                            const brk=row.break_start&&row.break_end?toM(row.break_end)-toM(row.break_start):0;
                                                            return Math.max(0,total-brk)/row.slot_duration;
                                                        })())} slots/day
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ══ APPOINTMENTS ══ */}
                    {active==="appointments"&&(
                        <div>
                            <div style={{marginBottom:16}}>
                                <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Appointments</h2>
                                <div style={{fontSize:12,color:"#64748b"}}>{filtAppts.length} appointments</div>
                            </div>
                            {/* Filters */}
                            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
                                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                    {["All","Pending","Confirmed","Completed","Cancelled"].map(f=>(
                                        <button key={f} onClick={()=>setApptFilter(f)} style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:apptFilter===f?"#0d4f4f":"#f1f5f9",color:apptFilter===f?"white":"#64748b"}}>
                                            {f} {f!=="All"&&<span style={{fontSize:11}}>({appointments.filter(a=>a.status===f).length})</span>}
                                        </button>
                                    ))}
                                </div>
                                <input type="date" value={apptDate} onChange={e=>setApptDate(e.target.value)}
                                    style={{padding:"7px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"white",cursor:"pointer"}}/>
                                {apptDate&&<button onClick={()=>setApptDate("")} style={{padding:"7px 12px",borderRadius:10,border:"none",background:"#fee2e2",color:"#dc2626",fontSize:12,fontWeight:600,cursor:"pointer"}}>Clear Date</button>}
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:12}}>
                                {filtAppts.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#94a3b8",background:"white",borderRadius:16}}>No appointments found.</div>}
                                {filtAppts.map(a=>(
                                    <div key={a.id} style={{background:"white",borderRadius:16,padding:"16px 20px",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",border:`1px solid ${a.status==="Confirmed"?"#bfdbfe":a.status==="Pending"?"#fde68a":a.status==="Completed"?"#bbf7d0":"#fecaca"}`}}>
                                        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                                            <img src={a.patient_avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(a.patient_name)}&background=14b8a6&color=fff`} alt="" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid #e2e8f0"}}/>
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                                                    <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{a.patient_name}</div>
                                                    <Badge s={a.status}/>
                                                    {a.ai_risk&&<Badge s={a.ai_risk}/>}
                                                </div>
                                                <div style={{fontSize:12,color:"#64748b",marginBottom:6}}>
                                                    📅 {a.date} · ⏰ {a.time_slot} · {a.visit_type==="online"?"💻 Online":"🏥 In-Person"}
                                                </div>
                                                <div style={{fontSize:12,color:"#374151",background:"#f8fafc",padding:"8px 12px",borderRadius:8}}>
                                                    <strong>Problem:</strong> {a.problem||"Not specified"}
                                                </div>
                                                {a.notes&&<div style={{fontSize:12,color:"#374151",background:"#fffbeb",padding:"8px 12px",borderRadius:8,marginTop:6}}><strong>Notes:</strong> {a.notes}</div>}
                                                {a.ai_analysis&&<div style={{fontSize:11,color:"#374151",background:"#f5f3ff",padding:"8px 12px",borderRadius:8,marginTop:6,whiteSpace:"pre-wrap"}}><strong>🤖 AI:</strong> {a.ai_analysis.substring(0,200)}{a.ai_analysis.length>200?"...":""}</div>}
                                            </div>
                                        </div>
                                        {a.status!=="Completed"&&a.status!=="Cancelled"&&(
                                            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                                                <button onClick={()=>openAI(a)} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"linear-gradient(120deg,#6366f1,#8b5cf6)",color:"white",fontWeight:700,fontSize:12,cursor:"pointer"}}>🤖 AI Analysis</button>
                                                {a.status==="Pending"&&<button onClick={()=>updateAppt(a.id,"Confirmed")} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#dbeafe",color:"#1d4ed8",fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ Confirm</button>}
                                                {a.status==="Confirmed"&&<button onClick={()=>updateAppt(a.id,"Completed")} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#dcfce7",color:"#16a34a",fontWeight:700,fontSize:12,cursor:"pointer"}}>✔ Complete</button>}
                                                <button onClick={()=>updateAppt(a.id,"Cancelled","Cancelled by doctor.")} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer"}}>✕ Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ══ PATIENTS ══ */}
                    {active==="patients"&&(
                        <div>
                            <div style={{marginBottom:16}}>
                                <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>My Patients</h2>
                                <div style={{fontSize:12,color:"#64748b"}}>{patients.length} unique patients</div>
                            </div>
                            <div className="pt-grid">
                                {patients.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#94a3b8",background:"white",borderRadius:16}}>No patients yet. Appointments will appear here.</div>}
                                {patients.map(p=>(
                                    <div key={p.id} style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 1px 8px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",gap:12}}>
                                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                                            <img src={p.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=14b8a6&color=fff`} alt={p.name} style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:"2px solid #ccfbf1",flexShrink:0}}/>
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{p.name}</div>
                                                <div style={{fontSize:12,color:"#64748b"}}>{p.email}</div>
                                                <div style={{marginTop:4,display:"flex",gap:6,flexWrap:"wrap"}}>
                                                    <Badge s={p.latest_risk||"Low"}/>
                                                    <span style={{fontSize:11,fontWeight:600,color:"#0d4f4f",background:"#ccfbf1",padding:"2px 8px",borderRadius:20}}>{p.visit_count} visits</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 10px",fontSize:11}}>
                                            {[["Age",p.age||"?"],["Blood",p.blood_type||"?"],["Last Visit",p.last_visit?.split('T')[0]||"N/A"],["Condition",p.condition_||"None"]].map(([l,v])=>(
                                                <div key={l}><div style={{fontSize:10,color:"#94a3b8"}}>{l}</div><div style={{fontWeight:700,color:"#0f172a"}}>{v}</div></div>
                                            ))}
                                        </div>
                                        <button onClick={()=>setPtDetail(p)} style={{padding:"8px",borderRadius:9,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",fontWeight:700,fontSize:12,cursor:"pointer"}}>👤 View Details</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ══ PROFILE ══ */}
                    {active==="profile"&&(
                        <div>
                            <div style={{marginBottom:20}}>
                                <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>My Profile</h2>
                                <div style={{fontSize:12,color:"#64748b"}}>Update your information and photo</div>
                            </div>
                            <div style={{background:"white",borderRadius:20,padding:"24px",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                {/* Photo */}
                                <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24,padding:"20px",background:"linear-gradient(120deg,#f0fdf9,#ccfbf1)",borderRadius:16}}>
                                    <div style={{position:"relative"}}>
                                        <img src={profPrev||`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.name||"Dr")}&background=14b8a6&color=fff&size=100`} alt=""
                                            style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",border:"4px solid #14b8a6",flexShrink:0}}/>
                                        <button onClick={()=>profRef.current.click()} style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:"#0d4f4f",border:"2px solid white",color:"white",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>📷</button>
                                        <input ref={profRef} type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setProfImg(f);setProfPrev(URL.createObjectURL(f));}}} style={{display:"none"}}/>
                                    </div>
                                    <div>
                                        <div style={{fontWeight:800,fontSize:18,color:"#0d4f4f"}}>{doctor?.name}</div>
                                        <div style={{fontSize:13,color:"#0d9488"}}>{doctor?.specialty}</div>
                                        <div style={{fontSize:12,color:"#475569",marginTop:4}}>ID: <strong>{doctor?.doctor_id}</strong></div>
                                    </div>
                                </div>
                                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="prof-grid">
                                    <Inp label="Full Name" value={profForm.name} onChange={e=>setProfForm(p=>({...p,name:e.target.value}))} placeholder="Dr. John Smith"/>
                                    <Inp label="Specialty" value={profForm.specialty} onChange={e=>setProfForm(p=>({...p,specialty:e.target.value}))} placeholder="Cardiology"/>
                                    <Inp label="Experience" value={profForm.experience} onChange={e=>setProfForm(p=>({...p,experience:e.target.value}))} placeholder="5 yrs"/>
                                    <Inp label="Consultation Fee ($)" type="number" value={profForm.fee} onChange={e=>setProfForm(p=>({...p,fee:e.target.value}))} placeholder="100"/>
                                    <Inp label="Phone" value={profForm.phone} onChange={e=>setProfForm(p=>({...p,phone:e.target.value}))} placeholder="+92-300-0000000"/>
                                    <div style={{display:"flex",alignItems:"flex-end"}}>
                                        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"9px 14px",fontSize:12,color:"#065f46",fontWeight:600,width:"100%",boxSizing:"border-box"}}>
                                            ✉️ {doctor?.email}
                                            <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>Email cannot be changed</div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={saveProfile} disabled={loading} style={{marginTop:20,width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                                    {loading?"Saving...":"💾 Save Profile"}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @media(min-width:769px){
                    .dr-sidebar{position:sticky !important;top:0 !important;height:100vh !important;}
                    .hamburger-dr{display:none !important;}
                    .dr-body{padding:22px 28px !important;}
                    .stat4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
                    .pt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
                    .sch-grid{grid-template-columns:1fr 1fr 1fr !important;}
                    .prof-grid{grid-template-columns:1fr 1fr !important;}
                }
                @media(max-width:768px){
                    .dr-sidebar{transform:translateX(-100%);transition:transform 0.25s ease;}
                    .stat4{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
                    .pt-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
                    .sch-grid{grid-template-columns:1fr 1fr !important;}
                    .prof-grid{grid-template-columns:1fr !important;}
                }
                @media(max-width:480px){.pt-grid{grid-template-columns:1fr;}}
                div::-webkit-scrollbar{width:4px;height:4px;}
                div::-webkit-scrollbar-thumb{background:#ccfbf1;border-radius:4px;}
                @keyframes slideIn{from{transform:translateX(20px);opacity:0;}to{transform:translateX(0);opacity:1;}}
            `}</style>
        </div>
    );
}