import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup1.css";

const API = "http://localhost:5000/api";

const RoleCard = ({ role, icon, desc, selected, onSelect }) => (
  <div className={`role-card ${selected?"selected":""}`} onClick={()=>onSelect(role)}>
    <div className="role-icon">{icon}</div>
    <div><div className="role-label">{role}</div><div className="role-desc">{desc}</div></div>
    <div className="role-check">{selected?"✓":""}</div>
  </div>
);

const OtpBox = ({ value, onChange }) => {
  const digits = value.split('').concat(Array(6).fill('')).slice(0,6);
  const focus  = id => document.getElementById(id)?.focus();
  const handle = (i,e) => {
    const v=e.target.value.replace(/\D/,'').slice(-1);
    const arr=[...digits]; arr[i]=v; onChange(arr.join(''));
    if(v&&i<5) focus(`otp-${i+1}`);
  };
  const handleKey = (i,e) => { if(e.key==="Backspace"&&!digits[i]&&i>0) focus(`otp-${i-1}`); };
  return (
    <div style={{display:"flex",gap:8,justifyContent:"center",margin:"20px 0"}}>
      {digits.map((d,i)=>(
        <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
          value={d} onChange={e=>handle(i,e)} onKeyDown={e=>handleKey(i,e)}
          style={{width:44,height:52,textAlign:"center",fontSize:22,fontWeight:800,borderRadius:12,border:`2px solid ${d?"#14b8a6":"rgba(255,255,255,0.1)"}`,background:"rgba(255,255,255,0.06)",color:"white",outline:"none",transition:"border 0.2s"}}
        />
      ))}
    </div>
  );
};

