import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API   = "http://localhost:5000/api";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = process.env.REACT_APP_GROQ_KEY || "";

const getToken = () => localStorage.getItem("hospital_token_patient");

const apiCall = async (url, method="GET", body=null) => {
    const token = getToken();
    if (!token) { window.location.href = "/login"; return { success:false, message:"Not logged in." }; }
    const opts  = {method, headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"}};
    if(body) opts.body = JSON.stringify(body);
    const res  = await fetch(`${API}${url}`,opts);
    const data = await res.json();
    if (res.status === 401) {
        localStorage.removeItem("hospital_token_patient");
        localStorage.removeItem("hospital_user_patient");
        window.location.href = "/login";
        return { success:false, message:"Session expired. Please login again." };
    }
    return data;
};

const claude = async (system, msgs, max_tokens=800) => {
    if (!GROQ_KEY) return "AI key not configured. Add REACT_APP_GROQ_KEY in .env";
    const messages = [
        { role:"system", content: system },
        ...msgs.map(m=>({
            role:    m.role==="assistant"||m.role==="model" ? "assistant" : "user",
            content: m.content || m.text || ""
        }))
    ];
    try {
        const res = await fetch(GROQ_URL, {
            method:"POST",
            headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${GROQ_KEY}` },
            body: JSON.stringify({ model:"llama-3.3-70b-versatile", messages, max_tokens, temperature:0.7 })
        });
        const d = await res.json();
        if(d.error) return `AI Error: ${d.error.message}`;
        return d.choices?.[0]?.message?.content || "No response.";
    } catch { return "AI service unavailable."; }
};

const fmtDate = d => d?new Date(d+"T00:00:00").toLocaleDateString("en-PK",{weekday:"short",day:"numeric",month:"short",year:"numeric"}):"—";
const fmtTime = t => {if(!t)return"—";const[h,m]=t.split(":");const hh=parseInt(h);return`${hh>12?hh-12:hh||12}:${m} ${hh>=12?"PM":"AM"}`;};
const minDate = () => {const d=new Date();d.setDate(d.getDate()+1);return d.toISOString().split("T")[0];};
const uiAv    = (name,bg="0d4f4f") => `https://ui-avatars.com/api/?name=${encodeURIComponent(name||"P")}&background=${bg}&color=fff`;

const SCLR = {Confirmed:["#dbeafe","#1d4ed8"],Pending:["#fef9c3","#b45309"],Cancelled:["#fee2e2","#dc2626"],Completed:["#dcfce7","#16a34a"]};
const RCLR = {Low:["#dcfce7","#16a34a"],Medium:["#fef9c3","#ca8a04"],High:["#fee2e2","#dc2626"]};
const Badge = ({s,map=SCLR})=>{const[bg,tc]=map[s]||["#f1f5f9","#64748b"];return<span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:bg,color:tc,whiteSpace:"nowrap"}}>{s}</span>;};
const Dots  = ()=><div style={{display:"flex",gap:5,padding:"10px 14px",background:"#f1f5f9",borderRadius:"4px 14px 14px 14px"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#14b8a6",animation:`bounce 1s infinite ${i*0.15}s`}}/>)}</div>;

// ── Specialty icon map ──
const SPEC_ICONS = {
  Cardiology:"🫀", Cardiologist:"🫀",
  Neurology:"🧠",  Neurologist:"🧠",
  Orthopedics:"🦴",Orthopedic:"🦴",
  Pediatrics:"👶", Pediatrician:"👶",
  Ophthalmology:"👁️",
  Pulmonology:"🫁", Pulmonologist:"🫁",
  Dermatology:"🧴", Dermatologist:"🧴",
  General:"🩺",    "General Physician":"🩺",
  Oncology:"🔬",   ENT:"👂",
  Urology:"🏥",    Psychiatry:"🧘",
  Endocrinologist:"🩸", Endocrinology:"🩸",
};
const specIcon = s => SPEC_ICONS[s] || "👨‍⚕️";

/* ══════════════════════════════════════════════
   CONSULTATION MODAL
══════════════════════════════════════════════ */
function ConsultationModal({appt, onClose, onSaveAnalysis}) {
    const [tab,      setTab]      = useState("ai");
    const [aiMsgs,   setAiMsgs]   = useState([]);
    const [aiInput,  setAiInput]  = useState("");
    const [aiLoad,   setAiLoad]   = useState(false);
    const [autoRan,  setAutoRan]  = useState(false);
    const [chatMsgs, setChatMsgs] = useState([]);
    const [drInput,  setDrInput]  = useState("");
    const [drSending,setDrSending]= useState(false);
    const [summary,  setSummary]  = useState(appt.ai_analysis||"");
    const [summLoad, setSummLoad] = useState(false);
    const [aiRisk,   setAiRisk]   = useState(appt.ai_risk||"Low");
    const aiRef=useRef(); const drRef=useRef(); const chatPollRef=useRef();
    const ptToken = localStorage.getItem("hospital_token_patient");
    const CHAT    = `http://localhost:5000/api/chat/${appt.id}`;

    const fmtT = (ts)=>new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

    useEffect(()=>{ aiRef.current?.scrollIntoView({behavior:"smooth"}); },[aiMsgs,aiLoad]);

    // Auto-run AI analysis on modal open
    useEffect(()=>{
        if(autoRan) return;
        setAutoRan(true);
        const autoAnalyze = async ()=>{
            setAiLoad(true);
            try {
                const reply = await claude(
                    `You are a medical AI assistant. A patient has booked an appointment with ${appt.doctor_name} (${appt.specialty}).
Analyze their problem and provide:
1. Brief symptom assessment (2-3 sentences)
2. What to expect at the appointment
3. 2-3 important questions to ask the doctor
Keep it simple, clear, and reassuring. Do NOT diagnose or prescribe.`,
                    [{role:"user", content:`Patient problem: "${appt.problem}"
Age: ${appt.age||"not specified"}
Appointment with: ${appt.doctor_name} (${appt.specialty})`}]
                );
                setAiMsgs([{role:"ai", text:reply, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);
            } catch {
                setAiMsgs([{role:"ai", text:"⚠️ Could not generate analysis. You can still ask questions below.", time:""}]);
            }
            setAiLoad(false);
        };
        autoAnalyze();
    },[]);
    useEffect(()=>{ drRef.current?.scrollIntoView({behavior:"smooth"}); },[chatMsgs]);

    // Fetch chat messages from DB
    const fetchChat = async ()=>{
        try {
            const res  = await fetch(CHAT, { headers:{ Authorization:`Bearer ${ptToken}` }});
            const data = await res.json();
            if(data.success) setChatMsgs(data.messages||[]);
        } catch {}
    };

    // Start polling when Doctor Chat tab is open
    useEffect(()=>{
        if(tab==="doctor") {
            fetchChat();
            chatPollRef.current = setInterval(fetchChat, 3000);
        } else {
            clearInterval(chatPollRef.current);
        }
        return ()=>clearInterval(chatPollRef.current);
    },[tab]);

    const now  = ()=>new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    const drAv = appt.doctor_avatar?`http://localhost:5000${appt.doctor_avatar}`:uiAv(appt.doctor_name,"0d4f4f");
    const ptAv = uiAv("Patient","14b8a6");

    // AI Assistant — patient asks, AI answers only
    const sendAi = async ()=>{
        const msg=aiInput.trim(); if(!msg||aiLoad) return;
        setAiMsgs(p=>[...p,{role:"user",text:msg,time:now()}]);
        setAiInput(""); setAiLoad(true);
        try {
            const hist = aiMsgs.map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
            const reply = await claude(
                `You are a medical AI assistant helping a patient prepare for their appointment with ${appt.doctor_name} (${appt.specialty}).
Patient problem: "${appt.problem}".
Help the patient understand their symptoms, what to expect, and what questions to ask the doctor.
NEVER diagnose or prescribe. Keep responses clear and reassuring. Max 3 sentences.`,
                [...hist,{role:"user",content:msg}]
            );
            setAiMsgs(p=>[...p,{role:"ai",text:reply,time:now()}]);
        } catch { setAiMsgs(p=>[...p,{role:"ai",text:"⚠️ AI unavailable. Please try again.",time:now()}]); }
        setAiLoad(false);
    };

    // Patient sends message to DB — doctor sees it via polling
    const sendDr = async ()=>{
        const msg=drInput.trim(); if(!msg||drSending) return;
        setDrSending(true); setDrInput("");
        try {
            await fetch(CHAT, {
                method:"POST",
                headers:{"Content-Type":"application/json", Authorization:`Bearer ${ptToken}`},
                body: JSON.stringify({ message: msg })
            });
            await fetchChat();
        } catch {}
        setDrSending(false);
    };

    // Generate clinical summary from AI chat
    const genSummary = async ()=>{
        setSummLoad(true);
        try {
            const aiTxt = aiMsgs.map(m=>`${m.role==="user"?"Patient":"AI"}: ${m.text}`).join("\n");
            // ✅ FIXED - Check both sender_role and sender_type for DB compatibility
            const drTxt = chatMsgs.map(m=>{
                const role = m.sender_role || m.sender_type || "";
                return `${role==="doctor"?"Doctor":"Patient"}: ${m.message}`;
            }).join("\n");
            const text  = await claude(
                `You are a clinical AI. Write a structured pre-appointment summary based on patient-AI chat and doctor-patient conversation.
Format:
Risk Level: Low / Medium / High
Chief Complaint: (one line)
Symptom Summary: (2-3 sentences)
Key Points for Doctor: (bullet points)
Recommended Next Steps: (2-3 items)
Max 200 words. Professional medical tone.`,
                [{role:"user",content:`Doctor: ${appt.doctor_name} (${appt.specialty})
Patient Problem: ${appt.problem}
Appointment: ${fmtDate(appt.date)} at ${fmtTime(appt.time_slot)}

AI Symptom Chat:
${aiTxt||"(Patient did not use AI chat)"}

Doctor Conversation:
${drTxt}`}]
            );
            const m=text.match(/Risk Level:\s*(Low|Medium|High)/i);
            if(m) setAiRisk(m[1]);
            setSummary(text);
        } catch { setSummary("⚠️ Could not generate summary. Please try again."); }
        setSummLoad(false);
    };

    const saveAndClose = async ()=>{
        if(summary) await onSaveAnalysis(appt.id,summary,aiRisk);
        onClose();
    };

    return(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
            <div style={{background:"white",borderRadius:20,width:"100%",maxWidth:860,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",overflow:"hidden"}}>

                {/* Header */}
                <div style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <img src={drAv} alt="" style={{width:42,height:42,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.4)"}}/>
                        <div>
                            <div style={{color:"white",fontWeight:800,fontSize:15}}>{appt.doctor_name}</div>
                            <div style={{color:"rgba(255,255,255,0.75)",fontSize:12}}>{appt.specialty} · 💻 Online Consultation</div>
                        </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <div style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:700,color:"white"}}>
                            👤 Patient Mode
                        </div>
                        <button onClick={saveAndClose} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{display:"flex",borderBottom:"2px solid #f1f5f9",flexShrink:0}}>
                    {[
                        ["ai",      "🤖 AI Assistant",  "Describe symptoms, get guidance"],
                        ["doctor",  "💬 Doctor Chat",    "Chat with your doctor"],
                        ["summary", "📋 Summary",        "AI clinical summary"],
                    ].map(([id,lbl,sub])=>(
                        <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px 8px",border:"none",cursor:"pointer",background:tab===id?"white":"#f8fafc",borderBottom:tab===id?"2px solid #0d4f4f":"2px solid transparent"}}>
                            <div style={{fontWeight:700,fontSize:13,color:tab===id?"#0d4f4f":"#64748b"}}>{lbl}</div>
                            <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{sub}</div>
                        </button>
                    ))}
                </div>

                <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>

                    {/* ── AI ASSISTANT TAB ── */}
                    {tab==="ai"&&(
                        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                            <div style={{background:"#eff6ff",padding:"8px 16px",borderBottom:"1px solid #bfdbfe",fontSize:12,color:"#1d4ed8",flexShrink:0}}>
                                💡 Describe your symptoms to AI. Use this to prepare before talking to your doctor.
                            </div>
                            <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
                                {/* Welcome + auto-analysis */}
                                <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
                                    <div style={{fontSize:24,flexShrink:0}}>🤖</div>
                                    <div style={{background:"#f1f5f9",padding:"12px 16px",borderRadius:"4px 14px 14px 14px",fontSize:13,color:"#0f172a",maxWidth:"85%",lineHeight:1.6}}>
                                        👋 Hi! I'm your AI health assistant.<br/>
                                        Analyzing your concern: <strong>"{appt.problem}"</strong>
                                        {aiLoad&&!aiMsgs.length&&<span><br/>🔄 Generating analysis...</span>}
                                    </div>
                                </div>

                                {aiMsgs.map((m,i)=>(
                                    <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-end",gap:8}}>
                                        {m.role==="ai"&&<div style={{fontSize:24,flexShrink:0}}>🤖</div>}
                                        <div style={{maxWidth:"78%"}}>
                                            <div style={{
                                                padding:"10px 14px",fontSize:13,lineHeight:1.6,
                                                borderRadius:m.role==="user"?"14px 4px 14px 14px":"4px 14px 14px 14px",
                                                background:m.role==="user"?"#0d4f4f":"#f1f5f9",
                                                color:m.role==="user"?"white":"#1e293b"
                                            }}>{m.text}</div>
                                            <div style={{fontSize:10,color:"#94a3b8",marginTop:3,textAlign:m.role==="user"?"right":"left"}}>{m.time}</div>
                                        </div>
                                        {m.role==="user"&&<img src={ptAv} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>}
                                    </div>
                                ))}
                                {aiLoad&&(
                                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                        <div style={{fontSize:24}}>🤖</div>
                                        <Dots/>
                                    </div>
                                )}
                                <div ref={aiRef}/>
                            </div>
                            <div style={{padding:"10px 14px",borderTop:"1px solid #f1f5f9",display:"flex",gap:8,flexShrink:0,background:"white"}}>
                                <input
                                    placeholder="Describe your symptoms to AI..."
                                    value={aiInput}
                                    onChange={e=>setAiInput(e.target.value)}
                                    onKeyDown={e=>e.key==="Enter"&&sendAi()}
                                    disabled={aiLoad}
                                    style={{flex:1,padding:"10px 14px",borderRadius:12,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc"}}
                                />
                                <button onClick={sendAi} disabled={!aiInput.trim()||aiLoad} style={{background:!aiInput.trim()||aiLoad?"#e2e8f0":"#0d4f4f",color:!aiInput.trim()||aiLoad?"#94a3b8":"white",border:"none",borderRadius:12,padding:"10px 16px",cursor:"pointer",fontWeight:700,fontSize:14}}>➤</button>
                            </div>
                        </div>
                    )}

                    {/* ── DOCTOR CHAT TAB — DB backed, polling every 3s ── */}
                    {tab==="doctor"&&(
                        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                            <div style={{background:"#f0fdf4",padding:"8px 16px",borderBottom:"1px solid #dcfce7",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                                <div style={{width:8,height:8,borderRadius:"50%",background:"#16a34a",animation:"pulse 2s infinite"}}/>
                                <span style={{fontSize:12,color:"#15803d",fontWeight:600}}>Live Chat with {appt.doctor_name}</span>
                                <span style={{marginLeft:"auto",background:"#dcfce7",padding:"2px 10px",borderRadius:20,fontSize:11,color:"#15803d",fontWeight:600}}>👤 Patient</span>
                            </div>
                            <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:12,background:"#f8fafc"}}>
                                {chatMsgs.length===0&&(
                                    <div style={{textAlign:"center",color:"#94a3b8",fontSize:13,padding:"30px 0"}}>
                                        No messages yet.<br/>
                                        <span style={{fontSize:12}}>Send a message — your doctor will reply from their portal.</span>
                                    </div>
                                )}
                                {chatMsgs.map((m)=>{
                                    // ✅ FIXED - Check both sender_role and sender_type
                                    const role = m.sender_role || m.sender_type || "";
                                    const isMe = role==="patient";
                                    return(
                                        <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",alignItems:"flex-end",gap:8}}>
                                            {!isMe&&<img src={drAv} alt="" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid #0d4f4f"}}/>}
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
                                            {isMe&&<img src={ptAv} alt="" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>}
                                        </div>
                                    );
                                })}
                                <div ref={drRef}/>
                            </div>
                            <div style={{padding:"10px 14px",borderTop:"1px solid #f1f5f9",display:"flex",gap:8,alignItems:"center",flexShrink:0,background:"white"}}>
                                <img src={ptAv} alt="" style={{width:32,height:32,borderRadius:"50%",flexShrink:0}}/>
                                <input
                                    placeholder="Message your doctor..."
                                    value={drInput}
                                    onChange={e=>setDrInput(e.target.value)}
                                    onKeyDown={e=>e.key==="Enter"&&sendDr()}
                                    disabled={drSending}
                                    style={{flex:1,padding:"10px 14px",borderRadius:12,border:"1.5px solid #0d4f4f",fontSize:13,outline:"none",background:"#f8fafc"}}
                                />
                                <button onClick={sendDr} disabled={!drInput.trim()||drSending} style={{background:drInput.trim()&&!drSending?"#0d4f4f":"#e2e8f0",color:drInput.trim()&&!drSending?"white":"#94a3b8",border:"none",borderRadius:12,padding:"10px 16px",cursor:"pointer",fontWeight:700,fontSize:14,transition:"all 0.2s"}}>
                                    {drSending?"...":"➤"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── SUMMARY TAB ── */}
                    {tab==="summary"&&(
                        <div style={{flex:1,overflowY:"auto",padding:"18px 20px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,marginBottom:16}}>
                                <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>📋 AI Clinical Summary</div>
                                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                    {["Low","Medium","High"].map(r=>(
                                        <button key={r} onClick={()=>setAiRisk(r)} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",fontWeight:700,fontSize:11,background:aiRisk===r?(r==="Low"?"#16a34a":r==="Medium"?"#d97706":"#dc2626"):"#f1f5f9",color:aiRisk===r?"white":"#64748b"}}>{r}</button>
                                    ))}
                                    <button onClick={genSummary} disabled={summLoad} style={{background:summLoad?"#e2e8f0":"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:summLoad?"#94a3b8":"white",border:"none",borderRadius:10,padding:"8px 14px",fontWeight:700,fontSize:12,cursor:summLoad?"not-allowed":"pointer"}}>
                                        {summLoad?"Generating...":"⚡ Generate Summary"}
                                    </button>
                                </div>
                            </div>
                            {/* Appointment info */}
                            <div style={{background:"#f8fafc",borderRadius:14,padding:"14px 16px",marginBottom:14,border:"1px solid #e2e8f0"}}>
                                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px"}}>
                                    {[
                                        ["Doctor",   appt.doctor_name],
                                        ["Specialty",appt.specialty],
                                        ["Date",     fmtDate(appt.date)],
                                        ["Time",     fmtTime(appt.time_slot)],
                                        ["Type",     appt.visit_type==="online"?"💻 Online":"🏥 In-Person"],
                                        ["Status",   appt.status],
                                    ].map(([l,v])=>(
                                        <div key={l}><span style={{fontSize:11,color:"#94a3b8"}}>{l}: </span><span style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{v}</span></div>
                                    ))}
                                </div>
                                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #e2e8f0"}}>
                                    <span style={{fontSize:11,color:"#94a3b8"}}>Problem: </span>
                                    <span style={{fontSize:12,color:"#1e293b"}}>{appt.problem}</span>
                                </div>
                            </div>
                            {!summary&&(
                                <div style={{textAlign:"center",padding:"30px 20px",color:"#94a3b8",fontSize:13,background:"#f8fafc",borderRadius:12,border:"1px dashed #e2e8f0"}}>
                                    💬 First chat with AI Assistant to describe your symptoms,<br/>then click <strong>Generate Summary</strong> to create your clinical notes.<br/>
                                    <span style={{fontSize:11,marginTop:6,display:"block"}}>This summary will be shared with your doctor.</span>
                                </div>
                            )}
                            {summary&&(
                                <textarea
                                    value={summary}
                                    onChange={e=>setSummary(e.target.value)}
                                    rows={8}
                                    style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box",background:"#f8fafc",lineHeight:1.7,marginBottom:12}}
                                />
                            )}
                            {summary&&(
                                <button onClick={saveAndClose} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                                    💾 Save & Close
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
        </div>
    );
}


/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function BookAppointment() {
    const navigate = useNavigate();
    const user     = JSON.parse(localStorage.getItem("hospital_user_patient")||"{}");

    // Data
    const [patient,      setPatient]      = useState(null);
    const [allDoctors,   setAllDoctors]   = useState([]);
    const [appointments, setAppointments] = useState([]);

    // Wizard state
    // substep: "specialty" → "doctor" → "details" → "confirm"
    const [substep,      setSubstep]      = useState("specialty");
    const [selectedSpec, setSelectedSpec] = useState(null);
    const [selectedDr,   setSelectedDr]   = useState(null);
    const [form,         setForm]         = useState({date:"",time_slot:"",visit_type:"in-person",problem:""});
    const [slots,        setSlots]        = useState([]);
    const [slotsLoad,    setSlotsLoad]    = useState(false);

    // Appointments UI
    const [apptFilter,   setApptFilter]   = useState("All");
    const [expandedId,   setExpandedId]   = useState(null);
    const [chatAppt,     setChatAppt]     = useState(null);

    // UI
    const [toast,   setToast]   = useState(null);
    const [booking, setBooking] = useState(false);

    const showToast = (msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3000);};

    const loadAll = useCallback(async()=>{
        // Load doctors separately — always keep them fresh
        const dData = await apiCall('/patient/doctors');
        if(dData.success && dData.doctors?.length > 0) setAllDoctors(dData.doctors);

        // Load profile and appointments
        const[p,a]=await Promise.all([
            apiCall('/patient/profile'),
            apiCall('/patient/appointments')
        ]);
        if(p.success) setPatient(p.patient);
        if(a.success) setAppointments(a.appointments);
    },[]);
    useEffect(()=>{loadAll();},[loadAll]);

    // Load slots when dr + date chosen
    useEffect(()=>{
        if(!selectedDr||!form.date){setSlots([]);return;}
        (async()=>{
            setSlotsLoad(true);
            const d=await apiCall(`/doctor/slots?doctor_id=${selectedDr.id}&date=${form.date}`);
            setSlotsLoad(false); setSlots(d.success?d.slots:[]);
        })();
    },[selectedDr,form.date]);

    // ── Derived data ──
    const specialties  = [...new Set(allDoctors.map(d=>d.specialty).filter(Boolean))].sort();
    const specDoctors  = selectedSpec ? allDoctors.filter(d=>d.specialty===selectedSpec) : [];

    const handleBook = async()=>{
        if(!form.date||!form.time_slot||!form.problem.trim()){showToast("Fill all fields.",false);return;}
        setBooking(true);
        const data=await apiCall('/patient/appointments','POST',{doctor_id:selectedDr.id,...form});
        setBooking(false);
        if(data.success){
            showToast("Appointment booked! ✅");
            resetWizard();
            // Reload appointments + keep doctors
            const[a]=await Promise.all([apiCall('/patient/appointments')]);
            if(a.success) setAppointments(a.appointments);
        } else {
            showToast(data.message||"Booking failed.",false);
        }
    };

    const handleCancel=async id=>{
        if(!window.confirm("Cancel this appointment?"))return;
        const data=await apiCall(`/patient/appointments/${id}/cancel`,'PUT',{reason:"Cancelled by patient."});
        if(data.success){showToast("Appointment cancelled.");loadAll();}
        else showToast(data.message,false);
    };

    const saveAnalysis=async(id,analysis,risk)=>{
        await apiCall(`/patient/appointments/${id}/analysis`,'PUT',{ai_analysis:analysis,ai_risk:risk});
        loadAll();
    };

    const resetWizard=()=>{
        setSubstep("specialty");
        setSelectedSpec(null);
        setSelectedDr(null);
        setForm({date:"",time_slot:"",visit_type:"in-person",problem:""});
        setSlots([]);
        // allDoctors is NOT reset — keep them loaded so specialty cards stay visible
    };

    // Step numbers for progress bar
    const stepNum = {specialty:1,doctor:2,details:3,confirm:4};
    const filtAppts = apptFilter==="All"?appointments:appointments.filter(a=>a.status===apptFilter);
    const ptName  = patient?.name||user?.name||"Patient";
    const ptAvImg = patient?.avatar?`http://localhost:5000${patient.avatar}`:uiAv(ptName,"14b8a6");

    return(
        <div style={{minHeight:"100vh",background:"#eaf1f3",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
            {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,background:toast.ok?"#10b981":"#ef4444",color:"white",padding:"12px 20px",borderRadius:12,fontWeight:700,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>{toast.ok?"✅":"❌"} {toast.msg}</div>}
            {chatAppt&&<ConsultationModal appt={chatAppt} onClose={()=>setChatAppt(null)} onSaveAnalysis={saveAnalysis}/>}

            {/* ── TOPBAR ── */}
            <div style={{background:"white",borderBottom:"1px solid #e2e8f0",padding:"0 20px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:30,boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <button onClick={()=>navigate("/patient")} style={{display:"flex",alignItems:"center",gap:6,background:"#f1f5f9",border:"none",borderRadius:10,padding:"7px 14px",cursor:"pointer",fontWeight:700,fontSize:13,color:"#475569"}}>
                        ← Back
                    </button>
                    <div>
                        <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>📅 Book Appointment</div>
                        <div style={{fontSize:11,color:"#94a3b8"}}>Real-time slots from registered doctors</div>
                    </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{textAlign:"right",display:"none"}} className="pt-name-desk">
                        <div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{ptName}</div>
                        <div style={{fontSize:11,color:"#94a3b8"}}>{patient?.blood_type||"Patient"}</div>
                    </div>
                    <img src={ptAvImg} alt={ptName} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"2px solid #14b8a6",flexShrink:0,cursor:"pointer"}} onClick={()=>navigate("/patient")} title={ptName}/>
                </div>
            </div>

            <div style={{padding:"20px 16px",maxWidth:940,margin:"0 auto"}} className="ba-wrap">

                {/* ── WIZARD CARD ── */}
                <div style={{background:"white",borderRadius:18,boxShadow:"0 2px 16px rgba(0,0,0,0.07)",overflow:"hidden",marginBottom:24}}>
                    {/* Progress */}
                    <div style={{background:"#f8fafc",padding:"14px 20px",borderBottom:"1px solid #e2e8f0"}}>
                        <div style={{display:"flex",alignItems:"center"}}>
                            {["Specialty","Doctor","Details","Confirm"].map((label,i)=>{
                                const num=i+1,done=stepNum[substep]>num,active=stepNum[substep]===num;
                                return(
                                    <div key={label} style={{display:"flex",alignItems:"center",flex:i<3?1:"none"}}>
                                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                                            <div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,background:done?"#14b8a6":active?"#0d4f4f":"#e2e8f0",color:done||active?"white":"#94a3b8",flexShrink:0}}>{done?"✓":num}</div>
                                            <span className="step-label" style={{fontSize:12,fontWeight:600,color:active?"#0d4f4f":done?"#14b8a6":"#94a3b8"}}>{label}</span>
                                        </div>
                                        {i<3&&<div style={{flex:1,height:2,background:done?"#14b8a6":"#e2e8f0",margin:"0 10px"}}/>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{padding:20}}>

                        {/* ── STEP 1: Specialty cards ── */}
                        {substep==="specialty"&&(
                            <div>
                                <div style={{fontWeight:700,fontSize:15,color:"#0f172a",marginBottom:16}}>What type of doctor do you need?</div>
                                {specialties.length===0
                                    ? <div style={{textAlign:"center",padding:"40px",color:"#94a3b8",background:"#f8fafc",borderRadius:12}}>
                                        <div style={{fontSize:32,marginBottom:10}}>👨‍⚕️</div>
                                        No doctors registered yet. Ask admin to add doctors first.
                                      </div>
                                    : <div className="spec-grid">
                                        {specialties.map(spec=>{
                                            const count=allDoctors.filter(d=>d.specialty===spec).length;
                                            return(
                                                <div key={spec} onClick={()=>{setSelectedSpec(spec);setSubstep("doctor");}}
                                                    style={{border:"2px solid #f1f5f9",borderRadius:16,padding:"20px 16px",cursor:"pointer",background:"#fafafa",transition:"all 0.15s",textAlign:"center",position:"relative"}}>
                                                    <div style={{fontSize:36,marginBottom:10}}>{specIcon(spec)}</div>
                                                    <div style={{fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:4}}>{spec}</div>
                                                    <div style={{fontSize:11,color:"#94a3b8"}}>{count} doctor{count!==1?"s":""} available</div>
                                                    <div style={{position:"absolute",top:10,right:10,width:22,height:22,borderRadius:"50%",background:"#f0fdfb",border:"1px solid #ccfbf1",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#14b8a6",fontWeight:700}}>{count}</div>
                                                </div>
                                            );
                                        })}
                                      </div>
                                }
                            </div>
                        )}

                        {/* ── STEP 2: Doctors in that specialty ── */}
                        {substep==="doctor"&&(
                            <div>
                                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                                    <div style={{fontSize:28}}>{specIcon(selectedSpec)}</div>
                                    <div>
                                        <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{selectedSpec}</div>
                                        <div style={{fontSize:12,color:"#64748b"}}>{specDoctors.length} doctor{specDoctors.length!==1?"s":""} available</div>
                                    </div>
                                </div>
                                {specDoctors.length===0
                                    ? <div style={{textAlign:"center",padding:"30px",color:"#94a3b8",background:"#f8fafc",borderRadius:12}}>No available doctors in this specialty right now.</div>
                                    : <div className="dr-pick-grid">
                                        {specDoctors.map(d=>(
                                            <div key={d.id} onClick={()=>{setSelectedDr(d);setSubstep("details");}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px",border:"2px solid #f1f5f9",borderRadius:14,cursor:"pointer",background:"#fafafa",transition:"all 0.15s"}}>
                                                <img src={d.avatar?`http://localhost:5000${d.avatar}`:uiAv(d.name,"0d4f4f")} alt={d.name} style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid #e2e8f0"}}/>
                                                <div style={{flex:1,minWidth:0}}>
                                                    <div style={{fontWeight:700,fontSize:14,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.name}</div>
                                                    <div style={{fontSize:12,color:"#64748b"}}>{d.specialty}</div>
                                                    <div style={{fontSize:11,color:"#0d4f4f",marginTop:3,fontWeight:600}}>
                                                        {d.experience&&`${d.experience}`}{d.fee?` · $${d.fee}/visit`:""}
                                                    </div>
                                                </div>
                                                <div style={{color:"#14b8a6",fontSize:20}}>→</div>
                                            </div>
                                        ))}
                                      </div>
                                }
                                <button onClick={()=>setSubstep("specialty")} style={{...outBtn,marginTop:14}}>← Back</button>
                            </div>
                        )}

                        {/* ── STEP 3: Details ── */}
                        {substep==="details"&&selectedDr&&(
                            <div>
                                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,background:"#f0fdfb",borderRadius:14,padding:"12px 16px",border:"1px solid #ccfbf1"}}>
                                    <img src={selectedDr.avatar?`http://localhost:5000${selectedDr.avatar}`:uiAv(selectedDr.name,"0d4f4f")} alt="" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                                    <div style={{flex:1}}>
                                        <div style={{fontWeight:800,fontSize:15,color:"#0d4f4f"}}>{selectedDr.name}</div>
                                        <div style={{fontSize:12,color:"#64748b"}}>{selectedDr.specialty}{selectedDr.experience&&` · ${selectedDr.experience}`}{selectedDr.fee&&` · $${selectedDr.fee}/visit`}</div>
                                    </div>
                                    <button onClick={()=>setSubstep("doctor")} style={{background:"none",border:"1px solid #ccfbf1",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#0d4f4f",cursor:"pointer",fontWeight:600}}>Change</button>
                                </div>
                                <div className="form-grid">
                                    <div>
                                        <label style={lbSt}>Appointment Date</label>
                                        <input type="date" value={form.date} min={minDate()} onChange={e=>setForm(f=>({...f,date:e.target.value,time_slot:""}))} style={inSt}/>
                                    </div>
                                    <div>
                                        <label style={lbSt}>Appointment Type</label>
                                        <div style={{display:"flex",gap:10}}>
                                            {[["in-person","🏥","In-Person"],["online","💻","Online"]].map(([val,icon,label])=>(
                                                <div key={val} onClick={()=>setForm(f=>({...f,visit_type:val}))} style={{flex:1,padding:"10px 12px",borderRadius:12,cursor:"pointer",border:form.visit_type===val?"2px solid #14b8a6":"2px solid #e2e8f0",background:form.visit_type===val?"#f0fdfb":"white",textAlign:"center",transition:"all 0.15s"}}>
                                                    <div style={{fontSize:20}}>{icon}</div>
                                                    <div style={{fontWeight:700,fontSize:12,color:"#0f172a",marginTop:4}}>{label}</div>
                                                    {form.visit_type===val&&<div style={{fontSize:10,color:"#14b8a6",fontWeight:700}}>✔ Selected</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="full-w">
                                        <label style={lbSt}>Available Slots {form.date&&<span style={{fontWeight:400,color:"#94a3b8",fontSize:11}}>— {fmtDate(form.date)}</span>}</label>
                                        {!form.date
                                            ? <div style={{padding:14,borderRadius:10,background:"#f8fafc",border:"1.5px solid #e2e8f0",fontSize:13,color:"#94a3b8",textAlign:"center"}}>Select a date first</div>
                                            : slotsLoad
                                                ? <div style={{padding:14,textAlign:"center",color:"#14b8a6",fontSize:13}}>Loading slots...</div>
                                                : slots.length===0
                                                    ? <div style={{padding:14,borderRadius:10,background:"#fef9c3",border:"1px solid #fde68a",fontSize:13,color:"#b45309",textAlign:"center"}}>⚠️ No slots on this day. Try another date.</div>
                                                    : <div className="slot-grid">
                                                        {slots.map(s=>(
                                                            <div key={s.time} onClick={()=>s.available&&setForm(f=>({...f,time_slot:s.time}))} style={{padding:"9px 4px",borderRadius:9,textAlign:"center",cursor:s.available?"pointer":"not-allowed",fontSize:12,fontWeight:600,border:form.time_slot===s.time?"2px solid #14b8a6":s.available?"2px solid #e2e8f0":"2px solid #f1f5f9",background:form.time_slot===s.time?"#f0fdfb":s.available?"#f8fafc":"#f1f5f9",color:form.time_slot===s.time?"#0d9488":s.available?"#475569":"#cbd5e1"}}>
                                                                {fmtTime(s.time)}
                                                                {!s.available&&<div style={{fontSize:9,color:"#ef4444",fontWeight:700}}>Booked</div>}
                                                            </div>
                                                        ))}
                                                      </div>
                                        }
                                    </div>
                                    <div className="full-w">
                                        <label style={lbSt}>Describe Your Problem <span style={{color:"#ef4444"}}>*</span></label>
                                        <textarea placeholder="Describe symptoms, how long, relevant history..." value={form.problem} onChange={e=>setForm(f=>({...f,problem:e.target.value}))} rows={4} style={{...inSt,resize:"vertical",lineHeight:1.6}}/>
                                    </div>
                                </div>
                                <div style={{display:"flex",gap:10,marginTop:8}}>
                                    <button onClick={()=>setSubstep("doctor")} style={outBtn}>← Back</button>
                                    <button onClick={()=>{if(!form.date||!form.time_slot||!form.problem.trim()){showToast("Fill all fields.",false);return;}setSubstep("confirm");}} style={{...primBtn,flex:1}}>Review →</button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 4: Confirm ── */}
                        {substep==="confirm"&&selectedDr&&(
                            <div>
                                <div style={{fontWeight:800,fontSize:15,color:"#0f172a",marginBottom:14}}>Review & Confirm</div>
                                <div style={{background:"#f8fafc",borderRadius:14,padding:"16px 18px",marginBottom:14,border:"1px solid #e2e8f0"}}>
                                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,paddingBottom:14,borderBottom:"1px solid #e2e8f0"}}>
                                        <img src={selectedDr.avatar?`http://localhost:5000${selectedDr.avatar}`:uiAv(selectedDr.name,"0d4f4f")} alt="" style={{width:46,height:46,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                                        <div><div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>{selectedDr.name}</div><div style={{fontSize:12,color:"#64748b"}}>{selectedDr.specialty}</div></div>
                                    </div>
                                    <div className="confirm-grid">
                                        {[["Date",fmtDate(form.date)],["Time",fmtTime(form.time_slot)],["Type",form.visit_type==="online"?"💻 Online":"🏥 In-Person"],["Fee",selectedDr.fee?`$${selectedDr.fee}`:"N/A"]].map(([l,v])=>(
                                            <div key={l}><div style={{fontSize:11,color:"#94a3b8",marginBottom:3}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{v}</div></div>
                                        ))}
                                    </div>
                                    <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #e2e8f0"}}>
                                        <div style={{fontSize:11,color:"#94a3b8",marginBottom:4}}>Problem</div>
                                        <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>{form.problem}</div>
                                    </div>
                                </div>
                                {form.visit_type==="online"&&<div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12,padding:"12px 16px",marginBottom:14,fontSize:12,color:"#1d4ed8",fontWeight:600}}>💻 After booking, open the consultation chat to talk with AI and your doctor.</div>}
                                {form.visit_type==="in-person"&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"12px 16px",marginBottom:14,fontSize:12,color:"#15803d",fontWeight:600}}>🏥 Please arrive 10 minutes early. Bring your ID and previous medical reports.</div>}
                                <div style={{display:"flex",gap:10}}>
                                    <button onClick={()=>setSubstep("details")} style={outBtn}>← Edit</button>
                                    <button onClick={handleBook} disabled={booking} style={{...primBtn,flex:1}}>{booking?"Booking...":"✅ Confirm Booking"}</button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* ── MY APPOINTMENTS ── */}
                <div style={{background:"white",borderRadius:18,boxShadow:"0 2px 16px rgba(0,0,0,0.07)",overflow:"hidden"}}>
                    <div style={{padding:"14px 20px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                        <div style={{fontWeight:800,fontSize:15,color:"#0f172a"}}>My Appointments</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {["All","Pending","Confirmed","Completed","Cancelled"].map(f=>(
                                <button key={f} onClick={()=>setApptFilter(f)} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:apptFilter===f?"#0d4f4f":"#f1f5f9",color:apptFilter===f?"white":"#64748b"}}>
                                    {f} <span style={{opacity:0.7}}>({(f==="All"?appointments:appointments.filter(a=>a.status===f)).length})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {filtAppts.length===0
                        ? <div style={{padding:"40px",textAlign:"center",color:"#94a3b8"}}><div style={{fontSize:32,marginBottom:10}}>📅</div>No appointments found.</div>
                        : filtAppts.map(a=>(
                            <div key={a.id}>
                                <div onClick={()=>setExpandedId(expandedId===a.id?null:a.id)} style={{padding:"14px 20px",cursor:"pointer",background:expandedId===a.id?"#f8fafc":"white",borderBottom:expandedId===a.id?"none":"1px solid #f1f5f9",transition:"background 0.15s"}}>
                                    <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                                        <img src={a.doctor_avatar?`http://localhost:5000${a.doctor_avatar}`:uiAv(a.doctor_name,"6366f1")} alt="" style={{width:44,height:44,borderRadius:12,objectFit:"cover",flexShrink:0,border:"2px solid #e2e8f0"}}/>
                                        <div style={{flex:1,minWidth:140}}>
                                            <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>{a.doctor_name}</div>
                                            <div style={{fontSize:12,color:"#94a3b8"}}>{a.specialty} · {fmtDate(a.date)} · {fmtTime(a.time_slot)}</div>
                                            <div style={{fontSize:12,color:"#64748b",marginTop:2}}><span style={{fontWeight:600}}>Problem:</span> {a.problem?.substring(0,60)}{a.problem?.length>60?"...":""}</div>
                                        </div>
                                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",flexShrink:0}}>
                                            <Badge s={a.status}/>
                                            {a.ai_risk&&<Badge s={a.ai_risk} map={RCLR}/>}
                                            <span style={{fontSize:12,fontWeight:600,color:a.visit_type==="online"?"#0284c7":"#0d4f4f"}}>{a.visit_type==="online"?"💻":"🏥"}</span>
                                            {a.visit_type==="online"&&a.status!=="Cancelled"&&<button onClick={e=>{e.stopPropagation();setChatAppt(a);}} style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>💬 Chat</button>}
                                            <span style={{fontSize:14,color:"#94a3b8"}}>{expandedId===a.id?"▲":"▼"}</span>
                                        </div>
                                    </div>
                                </div>
                                {expandedId===a.id&&(
                                    <div style={{background:"#f8fafc",padding:"14px 20px",borderBottom:"1px solid #e2e8f0"}}>
                                        <div className="expand-grid">
                                            <div style={{background:"white",borderRadius:12,padding:14,border:"1px solid #e2e8f0"}}>
                                                <div style={{fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8}}>{a.visit_type==="online"?"💻 Online Consultation":"🏥 Visit Info"}</div>
                                                {a.visit_type==="online"
                                                    ? <div style={{fontSize:12,color:"#64748b",lineHeight:1.8}}>📱 Chat with AI assistant<br/>💬 Talk with {a.doctor_name}<br/>📋 Generate clinical summary</div>
                                                    : <div style={{fontSize:12,color:"#64748b",lineHeight:1.8}}>📍 Arrive 10 minutes early<br/>🪪 Bring your ID card<br/>📋 Carry previous reports<br/>🚫 No food 2hrs before if blood test</div>
                                                }
                                                <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                                                    {a.visit_type==="online"&&a.status!=="Cancelled"&&<button onClick={()=>setChatAppt(a)} style={{...primBtn,fontSize:12,padding:"8px 14px"}}>💬 Open Chat</button>}
                                                    {(a.status==="Pending"||a.status==="Confirmed")&&<button onClick={()=>handleCancel(a.id)} style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:10,padding:"8px 14px",fontWeight:700,fontSize:12,cursor:"pointer"}}>✕ Cancel</button>}
                                                </div>
                                            </div>
                                            <div style={{background:"white",borderRadius:12,padding:14,border:"1px solid #e2e8f0"}}>
                                                <div style={{fontWeight:700,fontSize:13,color:"#0f172a",marginBottom:8}}>🧠 AI Analysis</div>
                                                {a.ai_analysis
                                                    ? <div style={{fontSize:12,color:"#475569",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{a.ai_analysis}</div>
                                                    : <div style={{fontSize:12,color:"#94a3b8"}}>No AI analysis yet. {a.visit_type==="online"?"Open chat to generate.":""}</div>
                                                }
                                                {a.cancel_reason&&<div style={{marginTop:8,background:"#fee2e2",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#dc2626"}}><strong>Reason:</strong> {a.cancel_reason}</div>}
                                                {a.notes&&<div style={{marginTop:8,background:"#fffbeb",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#92400e"}}><strong>Doctor's notes:</strong> {a.notes}</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    }
                </div>

            </div>

            <style>{`
                @media(min-width:769px){
                    .ba-wrap{padding:24px 28px !important;}
                    .pt-name-desk{display:block !important;}
                    .spec-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
                    .dr-pick-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
                    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
                    .slot-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;}
                    .confirm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
                    .expand-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
                    .step-label{display:inline !important;}
                    .full-w{grid-column:1/-1;}
                }
                @media(max-width:768px){
                    .spec-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}
                    .dr-pick-grid{display:flex;flex-direction:column;gap:10px;}
                    .form-grid{display:flex;flex-direction:column;gap:14px;}
                    .expand-grid{display:flex;flex-direction:column;gap:12px;}
                    .slot-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
                    .confirm-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
                    .expand-grid{display:flex;flexDirection:column;gap:12px;}
                    .step-label{display:none !important;}
                    .full-w{width:100%;}
                }
                select,input,textarea{font-family:inherit;}
                div::-webkit-scrollbar{width:4px;height:4px;}
                div::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
                @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
                @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
                .spec-grid > div:hover{border-color:#14b8a6!important;background:#f0fdfb!important;transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,0.08);}
                .dr-pick-grid > div:hover{border-color:#14b8a6!important;background:#f0fdfb!important;}
            `}</style>
        </div>
    );
}

const lbSt  = {fontSize:12,fontWeight:700,color:"#475569",marginBottom:6,display:"block"};
const inSt  = {padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%",boxSizing:"border-box"};
const primBtn={background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:12,padding:"12px 24px",fontWeight:700,fontSize:14,cursor:"pointer"};
const outBtn ={background:"white",color:"#64748b",border:"2px solid #e2e8f0",borderRadius:12,padding:"12px 20px",fontWeight:700,fontSize:13,cursor:"pointer"};