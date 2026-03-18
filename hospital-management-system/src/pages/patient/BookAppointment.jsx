import { useState, useRef, useEffect } from "react";

/* ── DATA ─────────────────────────────────────── */
const doctorCategories = [
  { specialty: "Cardiologist",      icon: "🫀", desc: "Heart & cardiovascular issues",   doctors: ["Dr. Emily Chen", "Dr. Tariq Mehmood"] },
  { specialty: "Endocrinologist",   icon: "🩸", desc: "Diabetes, thyroid, hormones",     doctors: ["Dr. James Liu", "Dr. Amna Siddiqui"] },
  { specialty: "Dermatologist",     icon: "🧴", desc: "Skin, hair & nail problems",      doctors: ["Dr. Sarah Malik", "Dr. Hassan Raza"] },
  { specialty: "General Physician", icon: "🩺", desc: "General health & checkups",       doctors: ["Dr. Hamid Raza", "Dr. Fatima Zahra"] },
  { specialty: "Neurologist",       icon: "🧠", desc: "Brain, nerves & headaches",       doctors: ["Dr. Ali Nawaz", "Dr. Sana Baig"] },
  { specialty: "Orthopedic",        icon: "🦴", desc: "Bones, joints & muscle pain",     doctors: ["Dr. Usman Butt", "Dr. Zara Khan"] },
];

const timeSlots = ["09:00 AM","10:00 AM","10:30 AM","11:00 AM","12:00 PM","02:00 PM","03:00 PM","04:00 PM"];

const statusColor = {
  Confirmed: { bg:"#dcfce7", color:"#16a34a" },
  Pending:   { bg:"#fef9c3", color:"#ca8a04" },
  Cancelled: { bg:"#fee2e2", color:"#dc2626" },
  Completed: { bg:"#e0f2fe", color:"#0284c7" },
};

const PATIENT_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";
const DR_AVATARS = {
  "Dr. Emily Chen":   "https://randomuser.me/api/portraits/women/44.jpg",
  "Dr. James Liu":    "https://randomuser.me/api/portraits/men/46.jpg",
  "Dr. Sarah Malik":  "https://randomuser.me/api/portraits/women/65.jpg",
  "Dr. Hamid Raza":   "https://randomuser.me/api/portraits/men/61.jpg",
  "Dr. Ali Nawaz":    "https://randomuser.me/api/portraits/men/55.jpg",
  "Dr. Usman Butt":   "https://randomuser.me/api/portraits/men/22.jpg",
  "Dr. Tariq Mehmood":"https://randomuser.me/api/portraits/men/36.jpg",
  "Dr. Amna Siddiqui":"https://randomuser.me/api/portraits/women/33.jpg",
  "Dr. Hassan Raza":  "https://randomuser.me/api/portraits/men/41.jpg",
  "Dr. Fatima Zahra": "https://randomuser.me/api/portraits/women/55.jpg",
  "Dr. Sana Baig":    "https://randomuser.me/api/portraits/women/22.jpg",
  "Dr. Zara Khan":    "https://randomuser.me/api/portraits/women/11.jpg",
};

