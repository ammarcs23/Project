import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaUser, FaRobot } from 'react-icons/fa';
import './ChatButton.css';

// ── Groq AI Setup ────────────────────────────────────────
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GKEY     = process.env.REACT_APP_GROQ_KEY || "";
const SYSTEM = `You are MediBot, a helpful AI assistant for MediCare+ Hospital.
You help with:
- General health questions and symptoms guidance
- Hospital services, departments, specialist doctors
- How to book appointments (go to patient portal)
- Understanding medical terms simply
Rules:
- Be warm, professional, empathetic
- Never diagnose or prescribe medication
- For emergencies say: "Please call 115 (Emergency) immediately"
- Keep replies short (2-3 sentences) unless detail is needed
- If unsure: "Please consult our doctors for personalized advice"
- Reply in same language user writes (Urdu/English/both)`;

const askGroq = async (allMessages) => {
    if (!GKEY) return "AI chatbot is not configured yet. Please contact admin.";

    // Build messages array — last 10 for context
    const messages = [
        { role: "system", content: SYSTEM },
        ...allMessages.slice(-10).map(m => ({
            role:    m.sender === "bot" ? "assistant" : "user",
            content: m.text
        }))
    ];

    try {
        const res  = await fetch(GROQ_URL, {
            method:  "POST",
            headers: {
                "Content-Type":  "application/json",
                "Authorization": `Bearer ${GKEY}`
            },
            body: JSON.stringify({
                model:       "llama-3.3-70b-versatile",
                messages,
                max_tokens:  400,
                temperature: 0.7
            })
        });
        const data = await res.json();
        if (data.error) return `Sorry, AI error: ${data.error.message}`;
        return data.choices?.[0]?.message?.content
            || "Sorry, I could not respond. Please try again.";
    } catch {
        return "Connection error. Please try again.";
    }
};
// ────────────────────────────────────────────────────────

const ChatButton = () => {
    const [isOpen,        setIsOpen]        = useState(false);
    const [messages,      setMessages]      = useState([
        { id:1, text:"👋 Hello! I'm **MediBot**, your MediCare+ AI assistant.\n\nHow can I help you today? Ask me about appointments, doctors, symptoms, or hospital services.", sender:"bot", time:new Date() }
    ]);
    const [inputMessage,  setInputMessage]  = useState("");
    const [isTyping,      setIsTyping]      = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(prev => !prev);

    // Auto scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = inputMessage.trim();
        if (!text || isTyping) return;

        // Add user message
        const userMessage = { id: messages.length + 1, text, sender: "user", time: new Date() };
        const updatedMsgs = [...messages, userMessage];
        setMessages(updatedMsgs);
        setInputMessage("");
        setIsTyping(true);

        // Call Gemini
        const reply = await askGroq(updatedMsgs);

        setMessages(prev => [...prev, {
            id:     prev.length + 1,
            text:   reply,
            sender: "bot",
            time:   new Date()
        }]);
        setIsTyping(false);
    };

    const formatTime = (date) =>
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Render bold markdown and newlines
    const renderText = (text) => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, i) =>
            i % 2 === 1
                ? <strong key={i}>{part}</strong>
                : part.split("\n").map((line, j, arr) =>
                    j < arr.length - 1
                        ? <span key={j}>{line}<br/></span>
                        : <span key={j}>{line}</span>
                )
        );
    };

    return (
        <>
            <div className={`chat-button-container ${isOpen ? "open" : ""}`}>
                <button
                    className={`chat-button ${isOpen ? "active" : ""}`}
                    onClick={toggleChat}
                    aria-label="Chat with us">
                    {isOpen ? <FaTimes /> : <FaComments />}
                </button>

                {isOpen && (
                    <div className="chat-window">
                        {/* Header — same as original */}
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <h4>MediBot AI Assistant</h4>
                                <p>🟢 Online · Powered by Gemini AI</p>
                            </div>
                            <button className="close-chat" onClick={toggleChat}>
                                <FaTimes />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages">
                            {messages.map((message) => (
                                <div key={message.id}
                                    className={`message ${message.sender === "bot" ? "bot-message" : "user-message"}`}>
                                    <div className="message-avatar">
                                        {message.sender === "bot" ? <FaRobot /> : <FaUser />}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-text">
                                            {renderText(message.text)}
                                        </div>
                                        <span className="message-time">{formatTime(message.time)}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="message bot-message">
                                    <div className="message-avatar"><FaRobot /></div>
                                    <div className="message-content">
                                        <div className="message-text" style={{padding:"12px 16px"}}>
                                            <span style={{display:"flex",gap:5,alignItems:"center"}}>
                                                {[0,1,2].map(i => (
                                                    <span key={i} style={{
                                                        width:7,height:7,borderRadius:"50%",
                                                        background:"#94a3b8",display:"inline-block",
                                                        animation:`pulse 1s infinite ${i*0.2}s`
                                                    }}/>
                                                ))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input form — same structure as original */}
                        <form className="chat-input-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                className="chat-input"
                                disabled={isTyping}
                            />
                            <button type="submit" className="send-button" disabled={!inputMessage.trim() || isTyping}>
                                <FaPaperPlane />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default ChatButton;