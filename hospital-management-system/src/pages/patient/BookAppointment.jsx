import { useState } from "react";

const initialAppointments = [
  { id: 1, doctor: "Dr. Emily Chen", specialty: "Cardiologist", date: "2024-03-20", time: "10:30", type: "visit", reason: "Heart checkup", status: "Confirmed", ai: "Routine cardiac screening. No immediate concern. Recommend ECG.", final: "Cleared for follow-up in 3 months." },
  { id: 2, doctor: "Dr. James Liu", specialty: "Endocrinologist", date: "2024-03-25", time: "14:00", type: "online", reason: "Diabetes management", status: "Pending", ai: "Blood sugar levels suggest medication adjustment needed.", final: "" },
];

const doctors = [
  { name: "Dr. Emily Chen", specialty: "Cardiologist" },
  { name: "Dr. James Liu", specialty: "Endocrinologist" },
  { name: "Dr. Sarah Malik", specialty: "Dermatologist" },
  { name: "Dr. Hamid Raza", specialty: "General Physician" },
];

const timeSlots = ["09:00", "10:00", "10:30", "11:00", "12:00", "14:00", "15:00", "16:00"];

const statusColor = {
  Confirmed: { bg: "#dcfce7", color: "#16a34a" },
  Pending: { bg: "#fef9c3", color: "#ca8a04" },
  Cancelled: { bg: "#fee2e2", color: "#dc2626" },
  Completed: { bg: "#e0f2fe", color: "#0284c7" },
};