/* ══════════════════════════════════════════════
   CONSULTATION CHAT MODAL
   Shows: AI tab + Dr tab (shared convo)
══════════════════════════════════════════════ */
function ConsultationChat({ appt, onClose }) {
  const [activeTab, setActiveTab]     = useState("ai");   // "ai" | "doctor"
  const [chatRole, setChatRole]       = useState("patient"); // "patient" | "doctor"

  // Shared doctor-patient conversation
  const [drConvo, setDrConvo]         = useState([
    { role:"doctor", text:`Hello! I'm ${appt.doctor}. I've reviewed your notes. How are you feeling today?`, time:"10:01 AM" },
  ]);
  const [drInput, setDrInput]         = useState("");
  const [drLoading, setDrLoading]     = useState(false);

  // AI chat
  const [aiMessages, setAiMessages]   = useState([]);
  const [aiInput, setAiInput]         = useState("");
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiAnalysis, setAiAnalysis]   = useState(appt.aiAnalysis || "");
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const drEndRef  = useRef(null);
  const aiEndRef  = useRef(null);

  useEffect(() => { drEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [drConvo]);
  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [aiMessages]);

  const now = () => new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

  /* ── Send to Dr chat ── */
  const sendDrMsg = async () => {
    const msg = drInput.trim(); if (!msg) return;
    const sender = chatRole;
    setDrConvo(p => [...p, { role:sender, text:msg, time:now() }]);
    setDrInput("");

    // If doctor side: AI generates doctor reply automatically
    if (chatRole === "patient") {
      setDrLoading(true);
      try {
        const history = drConvo.map(m => ({
          role: m.role === "doctor" ? "assistant" : "user",
          content: m.text,
        }));
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST", headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:600,
            system:`You are ${appt.doctor}, a ${appt.specialty}. You are in a live online consultation with a patient. Patient problem: "${appt.problem}". Reply as the doctor — warm, professional, concise. Ask follow-up questions. Give medical advice carefully. Max 3 sentences.`,
            messages: [...history, { role:"user", content:msg }],
          }),
        });
        const data = await res.json();
        const reply = data.content?.[0]?.text || "I see, let me check that for you.";
        setTimeout(() => {
          setDrConvo(p => [...p, { role:"doctor", text:reply, time:now() }]);
          setDrLoading(false);
        }, 800);
      } catch {
        setDrConvo(p => [...p, { role:"doctor", text:"Sorry, I'm having connectivity issues. Please try again.", time:now() }]);
        setDrLoading(false);
      }
    }
  };

  /* ── Send to AI chat ── */
  const sendAiMsg = async () => {
    const msg = aiInput.trim(); if (!msg) return;
    setAiMessages(p => [...p, { role:"user", text:msg, time:now() }]);
    setAiInput("");
    setAiLoading(true);
    try {
      const history = aiMessages.map(m => ({ role: m.role==="user"?"user":"assistant", content:m.text }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:800,
          system:`You are a helpful hospital AI assistant. Patient has an online consultation with ${appt.doctor} (${appt.specialty}). Problem: ${appt.problem}. Help patient understand symptoms, prepare questions for the doctor, and give general health tips. Be warm, concise. Never diagnose definitively.`,
          messages:[...history, { role:"user", content:msg }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, could not process.";
      setAiMessages(p => [...p, { role:"ai", text:reply, time:now() }]);
    } catch {
      setAiMessages(p => [...p, { role:"ai", text:"⚠️ AI unavailable right now.", time:now() }]);
    }
    setAiLoading(false);
  };

  /* ── Generate AI Analysis ── */
  const generateAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const convo = aiMessages.map(m=>`${m.role==="user"?"Patient":"AI"}: ${m.text}`).join("\n");
      const drChat = drConvo.map(m=>`${m.role==="doctor"?"Doctor":"Patient"}: ${m.text}`).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:600,
          system:"You are a medical AI. Based on all conversations, write a concise clinical summary: symptoms mentioned, key findings, and recommended next steps. Max 100 words. Professional tone.",
          messages:[{ role:"user", content:`Doctor: ${appt.doctor} (${appt.specialty})\nProblem: ${appt.problem}\n\nAI Chat:\n${convo||"None"}\n\nDoctor-Patient Chat:\n${drChat}\n\nProvide summary.` }],
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.content?.[0]?.text || "Could not generate.");
    } catch { setAiAnalysis("⚠️ Could not generate analysis."); }
    setAnalysisLoading(false);
  };

  const drAvatar = DR_AVATARS[appt.doctor] || "https://randomuser.me/api/portraits/men/75.jpg";

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.55)",
      zIndex:100, display:"flex", alignItems:"center", justifyContent:"center",
      padding:12,
    }}>
      <div style={{
        background:"white", borderRadius:20, width:"100%", maxWidth:860,
        maxHeight:"92vh", display:"flex", flexDirection:"column",
        boxShadow:"0 20px 60px rgba(0,0,0,0.3)", overflow:"hidden",
      }}>

        {/* ── MODAL HEADER ── */}
        <div style={{
          background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",
          padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
          flexShrink:0,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <img src={drAvatar} alt={appt.doctor}
              style={{ width:42, height:42, borderRadius:"50%", objectFit:"cover",
                border:"2px solid rgba(255,255,255,0.5)" }} />
            <div>
              <div style={{ color:"white", fontWeight:800, fontSize:15 }}>{appt.doctor}</div>
              <div style={{ color:"rgba(255,255,255,0.75)", fontSize:12 }}>
                {appt.specialty} · 💻 Online Consultation
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Role toggle */}
            <div style={{ display:"flex", background:"rgba(255,255,255,0.15)", borderRadius:20, padding:3 }}>
              {["patient","doctor"].map(r => (
                <button key={r} onClick={() => setChatRole(r)} style={{
                  padding:"5px 12px", borderRadius:16, border:"none", cursor:"pointer",
                  fontSize:11, fontWeight:700, transition:"all 0.2s",
                  background: chatRole===r ? "white" : "transparent",
                  color: chatRole===r ? "#0d4f4f" : "rgba(255,255,255,0.8)",
                }}>
                  {r==="patient" ? "👤 Patient" : "👨‍⚕️ Doctor"}
                </button>
              ))}
            </div>
            <button onClick={onClose} style={{
              background:"rgba(255,255,255,0.2)", border:"none", color:"white",
              borderRadius:"50%", width:32, height:32, cursor:"pointer",
              fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
            }}>✕</button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:"flex", borderBottom:"2px solid #f1f5f9", flexShrink:0 }}>
          {[
            { id:"ai",     label:"🤖 AI Assistant",          sub:"Symptom help & prep" },
            { id:"doctor", label:`💬 Dr. ${appt.doctor.split(" ").slice(-1)[0]}`, sub:"Live consultation" },
            { id:"summary",label:"📋 Summary",               sub:"AI clinical notes" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex:1, padding:"10px 8px", border:"none", cursor:"pointer",
              background: activeTab===tab.id ? "white" : "#f8fafc",
              borderBottom: activeTab===tab.id ? "2px solid #0d4f4f" : "2px solid transparent",
              transition:"all 0.2s",
            }}>
              <div style={{ fontWeight:700, fontSize:13,
                color: activeTab===tab.id ? "#0d4f4f" : "#64748b" }}>{tab.label}</div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{tab.sub}</div>
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>

          {/* ── AI CHAT TAB ── */}
          {activeTab==="ai" && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ flex:1, overflowY:"auto", padding:"14px 16px",
                display:"flex", flexDirection:"column", gap:10 }}>
                {!aiMessages.length && (
                  <div style={{ background:"#f0fdfb", borderRadius:"4px 12px 12px 12px",
                    padding:"12px 16px", fontSize:13, color:"#0f172a", maxWidth:"85%" }}>
                    👋 Hi! I'm your AI health assistant. Ask me anything about your symptoms, or I can help you prepare questions for {appt.doctor}.
                    <br/><br/><strong>Problem noted:</strong> {appt.problem}
                  </div>
                )}
                {aiMessages.map((m,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start",
                    alignItems:"flex-end", gap:8 }}>
                    {m.role==="ai" && <div style={{ fontSize:22, flexShrink:0 }}>🤖</div>}
                    <div style={{ maxWidth:"78%" }}>
                      <div style={{
                        padding:"10px 14px", fontSize:13, lineHeight:1.6,
                        borderRadius: m.role==="user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                        background: m.role==="user" ? "#0d4f4f" : "#f1f5f9",
                        color: m.role==="user" ? "white" : "#1e293b",
                      }}>{m.text}</div>
                      <div style={{ fontSize:10, color:"#94a3b8", marginTop:3,
                        textAlign: m.role==="user"?"right":"left" }}>{m.time}</div>
                    </div>
                    {m.role==="user" && <img src={PATIENT_AVATAR} alt="you"
                      style={{ width:28, height:28, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />}
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ fontSize:22 }}>🤖</div>
                    <div style={{ display:"flex", gap:5, padding:"10px 14px",
                      background:"#f1f5f9", borderRadius:"4px 14px 14px 14px" }}>
                      {[0,1,2].map(i=>(
                        <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#14b8a6",
                          animation:`bounce 1s infinite ${i*0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={aiEndRef} />
              </div>
              <div style={{ padding:"10px 14px", borderTop:"1px solid #f1f5f9", display:"flex", gap:8, flexShrink:0 }}>
                <input placeholder="Ask AI about your symptoms or appointment..."
                  value={aiInput} onChange={e=>setAiInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendAiMsg()}
                  style={{ flex:1, padding:"10px 14px", borderRadius:12,
                    border:"1.5px solid #e2e8f0", fontSize:13, outline:"none", background:"#f8fafc" }} />
                <button onClick={sendAiMsg} style={{
                  background:"#0d4f4f", color:"white", border:"none",
                  borderRadius:12, padding:"10px 16px", cursor:"pointer", fontWeight:700, fontSize:14,
                }}>➤</button>
              </div>
            </div>
          )}

          {/* ── DOCTOR CHAT TAB ── */}
          {activeTab==="doctor" && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              {/* Online badge */}
              <div style={{ background:"#f0fdf4", padding:"8px 16px", borderBottom:"1px solid #dcfce7",
                display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#16a34a",
                  animation:"pulse 2s infinite" }} />
                <span style={{ fontSize:12, color:"#15803d", fontWeight:600 }}>
                  {appt.doctor} is online · Live consultation in progress
                </span>
                <span style={{ marginLeft:"auto", fontSize:11, color:"#94a3b8" }}>
                  Viewing as: <strong>{chatRole==="patient"?"Patient 👤":"Doctor 👨‍⚕️"}</strong>
                </span>
              </div>

              {/* Messages */}
              <div style={{ flex:1, overflowY:"auto", padding:"14px 16px",
                display:"flex", flexDirection:"column", gap:12 }}>
                {drConvo.map((m,i) => {
                  const isMe = (chatRole==="patient" && m.role==="patient") ||
                               (chatRole==="doctor"  && m.role==="doctor");
                  const isDoctor = m.role==="doctor";
                  return (
                    <div key={i} style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start",
                      alignItems:"flex-end", gap:8 }}>
                      {!isMe && (
                        <img src={isDoctor ? drAvatar : PATIENT_AVATAR} alt=""
                          style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                      )}
                      <div style={{ maxWidth:"75%" }}>
                        {!isMe && (
                          <div style={{ fontSize:11, color:"#64748b", marginBottom:3, fontWeight:600 }}>
                            {isDoctor ? appt.doctor : "Patient (You)"}
                          </div>
                        )}
                        <div style={{
                          padding:"11px 15px", fontSize:13, lineHeight:1.6,
                          borderRadius: isMe ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                          background: isMe ? (chatRole==="doctor"?"#1a3fce":"#0d4f4f") : "white",
                          color: isMe ? "white" : "#1e293b",
                          boxShadow: isMe ? "none" : "0 1px 4px rgba(0,0,0,0.08)",
                          border: isMe ? "none" : "1px solid #f1f5f9",
                        }}>{m.text}</div>
                        <div style={{ fontSize:10, color:"#94a3b8", marginTop:3,
                          textAlign:isMe?"right":"left" }}>{m.time}</div>
                      </div>
                      {isMe && (
                        <img src={chatRole==="doctor" ? drAvatar : PATIENT_AVATAR} alt="you"
                          style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                      )}
                    </div>
                  );
                })}
                {drLoading && (
                  <div style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
                    <img src={drAvatar} alt="" style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover" }} />
                    <div style={{ display:"flex", gap:5, padding:"11px 15px",
                      background:"white", borderRadius:"4px 14px 14px 14px",
                      boxShadow:"0 1px 4px rgba(0,0,0,0.08)", border:"1px solid #f1f5f9" }}>
                      {[0,1,2].map(i=>(
                        <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#1a3fce",
                          animation:`bounce 1s infinite ${i*0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={drEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding:"10px 14px", borderTop:"1px solid #f1f5f9",
                display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
                <img src={chatRole==="doctor" ? drAvatar : PATIENT_AVATAR} alt=""
                  style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                <input
                  placeholder={chatRole==="patient"
                    ? "Message your doctor..."
                    : `Replying as ${appt.doctor}...`}
                  value={drInput} onChange={e=>setDrInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&sendDrMsg()}
                  style={{ flex:1, padding:"10px 14px", borderRadius:12,
                    border: chatRole==="doctor" ? "1.5px solid #1a3fce" : "1.5px solid #0d4f4f",
                    fontSize:13, outline:"none", background:"#f8fafc" }}
                />
                <button onClick={sendDrMsg} style={{
                  background: chatRole==="doctor" ? "#1a3fce" : "#0d4f4f",
                  color:"white", border:"none", borderRadius:12,
                  padding:"10px 16px", cursor:"pointer", fontWeight:700, fontSize:14,
                }}>➤</button>
              </div>
            </div>
          )}

          {/* ── SUMMARY TAB ── */}
          {activeTab==="summary" && (
            <div style={{ flex:1, overflowY:"auto", padding:"18px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div style={{ fontWeight:800, fontSize:15, color:"#0f172a" }}>📋 Clinical Summary</div>
                <button onClick={generateAnalysis} disabled={analysisLoading} style={{
                  background: analysisLoading ? "#e2e8f0" : "linear-gradient(120deg,#0d4f4f,#14b8a6)",
                  color: analysisLoading ? "#94a3b8" : "white",
                  border:"none", borderRadius:10, padding:"9px 18px",
                  fontWeight:700, fontSize:13, cursor: analysisLoading?"not-allowed":"pointer",
                }}>
                  {analysisLoading ? "Generating..." : "⚡ Generate Summary"}
                </button>
              </div>

              {/* Patient info */}
              <div style={{ background:"#f8fafc", borderRadius:14, padding:"14px 16px",
                border:"1px solid #e2e8f0", marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#0f172a", marginBottom:8 }}>Appointment Info</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 16px" }}>
                  {[["Doctor",appt.doctor],["Specialty",appt.specialty],
                    ["Date",appt.date],["Time",appt.time],
                    ["Type","💻 Online Consultation"],["Status",appt.status]
                  ].map(([l,v])=>(
                    <div key={l}>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>{l}: </span>
                      <span style={{ fontSize:12, fontWeight:600, color:"#1e293b" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid #e2e8f0" }}>
                  <span style={{ fontSize:11, color:"#94a3b8" }}>Problem: </span>
                  <span style={{ fontSize:12, color:"#1e293b" }}>{appt.problem}</span>
                </div>
              </div>

              {/* AI Analysis result */}
              <div style={{ background:"white", borderRadius:14, padding:"14px 16px",
                border:"1px solid #e2e8f0" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:18 }}>🧠</span>
                  <span style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>AI Clinical Analysis</span>
                </div>
                <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 14px",
                  fontSize:13, color:"#475569", lineHeight:1.7, minHeight:80,
                  border:"1px solid #f1f5f9" }}>
                  {aiAnalysis || (
                    <span style={{ color:"#94a3b8" }}>
                      Click <strong>⚡ Generate Summary</strong> to create an AI clinical summary based on both conversations.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }
        @keyframes pulse  { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function BookAppointment() {
  const [step, setStep]                 = useState(1);
  const [selectedCat, setSelectedCat]   = useState(null);
  const [form, setForm]                 = useState({ doctor:"", date:"", time:"", type:"visit", problem:"" });
  const [appointments, setAppointments] = useState([
    { id:1, doctor:"Dr. Emily Chen",  specialty:"Cardiologist",    date:"2024-03-20", time:"10:30 AM", type:"visit",   problem:"Chest pain on exertion",   status:"Confirmed", aiAnalysis:"Possible angina. ECG recommended." },
    { id:2, doctor:"Dr. James Liu",   specialty:"Endocrinologist", date:"2024-03-25", time:"02:00 PM", type:"online",  problem:"Uncontrolled blood sugar",  status:"Confirmed", aiAnalysis:"" },
  ]);
  const [expandedId,  setExpandedId]    = useState(null);
  const [chatAppt,    setChatAppt]      = useState(null); // opens modal

  const cat = doctorCategories.find(c => c.specialty === selectedCat);
  const resetWizard = () => { setStep(1); setSelectedCat(null); setForm({ doctor:"", date:"", time:"", type:"visit", problem:"" }); };

  const handleConfirm = () => {
    if (!form.doctor||!form.date||!form.time||!form.problem.trim()) { alert("Fill all fields."); return; }
    setAppointments(p => [{
      id:Date.now(), doctor:form.doctor, specialty:selectedCat,
      date:form.date, time:form.time, type:form.type,
      problem:form.problem, status:"Pending", aiAnalysis:"",
    }, ...p]);
    resetWizard();
  };

  return (
    <div style={{ minHeight:"100vh", background:"#eaf1f3", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>

      {/* Consultation Chat Modal */}
      {chatAppt && <ConsultationChat appt={chatAppt} onClose={() => setChatAppt(null)} />}

      {/* Top bar */}
      <div style={{ background:"white", borderBottom:"1px solid #e2e8f0",
        padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:30 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:18, color:"#0f172a" }}>📅 Book an Appointment</div>
          <div style={{ fontSize:12, color:"#64748b" }}>Online or in-person — choose what works for you</div>
        </div>
        {step > 1 && (
          <button onClick={resetWizard} style={{ background:"#f1f5f9", border:"none",
            borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:600,
            color:"#64748b", cursor:"pointer" }}>✕ Cancel</button>
        )}
      </div>

      <div style={{ padding:"20px 16px", maxWidth:900, margin:"0 auto" }} className="ba-body">

        {/* ── WIZARD ── */}
        {step <= 3 && (
          <div style={{ background:"white", borderRadius:18,
            boxShadow:"0 2px 16px rgba(0,0,0,0.07)", overflow:"hidden", marginBottom:28 }}>

            {/* Progress */}
            <div style={{ background:"#f8fafc", padding:"14px 20px", borderBottom:"1px solid #e2e8f0" }}>
              <div style={{ display:"flex", alignItems:"center" }}>
                {["Choose Specialty","Fill Details","Confirm"].map((label,i) => {
                  const num=i+1; const done=step>num; const active=step===num;
                  return (
                    <div key={label} style={{ display:"flex", alignItems:"center", flex:i<2?1:"none" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", display:"flex",
                          alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12,
                          background: done?"#14b8a6":active?"#0d4f4f":"#e2e8f0",
                          color: done||active?"white":"#94a3b8", flexShrink:0 }}>
                          {done?"✓":num}
                        </div>
                        <span className="step-label" style={{ fontSize:12, fontWeight:600,
                          color:active?"#0d4f4f":done?"#14b8a6":"#94a3b8" }}>{label}</span>
                      </div>
                      {i<2 && <div style={{ flex:1, height:2, background:done?"#14b8a6":"#e2e8f0", margin:"0 12px" }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ padding:20 }}>
              {/* STEP 1 */}
              {step===1 && (
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#0f172a", marginBottom:16 }}>What type of doctor do you need?</div>
                  <div className="cat-grid">
                    {doctorCategories.map(c => (
                      <div key={c.specialty}
                        onClick={()=>{ setSelectedCat(c.specialty); setForm(f=>({...f,doctor:c.doctors[0]})); setStep(2); }}
                        style={{ border:"2px solid #f1f5f9", borderRadius:14, padding:"16px 14px",
                          cursor:"pointer", background:"#fafafa", transition:"all 0.15s", textAlign:"center",
                          ":hover":{ border:"2px solid #14b8a6" } }}>
                        <div style={{ fontSize:32, marginBottom:8 }}>{c.icon}</div>
                        <div style={{ fontWeight:700, fontSize:13, color:"#0f172a", marginBottom:4 }}>{c.specialty}</div>
                        <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.4 }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step===2 && cat && (
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                    <div style={{ fontSize:28 }}>{cat.icon}</div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15, color:"#0f172a" }}>{cat.specialty}</div>
                      <div style={{ fontSize:12, color:"#64748b" }}>{cat.desc}</div>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div>
                      <label style={labelStyle}>Select Doctor</label>
                      <select value={form.doctor} onChange={e=>setForm(f=>({...f,doctor:e.target.value}))} style={selectSt}>
                        {cat.doctors.map(d=><option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Appointment Date</label>
                      <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inputSt} />
                    </div>
                    <div className="full-width">
                      <label style={labelStyle}>Appointment Type</label>
                      <div style={{ display:"flex", gap:10 }}>
                        {[["visit","🏥","Hospital Visit","Come in person"],["online","💻","Online Consultation","Video + chat with doctor"]].map(([val,icon,title,sub])=>(
                          <div key={val} onClick={()=>setForm(f=>({...f,type:val}))} style={{
                            flex:1, padding:"12px 14px", borderRadius:12, cursor:"pointer",
                            border: form.type===val?"2px solid #14b8a6":"2px solid #e2e8f0",
                            background: form.type===val?"#f0fdfb":"white", transition:"all 0.15s",
                          }}>
                            <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
                            <div style={{ fontWeight:700, fontSize:13, color:"#0f172a" }}>{title}</div>
                            <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{sub}</div>
                            {form.type===val && <div style={{ fontSize:11, color:"#14b8a6", fontWeight:700, marginTop:4 }}>✔ Selected</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="full-width">
                      <label style={labelStyle}>Available Time Slots</label>
                      <div className="slot-grid">
                        {timeSlots.map(slot=>(
                          <div key={slot} onClick={()=>setForm(f=>({...f,time:slot}))} style={{
                            padding:"9px 4px", borderRadius:9, textAlign:"center", cursor:"pointer",
                            fontSize:12, fontWeight:600,
                            border: form.time===slot?"2px solid #14b8a6":"2px solid #e2e8f0",
                            background: form.time===slot?"#f0fdfb":"#f8fafc",
                            color: form.time===slot?"#0d9488":"#475569",
                          }}>{slot}</div>
                        ))}
                      </div>
                    </div>
                    <div className="full-width">
                      <label style={labelStyle}>Describe Your Problem <span style={{ color:"#ef4444" }}>*</span></label>
                      <textarea placeholder="Describe your symptoms, duration, and any relevant history..."
                        value={form.problem} onChange={e=>setForm(f=>({...f,problem:e.target.value}))}
                        rows={4} style={{ ...inputSt, resize:"vertical", lineHeight:1.6 }} />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, marginTop:8 }}>
                    <button onClick={()=>setStep(1)} style={outlineBtn}>← Back</button>
                    <button onClick={()=>{ if(!form.date||!form.time||!form.problem.trim()){alert("Fill all fields.");return;} setStep(3); }}
                      style={{ ...primaryBtn, flex:1 }}>Review →</button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step===3 && cat && (
                <div>
                  <div style={{ fontWeight:800, fontSize:15, color:"#0f172a", marginBottom:14 }}>Review & Confirm</div>
                  <div style={{ background:"#f8fafc", borderRadius:14, padding:"16px 18px",
                    marginBottom:14, border:"1px solid #e2e8f0" }}>
                    <div className="confirm-grid">
                      {[["Specialty",`${cat.icon} ${selectedCat}`],["Doctor",form.doctor],
                        ["Date",form.date],["Time",form.time],
                        ["Type",form.type==="online"?"💻 Online":"🏥 Visit"]].map(([l,v])=>(
                        <div key={l}>
                          <div style={{ fontSize:11, color:"#94a3b8", marginBottom:3 }}>{l}</div>
                          <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #e2e8f0" }}>
                      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:4 }}>Problem</div>
                      <div style={{ fontSize:13, color:"#475569", lineHeight:1.6 }}>{form.problem}</div>
                    </div>
                  </div>
                  {form.type==="online" && (
                    <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:12,
                      padding:"12px 16px", marginBottom:14, fontSize:12, color:"#1d4ed8", fontWeight:600 }}>
                      💻 After booking, you can open the consultation chat to talk with both the AI assistant and your doctor directly.
                    </div>
                  )}
                  {form.type==="visit" && (
                    <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12,
                      padding:"12px 16px", marginBottom:14, fontSize:12, color:"#15803d", fontWeight:600 }}>
                      🏥 Please arrive 10 minutes early. Bring your ID and any previous medical reports.
                    </div>
                  )}
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={()=>setStep(2)} style={outlineBtn}>← Edit</button>
                    <button onClick={handleConfirm} style={{ ...primaryBtn, flex:1 }}>✅ Confirm Booking</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS TABLE ── */}
        <div style={{ background:"white", borderRadius:18,
          boxShadow:"0 2px 16px rgba(0,0,0,0.07)", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid #f1f5f9",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontWeight:800, fontSize:15, color:"#0f172a" }}>My Appointments</div>
            <span style={{ fontSize:11, background:"#f1f5f9", color:"#64748b",
              padding:"4px 10px", borderRadius:20, fontWeight:600 }}>{appointments.length} total</span>
          </div>

          {appointments.map((appt,idx) => (
            <div key={appt.id}>
              <div onClick={()=>setExpandedId(expandedId===appt.id?null:appt.id)}
                style={{ padding:"14px 20px", cursor:"pointer",
                  background:expandedId===appt.id?"#f8fafc":"white",
                  borderBottom:expandedId===appt.id?"none":"1px solid #f1f5f9",
                  transition:"background 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:160 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>{appt.doctor}</div>
                    <div style={{ fontSize:12, color:"#94a3b8" }}>{appt.specialty} · {appt.date} · {appt.time}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, fontWeight:600, color:appt.type==="online"?"#0284c7":"#0d4f4f" }}>
                      {appt.type==="online"?"💻 Online":"🏥 Visit"}
                    </span>
                    <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20,
                      background:statusColor[appt.status]?.bg, color:statusColor[appt.status]?.color }}>
                      {appt.status}
                    </span>
                    {appt.type==="online" && (
                      <button
                        onClick={e=>{ e.stopPropagation(); setChatAppt(appt); }}
                        style={{ background:"linear-gradient(120deg,#0d4f4f,#14b8a6)", color:"white",
                          border:"none", borderRadius:8, padding:"6px 14px",
                          fontSize:12, fontWeight:700, cursor:"pointer" }}>
                        💬 Open Chat
                      </button>
                    )}
                    <span style={{ fontSize:16, color:"#94a3b8" }}>{expandedId===appt.id?"▲":"▼"}</span>
                  </div>
                </div>
                <div style={{ marginTop:5, fontSize:12, color:"#64748b" }}>
                  <span style={{ fontWeight:600 }}>Problem: </span>{appt.problem}
                </div>
              </div>

              {expandedId===appt.id && (
                <div style={{ background:"#f8fafc", padding:"16px 20px",
                  borderBottom:"1px solid #e2e8f0" }}>
                  {appt.type==="online" ? (
                    <div style={{ textAlign:"center", padding:"20px 0" }}>
                      <div style={{ fontSize:36, marginBottom:10 }}>💻</div>
                      <div style={{ fontWeight:700, fontSize:15, color:"#0f172a", marginBottom:6 }}>
                        Online Consultation
                      </div>
                      <div style={{ fontSize:13, color:"#64748b", marginBottom:16 }}>
                        Chat with AI assistant and your doctor in the consultation panel.
                      </div>
                      <button onClick={()=>setChatAppt(appt)}
                        style={{ ...primaryBtn, fontSize:14 }}>
                        💬 Open Consultation Chat
                      </button>
                    </div>
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }} className="visit-info">
                      <div style={{ background:"white", borderRadius:12, padding:16, border:"1px solid #e2e8f0" }}>
                        <div style={{ fontWeight:700, fontSize:13, color:"#0f172a", marginBottom:8 }}>🏥 Visit Info</div>
                        <div style={{ fontSize:12, color:"#64748b", lineHeight:1.7 }}>
                          📍 Arrive 10 minutes early<br/>
                          🪪 Bring your ID card<br/>
                          📋 Carry previous reports<br/>
                          🚫 No food 2 hours before (if blood test)
                        </div>
                      </div>
                      <div style={{ background:"white", borderRadius:12, padding:16, border:"1px solid #e2e8f0" }}>
                        <div style={{ fontWeight:700, fontSize:13, color:"#0f172a", marginBottom:8 }}>🧠 AI Notes</div>
                        <div style={{ fontSize:12, color:"#475569", lineHeight:1.7 }}>
                          {appt.aiAnalysis || <span style={{ color:"#94a3b8" }}>No AI analysis yet.</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }
        @keyframes pulse  { 0%,100%{opacity:1}50%{opacity:0.5} }
        @media(min-width:769px){
          .ba-body       { padding:24px 28px !important; }
          .cat-grid      { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
          .form-grid     { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
          .slot-grid     { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
          .confirm-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
          .visit-info    { grid-template-columns:1fr 1fr !important; }
          .step-label    { display:inline !important; }
          .full-width    { grid-column:1/-1; }
        }
        @media(max-width:768px){
          .cat-grid      { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
          .form-grid     { display:flex; flex-direction:column; gap:14px; }
          .slot-grid     { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
          .confirm-grid  { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
          .visit-info    { grid-template-columns:1fr !important; }
          .step-label    { display:none !important; }
          .full-width    { width:100%; }
        }
        select,input,textarea{ font-family:inherit; }
        div::-webkit-scrollbar      { width:4px; height:4px; }
        div::-webkit-scrollbar-thumb{ background:#cbd5e1; border-radius:4px; }
      `}</style>
    </div>
  );
}

const labelStyle = { fontSize:12, fontWeight:700, color:"#475569", marginBottom:6, display:"block" };
const inputSt    = { padding:"10px 12px", borderRadius:10, border:"1.5px solid #e2e8f0", fontSize:13,
  outline:"none", background:"#f8fafc", color:"#1e293b", width:"100%", boxSizing:"border-box" };
const selectSt   = { ...inputSt, cursor:"pointer" };
const primaryBtn = { background:"linear-gradient(120deg,#0d4f4f,#14b8a6)", color:"white", border:"none",
  borderRadius:12, padding:"12px 24px", fontWeight:700, fontSize:14, cursor:"pointer" };
const outlineBtn = { background:"white", color:"#64748b", border:"2px solid #e2e8f0",
  borderRadius:12, padding:"12px 20px", fontWeight:700, fontSize:13, cursor:"pointer" };