export default function Signup1() {
  const navigate = useNavigate();
  const [step,        setStep]        = useState("role");
  const [role,        setRole]        = useState(null);
  const [mode,        setMode]        = useState("login");
  const [form,        setForm]        = useState({name:"",email:"",password:"",doctorId:""});
  const [rememberMe,  setRememberMe]  = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [verifyId,    setVerifyId]    = useState(null);
  const [otp,         setOtp]         = useState("");
  const [timer,       setTimer]       = useState(0);
  const [resending,   setResending]   = useState(false);
  // Forgot password
  const [fEmail,      setFEmail]      = useState("");
  const [fOtp,        setFOtp]        = useState("");
  const [fPass,       setFPass]       = useState("");
  const [fPass2,      setFPass2]      = useState("");

  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  /* ── Save token — role-specific keys so multiple tabs work ── */
  const saveAuth = (token, user) => {
    const role = user.role; // admin | doctor | patient
    localStorage.setItem(`hospital_token_${role}`, token);
    localStorage.setItem(`hospital_user_${role}`,  JSON.stringify(user));
  };

  const startTimer = () => {
    setTimer(60);
    const iv = setInterval(()=>setTimer(t=>{ if(t<=1){clearInterval(iv);return 0;} return t-1; }),1000);
  };

  const redirect = role => {
    if(role==="admin")  navigate("/admin");
    else if(role==="doctor") navigate("/doctor");
    else navigate("/patient");
  };

  const handleContinue = () => {
    if(!role){setError("Please select your role.");return;}
    setError(""); setStep("auth");
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError("");
    if(!form.email||!form.password){setError("Email and password required.");return;}
    if(mode==="register"&&!form.name){setError("Full name required.");return;}
    if(mode==="login"&&role==="Doctor"&&!form.doctorId){setError("Doctor ID required.");return;}
    setLoading(true);
    try {
      if(mode==="register") {
        const res  = await fetch(`${API}/auth/send-otp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:form.name,email:form.email,password:form.password})});
        const data = await res.json();
        if(!data.success){setError(data.message);setLoading(false);return;}
        setStep("verify"); startTimer(); setError("");
      } else {
        const res  = await fetch(`${API}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:form.email,password:form.password,role:role.toLowerCase(),doctorId:form.doctorId||undefined,rememberMe})});
        const data = await res.json();
        if(!data.success){
          if(data.requiresVerification){setVerifyId(data.userId);setStep("verify");startTimer();}
          else setError(data.message);
          setLoading(false); return;
        }
        saveAuth(data.token,data.user);
        redirect(data.user.role);
      }
    } catch{setError("Cannot connect to server.");}
    setLoading(false);
  };

  const handleVerify = async () => {
    if(otp.length!==6){setError("Enter complete 6-digit PIN.");return;}
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/auth/verify-otp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:form.email,otp})});
      const data = await res.json();
      if(!data.success){setError(data.message);setLoading(false);return;}
      saveAuth(data.token,data.user);
      redirect(data.user.role);
    } catch{setError("Server error.");}
    setLoading(false);
  };

  const handleResend = async () => {
    if(timer>0) return;
    setResending(true);
    try{
      await fetch(`${API}/auth/send-otp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:form.name,email:form.email,password:form.password})});
      startTimer(); setError(""); setOtp("");
    }catch{}
    setResending(false);
  };

  /* ── Forgot password handlers ── */
  const handleForgot = async () => {
    if(!fEmail){setError("Enter your email address.");return;}
    setLoading(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`${API}/auth/forgot-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:fEmail,role:role.toLowerCase()})});
      const data = await res.json();
      if(!data.success){setError(data.message);setLoading(false);return;}
      setSuccess(data.message);
      startTimer(); setStep("forgot-otp");
    } catch { setError("Cannot connect to server."); }
    setLoading(false);
  };

  const handleForgotVerify = async () => {
    if(fOtp.length!==6){setError("Enter complete 6-digit code.");return;}
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/auth/verify-reset-otp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:fEmail,role:role.toLowerCase(),otp:fOtp})});
      const data = await res.json();
      if(!data.success){setError(data.message);setLoading(false);return;}
      setStep("new-password");
    } catch { setError("Server error."); }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if(!fPass||fPass.length<6){setError("Password must be at least 6 characters.");return;}
    if(fPass!==fPass2){setError("Passwords do not match.");return;}
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/auth/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:fEmail,role:role.toLowerCase(),otp:fOtp,newPassword:fPass})});
      const data = await res.json();
      if(!data.success){setError(data.message);setLoading(false);return;}
      setSuccess(data.message);
      setTimeout(()=>{ setStep("auth"); setMode("login"); setFEmail(""); setFOtp(""); setFPass(""); setFPass2(""); setSuccess(""); },2000);
    } catch { setError("Server error."); }
    setLoading(false);
  };

  const handleForgotResend = async () => {
    if(timer>0) return;
    setResending(true);
    try {
      await fetch(`${API}/auth/forgot-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:fEmail,role:role.toLowerCase()})});
      startTimer(); setFOtp(""); setError("");
    } catch {}
    setResending(false);
  };

  return (
    <div className="sl-page">
      <div className="sl-bg">
        <div className="sl-orb sl-orb-1"/><div className="sl-orb sl-orb-2"/><div className="sl-orb sl-orb-3"/>
        <div className="sl-grid"/>
      </div>
      <div className="sl-card">
        {/* Left */}
        <div className="sl-left">
          <div className="sl-brand">
            <div className="sl-brand-icon">🏥</div>
            <div><div className="sl-brand-name">MediCare<span>+</span></div><div className="sl-brand-sub">Advanced Hospital System</div></div>
          </div>
          <div className="sl-left-body">
            <h1 className="sl-headline">Your Health,<br/><span>Our Priority</span></h1>
            <p className="sl-tagline">Seamlessly connect with doctors, manage appointments, and access your health records.</p>
            <div className="sl-stats">
              {[["500+","Beds"],["150+","Doctors"],["50K+","Patients"],["24/7","Support"]].map(([v,l])=>(
                <div key={l} className="sl-stat"><div className="sl-stat-val">{v}</div><div className="sl-stat-lbl">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="sl-left-footer">Trusted healthcare since 1998 · NABH Accredited</div>
        </div>

        {/* Right */}
        <div className="sl-right">

          {/* ── ROLE STEP ── */}
          {step==="role"&&(
            <div className="sl-step">
              <div className="sl-step-header"><h2>Welcome Back</h2><p>Who are you logging in as?</p></div>
              <div className="role-cards">
                <RoleCard role="Patient" icon="🧑‍⚕️" desc="Access appointments & health records" selected={role==="Patient"} onSelect={setRole}/>
                <RoleCard role="Doctor"  icon="👨‍⚕️" desc="Manage schedule & patient records"    selected={role==="Doctor"}  onSelect={setRole}/>
                <RoleCard role="Admin"   icon="🔐"   desc="Manage hospital system & staff"       selected={role==="Admin"}   onSelect={setRole}/>
              </div>
              {error&&<div className="sl-error">{error}</div>}
              <button className="sl-btn" onClick={handleContinue}>
                Continue
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}

          {/* ── AUTH STEP ── */}
          {step==="auth"&&(
            <div className="sl-step">
              <button className="sl-back" onClick={()=>{setStep("role");setError("");}}>← Back</button>
              <div className={`sl-role-badge ${role==="Doctor"?"badge-doctor":role==="Admin"?"badge-admin":"badge-patient"}`}>
                {role==="Doctor"?"👨‍⚕️":role==="Admin"?"🔐":"🧑‍⚕️"} {role} Portal
              </div>
              <div className="sl-tabs">
                <button className={`sl-tab ${mode==="login"?"active":""}`} onClick={()=>{setMode("login");setError("");}}>Sign In</button>
                {role==="Patient"&&<button className={`sl-tab ${mode==="register"?"active":""}`} onClick={()=>{setMode("register");setError("");}}>Register</button>}
              </div>
              <form className="sl-form" onSubmit={handleSubmit}>
                {mode==="register"&&<div className="sl-field"><label>Full Name</label><input type="text" placeholder="John Smith" value={form.name} onChange={set("name")}/></div>}
                <div className="sl-field"><label>Email Address</label><input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")}/></div>
                <div className="sl-field"><label>Password</label><input type="password" placeholder="••••••••" value={form.password} onChange={set("password")}/></div>
                {role==="Doctor"&&mode==="login"&&(
                  <div className="sl-field"><label>Doctor ID <span className="sl-hint">(assigned by admin)</span></label><input type="text" placeholder="D001" value={form.doctorId} onChange={set("doctorId")}/></div>
                )}

                {/* Remember Me */}
                {mode==="login"&&(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"2px 0"}}>
                    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}} onClick={()=>setRememberMe(p=>!p)}>
                      <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${rememberMe?"#14b8a6":"rgba(255,255,255,0.2)"}`,background:rememberMe?"#14b8a6":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                        {rememberMe&&<span style={{color:"white",fontSize:11,fontWeight:800,lineHeight:1}}>✓</span>}
                      </div>
                      <span style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Remember me for 30 days</span>
                    </label>
                    <div className="sl-forgot" style={{cursor:"pointer"}} onClick={()=>{setStep("forgot");setError("");setSuccess("");setFEmail(form.email);}}>Forgot password?</div>
                  </div>
                )}

                {error&&<div className="sl-error">{error}</div>}
                <button type="submit" className={`sl-btn ${loading?"loading":""}`} disabled={loading}>
                  {loading?<span className="sl-spinner"/>:mode==="login"?"Sign In":"Create Account"}
                </button>
                {role==="Doctor"&&mode==="login"&&<div className="sl-doctor-note">Don't have a Doctor ID? Contact the hospital admin.</div>}
                {role==="Admin"&&<div className="sl-doctor-note">Admin access is restricted. Contact your system administrator.</div>}
              </form>
            </div>
          )}

          {/* ── OTP VERIFICATION STEP ── */}
          {step==="verify"&&(
            <div className="sl-step">
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:48,marginBottom:12}}>📬</div>
                <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"1.5rem",fontWeight:800,color:"white",margin:"0 0 8px",letterSpacing:"-0.5px"}}>Verify Your Email</h2>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",margin:0,lineHeight:1.7}}>
                  We sent a 6-digit PIN to<br/>
                  <strong style={{color:"#14b8a6",fontSize:14}}>{form.email}</strong>
                </p>
              </div>

              <OtpBox value={otp} onChange={setOtp}/>

              <div style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:16}}>
                PIN expires in <strong style={{color:"rgba(255,255,255,0.5)"}}>10 minutes</strong>
              </div>

              {error&&<div className="sl-error" style={{marginBottom:12}}>{error}</div>}

              <button onClick={handleVerify} className={`sl-btn ${loading?"loading":""}`} disabled={loading}>
                {loading?<span className="sl-spinner"/>:"✅ Verify & Continue"}
              </button>

              <div style={{textAlign:"center",marginTop:16}}>
                <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Didn't get it? </span>
                <button onClick={handleResend} disabled={timer>0||resending} style={{background:"none",border:"none",cursor:timer>0?"default":"pointer",fontSize:12,color:timer>0?"rgba(255,255,255,0.2)":"#14b8a6",fontWeight:600,padding:0,fontFamily:"inherit"}}>
                  {timer>0?`Resend in ${timer}s`:resending?"Sending...":"Resend PIN"}
                </button>
              </div>

              <button onClick={()=>{setStep("auth");setError("");setOtp("");}} style={{display:"block",margin:"12px auto 0",background:"none",border:"none",color:"rgba(255,255,255,0.25)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                ← Use different email
              </button>
            </div>
          )}

        {/* ── FORGOT PASSWORD — Email input ── */}
          {step==="forgot"&&(
            <div className="sl-step">
              <button className="sl-back" onClick={()=>{setStep("auth");setError("");setSuccess("");}}>← Back to Login</button>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:44,marginBottom:10}}>🔑</div>
                <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"1.4rem",fontWeight:800,color:"white",margin:"0 0 6px"}}>Forgot Password?</h2>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",margin:0,lineHeight:1.6}}>
                  Enter your <strong style={{color:"#14b8a6"}}>{role}</strong> account email.<br/>
                  We'll send you a 6-digit reset code.
                </p>
              </div>
              <div className="sl-field">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={fEmail} onChange={e=>setFEmail(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleForgot()}/>
              </div>
              {error&&<div className="sl-error">{error}</div>}
              {success&&<div style={{background:"rgba(20,184,166,0.15)",border:"1px solid rgba(20,184,166,0.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#14b8a6",marginBottom:12}}>{success}</div>}
              <button onClick={handleForgot} className={`sl-btn ${loading?"loading":""}`} disabled={loading}>
                {loading?<span className="sl-spinner"/>:"📧 Send Reset Code"}
              </button>
            </div>
          )}

          {/* ── FORGOT PASSWORD — OTP verify ── */}
          {step==="forgot-otp"&&(
            <div className="sl-step">
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:44,marginBottom:10}}>📬</div>
                <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"1.4rem",fontWeight:800,color:"white",margin:"0 0 8px"}}>Enter Reset Code</h2>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",margin:0,lineHeight:1.7}}>
                  Code sent to<br/>
                  <strong style={{color:"#14b8a6",fontSize:14}}>{fEmail}</strong>
                </p>
              </div>
              <OtpBox value={fOtp} onChange={setFOtp}/>
              <div style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:16}}>
                Code expires in <strong style={{color:"rgba(255,255,255,0.5)"}}>10 minutes</strong>
              </div>
              {error&&<div className="sl-error" style={{marginBottom:12}}>{error}</div>}
              <button onClick={handleForgotVerify} className={`sl-btn ${loading?"loading":""}`} disabled={loading}>
                {loading?<span className="sl-spinner"/>:"✅ Verify Code"}
              </button>
              <div style={{textAlign:"center",marginTop:14}}>
                <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Didn't get it? </span>
                <button onClick={handleForgotResend} disabled={timer>0||resending} style={{background:"none",border:"none",cursor:timer>0?"default":"pointer",fontSize:12,color:timer>0?"rgba(255,255,255,0.2)":"#14b8a6",fontWeight:600,padding:0,fontFamily:"inherit"}}>
                  {timer>0?`Resend in ${timer}s`:resending?"Sending...":"Resend Code"}
                </button>
              </div>
              <button onClick={()=>{setStep("forgot");setError("");setFOtp("");}} style={{display:"block",margin:"12px auto 0",background:"none",border:"none",color:"rgba(255,255,255,0.25)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                ← Use different email
              </button>
            </div>
          )}

          {/* ── FORGOT PASSWORD — New password ── */}
          {step==="new-password"&&(
            <div className="sl-step">
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:44,marginBottom:10}}>🔒</div>
                <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"1.4rem",fontWeight:800,color:"white",margin:"0 0 8px"}}>Set New Password</h2>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",margin:0}}>Choose a strong password for your account</p>
              </div>
              <div className="sl-field">
                <label>New Password</label>
                <input type="password" placeholder="Min. 6 characters" value={fPass} onChange={e=>setFPass(e.target.value)}/>
              </div>
              <div className="sl-field" style={{marginTop:12}}>
                <label>Confirm Password</label>
                <input type="password" placeholder="Repeat password" value={fPass2} onChange={e=>setFPass2(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleResetPassword()}/>
              </div>
              {fPass&&fPass2&&fPass!==fPass2&&(
                <div style={{fontSize:12,color:"#f87171",marginTop:4}}>⚠ Passwords do not match</div>
              )}
              {fPass&&fPass2&&fPass===fPass2&&fPass.length>=6&&(
                <div style={{fontSize:12,color:"#34d399",marginTop:4}}>✓ Passwords match</div>
              )}
              {error&&<div className="sl-error" style={{marginTop:12}}>{error}</div>}
              {success&&<div style={{background:"rgba(20,184,166,0.15)",border:"1px solid rgba(20,184,166,0.3)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#14b8a6",marginTop:12,textAlign:"center"}}>{success}</div>}
              <button onClick={handleResetPassword} className={`sl-btn ${loading?"loading":""}`} disabled={loading} style={{marginTop:16}}>
                {loading?<span className="sl-spinner"/>:"🔒 Reset Password"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}