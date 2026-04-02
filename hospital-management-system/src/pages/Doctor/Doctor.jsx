import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API       = "http://localhost:5000/api/doctor";
const GROQ_URL  = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY  = process.env.REACT_APP_GROQ_KEY || "";

const api = async (url, method="GET", body=null, isForm=false) => {
    const token = localStorage.getItem("hospital_token_doctor");
    if (!token) { window.location.href = "/login"; return { success:false, message:"Not logged in." }; }
    const opts  = { method, headers:{ Authorization:`Bearer ${token}` } };
    if (body) {
        if (isForm) opts.body = body;
        else { opts.headers["Content-Type"]="application/json"; opts.body=JSON.stringify(body); }
    }
    const res  = await fetch(`${API}${url}`, opts);
    const data = await res.json();
    if (res.status === 401) {
        localStorage.removeItem("hospital_token_doctor");
        localStorage.removeItem("hospital_user_doctor");
        window.location.href = "/login";
        return { success:false, message:"Session expired. Please login again." };
    }
    return data;
};

// Groq AI helper — medical analysis
const aiCall = async (system, messages, max_tokens=800) => {
    if (!GROQ_KEY) return "AI key not configured. Add REACT_APP_GROQ_KEY in .env";
    const msgs = [
        { role:"system", content: system },
        ...messages.map(m=>({
            role:    m.role==="assistant"||m.role==="model" ? "assistant" : "user",
            content: m.content || m.text || ""
        }))
    ];
    try {
        const res = await fetch(GROQ_URL, {
            method:"POST",
            headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${GROQ_KEY}` },
            body: JSON.stringify({ model:"llama-3.3-70b-versatile", messages:msgs, max_tokens, temperature:0.7 })
        });
        const d = await res.json();
        if(d.error) return `AI Error: ${d.error.message}`;
        return d.choices?.[0]?.message?.content || "No response.";
    } catch { return "AI service unavailable."; }
};

/* ── Helpers ── */
const fmtDate = d => { if(!d) return "—"; const dt = new Date(d+"T00:00:00"); return dt.toLocaleDateString("en-PK",{weekday:"short",day:"numeric",month:"short",year:"numeric"}); };
const fmtTime = t => { if(!t) return "—"; const[h,m]=t.split(":"); const hh=parseInt(h); return `${hh>12?hh-12:hh||12}:${m} ${hh>=12?"PM":"AM"}`; };
const uiAv    = (name,bg="14b8a6") => `https://ui-avatars.com/api/?name=${encodeURIComponent(name||"P")}&background=${bg}&color=fff`;
const todayStr = () => new Date().toISOString().split("T")[0];

const STATUS_CLR = {Active:["#dcfce7","#16a34a"],"On Leave":["#fef9c3","#ca8a04"],Inactive:["#fee2e2","#dc2626"],Confirmed:["#dbeafe","#1d4ed8"],Pending:["#fef9c3","#b45309"],Completed:["#dcfce7","#16a34a"],Cancelled:["#fee2e2","#dc2626"],Low:["#dcfce7","#16a34a"],Medium:["#fef9c3","#ca8a04"],High:["#fee2e2","#dc2626"]};
const Badge = ({s}) => { const[bg,tc]=STATUS_CLR[s]||["#f1f5f9","#64748b"]; return <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:bg,color:tc,whiteSpace:"nowrap"}}>{s}</span>; };
const Toast = ({msg,ok}) => <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:ok?"#10b981":"#ef4444",color:"white",padding:"12px 20px",borderRadius:12,fontWeight:700,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>{ok?"✅":"❌"} {msg}</div>;
const Dots  = () => <div style={{display:"flex",gap:5,padding:"10px 14px",background:"#f1f5f9",borderRadius:"4px 14px 14px 14px"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#0d4f4f",animation:`bounce 1s infinite ${i*0.15}s`}}/>)}</div>;

const Inp = ({label,value,onChange,type="text",placeholder="",hint=""}) => (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}{hint&&<span style={{fontWeight:400,color:"#94a3b8",fontSize:11}}> {hint}</span>}</label>
        <input type={type} value={value||""} onChange={onChange} placeholder={placeholder}
            style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%",boxSizing:"border-box"}}/>
    </div>
);
const Sel = ({label,value,onChange,options}) => (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label>
        <select value={value||""} onChange={onChange} style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%"}}>
            {options.map(o=><option key={o}>{o}</option>)}
        </select>
    </div>
);
const Toggle = ({val,onToggle}) => (
    <div onClick={onToggle} style={{width:44,height:24,borderRadius:20,background:val?"#0d9488":"#e2e8f0",position:"relative",cursor:"pointer",transition:"all 0.2s",flexShrink:0}}>
        <div style={{position:"absolute",top:2,width:20,height:20,borderRadius:"50%",background:"white",transition:"all 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",left:val?22:2}}/>
    </div>
);
const Modal = ({title,onClose,children,maxW=580}) => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"white",borderRadius:20,width:"100%",maxWidth:maxW,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.3)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"white"}}>
                <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>{title}</div>
                <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
            <div style={{padding:"20px 22px"}}>{children}</div>
        </div>
    </div>
);

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const NAV  = [{id:"dashboard",icon:"⊞",label:"Dashboard"},{id:"schedule",icon:"📅",label:"Schedule"},{id:"appointments",icon:"🗂️",label:"Appointments"},{id:"patients",icon:"👥",label:"Patients"},{id:"profile",icon:"👤",label:"Profile"}];