export default function BookAppointment() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [addingRow, setAddingRow] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // New appointment form state
  const [form, setForm] = useState({
    doctor: doctors[0].name,
    specialty: doctors[0].specialty,
    date: "",
    time: timeSlots[0],
    type: "visit",
    reason: "",
  });

  // AI chat state — per appointment
  const [chatInputs, setChatInputs] = useState({});
  const [chatMessages, setChatMessages] = useState({});
  const [chatLoading, setChatLoading] = useState({});
  const [finalAnalysis, setFinalAnalysis] = useState({});
  const [finalLoading, setFinalLoading] = useState({});

  const handleDoctorChange = (name) => {
    const doc = doctors.find(d => d.name === name);
    setForm(f => ({ ...f, doctor: name, specialty: doc?.specialty || "" }));
  };

  const handleAddAppointment = () => {
    if (!form.date || !form.reason.trim()) {
      alert("Please fill in Date and Reason.");
      return;
    }
    const newAppt = {
      id: Date.now(),
      ...form,
      status: "Pending",
      ai: "",
      final: "",
    };
    setAppointments(prev => [newAppt, ...prev]);
    setAddingRow(false);
    setForm({ doctor: doctors[0].name, specialty: doctors[0].specialty, date: "", time: timeSlots[0], type: "visit", reason: "" });
  };

  const handleSendChat = async (apptId) => {
    const msg = (chatInputs[apptId] || "").trim();
    if (!msg) return;
    const appt = appointments.find(a => a.id === apptId);

    const userMsg = { role: "user", text: msg };
    setChatMessages(prev => ({
      ...prev,
      [apptId]: [...(prev[apptId] || []), userMsg],
    }));
    setChatInputs(prev => ({ ...prev, [apptId]: "" }));
    setChatLoading(prev => ({ ...prev, [apptId]: true }));

    try {
      const history = (chatMessages[apptId] || []).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a helpful hospital AI assistant. The patient has an appointment with ${appt.doctor} (${appt.specialty}) on ${appt.date} at ${appt.time}. 
Appointment type: ${appt.type === "online" ? "Online consultation" : "Hospital visit"}.
Reason for visit: ${appt.reason}.
Help the patient with medical questions, symptoms, preparation tips, and general health advice. Be concise, warm, and professional. Do NOT diagnose definitively — always recommend consulting the doctor.`,
          messages: [...history, { role: "user", content: msg }],
        }),
      });

      const data = await res.json();
      const aiText = data.content?.[0]?.text || "Sorry, I could not process that.";
      setChatMessages(prev => ({
        ...prev,
        [apptId]: [...(prev[apptId] || []), userMsg, { role: "ai", text: aiText }],
      }));
      // remove the user msg we already added
      setChatMessages(prev => {
        const msgs = prev[apptId] || [];
        // avoid duplicate user message
        const withoutLastUser = msgs.slice(0, -2).concat({ role: "ai", text: aiText });
        return { ...prev, [apptId]: [...(msgs.slice(0, -1)), { role: "ai", text: aiText }] };
      });
    } catch {
      setChatMessages(prev => ({
        ...prev,
        [apptId]: [...(prev[apptId] || []), { role: "ai", text: "⚠️ AI service unavailable right now." }],
      }));
    }
    setChatLoading(prev => ({ ...prev, [apptId]: false }));
  };

  const handleFinalAnalysis = async (apptId) => {
    const appt = appointments.find(a => a.id === apptId);
    const msgs = chatMessages[apptId] || [];
    setFinalLoading(prev => ({ ...prev, [apptId]: true }));

    try {
      const convo = msgs.map(m => `${m.role === "user" ? "Patient" : "AI"}: ${m.text}`).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a medical AI assistant. Based on the conversation, provide a concise final summary: key symptoms mentioned, preliminary observations, and preparation advice for the doctor visit. Keep it under 80 words. Be professional.",
          messages: [{
            role: "user",
            content: `Appointment: ${appt.doctor}, ${appt.specialty}, Reason: ${appt.reason}\n\nConversation:\n${convo || "No conversation yet."}\n\nProvide final analysis summary.`,
          }],
        }),
      });
      const data = await res.json();
      const summary = data.content?.[0]?.text || "Could not generate analysis.";
      setFinalAnalysis(prev => ({ ...prev, [apptId]: summary }));
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, final: summary } : a));
    } catch {
      setFinalAnalysis(prev => ({ ...prev, [apptId]: "⚠️ Could not generate analysis." }));
    }
    setFinalLoading(prev => ({ ...prev, [apptId]: false }));
  };

  const inputStyle = {
    padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0",
    fontSize: 13, outline: "none", background: "#f8fafc", color: "#1e293b",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#eaf1f3",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "28px 32px",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>Book an Appointment</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Manage your appointments — online or in-person</p>
        </div>
        <button
          onClick={() => { setAddingRow(true); setExpandedId(null); }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(120deg, #0d4f4f, #14b8a6)",
            color: "white", border: "none", borderRadius: 12,
            padding: "11px 22px", fontWeight: 700, fontSize: 14,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(13,79,79,0.25)",
          }}
        >
          + New Appointment
        </button>
      </div>

      {/* Table Card */}
      <div style={{ background: "white", borderRadius: 18, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", overflow: "hidden" }}>

        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "180px 150px 100px 90px 100px 110px 80px 50px",
          background: "#f1f5f9", padding: "12px 18px",
          fontSize: 11, fontWeight: 800, color: "#64748b",
          textTransform: "uppercase", letterSpacing: 0.5,
          borderBottom: "1px solid #e2e8f0",
        }}>
          <span>Doctor</span>
          <span>Reason</span>
          <span>Date</span>
          <span>Time</span>
          <span>Type</span>
          <span>Status</span>
          <span>AI</span>
          <span></span>
        </div>

        {/* ADD ROW (inline) */}
        {addingRow && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "180px 150px 100px 90px 100px 110px 80px 50px",
            padding: "12px 18px", gap: 8, alignItems: "center",
            background: "#f0fdfb", borderBottom: "2px solid #14b8a6",
          }}>
            <select value={form.doctor} onChange={e => handleDoctorChange(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
              {doctors.map(d => <option key={d.name}>{d.name}</option>)}
            </select>
            <input placeholder="Reason" value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              style={{ ...inputStyle, width: "100%" }} />
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              style={{ ...inputStyle, width: "100%" }} />
            <select value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ ...inputStyle, width: "100%" }}>
              {timeSlots.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle, width: "100%" }}>
              <option value="visit">🏥 Visit</option>
              <option value="online">💻 Online</option>
            </select>
            <span style={{ fontSize: 11, color: "#ca8a04", background: "#fef9c3", padding: "4px 10px", borderRadius: 20, fontWeight: 700, textAlign: "center" }}>Pending</span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>After save</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={handleAddAppointment} style={{
                background: "#14b8a6", color: "white", border: "none",
                borderRadius: 7, padding: "6px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12,
              }}>✓</button>
              <button onClick={() => setAddingRow(false)} style={{
                background: "#fee2e2", color: "#dc2626", border: "none",
                borderRadius: 7, padding: "6px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12,
              }}>✕</button>
            </div>
          </div>
        )}

        {/* Rows */}
        {appointments.length === 0 && !addingRow && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            No appointments yet. Click <strong>+ New Appointment</strong> to add one.
          </div>
        )}

        {appointments.map((appt, idx) => (
          <div key={appt.id}>
            {/* Main Row */}
            <div
              onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 150px 100px 90px 100px 110px 80px 50px",
                padding: "13px 18px", alignItems: "center",
                borderBottom: expandedId === appt.id ? "none" : "1px solid #f1f5f9",
                background: expandedId === appt.id ? "#f8fafc" : "white",
                cursor: "pointer", transition: "background 0.15s",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{appt.doctor}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{appt.specialty}</div>
              </div>
              <div style={{ fontSize: 13, color: "#475569" }}>{appt.reason}</div>
              <div style={{ fontSize: 13, color: "#475569" }}>{appt.date}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{appt.time}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: appt.type === "online" ? "#0284c7" : "#0d4f4f" }}>
                {appt.type === "online" ? "💻 Online" : "🏥 Visit"}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                background: statusColor[appt.status]?.bg, color: statusColor[appt.status]?.color,
                display: "inline-block",
              }}>{appt.status}</span>
              <span style={{ fontSize: 11, color: appt.ai ? "#16a34a" : "#94a3b8" }}>
                {appt.ai ? "✅ Done" : "—"}
              </span>
              <span style={{ fontSize: 16, color: "#94a3b8", textAlign: "center" }}>
                {expandedId === appt.id ? "▲" : "▼"}
              </span>
            </div>

            {/* EXPANDED PANEL */}
            {expandedId === appt.id && (
              <div style={{
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "0 18px 20px",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingTop: 16 }}>

                  {/* LEFT: AI Chat */}
                  <div style={{
                    background: "white", borderRadius: 14, overflow: "hidden",
                    border: "1px solid #e2e8f0", display: "flex", flexDirection: "column",
                  }}>
                    {/* Chat header */}
                    <div style={{
                      background: "linear-gradient(120deg, #0d4f4f, #14b8a6)",
                      padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <div style={{ fontSize: 20 }}>🤖</div>
                      <div>
                        <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>AI Health Assistant</div>
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                          {appt.type === "online" ? "💻 Online Consultation Assistant" : "🏥 Pre-visit Assistant"}
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                      flex: 1, minHeight: 180, maxHeight: 220, overflowY: "auto",
                      padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10,
                    }}>
                      {/* Welcome message */}
                      {!(chatMessages[appt.id]?.length) && (
                        <div style={{
                          background: "#f0fdfb", borderRadius: "4px 12px 12px 12px",
                          padding: "10px 14px", fontSize: 12, color: "#0f172a", maxWidth: "85%",
                        }}>
                          👋 Hello! I'm your AI assistant for your appointment with <strong>{appt.doctor}</strong>. 
                          {appt.type === "online"
                            ? " This is an online consultation — I can help you describe your symptoms, prepare questions, and guide you through the session."
                            : " You have a hospital visit scheduled. I can help you prepare — ask me anything about your symptoms or what to expect."}
                        </div>
                      )}

                      {(chatMessages[appt.id] || []).map((msg, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        }}>
                          <div style={{
                            maxWidth: "80%", padding: "9px 13px", fontSize: 12, lineHeight: 1.5,
                            borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                            background: msg.role === "user" ? "#0d4f4f" : "#f1f5f9",
                            color: msg.role === "user" ? "white" : "#1e293b",
                          }}>{msg.text}</div>
                        </div>
                      ))}

                      {chatLoading[appt.id] && (
                        <div style={{ display: "flex", gap: 4, padding: "8px 14px" }}>
                          {[0,1,2].map(i => (
                            <div key={i} style={{
                              width: 7, height: 7, borderRadius: "50%", background: "#14b8a6",
                              animation: `bounce 1s infinite ${i * 0.15}s`,
                            }} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div style={{
                      padding: "10px 12px", borderTop: "1px solid #f1f5f9",
                      display: "flex", gap: 8,
                    }}>
                      <input
                        placeholder="Describe your symptoms or ask a question..."
                        value={chatInputs[appt.id] || ""}
                        onChange={e => setChatInputs(prev => ({ ...prev, [appt.id]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && handleSendChat(appt.id)}
                        style={{
                          flex: 1, padding: "9px 12px", borderRadius: 10,
                          border: "1.5px solid #e2e8f0", fontSize: 12,
                          outline: "none", background: "#f8fafc",
                        }}
                      />
                      <button
                        onClick={() => handleSendChat(appt.id)}
                        style={{
                          background: "#0d4f4f", color: "white", border: "none",
                          borderRadius: 10, padding: "9px 16px", cursor: "pointer",
                          fontWeight: 700, fontSize: 13,
                        }}
                      >➤</button>
                    </div>
                  </div>

                  {/* RIGHT: AI Analysis + Final */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                    {/* AI Preliminary Analysis */}
                    <div style={{
                      background: "white", borderRadius: 14, padding: 16,
                      border: "1px solid #e2e8f0",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>🧠</span>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>AI Preliminary Analysis</div>
                      </div>
                      <div style={{
                        background: "#f8fafc", borderRadius: 10, padding: "12px 14px",
                        fontSize: 12, color: "#475569", lineHeight: 1.6, minHeight: 60,
                        border: "1px solid #f1f5f9",
                      }}>
                        {appt.ai || (
                          <span style={{ color: "#94a3b8" }}>
                            Chat with the AI assistant first — preliminary analysis will appear here based on your conversation.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Final Analysis */}
                    <div style={{
                      background: "white", borderRadius: 14, padding: 16,
                      border: "1px solid #e2e8f0", flex: 1,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>📋</span>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>Final Summary</div>
                        </div>
                        <button
                          onClick={() => handleFinalAnalysis(appt.id)}
                          disabled={finalLoading[appt.id]}
                          style={{
                            background: finalLoading[appt.id] ? "#e2e8f0" : "#0d4f4f",
                            color: finalLoading[appt.id] ? "#94a3b8" : "white",
                            border: "none", borderRadius: 8,
                            padding: "6px 14px", fontSize: 11, fontWeight: 700,
                            cursor: finalLoading[appt.id] ? "not-allowed" : "pointer",
                          }}
                        >
                          {finalLoading[appt.id] ? "Generating..." : "⚡ Generate"}
                        </button>
                      </div>
                      <div style={{
                        background: "#f8fafc", borderRadius: 10, padding: "12px 14px",
                        fontSize: 12, color: "#475569", lineHeight: 1.6, minHeight: 80,
                        border: "1px solid #f1f5f9",
                      }}>
                        {finalAnalysis[appt.id] || appt.final || (
                          <span style={{ color: "#94a3b8" }}>
                            Click <strong>⚡ Generate</strong> to create a final AI summary of your consultation to share with the doctor.
                          </span>
                        )}
                      </div>

                      {/* Appointment type note */}
                      {appt.type === "online" && (
                        <div style={{
                          marginTop: 10, padding: "9px 12px", borderRadius: 9,
                          background: "#eff6ff", border: "1px solid #bfdbfe",
                          fontSize: 11, color: "#1d4ed8", fontWeight: 600,
                        }}>
                          💻 Online appointment — a video/chat link will be sent to your email before the session.
                        </div>
                      )}
                      {appt.type === "visit" && (
                        <div style={{
                          marginTop: 10, padding: "9px 12px", borderRadius: 9,
                          background: "#f0fdf4", border: "1px solid #bbf7d0",
                          fontSize: 11, color: "#15803d", fontWeight: 600,
                        }}>
                          🏥 Hospital visit — please arrive 10 minutes early. Bring your ID and previous reports.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
