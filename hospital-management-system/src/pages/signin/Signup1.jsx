import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup1.css";

const API = "http://localhost:5000/api";

/* ── Role Card ── */
const RoleCard = ({ role, icon, desc, selected, onSelect }) => (
  <div
    className={`role-card ${selected ? "selected" : ""}`}
    onClick={() => onSelect(role)}
  >
    <div className="role-icon">{icon}</div>
    <div>
      <div className="role-label">{role}</div>
      <div className="role-desc">{desc}</div>
    </div>
    <div className="role-check">{selected ? "✓" : ""}</div>
  </div>
);

export default function Signup1() {
  const navigate = useNavigate();
  const [step, setStep]       = useState("role");
  const [role, setRole]       = useState(null);
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ name: "", email: "", password: "", doctorId: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleContinue = () => {
    if (!role) { setError("Please select your role first."); return; }
    setError("");
    setStep("auth");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    if (mode === "register" && !form.name) { setError("Full name is required."); return; }
    if (mode === "login" && role === "Doctor" && !form.doctorId) {
      setError("Doctor ID is required. Contact admin."); return;
    }

    setLoading(true);

    try {
      let res, data;

      if (mode === "register") {
        res  = await fetch(`${API}/auth/register`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        data = await res.json();

      } else {
        res  = await fetch(`${API}/auth/login`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            email:    form.email,
            password: form.password,
            role:     role.toLowerCase(),
            doctorId: form.doctorId || undefined,
          }),
        });
        data = await res.json();
      }

      if (!data.success) {
        setError(data.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      // Token + user save karo
      localStorage.setItem("hospital_token", data.token);
      localStorage.setItem("hospital_user",  JSON.stringify(data.user));

      // Role ke hisaab se redirect
      const userRole = data.user.role;
      if      (userRole === "admin")   navigate("/admin");
      else if (userRole === "doctor")  navigate("/doctor");
      else                             navigate("/patient");

    } catch (err) {
      setError("Cannot connect to server. Make sure backend is running.");
    }

    setLoading(false);
  };

  return (
    <div className="sl-page">
      <div className="sl-bg">
        <div className="sl-orb sl-orb-1" />
        <div className="sl-orb sl-orb-2" />
        <div className="sl-orb sl-orb-3" />
        <div className="sl-grid" />
      </div>

      <div className="sl-card">

        {/* ── Left Panel ── */}
        <div className="sl-left">
          <div className="sl-brand">
            <div className="sl-brand-icon">🏥</div>
            <div>
              <div className="sl-brand-name">MediCare<span>+</span></div>
              <div className="sl-brand-sub">Advanced Hospital System</div>
            </div>
          </div>

          <div className="sl-left-body">
            <h1 className="sl-headline">
              Your Health,<br />
              <span>Our Priority</span>
            </h1>
            <p className="sl-tagline">
              Seamlessly connect with doctors, manage appointments,
              and access your complete health records — all in one place.
            </p>
            <div className="sl-stats">
              {[["500+","Beds"],["150+","Doctors"],["50K+","Patients"],["24/7","Support"]].map(([v,l]) => (
                <div key={l} className="sl-stat">
                  <div className="sl-stat-val">{v}</div>
                  <div className="sl-stat-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sl-left-footer">
            Trusted healthcare since 1998 · NABH Accredited
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="sl-right">

          {/* STEP 1 — Role Selection */}
          {step === "role" && (
            <div className="sl-step sl-step-role">
              <div className="sl-step-header">
                <h2>Welcome Back</h2>
                <p>Who are you logging in as?</p>
              </div>

              <div className="role-cards">
                <RoleCard
                  role="Patient"
                  icon="🧑‍⚕️"
                  desc="Access appointments & health records"
                  selected={role === "Patient"}
                  onSelect={setRole}
                />
                <RoleCard
                  role="Doctor"
                  icon="👨‍⚕️"
                  desc="Manage schedule & patient records"
                  selected={role === "Doctor"}
                  onSelect={setRole}
                />
                <RoleCard
                  role="Admin"
                  icon="🔐"
                  desc="Manage hospital system & staff"
                  selected={role === "Admin"}
                  onSelect={setRole}
                />
              </div>

              {error && <div className="sl-error">{error}</div>}

              <button className="sl-btn" onClick={handleContinue}>
                Continue
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* STEP 2 — Auth Form */}
          {step === "auth" && (
            <div className="sl-step sl-step-auth">
              <button className="sl-back" onClick={() => { setStep("role"); setError(""); }}>
                ← Back
              </button>

              <div className={`sl-role-badge ${
                role === "Doctor" ? "badge-doctor" :
                role === "Admin"  ? "badge-admin"  : "badge-patient"
              }`}>
                {role === "Doctor" ? "👨‍⚕️" : role === "Admin" ? "🔐" : "🧑‍⚕️"} {role} Portal
              </div>

              {/* Tabs — Register sirf Patient ke liye */}
              <div className="sl-tabs">
                <button
                  className={`sl-tab ${mode === "login" ? "active" : ""}`}
                  onClick={() => { setMode("login"); setError(""); }}
                >
                  Sign In
                </button>
                {role === "Patient" && (
                  <button
                    className={`sl-tab ${mode === "register" ? "active" : ""}`}
                    onClick={() => { setMode("register"); setError(""); }}
                  >
                    Register
                  </button>
                )}
              </div>

              <form className="sl-form" onSubmit={handleSubmit}>

                {mode === "register" && (
                  <div className="sl-field">
                    <label>Full Name</label>
                    <input type="text" placeholder="John Smith" value={form.name} onChange={set("name")} />
                  </div>
                )}

                <div className="sl-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
                </div>

                <div className="sl-field">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
                </div>

                {/* Doctor ID field */}
                {role === "Doctor" && mode === "login" && (
                  <div className="sl-field">
                    <label>Doctor ID <span className="sl-hint">(assigned by admin)</span></label>
                    <input type="text" placeholder="e.g. D001" value={form.doctorId} onChange={set("doctorId")} />
                  </div>
                )}

                {error && <div className="sl-error">{error}</div>}

                {mode === "login" && (
                  <div className="sl-forgot">Forgot password?</div>
                )}

                <button
                  type="submit"
                  className={`sl-btn ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  {loading
                    ? <span className="sl-spinner" />
                    : mode === "login" ? "Sign In" : "Create Account"}
                </button>

                {role === "Doctor" && mode === "login" && (
                  <div className="sl-doctor-note">
                    Don't have a Doctor ID? Contact the hospital admin to get your credentials.
                  </div>
                )}

                {role === "Admin" && (
                  <div className="sl-doctor-note">
                    Admin access is restricted. Contact system administrator if you have issues logging in.
                  </div>
                )}

              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}