/* ══ ONLINE CONSULTATION MODAL ══ */
function OnlineConsultModal({ appt, onClose, onSaveAI }) {
    const [tab,     setTab]     = useState("chat");
    const [msgs,    setMsgs]    = useState([]);
    const [input,   setInput]   = useState("");
    const [sending, setSending] = useState(false);
    const [aiText,  setAiText]  = useState(appt.ai_analysis||"");
    const [aiRisk,  setAiRisk]  = useState(appt.ai_risk||"Low");
    const [aiLoad,  setAiLoad]  = useState(false);
    const chatRef   = useRef();
    const pollRef   = useRef();
    const lastIdRef = useRef(0);

    const drToken = localStorage.getItem("hospital_token_doctor");
    const CHAT    = `http://localhost:5000/api/chat/${appt.id}`;

    const ptAv = appt.patient_avatar ? `http://localhost:5000${appt.patient_avatar}` : uiAv(appt.patient_name);
    const drAv = uiAv(appt.doctor_name||"Dr","0d4f4f");
    const fmtT = (ts) => new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

    // Fetch messages from DB
    const fetchMsgs = async () => {
        try {
            const res  = await fetch(CHAT, { headers:{ Authorization:`Bearer ${drToken}` }});
            const data = await res.json();
            if(data.success && data.messages) {
                setMsgs(data.messages);
                if(data.messages.length) lastIdRef.current = data.messages[data.messages.length-1].id;
            }
        } catch {}
    };

    // Load messages + start polling every 3 seconds
    useEffect(()=>{
        fetchMsgs();
        pollRef.current = setInterval(fetchMsgs, 3000);
        return ()=> clearInterval(pollRef.current);
    },[appt.id]);

    useEffect(()=>{ chatRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

    // Doctor sends message to DB
    const sendMsg = async () => {
        const msg = input.trim();
        if(!msg || sending) return;
        setSending(true);
        setInput("");
        try {
            await fetch(CHAT, {
                method:"POST",
                headers:{ "Content-Type":"application/json", Authorization:`Bearer ${drToken}` },
                body: JSON.stringify({ message: msg })
            });
            await fetchMsgs(); // refresh immediately
        } catch {}
        setSending(false);
    };

    const generateAI = async () => {
        setAiLoad(true);
        try {
            // ✅ FIXED
            const chat = msgs.map(m=>`${m.sender_role==="doctor"?"Doctor":"Patient"}: ${m.message}`).join("\n");
            const text = await aiCall(
                `You are a clinical AI assistant. Based on the doctor-patient consultation below, write a structured medical assessment.
Start with "Risk Level: Low / Medium / High".
Then provide: Clinical Summary, Key Observations, Recommended Next Steps.
Max 180 words. Professional medical tone.`,
                [{role:"user",content:`Specialty: ${appt.specialty||"General Medicine"}
Patient: ${appt.patient_name}, Age: ${appt.age||"?"}, Gender: ${appt.gender||"?"}, Blood: ${appt.blood_type||"?"}
Chief Complaint: ${appt.problem}
Known Condition: ${appt.condition||"None"}

Consultation Transcript:
${chat}`}]
            );
            const m = text.match(/Risk Level:\s*(Low|Medium|High)/i);
            if(m) setAiRisk(m[1]);
            setAiText(text);
        } catch { setAiText("⚠️ Could not generate analysis."); }
        setAiLoad(false);
    };

    const saveClose = async () => {
        if(aiText) await onSaveAI(appt.id, aiText, aiRisk);
        onClose();
    };

    return (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
            <div style={{background:"white",borderRadius:20,width:"100%",maxWidth:860,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",overflow:"hidden"}}>
                {/* Header */}
                <div style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <img src={ptAv} alt="" style={{width:42,height:42,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.4)"}}/>
                        <div>
                            <div style={{color:"white",fontWeight:800,fontSize:15}}>{appt.patient_name}</div>
                            <div style={{color:"rgba(255,255,255,0.75)",fontSize:12}}>Age {appt.age||"?"} · {appt.blood_type||"?"} · 💻 Online Consultation</div>
                        </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <div style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:700,color:"white"}}>
                            👨‍⚕️ Doctor Mode
                        </div>
                        <button onClick={saveClose} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    </div>
                </div>
                {/* Tabs */}
                <div style={{display:"flex",borderBottom:"2px solid #f1f5f9",flexShrink:0}}>
                    {[["chat","💬 Consultation","Live chat with patient"],["ai","🧠 AI Analysis","Clinical assessment"]].map(([id,label,sub])=>(
                        <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px 8px",border:"none",cursor:"pointer",background:tab===id?"white":"#f8fafc",borderBottom:tab===id?"2px solid #0d4f4f":"2px solid transparent"}}>
                            <div style={{fontWeight:700,fontSize:13,color:tab===id?"#0d4f4f":"#64748b"}}>{label}</div>
                            <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{sub}</div>
                        </button>
                    ))}
                </div>
                <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                    {/* Chat Tab — DB backed real-time polling */}
                    {tab==="chat"&&(
                        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                            <div style={{background:"#f0fdf4",padding:"8px 16px",borderBottom:"1px solid #dcfce7",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                                <div style={{width:8,height:8,borderRadius:"50%",background:"#16a34a",animation:"pulse 2s infinite"}}/>
                                <span style={{fontSize:12,color:"#15803d",fontWeight:600}}>
                                    Live Chat · {fmtDate(appt.date)} {fmtTime(appt.time_slot)}
                                </span>
                                <span style={{marginLeft:"auto",fontSize:11,color:"#064e3b",background:"#dcfce7",padding:"2px 10px",borderRadius:20,fontWeight:600}}>
                                    👨‍⚕️ Doctor
                                </span>
                            </div>
                            <div style={{background:"#fffbeb",padding:"7px 16px",borderBottom:"1px solid #fde68a",fontSize:12,color:"#92400e",flexShrink:0}}>
                                <strong>Problem:</strong> {appt.problem}
                                {appt.age&&<span> · Age {appt.age}</span>}
                                {appt.blood_type&&<span> · 🩸 {appt.blood_type}</span>}
                            </div>
                            <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:12,background:"#f8fafc"}}>
                                {msgs.length===0&&(
                                    <div style={{textAlign:"center",color:"#94a3b8",fontSize:13,padding:"30px 0"}}>
                                        No messages yet. Start the consultation!
                                    </div>
                                )}
                                {msgs.map((m)=>{
                                    const isMe = m.sender_role==="doctor";
                                    return (
                                        <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",alignItems:"flex-end",gap:8}}>
                                            {!isMe&&<img src={ptAv} alt="" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid #e2e8f0"}}/>}
                                            <div style={{maxWidth:"75%"}}>
                                                {!isMe&&<div style={{fontSize:11,color:"#64748b",marginBottom:3,fontWeight:600}}>{m.sender_name}</div>}
                                                <div style={{
                                                    padding:"11px 15px",fontSize:13,lineHeight:1.6,
                                                    borderRadius:isMe?"14px 4px 14px 14px":"4px 14px 14px 14px",
                                                    background:isMe?"#0d4f4f":"white",
                                                    color:isMe?"white":"#1e293b",
                                                    boxShadow:isMe?"none":"0 1px 4px rgba(0,0,0,0.06)",
                                                    border:isMe?"none":"1px solid #f1f5f9"
                                                }}>{m.message}</div>
                                                <div style={{fontSize:10,color:"#94a3b8",marginTop:3,textAlign:isMe?"right":"left"}}>{fmtT(m.created_at)}</div>
                                            </div>
                                            {isMe&&<img src={drAv} alt="" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid #0d4f4f"}}/>}
                                        </div>
                                    );
                                })}
                                <div ref={chatRef}/>
                            </div>
                            <div style={{padding:"10px 14px",borderTop:"1px solid #f1f5f9",display:"flex",gap:8,alignItems:"center",flexShrink:0,background:"white"}}>
                                <img src={drAv} alt="" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid #0d4f4f"}}/>
                                <input
                                    placeholder="Write your message to patient..."
                                    value={input}
                                    onChange={e=>setInput(e.target.value)}
                                    onKeyDown={e=>e.key==="Enter"&&sendMsg()}
                                    disabled={sending}
                                    style={{flex:1,padding:"10px 14px",borderRadius:12,border:"1.5px solid #0d4f4f",fontSize:13,outline:"none",background:"#f8fafc"}}
                                />
                                <button onClick={sendMsg} disabled={!input.trim()||sending} style={{background:input.trim()&&!sending?"#0d4f4f":"#e2e8f0",color:input.trim()&&!sending?"white":"#94a3b8",border:"none",borderRadius:12,padding:"10px 16px",cursor:"pointer",fontWeight:700,fontSize:14,transition:"all 0.2s"}}>
                                    {sending?"...":"➤"}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* AI Tab */}
                    {tab==="ai"&&(
                        <div style={{flex:1,overflowY:"auto",padding:"18px 20px"}}>
                            {/* Patient summary */}
                            <div style={{background:"#f0fdfb",borderRadius:12,padding:"14px 16px",marginBottom:16,border:"1px solid #ccfbf1"}}>
                                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                                    <img src={ptAv} alt="" style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                                    <div>
                                        <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{appt.patient_name}</div>
                                        <div style={{fontSize:12,color:"#64748b"}}>Age {appt.age||"?"} · {appt.gender||"?"} · Blood {appt.blood_type||"?"}  · {appt.condition||"No prior condition"}</div>
                                    </div>
                                </div>
                                <div style={{fontSize:12,color:"#374151",background:"white",padding:"10px 12px",borderRadius:8,border:"1px solid #e2e8f0"}}><strong>Problem:</strong> {appt.problem}</div>
                            </div>
                            {/* Risk selector */}
                            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                                <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>Risk Level:</div>
                                <div style={{display:"flex",gap:6}}>
                                    {["Low","Medium","High"].map(r=>(
                                        <button key={r} onClick={()=>setAiRisk(r)} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,background:aiRisk===r?(r==="Low"?"#16a34a":r==="Medium"?"#d97706":"#dc2626"):"#f1f5f9",color:aiRisk===r?"white":"#64748b"}}>
                                            {r==="Low"?"🟢":r==="Medium"?"🟡":"🔴"} {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Analysis textarea */}
                            <div style={{marginBottom:12}}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                                    <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>AI Clinical Analysis</label>
                                    <button onClick={generateAI} disabled={aiLoad} style={{background:aiLoad?"#e2e8f0":"linear-gradient(120deg,#6366f1,#8b5cf6)",color:aiLoad?"#94a3b8":"white",border:"none",borderRadius:10,padding:"7px 16px",fontWeight:700,fontSize:12,cursor:aiLoad?"not-allowed":"pointer"}}>
                                        {aiLoad?"🔄 Analyzing...":"🤖 Generate AI"}
                                    </button>
                                </div>
                                <textarea value={aiText} onChange={e=>setAiText(e.target.value)} rows={8} placeholder="Click 🤖 Generate AI to create clinical assessment, or type manually..." style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box",background:"#f8fafc",lineHeight:1.7}}/>
                            </div>
                            <button onClick={saveClose} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                                💾 Save Analysis & Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </div>
    );
}

/* ══ PATIENT DETAIL MODAL ══ */
function PatientDetailModal({ patient, appointments, onClose }) {
    const [tab, setTab] = useState("info");
    const ptAv = patient.avatar ? `http://localhost:5000${patient.avatar}` : (patient.patient_avatar ? `http://localhost:5000${patient.patient_avatar}` : uiAv(patient.name));
    const ptAppts = patient.appts || appointments.filter(a=>a.patient_id===patient.id || a.patient_id===patient.patient_id);

    return (
        <Modal title="👤 Patient Details" onClose={onClose} maxW={620}>
            {/* Patient header */}
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,background:"linear-gradient(120deg,#f0fdfb,#ccfbf1)",borderRadius:14,padding:"14px 16px"}}>
                <img src={ptAv} alt={patient.name} style={{width:64,height:64,borderRadius:"50%",objectFit:"cover",border:"3px solid #14b8a6",flexShrink:0}}/>
                <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:17,color:"#0f172a"}}>{patient.name}</div>
                    <div style={{fontSize:13,color:"#64748b",marginTop:2}}>{patient.email}</div>
                    <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
                        <Badge s={patient.latest_risk||"Low"}/>
                        <span style={{fontSize:11,fontWeight:700,color:"#0d4f4f",background:"#ccfbf1",padding:"3px 10px",borderRadius:20}}>
                            {patient.visit_count||0} visit{patient.visit_count!==1?"s":""}
                        </span>
                        {patient.blood_type&&<span style={{fontSize:11,fontWeight:700,color:"#dc2626",background:"#fee2e2",padding:"3px 10px",borderRadius:20}}>🩸 {patient.blood_type}</span>}
                    </div>
                </div>
            </div>
            {/* Tabs */}
            <div style={{display:"flex",gap:6,marginBottom:16}}>
                {[["info","📋 Info"],["appointments","📅 Appointments"]].map(([id,label])=>(
                    <button key={id} onClick={()=>setTab(id)} style={{padding:"7px 16px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:tab===id?"#0d4f4f":"#f1f5f9",color:tab===id?"white":"#64748b"}}>
                        {label}
                    </button>
                ))}
            </div>
            {/* Info Tab */}
            {tab==="info"&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[
                        ["Full Name",     patient.name],
                        ["Email",         patient.email],
                        ["Age",           patient.age ? `${patient.age} years` : "Not set"],
                        ["Gender",        patient.gender||"Not set"],
                        ["Blood Type",    patient.blood_type||"Not set"],
                        ["Phone",         patient.phone || patient.patient_phone || "Not set"],
                        ["Condition",     patient.condition_ || patient.condition || "None listed"],
                        ["Last Visit",    patient.last_visit ? fmtDate(patient.last_visit.split("T")[0]) : "N/A"],
                    ].map(([l,v])=>(
                        <div key={l} style={{background:"#f8fafc",borderRadius:10,padding:"10px 14px"}}>
                            <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginBottom:3}}>{l}</div>
                            <div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{v}</div>
                        </div>
                    ))}
                </div>
            )}
            {/* Appointments Tab */}
            {tab==="appointments"&&(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {ptAppts.length===0
                        ? <div style={{textAlign:"center",padding:"30px",color:"#94a3b8"}}>No appointments found.</div>
                        : ptAppts.map(a=>(
                            <div key={a.id} style={{border:`1px solid ${a.status==="Confirmed"?"#bfdbfe":a.status==="Pending"?"#fde68a":a.status==="Completed"?"#bbf7d0":"#fecaca"}`,borderRadius:12,padding:"12px 14px"}}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:6}}>
                                    <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{fmtDate(a.date)} · {fmtTime(a.time_slot)}</div>
                                    <div style={{display:"flex",gap:6}}>
                                        <Badge s={a.status}/>
                                        <span style={{fontSize:11,fontWeight:600,color:a.visit_type==="online"?"#0284c7":"#0d4f4f"}}>{a.visit_type==="online"?"💻":"🏥"}</span>
                                    </div>
                                </div>
                                <div style={{fontSize:12,color:"#475569"}}><strong>Problem:</strong> {a.problem}</div>
                                {a.ai_analysis&&<div style={{fontSize:11,color:"#6366f1",marginTop:6,background:"#f5f3ff",padding:"6px 10px",borderRadius:8}}>🤖 {a.ai_analysis.substring(0,100)}...</div>}
                            </div>
                        ))
                    }
                </div>
            )}
        </Modal>
    );
}

/* ══ MAIN DOCTOR DASHBOARD ══ */
export default function DoctorDashboard() {
    const navigate = useNavigate();
    const [active,      setActive]      = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast,       setToast]       = useState(null);
    const [loading,     setLoading]     = useState(false);

    const [doctor,       setDoctor]       = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [patients,     setPatients]     = useState([]);
    const [schEdit,      setSchEdit]      = useState([]);

    const [apptFilter,  setApptFilter]  = useState("All");
    const [apptDate,    setApptDate]    = useState("");
    const [aiModal,     setAiModal]     = useState(null);
    const [onlineModal, setOnlineModal] = useState(null);
    const [ptModal,     setPtModal]     = useState(null);
    const [statusModal, setStatusModal] = useState(false);
    const [profForm,    setProfForm]    = useState({});
    const [profImg,     setProfImg]     = useState(null);
    const [profPrev,    setProfPrev]    = useState(null);
    const profRef = useRef();

    const user      = JSON.parse(localStorage.getItem("hospital_user_doctor")||"{}");
    const showToast = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

    /* ── Load ── */
    const loadAll = async () => {
        const [d,a,p,s] = await Promise.all([
            api('/profile'), api('/appointments'), api('/patients'), api('/schedule')
        ]);
        if(d.success) {
            setDoctor(d.doctor);
            setProfForm({name:d.doctor.name,specialty:d.doctor.specialty,experience:d.doctor.experience||"",fee:d.doctor.fee||"",phone:d.doctor.phone||"",newPassword:"",confirmPass:""});
            setProfPrev(d.doctor.avatar?(d.doctor.avatar.startsWith("http")?d.doctor.avatar:`http://localhost:5000${d.doctor.avatar}`):null);
        }
        if(a.success) setAppointments(a.appointments);
        if(p.success) setPatients(p.patients);
        if(s.success) {
            const ex={};
            s.schedule.forEach(r=>ex[r.day]=r);
            setSchEdit(DAYS.map(day=>ex[day]?{...ex[day]}:{day,start_time:"09:00",end_time:"17:00",break_start:"13:00",break_end:"14:00",slot_duration:30,is_available:false}));
        } else {
            setSchEdit(DAYS.map(day=>({day,start_time:"09:00",end_time:"17:00",break_start:"13:00",break_end:"14:00",slot_duration:30,is_available:false})));
        }
    };
    useEffect(()=>{ loadAll(); },[]);

    /* ── Actions ── */
    const saveSchedule = async () => {
        setLoading(true);
        const data = await api('/schedule','POST',{schedule:schEdit});
        setLoading(false);
        if(data.success) { showToast(data.message); loadAll(); }
        else showToast(data.message,false);
    };

    const saveProfile = async () => {
        if(profForm.newPassword && profForm.newPassword !== profForm.confirmPass) {
            showToast("Passwords do not match.",false); return;
        }
        if(profForm.newPassword && profForm.newPassword.length < 6) {
            showToast("Password must be at least 6 characters.",false); return;
        }
        setLoading(true);
        const fd=new FormData();
        ["name","specialty","experience","fee","phone"].forEach(k=>{ if(profForm[k]!==null&&profForm[k]!=="") fd.append(k,profForm[k]); });
        if(profForm.newPassword) fd.append("newPassword", profForm.newPassword);
        if(profImg) fd.append("avatar",profImg);
        const data=await api('/profile','PUT',fd,true);
        setLoading(false);
        if(data.success) { showToast(data.message); setProfForm(p=>({...p,newPassword:"",confirmPass:""})); loadAll(); }
        else showToast(data.message,false);
    };

    const setDrStatus = async (status) => {
        const data=await api('/status','PUT',{status});
        setStatusModal(false);
        if(data.success) { showToast(data.message); loadAll(); }
        else showToast(data.message,false);
    };

    const updateAppt = async (id,status,cancel_reason="") => {
        const data=await api(`/appointments/${id}/status`,'PUT',{status,cancel_reason});
        if(data.success) { showToast(data.message); loadAll(); }
        else showToast(data.message,false);
    };

    const saveAI = async (id,ai_analysis,ai_risk) => {
        await api(`/appointments/${id}/analysis`,'PUT',{ai_analysis,ai_risk});
        showToast("Analysis saved!");
        loadAll();
    };

    const updSch = (i,key,val) => setSchEdit(prev=>{ const n=[...prev]; n[i]={...n[i],[key]:val}; return n; });

    /* ── Derived ── */
    const today = todayStr();

    // Today's appointments
    const todayAppts = appointments.filter(a => {
        const aDate = a.date || a.appointment_date || "";
        return aDate === today || a.created_at?.startsWith(today);
    });

    const filtAppts = appointments.filter(a => {
        const ms = apptFilter==="All" || a.status===apptFilter;
        const md = !apptDate || a.date===apptDate || a.appointment_date===apptDate;
        return ms && md;
    });

    // Build unique patient list from appointments (single source of truth)
    // appointments already contain: patient_name, age, gender, blood_type, patient_phone, condition, patient_avatar, patient_id
    // patients API gives us: email + visit_count + last_visit + latest_risk
    // We merge them by patient_id
    const derivedPatients = (() => {
        const map = new Map(); // patient_id -> merged object
        // First pass: group appointments by patient_id
        appointments
          .filter(a => a.status !== "Cancelled")
          .forEach(a => {
            const pid = a.patient_id;
            if (!pid) return;
            if (!map.has(pid)) {
                map.set(pid, {
                    id:           pid,
                    patient_id:   pid,
                    name:         a.patient_name   || "Unknown",
                    age:          a.age,
                    gender:       a.gender,
                    blood_type:   a.blood_type,
                    phone:        a.patient_phone,
                    condition_:   a.condition,
                    avatar:       a.patient_avatar,
                    email:        null,
                    visit_count:  0,
                    latest_risk:  null,
                    last_visit:   null,
                    appts:        [],
                });
            }
            const p = map.get(pid);
            p.visit_count++;
            p.appts.push(a);
            // Track latest risk
            if (a.ai_risk && (!p.latest_risk || a.ai_risk === "High")) p.latest_risk = a.ai_risk;
            // Track last visit date
            const aDate = a.date || a.appointment_date || "";
            if (aDate && (!p.last_visit || aDate > p.last_visit)) p.last_visit = aDate;
        });
        // Second pass: merge email from patients API array (match by id)
        patients.forEach(pt => {
            if (map.has(pt.id)) {
                const p = map.get(pt.id);
                p.email       = pt.email       || p.email;
                p.latest_risk = pt.latest_risk || p.latest_risk;
            }
        });
        return Array.from(map.values()).sort((a,b) => (b.last_visit||"") > (a.last_visit||"") ? 1 : -1);
    })();

    const stats = {
        today:     todayAppts.length,
        pending:   appointments.filter(a=>a.status==="Pending").length,
        confirmed: appointments.filter(a=>a.status==="Confirmed").length,
        online:    appointments.filter(a=>a.visit_type==="online"&&(a.status==="Pending"||a.status==="Confirmed")).length,
    };

    const drAv = doctor?.avatar?(doctor.avatar.startsWith("http")?doctor.avatar:`http://localhost:5000${doctor.avatar}`):uiAv(doctor?.name||"Dr","0d4f4f");

    return (
        <div style={{display:"flex",minHeight:"100vh",background:"#f0f7f6",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
            {toast && <Toast {...toast}/>}

            {/* Status Modal */}
            {statusModal&&(
                <Modal title="🔄 Change Availability" onClose={()=>setStatusModal(false)} maxW={380}>
                    <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>⚠️ Setting Inactive/On Leave will auto-cancel future appointments.</p>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        {["Active","On Leave","Inactive"].map(s=>(
                            <button key={s} onClick={()=>setDrStatus(s)} style={{padding:"13px",borderRadius:12,border:`2px solid ${doctor?.status===s?"#0d4f4f":"#e2e8f0"}`,background:doctor?.status===s?"#0d4f4f":"white",color:doctor?.status===s?"white":"#374151",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                                <span>{s==="Active"?"🟢":s==="On Leave"?"🟡":"🔴"}</span>{s}
                                {doctor?.status===s&&<span style={{marginLeft:"auto",fontSize:11}}>Current</span>}
                            </button>
                        ))}
                    </div>
                </Modal>
            )}

            {/* Online Consultation Modal */}
            {onlineModal&&<OnlineConsultModal appt={onlineModal} onClose={()=>setOnlineModal(null)} onSaveAI={saveAI}/>}

            {/* AI Analysis Modal (for in-person) */}
            {aiModal&&(
                <Modal title="🤖 AI Patient Analysis" onClose={()=>setAiModal(null)} maxW={600}>
                    <div style={{background:"#f0fdfb",borderRadius:12,padding:"12px 16px",marginBottom:16,border:"1px solid #ccfbf1"}}>
                        <div style={{fontWeight:700,fontSize:14,color:"#065f46"}}>{aiModal.patient_name}</div>
                        <div style={{fontSize:12,color:"#6b7280",marginTop:4}}>Age {aiModal.age||"?"} · {aiModal.gender||"?"} · Blood {aiModal.blood_type||"?"}</div>
                        <div style={{fontSize:12,color:"#374151",marginTop:6,background:"white",padding:"8px 12px",borderRadius:8,border:"1px solid #e2e8f0"}}><strong>Problem:</strong> {aiModal.problem}</div>
                    </div>
                    <div style={{fontSize:12,color:"#475569",marginBottom:14}}><strong>Condition:</strong> {aiModal.condition||"None listed"}</div>
                    <textarea value={aiModal._analysis||aiModal.ai_analysis||""} onChange={e=>setAiModal(m=>({...m,_analysis:e.target.value}))} rows={6} placeholder="AI analysis will appear here..." style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box",background:"#f8fafc",lineHeight:1.7,marginBottom:12}}/>
                    <div style={{display:"flex",gap:10}}>
                        <button onClick={async()=>{
                            const text=await aiCall(
                                `You are a clinical AI. Analyze this patient's appointment. Start with "Risk Level: Low/Medium/High". Include: Summary, Observations, Recommendations. Max 120 words.`,
                                [{role:"user",content:`Patient: ${aiModal.patient_name}, Age: ${aiModal.age||"?"}, Blood: ${aiModal.blood_type||"?"}, Condition: ${aiModal.condition||"none"}\nProblem: ${aiModal.problem}`}]
                            );
                            setAiModal(m=>({...m,_analysis:text}));
                        }} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#6366f1,#8b5cf6)",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                            🤖 Generate AI
                        </button>
                        <button onClick={async()=>{ await saveAI(aiModal.id,aiModal._analysis||aiModal.ai_analysis||"","Low"); setAiModal(null); }} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                            💾 Save
                        </button>
                    </div>
                </Modal>
            )}

            {/* Patient Detail Modal */}
            {ptModal&&<PatientDetailModal patient={ptModal} appointments={appointments} onClose={()=>setPtModal(null)}/>}

            {/* Mobile overlay */}
            {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:40}}/>}

            {/* ══ SIDEBAR ══ */}
            <div style={{width:220,flexShrink:0,background:"linear-gradient(180deg,#0d4f4f,#0a3d3d)",display:"flex",flexDirection:"column",padding:"20px 0",position:"fixed",top:0,left:0,bottom:0,zIndex:50}} className="dr-sidebar">
                <div style={{padding:"0 16px 18px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:36,height:36,borderRadius:10,background:"#14b8a6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🏥</div>
                        <div><div style={{color:"white",fontWeight:800,fontSize:15}}>DocPortal</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:10}}>Hospital System</div></div>
                    </div>
                </div>
                {/* Doctor card */}
                <div style={{margin:"12px",background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <img src={drAv} alt="" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.25)",flexShrink:0}}/>
                        <div style={{minWidth:0}}>
                            <div style={{color:"white",fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{doctor?.name||user.name}</div>
                            <div style={{color:"rgba(255,255,255,0.5)",fontSize:10}}>{doctor?.specialty||"Specialist"}</div>
                        </div>
                    </div>
                    <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <Badge s={doctor?.status||"Active"}/>
                        <button onClick={()=>setStatusModal(true)} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"4px 10px",color:"rgba(255,255,255,0.7)",fontSize:11,cursor:"pointer",fontWeight:600}}>Change</button>
                    </div>
                    {stats.online>0&&<div style={{marginTop:8,background:"rgba(99,102,241,0.3)",borderRadius:8,padding:"6px 10px",fontSize:11,color:"#a5b4fc",fontWeight:700,textAlign:"center"}}>
                        💻 {stats.online} online appointment{stats.online>1?"s":""}
                    </div>}
                </div>
                {/* Nav */}
                <div style={{padding:"0 10px",flex:1,display:"flex",flexDirection:"column",gap:4}}>
                    {NAV.map(item=>(
                        <button key={item.id} onClick={()=>{setActive(item.id);setSidebarOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:"none",cursor:"pointer",background:active===item.id?"rgba(20,184,166,0.25)":"transparent",borderLeft:active===item.id?"3px solid #14b8a6":"3px solid transparent",color:active===item.id?"white":"rgba(255,255,255,0.6)",fontSize:13,fontWeight:600,transition:"all 0.2s",textAlign:"left"}}>
                            <span style={{fontSize:17}}>{item.icon}</span>{item.label}
                            {item.id==="appointments"&&stats.pending>0&&<span style={{marginLeft:"auto",background:"#f59e0b",borderRadius:"50%",minWidth:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"white",fontWeight:800}}>{stats.pending}</span>}
                            {item.id==="patients"&&derivedPatients.length>0&&<span style={{marginLeft:"auto",background:"rgba(20,184,166,0.4)",borderRadius:20,padding:"1px 8px",fontSize:10,color:"#5eead4"}}>{derivedPatients.length}</span>}
                        </button>
                    ))}
                </div>
                <button onClick={()=>{localStorage.removeItem("hospital_token_doctor");localStorage.removeItem("hospital_user_doctor");navigate("/login");}} style={{margin:"0 10px",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:12}}>
                    ↩ Logout
                </button>
            </div>

            {/* ══ MAIN ══ */}
            <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}} className="dr-main">
                {/* Topbar */}
                <div style={{height:60,background:"white",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #e8ecf4",position:"sticky",top:0,zIndex:30,boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <button onClick={()=>setSidebarOpen(true)} className="dr-burger" style={{background:"none",border:"none",fontSize:22,color:"#0d4f4f",cursor:"pointer"}}>☰</button>
                        <div>
                            <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>{NAV.find(n=>n.id===active)?.icon} {NAV.find(n=>n.id===active)?.label}</div>
                            <div style={{fontSize:11,color:"#94a3b8"}}>ID: {doctor?.doctor_id||"..."}</div>
                        </div>
                    </div>
                    <div style={{fontSize:12,color:"#64748b",background:"#f1f5f9",padding:"6px 14px",borderRadius:20,fontWeight:600}}>
                        📅 Today: {stats.today} · ⏳ Pending: {stats.pending}
                    </div>
                </div>

                <div style={{flex:1,overflow:"auto",padding:"20px 16px"}} className="dr-body">

                    {/* ══ DASHBOARD ══ */}
                    {active==="dashboard"&&(
                        <div>
                            <div className="stat4" style={{marginBottom:20}}>
                                {[
                                    ["Today",     stats.today,          "📅","linear-gradient(135deg,#0d4f4f,#14b8a6)"],
                                    ["Pending",   stats.pending,        "⏳","linear-gradient(135deg,#d97706,#f59e0b)"],
                                    ["Confirmed", stats.confirmed,      "✅","linear-gradient(135deg,#1d4ed8,#3b82f6)"],
                                    ["Patients",  derivedPatients.length,"👥","linear-gradient(135deg,#7c3aed,#8b5cf6)"],
                                ].map(([label,val,icon,bg])=>(
                                    <div key={label} style={{background:bg,borderRadius:16,padding:"20px 22px",boxShadow:"0 4px 16px rgba(0,0,0,0.12)",color:"white",cursor:"pointer"}} onClick={()=>setActive(label==="Patients"?"patients":"appointments")}>
                                        <div style={{display:"flex",justifyContent:"space-between"}}>
                                            <div><div style={{fontSize:11,opacity:0.8,marginBottom:6}}>{label}</div><div style={{fontSize:28,fontWeight:800}}>{val}</div></div>
                                            <div style={{fontSize:26,opacity:0.8}}>{icon}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Online appointments alert */}
                            {stats.online>0&&(
                                <div style={{background:"linear-gradient(120deg,#eff6ff,#dbeafe)",border:"1px solid #bfdbfe",borderRadius:14,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
                                    <div style={{fontSize:28}}>💻</div>
                                    <div style={{flex:1}}>
                                        <div style={{fontWeight:700,fontSize:14,color:"#1e40af"}}>Online Appointments Waiting</div>
                                        <div style={{fontSize:12,color:"#3b82f6"}}>You have {stats.online} online consultation{stats.online>1?"s":""} — click to start</div>
                                    </div>
                                    <button onClick={()=>{setActive("appointments");setApptFilter("Pending");}} style={{background:"#1d4ed8",color:"white",border:"none",borderRadius:10,padding:"8px 16px",fontWeight:700,fontSize:12,cursor:"pointer"}}>View Now →</button>
                                </div>
                            )}

                            {/* Today's appointments */}
                            <div style={{background:"white",borderRadius:16,padding:22,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                <div style={{fontWeight:800,fontSize:15,color:"#0f172a",marginBottom:14}}>📋 Today's Appointments</div>
                                {todayAppts.length===0
                                    ? <div style={{textAlign:"center",padding:"24px",color:"#94a3b8",fontSize:13}}>No appointments today. Enjoy the day! 🌿</div>
                                    : todayAppts.map(a=>(
                                        <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,background:"#f8fafc",marginBottom:8,border:`1px solid ${a.visit_type==="online"?"#bfdbfe":"#f1f5f9"}`}}>
                                            <img src={a.patient_avatar?(a.patient_avatar.startsWith("http")?a.patient_avatar:`http://localhost:5000${a.patient_avatar}`):uiAv(a.patient_name)} alt="" style={{width:42,height:42,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                                            <div style={{flex:1}}>
                                                <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{a.patient_name}</div>
                                                <div style={{fontSize:11,color:"#94a3b8"}}>{fmtTime(a.time_slot)} · {a.problem?.substring(0,40)}</div>
                                            </div>
                                            <Badge s={a.status}/>
                                            {a.visit_type==="online"&&<span style={{fontSize:11,fontWeight:700,color:"#0284c7"}}>💻</span>}
                                            {a.visit_type==="online"&&(a.status==="Pending"||a.status==="Confirmed")&&(
                                                <button onClick={()=>setOnlineModal(a)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"linear-gradient(120deg,#1d4ed8,#3b82f6)",color:"white",fontSize:11,fontWeight:700,cursor:"pointer"}}>💬 Start</button>
                                            )}
                                            {a.visit_type==="in-person"&&<button onClick={()=>setAiModal({...a,_analysis:a.ai_analysis})} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"linear-gradient(120deg,#6366f1,#8b5cf6)",color:"white",fontSize:11,fontWeight:700,cursor:"pointer"}}>🤖 AI</button>}
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
                                <div><h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>My Schedule</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>Set working days, hours and break times</div></div>
                                <button onClick={saveSchedule} disabled={loading} style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:12,padding:"10px 22px",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                                    {loading?"Saving...":"💾 Save Schedule"}
                                </button>
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:12}}>
                                {schEdit.map((row,i)=>(
                                    <div key={row.day} style={{background:"white",borderRadius:16,padding:"18px 20px",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",border:`2px solid ${row.is_available?"#14b8a6":"#e2e8f0"}`}}>
                                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:row.is_available?14:0}}>
                                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                                                <Toggle val={row.is_available} onToggle={()=>updSch(i,"is_available",!row.is_available)}/>
                                                <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{row.day}</div>
                                                {!row.is_available&&<span style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>Day Off</span>}
                                            </div>
                                            {row.is_available&&<div style={{fontSize:12,color:"#0d4f4f",fontWeight:700,background:"#ccfbf1",padding:"4px 12px",borderRadius:20}}>
                                                {row.start_time} → {row.end_time}{row.break_start?` · Break ${row.break_start}–${row.break_end}`:""}
                                            </div>}
                                        </div>
                                        {row.is_available&&(
                                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}} className="sch-grid">
                                                <Inp label="Start" type="time" value={row.start_time} onChange={e=>updSch(i,"start_time",e.target.value)}/>
                                                <Inp label="End" type="time" value={row.end_time} onChange={e=>updSch(i,"end_time",e.target.value)}/>
                                                <Sel label="Slot (min)" value={String(row.slot_duration)} onChange={e=>updSch(i,"slot_duration",parseInt(e.target.value))} options={["15","20","30","45","60"]}/>
                                                <Inp label="Break Start" type="time" value={row.break_start||""} onChange={e=>updSch(i,"break_start",e.target.value)} hint="optional"/>
                                                <Inp label="Break End" type="time" value={row.break_end||""} onChange={e=>updSch(i,"break_end",e.target.value)} hint="optional"/>
                                                <div style={{display:"flex",alignItems:"flex-end"}}>
                                                    <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"9px 12px",fontSize:12,color:"#065f46",fontWeight:600,width:"100%",boxSizing:"border-box"}}>
                                                        ~{Math.floor((()=>{const toM=t=>{if(!t)return 0;const[h,m]=t.split(':').map(Number);return h*60+m;};const tot=toM(row.end_time)-toM(row.start_time);const brk=row.break_start&&row.break_end?toM(row.break_end)-toM(row.break_start):0;return Math.max(0,tot-brk)/row.slot_duration;})())} slots/day
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
                                <div style={{fontSize:12,color:"#64748b"}}>{filtAppts.length} shown</div>
                            </div>
                            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
                                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                    {["All","Pending","Confirmed","Completed","Cancelled"].map(f=>(
                                        <button key={f} onClick={()=>setApptFilter(f)} style={{padding:"7px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:apptFilter===f?"#0d4f4f":"#f1f5f9",color:apptFilter===f?"white":"#64748b"}}>
                                            {f} ({(f==="All"?appointments:appointments.filter(a=>a.status===f)).length})
                                        </button>
                                    ))}
                                </div>
                                <input type="date" value={apptDate} onChange={e=>setApptDate(e.target.value)} style={{padding:"7px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"white"}}/>
                                {apptDate&&<button onClick={()=>setApptDate("")} style={{padding:"7px 12px",borderRadius:10,border:"none",background:"#fee2e2",color:"#dc2626",fontSize:12,fontWeight:600,cursor:"pointer"}}>Clear</button>}
                            </div>
                            <div style={{display:"flex",flexDirection:"column",gap:12}}>
                                {filtAppts.length===0&&<div style={{textAlign:"center",padding:"40px",color:"#94a3b8",background:"white",borderRadius:16}}>No appointments found.</div>}
                                {filtAppts.map(a=>(
                                    <div key={a.id} style={{background:"white",borderRadius:16,padding:"16px 20px",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",border:`1px solid ${a.status==="Confirmed"?"#bfdbfe":a.status==="Pending"?"#fde68a":a.status==="Completed"?"#bbf7d0":"#fecaca"}`}}>
                                        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                                            <img src={a.patient_avatar?(a.patient_avatar.startsWith("http")?a.patient_avatar:`http://localhost:5000${a.patient_avatar}`):uiAv(a.patient_name)} alt="" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid #e2e8f0"}}/>
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                                                    <div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{a.patient_name}</div>
                                                    <Badge s={a.status}/>
                                                    {a.ai_risk&&<Badge s={a.ai_risk}/>}
                                                    {a.visit_type==="online"&&<span style={{fontSize:11,fontWeight:700,color:"#0284c7",background:"#eff6ff",padding:"2px 8px",borderRadius:20}}>💻 Online</span>}
                                                    {a.visit_type==="in-person"&&<span style={{fontSize:11,fontWeight:700,color:"#0d4f4f",background:"#f0fdfb",padding:"2px 8px",borderRadius:20}}>🏥 In-Person</span>}
                                                </div>
                                                <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>
                                                    📅 {fmtDate(a.date)} · ⏰ {fmtTime(a.time_slot)}
                                                    {a.age&&<span> · Age {a.age}</span>}
                                                    {a.blood_type&&<span> · {a.blood_type}</span>}
                                                </div>
                                                <div style={{fontSize:12,color:"#374151",background:"#f8fafc",padding:"8px 12px",borderRadius:8}}><strong>Problem:</strong> {a.problem||"Not specified"}</div>
                                                {a.condition&&<div style={{fontSize:11,color:"#64748b",marginTop:4}}>Condition: {a.condition}</div>}
                                                {a.notes&&<div style={{fontSize:12,color:"#374151",background:"#fffbeb",padding:"8px 12px",borderRadius:8,marginTop:6}}><strong>Notes:</strong> {a.notes}</div>}
                                                {a.ai_analysis&&<div style={{fontSize:11,color:"#6366f1",background:"#f5f3ff",padding:"8px 12px",borderRadius:8,marginTop:6}}><strong>🤖 AI:</strong> {a.ai_analysis.substring(0,150)}{a.ai_analysis.length>150?"...":""}</div>}
                                            </div>
                                        </div>
                                        {a.status!=="Completed"&&a.status!=="Cancelled"&&(
                                            <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                                                {/* Online appointment: Chat button */}
                                                {a.visit_type==="online"&&(
                                                    <button onClick={()=>setOnlineModal(a)} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"linear-gradient(120deg,#1d4ed8,#3b82f6)",color:"white",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                                                        💬 Start Consultation
                                                    </button>
                                                )}
                                                {/* In-person: AI analysis */}
                                                {a.visit_type==="in-person"&&(
                                                    <button onClick={()=>setAiModal({...a,_analysis:a.ai_analysis})} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"linear-gradient(120deg,#6366f1,#8b5cf6)",color:"white",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                                                        🤖 AI Analysis
                                                    </button>
                                                )}
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
                                <div style={{fontSize:12,color:"#64748b"}}>{derivedPatients.length} patients who booked with you</div>
                            </div>
                            {derivedPatients.length===0
                                ? <div style={{textAlign:"center",padding:"50px 20px",background:"white",borderRadius:16,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                    <div style={{fontSize:40,marginBottom:12}}>👥</div>
                                    <div style={{fontWeight:700,fontSize:15,color:"#0f172a",marginBottom:6}}>No patients yet</div>
                                    <div style={{fontSize:13,color:"#94a3b8"}}>Patients will appear here when they book appointments with you.</div>
                                  </div>
                                : <div className="pt-grid">
                                    {derivedPatients.map(p=>{
                                        const ptAv = p.avatar ? `http://localhost:5000${p.avatar}` : uiAv(p.name);
                                        const ptAppts = (p.appts || appointments.filter(a=>a.patient_id===p.id));
                                        const lastAppt = ptAppts[0];
                                        return (
                                            <div key={p.id} style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 1px 8px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",gap:12}}>
                                                {/* Patient header */}
                                                <div style={{display:"flex",alignItems:"center",gap:12}}>
                                                    <img src={ptAv} alt={p.name} style={{width:54,height:54,borderRadius:"50%",objectFit:"cover",border:"2px solid #ccfbf1",flexShrink:0}}/>
                                                    <div style={{flex:1,minWidth:0}}>
                                                        <div style={{fontWeight:800,fontSize:14,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
                                                        <div style={{fontSize:11,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.email}</div>
                                                        <div style={{marginTop:5,display:"flex",gap:6,flexWrap:"wrap"}}>
                                                            <Badge s={p.latest_risk||"Low"}/>
                                                            <span style={{fontSize:11,fontWeight:600,color:"#0d4f4f",background:"#ccfbf1",padding:"2px 8px",borderRadius:20}}>{p.visit_count||0} visit{p.visit_count!==1?"s":""}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Patient details */}
                                                <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 10px"}}>
                                                    {[
                                                        ["Age",        p.age        ? `${p.age} yrs` : "?"],
                                                        ["Blood",      p.blood_type || "?"],
                                                        ["Gender",     p.gender     || "?"],
                                                        ["Phone",      p.phone || p.patient_phone || "?"],
                                                        ["Condition",  p.condition_ || p.condition || "None"],
                                                        ["Last Visit", p.last_visit ? fmtDate(p.last_visit.split("T")[0]) : "N/A"],
                                                    ].map(([l,v])=>(
                                                        <div key={l}>
                                                            <div style={{fontSize:10,color:"#94a3b8",marginBottom:2}}>{l}</div>
                                                            <div style={{fontSize:12,fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Last appointment */}
                                                {lastAppt&&(
                                                    <div style={{background:lastAppt.visit_type==="online"?"#eff6ff":"#f0fdfb",borderRadius:10,padding:"8px 12px",border:`1px solid ${lastAppt.visit_type==="online"?"#bfdbfe":"#ccfbf1"}`}}>
                                                        <div style={{fontSize:11,color:"#64748b",marginBottom:2}}>Latest appointment</div>
                                                        <div style={{fontSize:12,fontWeight:700,color:"#0f172a",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                                            <span>{fmtDate(lastAppt.date)} {fmtTime(lastAppt.time_slot)}</span>
                                                            <Badge s={lastAppt.status}/>
                                                        </div>
                                                        <div style={{fontSize:11,color:"#475569",marginTop:3}}>{lastAppt.visit_type==="online"?"💻 Online":"🏥 In-Person"} · {lastAppt.problem?.substring(0,40)}</div>
                                                    </div>
                                                )}
                                                {/* Actions */}
                                                <div style={{display:"flex",gap:8}}>
                                                    <button onClick={()=>setPtModal(p)} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                                                        👤 Full Details
                                                    </button>
                                                    {lastAppt&&lastAppt.visit_type==="online"&&(lastAppt.status==="Pending"||lastAppt.status==="Confirmed")&&(
                                                        <button onClick={()=>setOnlineModal(lastAppt)} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:"linear-gradient(120deg,#1d4ed8,#3b82f6)",color:"white",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                                                            💬 Consult
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                  </div>
                            }
                        </div>
                    )}

                    {/* ══ PROFILE ══ */}
                    {active==="profile"&&(
                        <div>
                            <div style={{marginBottom:20}}>
                                <h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>My Profile</h2>
                                <div style={{fontSize:12,color:"#64748b"}}>Update your information and photo</div>
                            </div>
                            <div style={{background:"white",borderRadius:20,padding:24,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:24,padding:18,background:"linear-gradient(120deg,#f0fdf9,#ccfbf1)",borderRadius:16}}>
                                    <div style={{position:"relative"}}>
                                        <img src={profPrev||uiAv(doctor?.name||"Dr","0d4f4f")} alt="" style={{width:86,height:86,borderRadius:"50%",objectFit:"cover",border:"4px solid #14b8a6",flexShrink:0}}/>
                                        <button onClick={()=>profRef.current.click()} style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:"#0d4f4f",border:"2px solid white",color:"white",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>📷</button>
                                        <input ref={profRef} type="file" accept="image/*" onChange={e=>{const f=e.target.files[0];if(f){setProfImg(f);setProfPrev(URL.createObjectURL(f));} }} style={{display:"none"}}/>
                                    </div>
                                    <div>
                                        <div style={{fontWeight:800,fontSize:18,color:"#0d4f4f"}}>{doctor?.name}</div>
                                        <div style={{fontSize:13,color:"#0d9488"}}>{doctor?.specialty}</div>
                                        <div style={{fontSize:12,color:"#475569",marginTop:4}}>Doctor ID: <strong>{doctor?.doctor_id}</strong></div>
                                    </div>
                                </div>
                                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="prof-grid">
                                    <Inp label="Full Name" value={profForm.name} onChange={e=>setProfForm(p=>({...p,name:e.target.value}))} placeholder="Dr. Name"/>
                                    <Inp label="Specialty" value={profForm.specialty} onChange={e=>setProfForm(p=>({...p,specialty:e.target.value}))} placeholder="Cardiology"/>
                                    <Inp label="Experience" value={profForm.experience} onChange={e=>setProfForm(p=>({...p,experience:e.target.value}))} placeholder="5 yrs"/>
                                    <Inp label="Fee ($)" type="number" value={profForm.fee} onChange={e=>setProfForm(p=>({...p,fee:e.target.value}))} placeholder="100"/>
                                    <Inp label="Phone" value={profForm.phone} onChange={e=>setProfForm(p=>({...p,phone:e.target.value}))} placeholder="+92-300-0000000"/>
                                    <div style={{display:"flex",alignItems:"flex-end"}}>
                                        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"9px 14px",fontSize:12,color:"#065f46",fontWeight:600,width:"100%",boxSizing:"border-box"}}>
                                            ✉️ {doctor?.email}
                                            <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>Email cannot be changed</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Password section */}
                                <div style={{borderTop:"1px solid #f1f5f9",paddingTop:16,marginTop:4}}>
                                    <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:12}}>🔒 Change Password <span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>(leave blank to keep current)</span></div>
                                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="prof-grid">
                                        {/* New Password */}
                                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                                            <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>New Password</label>
                                            <div style={{position:"relative"}}>
                                                <input
                                                    type={profForm._showPass?"text":"password"}
                                                    value={profForm.newPassword||""}
                                                    onChange={e=>setProfForm(p=>({...p,newPassword:e.target.value}))}
                                                    placeholder="Min. 6 characters"
                                                    style={{padding:"9px 38px 9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%",boxSizing:"border-box"}}
                                                />
                                                <button type="button" onClick={()=>setProfForm(p=>({...p,_showPass:!p._showPass}))}
                                                    style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#94a3b8",padding:0}}>
                                                    {profForm._showPass?"🙈":"👁️"}
                                                </button>
                                            </div>
                                        </div>
                                        {/* Confirm Password */}
                                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                                            <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>Confirm Password</label>
                                            <div style={{position:"relative"}}>
                                                <input
                                                    type={profForm._showConf?"text":"password"}
                                                    value={profForm.confirmPass||""}
                                                    onChange={e=>setProfForm(p=>({...p,confirmPass:e.target.value}))}
                                                    placeholder="Repeat password"
                                                    style={{padding:"9px 38px 9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%",boxSizing:"border-box"}}
                                                />
                                                <button type="button" onClick={()=>setProfForm(p=>({...p,_showConf:!p._showConf}))}
                                                    style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#94a3b8",padding:0}}>
                                                    {profForm._showConf?"🙈":"👁️"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {profForm.newPassword&&profForm.confirmPass&&profForm.newPassword!==profForm.confirmPass&&(
                                        <div style={{fontSize:12,color:"#ef4444",marginTop:6}}>⚠️ Passwords do not match</div>
                                    )}
                                    {profForm.newPassword&&profForm.confirmPass&&profForm.newPassword===profForm.confirmPass&&profForm.newPassword.length>=6&&(
                                        <div style={{fontSize:12,color:"#10b981",marginTop:6}}>✓ Passwords match</div>
                                    )}
                                </div>
                                <button onClick={saveProfile} disabled={loading} style={{marginTop:18,width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>
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
                    .dr-burger{display:none !important;}
                    .dr-body{padding:22px 28px !important;}
                    .stat4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
                    .pt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
                    .sch-grid{grid-template-columns:1fr 1fr 1fr !important;}
                    .prof-grid{grid-template-columns:1fr 1fr !important;}
                }
                @media(max-width:1100px) and (min-width:769px){.pt-grid{grid-template-columns:repeat(2,1fr);}}
                @media(max-width:768px){
                    .dr-sidebar{transform:translateX(-100%);transition:transform 0.25s ease;}
                    .stat4{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
                    .pt-grid{display:grid;grid-template-columns:1fr;gap:12px;}
                    .sch-grid{grid-template-columns:1fr 1fr !important;}
                    .prof-grid{grid-template-columns:1fr !important;}
                }
                div::-webkit-scrollbar{width:4px;height:4px;}
                div::-webkit-scrollbar-thumb{background:#ccfbf1;border-radius:4px;}
                @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
                @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
            `}</style>
        </div>
    );
}