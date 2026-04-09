import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useHomepage } from "../../context/HomepageContext";

const API = "http://localhost:5000/api/admin";

/* ── API Helper ── */
const api = async (url, method="GET", body=null, isForm=false) => {
    const token = localStorage.getItem("hospital_token_admin");
    if (!token) { window.location.href = "/login"; return { success:false, message:"Not logged in." }; }
    const opts  = { method, headers: { Authorization: `Bearer ${token}` } };
    if (body) {
        if (isForm) opts.body = body;
        else { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
    }
    const res  = await fetch(`${API}${url}`, opts);
    const data = await res.json();
    if (res.status === 401) {
        localStorage.removeItem("hospital_token_admin");
        localStorage.removeItem("hospital_user_admin");
        window.location.href = "/login";
        return { success:false, message:"Session expired. Please login again." };
    }
    return data;
};

/* ── Helpers ── */
const Badge = ({ s }) => {
    const m = { Active:["#dcfce7","#16a34a"], "On Leave":["#fef9c3","#ca8a04"], Inactive:["#fee2e2","#dc2626"], Critical:["#fee2e2","#dc2626"] };
    const [bg,tc] = m[s]||["#f1f5f9","#64748b"];
    return <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:bg,color:tc}}>{s}</span>;
};
const Inp = ({label,value,onChange,type="text",placeholder="",required=false,hint=""}) => {
    const [show,setShow] = React.useState(false);
    const isPass = type==="password";
    return (
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}{required&&<span style={{color:"#ef4444"}}>*</span>}{hint&&<span style={{fontWeight:400,color:"#94a3b8",fontSize:11}}> {hint}</span>}</label>
            <div style={{position:"relative"}}>
                <input type={isPass?(show?"text":"password"):type} value={value||""} onChange={onChange} placeholder={placeholder}
                    style={{padding:isPass?"9px 38px 9px 12px":"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%",boxSizing:"border-box"}}/>
                {isPass&&<button type="button" onClick={()=>setShow(s=>!s)}
                    style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#94a3b8",padding:0}}>
                    {show?"🙈":"👁️"}
                </button>}
            </div>
        </div>
    );
};
const Sel = ({label,value,onChange,options}) => (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label>
        <select value={value||""} onChange={onChange} style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",width:"100%"}}>
            {options.map(o=><option key={o}>{o}</option>)}
        </select>
    </div>
);
const Txt = ({label,value,onChange,rows=3}) => (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label>
        <textarea value={value||""} onChange={onChange} rows={rows} style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",resize:"vertical",width:"100%",boxSizing:"border-box",fontFamily:"inherit"}}/>
    </div>
);
const Toggle = ({val,onToggle}) => (
    <div onClick={onToggle} style={{width:46,height:26,borderRadius:20,cursor:"pointer",transition:"all 0.2s",background:val?"#6366f1":"#e2e8f0",position:"relative",flexShrink:0}}>
        <div style={{position:"absolute",top:3,width:20,height:20,borderRadius:"50%",background:"white",transition:"all 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",left:val?23:3}}/>
    </div>
);
const ImgUpload = ({label,preview,onChange}) => {
    const ref = useRef();
    return (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label>
            <div onClick={()=>ref.current.click()} style={{width:"100%",height:110,borderRadius:12,border:"2px dashed #cbd5e1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"#f8fafc",overflow:"hidden"}}>
                {preview ? <img src={preview} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <><div style={{fontSize:28}}>📷</div><div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>Click to upload photo</div></>}
            </div>
            <input ref={ref} type="file" accept="image/*" onChange={onChange} style={{display:"none"}}/>
        </div>
    );
};

const Modal = ({title,onClose,children,maxWidth=540}) => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"white",borderRadius:20,width:"100%",maxWidth,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.3)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"white",zIndex:1}}>
                <div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>{title}</div>
                <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16}}>✕</button>
            </div>
            <div style={{padding:"20px 22px"}}>{children}</div>
        </div>
    </div>
);

const DelConfirm = ({name,onCancel,onConfirm}) => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"white",borderRadius:20,padding:28,maxWidth:380,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:44,marginBottom:10}}>⚠️</div>
            <div style={{fontWeight:800,fontSize:17,color:"#0f172a",marginBottom:8}}>Confirm Delete</div>
            <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>Delete <strong>{name}</strong>? This cannot be undone.</div>
            <div style={{display:"flex",gap:10}}>
                <button onClick={onCancel} style={{flex:1,padding:"11px",borderRadius:10,border:"2px solid #e2e8f0",background:"white",fontWeight:700,fontSize:13,cursor:"pointer",color:"#64748b"}}>Cancel</button>
                <button onClick={onConfirm} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"#ef4444",fontWeight:700,fontSize:13,cursor:"pointer",color:"white"}}>Delete</button>
            </div>
        </div>
    </div>
);

const SPECIALTIES = ["Cardiology","Neurology","Orthopedics","Pediatrics","Ophthalmology","Pulmonology","Dermatology","General","Oncology","ENT","Urology","Psychiatry"];
const COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#14b8a6"];
const navItems = [
    {id:"dashboard",icon:"⊞",  label:"Dashboard"},
    {id:"homepage", icon:"🌐", label:"Homepage"},
    {id:"doctors",  icon:"👨‍⚕️",label:"Doctors"},
    {id:"patients", icon:"👥", label:"Patients"},
    {id:"admins",   icon:"🔐", label:"Admins"},
];
const hpTabs = [
    ["banner","📢 Banner"],["popup","🎉 Popup"],["hero","🖼️ Hero"],
    ["services","⚕️ Services"],["hp_doctors","👨‍⚕️ Doctors"],
    ["about","ℹ️ About"],["offers","🎁 Offers"],["contact","📞 Contact"],
];

/* ══════════════════════════ MAIN ══════════════════════════ */
export default function AdminDashboard() {
    const navigate  = useNavigate();
    const { state:hp, update:hpUpdate, updateNested, addItem, removeItem } = useHomepage();

    const [active,       setActive]       = useState("dashboard");
    const [sidebarOpen,  setSidebarOpen]  = useState(false);
    const [loading,      setLoading]      = useState(false);
    const [toast,        setToast]        = useState(null);
    const [delTarget,    setDelTarget]    = useState(null);

    // Data
    const [stats,    setStats]    = useState({});
    const [doctors,  setDoctors]  = useState([]);
    const [patients, setPatients] = useState([]);
    const [admins,   setAdmins]   = useState([]);

    // Search/Filter
    const [drSearch, setDrSearch] = useState("");
    const [ptSearch, setPtSearch] = useState("");
    const [ptFilter, setPtFilter] = useState("All");

    // Doctor modal
    const [drModal, setDrModal] = useState(null);
    const [drForm,  setDrForm]  = useState({});
    const [drImg,   setDrImg]   = useState(null);
    const [drPrev,  setDrPrev]  = useState(null);

    // Patient modal
    const [ptModal, setPtModal] = useState(false);
    const [ptForm,  setPtForm]  = useState({});
    const [ptImg,   setPtImg]   = useState(null);
    const [ptPrev,  setPtPrev]  = useState(null);

    // Admin modal
    const [admModal, setAdmModal] = useState(false);
    const [admForm,  setAdmForm]  = useState({name:"",email:"",password:""});

    // Homepage
    const [hpTab,   setHpTab]   = useState("banner");
    const [hpSaved, setHpSaved] = useState(false);

    const user        = JSON.parse(localStorage.getItem("hospital_user_admin")||"{}");
    const showToast   = (msg,ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

    /* ── Load data ── */
    const loadAll = async () => {
        const [s,d,p,a] = await Promise.all([
            api('/stats'), api('/doctors'), api('/patients'), api('/admins')
        ]);
        if (s.success) setStats(s.stats);
        if (d.success) setDoctors(d.doctors);
        if (p.success) setPatients(p.patients);
        if (a.success) setAdmins(a.admins);
    };
    useEffect(() => { loadAll(); }, []);

    const isSuperAdmin = admins.length > 0 && admins[0]?.id === user.id;

    /* ── Logout ── */
    const handleLogout = () => {
        localStorage.removeItem("hospital_token_admin");
        localStorage.removeItem("hospital_user_admin");
        navigate("/login");
    };

    /* ── Doctor ── */
    const openAddDr = () => {
        setDrForm({name:"",email:"",password:"",specialty:"Cardiology",experience:"",fee:"",phone:"",status:"Active"});
        setDrImg(null); setDrPrev(null); setDrModal("add");
    };
    const openEditDr = (d) => {
        setDrForm({id:d.id,name:d.name,email:d.email,password:"",specialty:d.specialty,experience:d.experience||"",fee:d.fee||"",phone:d.phone||"",status:d.status});
        setDrImg(null); setDrPrev(d.avatar?(d.avatar.startsWith('http')?d.avatar:`http://localhost:5000${d.avatar}`):null); setDrModal("edit");
    };
    const saveDr = async () => {
        if (!drForm.name||!drForm.email||(drModal==="add"&&!drForm.password)||!drForm.specialty) {
            showToast("Name, email, password and specialty required.",false); return;
        }
        setLoading(true);
        const fd = new FormData();
        Object.entries(drForm).forEach(([k,v])=>{ if(v!==null&&v!=="") fd.append(k,v); });
        if (drImg) fd.append("avatar",drImg);
        const url    = drModal==="add" ? "/doctors" : `/doctors/${drForm.id}`;
        const method = drModal==="add" ? "POST" : "PUT";
        const data   = await api(url, method, fd, true);
        setLoading(false);
        if (data.success) {
            showToast(data.message);
            setDrModal(null);
            loadAll();
            if (drModal==="add"&&data.doctorId) {
                setTimeout(()=>alert(`✅ Doctor Added Successfully!\n\nDoctor ID: ${data.doctorId}\n\nGive this ID to the doctor. They will use it along with their email and password to login.`),400);
            }
        } else showToast(data.message,false);
    };

    /* ── Patient ── */
    const openEditPt = (p) => {
        setPtForm({id:p.id,name:p.name,email:p.email,age:p.age||"",gender:p.gender||"Male",blood_type:p.blood_type||"O+",phone:p.phone||"",address:p.address||"",condition_:p.condition_||""});
        setPtImg(null); setPtPrev(p.avatar?(p.avatar.startsWith('http')?p.avatar:`http://localhost:5000${p.avatar}`):null); setPtModal(true);
    };
    const savePt = async () => {
        setLoading(true);
        const fd = new FormData();
        Object.entries(ptForm).forEach(([k,v])=>{ if(v!==null) fd.append(k,v); });
        if (ptImg) fd.append("avatar",ptImg);
        const data = await api(`/patients/${ptForm.id}`,"PUT",fd,true);
        setLoading(false);
        if (data.success) { showToast(data.message); setPtModal(false); loadAll(); }
        else showToast(data.message,false);
    };

    /* ── Admin ── */
    const saveAdmin = async () => {
        if (!admForm.name||!admForm.email||!admForm.password) { showToast("All fields required.",false); return; }
        setLoading(true);
        const data = await api("/admins","POST",admForm);
        setLoading(false);
        if (data.success) { showToast(data.message); setAdmModal(false); setAdmForm({name:"",email:"",password:""}); loadAll(); }
        else showToast(data.message,false);
    };

    /* ── Delete ── */
    const confirmDel = async () => {
        const {type,id} = delTarget;
        const urlMap = {doctor:`/doctors/${id}`,patient:`/patients/${id}`,admin:`/admins/${id}`};
        const data   = await api(urlMap[type],"DELETE");
        setDelTarget(null);
        if (data.success) { showToast(data.message); loadAll(); }
        else showToast(data.message,false);
    };

    /* ── Homepage Save ── */
    const saveHomepage = async () => {
        const data = await api("/homepage","PUT",hp);
        if (data.success) { setHpSaved(true); setTimeout(()=>setHpSaved(false),2500); showToast("Homepage saved!"); }
        else showToast("Save failed.",false);
    };

    /* ── Filtered ── */
    const filtDrs = doctors.filter(d =>
        d.name?.toLowerCase().includes(drSearch.toLowerCase())||
        d.specialty?.toLowerCase().includes(drSearch.toLowerCase())||
        d.doctor_id?.toLowerCase().includes(drSearch.toLowerCase())
    );
    const filtPts = patients.filter(p => {
        const ms = p.name?.toLowerCase().includes(ptSearch.toLowerCase())||p.condition_?.toLowerCase().includes(ptSearch.toLowerCase());
        const mf = ptFilter==="All"||(ptFilter==="Active"?p.is_active:!p.is_active);
        return ms&&mf;
    });

    return (
        <div style={{display:"flex",minHeight:"100vh",background:"#f0f4ff",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>

            {/* Toast */}
            {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,background:toast.ok?"#10b981":"#ef4444",color:"white",padding:"12px 20px",borderRadius:12,fontWeight:700,fontSize:14,boxShadow:"0 8px 24px rgba(0,0,0,0.2)"}}>{toast.ok?"✅":"❌"} {toast.msg}</div>}

            {/* Delete Confirm */}
            {delTarget&&<DelConfirm name={delTarget.name} onCancel={()=>setDelTarget(null)} onConfirm={confirmDel}/>}

            {/* Doctor Modal */}
            {drModal&&(
                <Modal title={drModal==="add"?"➕ Add Doctor":"✏️ Edit Doctor"} onClose={()=>setDrModal(null)}>
                    <div style={{display:"flex",flexDirection:"column",gap:14}}>
                        <ImgUpload label="Doctor Photo" preview={drPrev} onChange={e=>{const f=e.target.files[0];if(f){setDrImg(f);setDrPrev(URL.createObjectURL(f));}}}/>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                            <Inp label="Full Name" value={drForm.name} onChange={e=>setDrForm(p=>({...p,name:e.target.value}))} placeholder="Dr. John Smith" required/>
                            <Inp label="Email" value={drForm.email} onChange={e=>setDrForm(p=>({...p,email:e.target.value}))} placeholder="dr@hospital.com" required/>
                            <Inp label={drModal==="add"?"Password":"New Password"} type="password" value={drForm.password} onChange={e=>setDrForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" required={drModal==="add"} hint={drModal==="edit"?"(leave blank to keep)":""}/>
                            <Sel label="Specialty" value={drForm.specialty} onChange={e=>setDrForm(p=>({...p,specialty:e.target.value}))} options={SPECIALTIES}/>
                            <Inp label="Experience" value={drForm.experience} onChange={e=>setDrForm(p=>({...p,experience:e.target.value}))} placeholder="5 yrs"/>
                            <Inp label="Fee ($)" type="number" value={drForm.fee} onChange={e=>setDrForm(p=>({...p,fee:e.target.value}))} placeholder="100"/>
                            <Inp label="Phone" value={drForm.phone} onChange={e=>setDrForm(p=>({...p,phone:e.target.value}))} placeholder="+1-555-0000"/>
                            <Sel label="Status" value={drForm.status} onChange={e=>setDrForm(p=>({...p,status:e.target.value}))} options={["Active","On Leave","Inactive"]}/>
                        </div>
                        {drModal==="add"&&<div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#1e40af"}}>ℹ️ Doctor ID will be auto-generated. Share it with the doctor for login.</div>}
                        <div style={{display:"flex",gap:10,marginTop:4}}>
                            <button onClick={()=>setDrModal(null)} style={{flex:1,padding:"11px",borderRadius:10,border:"2px solid #e2e8f0",background:"white",fontWeight:700,fontSize:13,cursor:"pointer",color:"#64748b"}}>Cancel</button>
                            <button onClick={saveDr} disabled={loading} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#4f46e5,#7c3aed)",fontWeight:700,fontSize:13,cursor:"pointer",color:"white"}}>
                                {loading?"Saving...":drModal==="add"?"✅ Add Doctor":"💾 Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Patient Modal */}
            {ptModal&&(
                <Modal title="✏️ Edit Patient" onClose={()=>setPtModal(false)}>
                    <div style={{display:"flex",flexDirection:"column",gap:14}}>
                        <ImgUpload label="Patient Photo" preview={ptPrev} onChange={e=>{const f=e.target.files[0];if(f){setPtImg(f);setPtPrev(URL.createObjectURL(f));}}}/>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                            <Inp label="Full Name" value={ptForm.name} onChange={e=>setPtForm(p=>({...p,name:e.target.value}))} required/>
                            <Inp label="Email" value={ptForm.email} onChange={e=>setPtForm(p=>({...p,email:e.target.value}))} required/>
                            <Inp label="Age" type="number" value={ptForm.age} onChange={e=>setPtForm(p=>({...p,age:e.target.value}))} placeholder="35"/>
                            <Sel label="Gender" value={ptForm.gender} onChange={e=>setPtForm(p=>({...p,gender:e.target.value}))} options={["Male","Female","Other"]}/>
                            <Sel label="Blood Type" value={ptForm.blood_type} onChange={e=>setPtForm(p=>({...p,blood_type:e.target.value}))} options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]}/>
                            <Inp label="Phone" value={ptForm.phone} onChange={e=>setPtForm(p=>({...p,phone:e.target.value}))} placeholder="+1-555-0000"/>
                            <Inp label="Condition" value={ptForm.condition_} onChange={e=>setPtForm(p=>({...p,condition_:e.target.value}))} placeholder="Diabetes..."/>
                            <Inp label="Address" value={ptForm.address} onChange={e=>setPtForm(p=>({...p,address:e.target.value}))} placeholder="123 Street..."/>
                        </div>
                        <div style={{display:"flex",gap:10,marginTop:4}}>
                            <button onClick={()=>setPtModal(false)} style={{flex:1,padding:"11px",borderRadius:10,border:"2px solid #e2e8f0",background:"white",fontWeight:700,fontSize:13,cursor:"pointer",color:"#64748b"}}>Cancel</button>
                            <button onClick={savePt} disabled={loading} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",fontWeight:700,fontSize:13,cursor:"pointer",color:"white"}}>
                                {loading?"Saving...":"💾 Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Admin Modal */}
            {admModal&&(
                <Modal title="🔐 Add New Admin" onClose={()=>setAdmModal(false)} maxWidth={420}>
                    <div style={{display:"flex",flexDirection:"column",gap:14}}>
                        <Inp label="Full Name" value={admForm.name} onChange={e=>setAdmForm(p=>({...p,name:e.target.value}))} placeholder="Admin Name" required/>
                        <Inp label="Email" value={admForm.email} onChange={e=>setAdmForm(p=>({...p,email:e.target.value}))} placeholder="admin@hospital.com" required/>
                        <Inp label="Password" type="password" value={admForm.password} onChange={e=>setAdmForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" required/>
                        <div style={{background:"#fef9c3",border:"1px solid #fde047",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#713f12"}}>⚠️ Only Super Admin can add or delete admins. New admin will have standard admin access.</div>
                        <div style={{display:"flex",gap:10}}>
                            <button onClick={()=>setAdmModal(false)} style={{flex:1,padding:"11px",borderRadius:10,border:"2px solid #e2e8f0",background:"white",fontWeight:700,fontSize:13,cursor:"pointer",color:"#64748b"}}>Cancel</button>
                            <button onClick={saveAdmin} disabled={loading} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#dc2626,#991b1b)",fontWeight:700,fontSize:13,cursor:"pointer",color:"white"}}>
                                {loading?"Adding...":"🔐 Add Admin"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Mobile Overlay */}
            {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:40}}/>}

            {/* ══ SIDEBAR ══ */}
            <div style={{width:220,flexShrink:0,background:"linear-gradient(180deg,#1e1b4b 0%,#312e81 60%,#1e1b4b 100%)",display:"flex",flexDirection:"column",padding:"24px 0 20px",position:"fixed",top:0,left:0,bottom:0,zIndex:50,transform:sidebarOpen?"translateX(0)":"",transition:"transform 0.25s ease"}} className="adm-sidebar">
                <div style={{padding:"0 20px 20px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏥</div>
                        <div><div style={{color:"white",fontWeight:800,fontSize:15}}>MediAdmin</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:10}}>Hospital System</div></div>
                    </div>
                </div>
                <div style={{margin:"12px",background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>👤</div>
                    <div style={{minWidth:0}}>
                        <div style={{color:"white",fontWeight:700,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name||"Admin"}</div>
                        <div style={{color:"rgba(255,255,255,0.5)",fontSize:10}}>{isSuperAdmin?"⭐ Super Admin":"Admin"}</div>
                    </div>
                </div>
                <div style={{padding:"0 12px",display:"flex",flexDirection:"column",gap:4,flex:1}}>
                    {navItems.map(item=>(
                        <button key={item.id} onClick={()=>{setActive(item.id);setSidebarOpen(false);}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:"none",cursor:"pointer",background:active===item.id?"rgba(99,102,241,0.3)":"transparent",borderLeft:active===item.id?"3px solid #6366f1":"3px solid transparent",color:active===item.id?"white":"rgba(255,255,255,0.6)",fontSize:13,fontWeight:600,transition:"all 0.2s",textAlign:"left"}}>
                            <span style={{fontSize:17}}>{item.icon}</span>{item.label}
                            {item.id==="doctors" &&<span style={{marginLeft:"auto",background:"rgba(99,102,241,0.4)",borderRadius:20,padding:"1px 8px",fontSize:10,color:"#a5b4fc"}}>{doctors.length}</span>}
                            {item.id==="patients"&&<span style={{marginLeft:"auto",background:"rgba(20,184,166,0.3)",borderRadius:20,padding:"1px 8px",fontSize:10,color:"#5eead4"}}>{patients.length}</span>}
                            {item.id==="admins"  &&<span style={{marginLeft:"auto",background:"rgba(239,68,68,0.3)",borderRadius:20,padding:"1px 8px",fontSize:10,color:"#fca5a5"}}>{admins.length}</span>}
                        </button>
                    ))}
                </div>
                <button onClick={handleLogout} style={{margin:"0 12px",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:12}}>↩ Logout</button>
            </div>

            {/* ══ MAIN ══ */}
            <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}} className="adm-main">
                {/* Topbar */}
                <div style={{height:60,background:"white",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #e8ecf4",position:"sticky",top:0,zIndex:30,boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <button onClick={()=>setSidebarOpen(true)} className="hamburger-adm" style={{background:"none",border:"none",fontSize:22,color:"#4f46e5",cursor:"pointer"}}>☰</button>
                        <div><div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>{navItems.find(n=>n.id===active)?.icon} {navItems.find(n=>n.id===active)?.label}</div><div style={{fontSize:11,color:"#94a3b8"}}>Hospital Management System</div></div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                        {isSuperAdmin&&<span style={{fontSize:11,fontWeight:700,background:"linear-gradient(120deg,#f59e0b,#fbbf24)",color:"white",padding:"4px 10px",borderRadius:20}}>⭐ Super Admin</span>}
                    </div>
                </div>

                <div style={{flex:1,overflow:"auto",padding:"20px 16px"}} className="adm-body">

                    {/* ══ DASHBOARD ══ */}
                    {active==="dashboard"&&(
                        <div>
                            <div className="stat4" style={{marginBottom:20}}>
                                {[
                                    ["Total Doctors",  stats.totalDoctors||0,      "👨‍⚕️","linear-gradient(135deg,#6366f1,#8b5cf6)"],
                                    ["Total Patients", stats.totalPatients||0,     "👥",  "linear-gradient(135deg,#0d4f4f,#14b8a6)"],
                                    ["Appointments",   stats.totalAppointments||0, "📅",  "linear-gradient(135deg,#0ea5e9,#38bdf8)"],
                                    ["Active Doctors", stats.activeDoctors||0,     "✅",  "linear-gradient(135deg,#f59e0b,#fbbf24)"],
                                ].map(([label,val,icon,bg])=>(
                                    <div key={label} style={{background:bg,borderRadius:16,padding:"20px 22px",boxShadow:"0 4px 16px rgba(0,0,0,0.12)",color:"white"}}>
                                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                                            <div><div style={{fontSize:11,opacity:0.8,marginBottom:6}}>{label}</div><div style={{fontSize:28,fontWeight:800}}>{val}</div></div>
                                            <div style={{fontSize:28,opacity:0.8}}>{icon}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{background:"white",borderRadius:16,padding:24,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                <div style={{fontWeight:800,fontSize:15,color:"#0f172a",marginBottom:16}}>Quick Actions</div>
                                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                                    <button onClick={()=>{setActive("doctors");setTimeout(openAddDr,100);}} style={{padding:"12px 20px",borderRadius:12,border:"none",background:"#4f46e5",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>➕ Add Doctor</button>
                                    <button onClick={()=>setActive("patients")} style={{padding:"12px 20px",borderRadius:12,border:"none",background:"#0d4f4f",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>👥 View Patients</button>
                                    <button onClick={()=>setActive("homepage")} style={{padding:"12px 20px",borderRadius:12,border:"none",background:"#0ea5e9",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>🌐 Edit Homepage</button>
                                    {isSuperAdmin&&<button onClick={()=>{setActive("admins");setTimeout(()=>setAdmModal(true),100);}} style={{padding:"12px 20px",borderRadius:12,border:"none",background:"#dc2626",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔐 Add Admin</button>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ HOMEPAGE EDITOR ══ */}
                    {active==="homepage"&&(
                        <div>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:20}}>
                                <div><h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Homepage Editor</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>Changes apply to homepage instantly</div></div>
                                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                                    {hpSaved&&<span style={{fontSize:13,color:"#16a34a",fontWeight:700,background:"#dcfce7",padding:"6px 14px",borderRadius:20}}>✅ Saved!</span>}
                                    <button onClick={saveHomepage} style={{background:"linear-gradient(120deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:12,padding:"10px 22px",fontWeight:700,fontSize:13,cursor:"pointer"}}>💾 Save to DB</button>
                                </div>
                            </div>
                            {/* HP Tabs */}
                            <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:6}}>
                                {hpTabs.map(([id,label])=>(
                                    <button key={id} onClick={()=>setHpTab(id)} style={{flexShrink:0,padding:"8px 16px",borderRadius:20,border:"none",cursor:"pointer",background:hpTab===id?"#4f46e5":"white",color:hpTab===id?"white":"#64748b",fontWeight:700,fontSize:12,transition:"all 0.2s"}}>{label}</button>
                                ))}
                            </div>
                            <div style={{background:"white",borderRadius:16,padding:22,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>

                                {/* BANNER */}
                                {hpTab==="banner"&&(
                                    <div style={{display:"flex",flexDirection:"column",gap:16}}>
                                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"#f8fafc",borderRadius:12,border:"1px solid #e2e8f0"}}>
                                            <div><div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>📢 Announcement Banner</div><div style={{fontSize:12,color:"#64748b",marginTop:2}}>Shows at top of homepage</div></div>
                                            <Toggle val={hp.showBanner} onToggle={()=>hpUpdate("showBanner",!hp.showBanner)}/>
                                        </div>
                                        {hp.showBanner&&<>
                                            <Inp label="Banner Text" value={hp.bannerText} onChange={e=>hpUpdate("bannerText",e.target.value)}/>
                                            <Inp label="Link URL" value={hp.bannerLink} onChange={e=>hpUpdate("bannerLink",e.target.value)} placeholder="/book-appointment"/>
                                            <div><label style={{fontSize:12,fontWeight:700,color:"#475569",marginBottom:6,display:"block"}}>Background Color</label>
                                            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["#1e40af","#065f46","#7c2d12","#581c87","#991b1b","#0d4f4f"].map(c=><div key={c} onClick={()=>hpUpdate("bannerBg",c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:hp.bannerBg===c?"3px solid #0f172a":"3px solid transparent"}}/>)}</div></div>
                                            <div style={{background:hp.bannerBg,color:"white",padding:"10px 20px",borderRadius:10,textAlign:"center",fontSize:14,fontWeight:600}}>Preview: {hp.bannerText}</div>
                                        </>}
                                    </div>
                                )}

                                {/* POPUP */}
                                {hpTab==="popup"&&(
                                    <div style={{display:"flex",flexDirection:"column",gap:16}}>
                                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"#f8fafc",borderRadius:12,border:"1px solid #e2e8f0"}}>
                                            <div><div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>🎉 Welcome Popup</div><div style={{fontSize:12,color:"#64748b",marginTop:2}}>Shows on page load</div></div>
                                            <Toggle val={hp.showPopup} onToggle={()=>hpUpdate("showPopup",!hp.showPopup)}/>
                                        </div>
                                        {hp.showPopup&&<>
                                            <Inp label="Title" value={hp.popupTitle} onChange={e=>hpUpdate("popupTitle",e.target.value)}/>
                                            <Txt label="Message" value={hp.popupText} onChange={e=>hpUpdate("popupText",e.target.value)}/>
                                            <Inp label="Button Text" value={hp.popupBtn} onChange={e=>hpUpdate("popupBtn",e.target.value)}/>
                                            <div><label style={{fontSize:12,fontWeight:700,color:"#475569",marginBottom:6,display:"block"}}>Header Color</label>
                                            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["#0d4f4f","#1e40af","#581c87","#7c2d12"].map(c=><div key={c} onClick={()=>hpUpdate("popupBg",c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:hp.popupBg===c?"3px solid #0f172a":"3px solid transparent"}}/>)}</div></div>
                                        </>}
                                    </div>
                                )}

                                {/* HERO */}
                                {hpTab==="hero"&&(
                                    <div style={{display:"flex",flexDirection:"column",gap:16}}>
                                        <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>🖼️ Hero Slides ({hp.heroSlides?.length||0})</div>
                                        {hp.heroSlides?.map((slide,i)=>(
                                            <div key={i} style={{border:"1px solid #e2e8f0",borderRadius:14,padding:16}}>
                                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                                                    <span style={{fontWeight:700,fontSize:13,color:"#4f46e5"}}>Slide {i+1}</span>
                                                    {hp.heroSlides.length>1&&<button onClick={()=>removeItem("heroSlides",i)} style={{background:"#fee2e2",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#dc2626",fontWeight:700}}>✕</button>}
                                                </div>
                                                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                                                    <Inp label="Title" value={slide.title} onChange={e=>updateNested("heroSlides",i,"title",e.target.value)}/>
                                                    <Txt label="Description" value={slide.description} onChange={e=>updateNested("heroSlides",i,"description",e.target.value)} rows={2}/>
                                                    <Inp label="Button Text" value={slide.btnText} onChange={e=>updateNested("heroSlides",i,"btnText",e.target.value)}/>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={()=>addItem("heroSlides",{title:"New Slide",description:"Description...",badge:"Section",stats:["Stat 1","Stat 2","Stat 3"],btnText:"Book Appointment"})} style={{background:"#f1f5f9",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,color:"#4f46e5",cursor:"pointer"}}>+ Add Slide</button>
                                    </div>
                                )}

                                {/* SERVICES */}
                                {hpTab==="services"&&(
                                    <div style={{display:"flex",flexDirection:"column",gap:16}}>
                                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                            <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>⚕️ Services ({hp.services?.length||0})</div>
                                            <button onClick={()=>addItem("services",{id:Date.now(),title:"New Service",description:"Service description",features:["Feature 1","Feature 2","Feature 3"],color:COLORS[hp.services?.length%COLORS.length||0],active:true})} style={{background:"linear-gradient(120deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Add</button>
                                        </div>
                                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="two-col-grid">
                                            <Inp label="Section Title" value={hp.servicesTitle} onChange={e=>hpUpdate("servicesTitle",e.target.value)}/>
                                            <Inp label="Subtitle" value={hp.servicesSubtitle} onChange={e=>hpUpdate("servicesSubtitle",e.target.value)}/>
                                        </div>
                                        {hp.services?.map((s,i)=>(
                                            <div key={s.id||i} style={{border:`2px solid ${s.active?"#6366f1":"#e2e8f0"}`,borderRadius:14,padding:16}}>
                                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                                                    <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:18,height:18,borderRadius:"50%",background:s.color}}/><span style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{s.title}</span></div>
                                                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                                        <span style={{fontSize:11,color:"#64748b"}}>Show</span><Toggle val={s.active} onToggle={()=>updateNested("services",i,"active",!s.active)}/>
                                                        <button onClick={()=>removeItem("services",i)} style={{background:"#fee2e2",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#dc2626",fontWeight:700}}>✕</button>
                                                    </div>
                                                </div>
                                                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="two-col-grid">
                                                    <Inp label="Title" value={s.title} onChange={e=>updateNested("services",i,"title",e.target.value)}/>
                                                    <div><label style={{fontSize:12,fontWeight:700,color:"#475569",marginBottom:5,display:"block"}}>Color</label><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} onClick={()=>updateNested("services",i,"color",c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:s.color===c?"3px solid #0f172a":"2px solid transparent"}}/>)}</div></div>
                                                </div>
                                                <div style={{marginTop:10}}><Inp label="Description" value={s.description} onChange={e=>updateNested("services",i,"description",e.target.value)}/></div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* HOMEPAGE DOCTORS */}
                                {hpTab==="hp_doctors"&&(
                                    <div style={{display:"flex",flexDirection:"column",gap:16}}>
                                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                            <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>👨‍⚕️ Homepage Doctors</div>
                                            <button onClick={()=>addItem("doctors",{id:Date.now(),name:"Dr. New Doctor",specialty:"General",avatar:"",active:true})} style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Add</button>
                                        </div>
                                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="two-col-grid">
                                            <Inp label="Section Title" value={hp.doctorsTitle} onChange={e=>hpUpdate("doctorsTitle",e.target.value)}/>
                                            <Inp label="Subtitle" value={hp.doctorsSubtitle} onChange={e=>hpUpdate("doctorsSubtitle",e.target.value)}/>
                                        </div>
                                        {hp.doctors?.map((doc,i)=>(
                                            <div key={doc.id||i} style={{border:`2px solid ${doc.active?"#14b8a6":"#e2e8f0"}`,borderRadius:14,padding:16}}>
                                                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                                                    <img src={doc.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=14b8a6&color=fff`} alt={doc.name} style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                                                    <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{doc.name}</div><div style={{fontSize:11,color:"#64748b"}}>{doc.specialty}</div></div>
                                                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                                        <Toggle val={doc.active} onToggle={()=>updateNested("doctors",i,"active",!doc.active)}/>
                                                        <button onClick={()=>removeItem("doctors",i)} style={{background:"#fee2e2",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#dc2626",fontWeight:700}}>✕</button>
                                                    </div>
                                                </div>
                                                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="two-col-grid">
                                                    <Inp label="Name" value={doc.name} onChange={e=>updateNested("doctors",i,"name",e.target.value)}/>
                                                    <Inp label="Specialty" value={doc.specialty} onChange={e=>updateNested("doctors",i,"specialty",e.target.value)}/>
                                                </div>
                                                <div style={{marginTop:10}}><Inp label="Avatar URL" value={doc.avatar} onChange={e=>updateNested("doctors",i,"avatar",e.target.value)} placeholder="https://..."/></div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ABOUT */}
                                {hpTab==="about"&&(
                                    <div style={{display:"flex",flexDirection:"column",gap:14}}>
                                        <Inp label="Main Title" value={hp.aboutTitle} onChange={e=>hpUpdate("aboutTitle",e.target.value)}/>
                                        <Inp label="Subtitle" value={hp.aboutSubtitle} onChange={e=>hpUpdate("aboutSubtitle",e.target.value)}/>
                                        <Txt label="Description" value={hp.aboutDescription} onChange={e=>hpUpdate("aboutDescription",e.target.value)}/>
                                        <div style={{fontWeight:700,fontSize:13,color:"#475569"}}>Stats</div>
                                        {hp.aboutStats?.map((s,i)=>(
                                            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="two-col-grid">
                                                <Inp label={`Stat ${i+1} Value`} value={s.value} onChange={e=>updateNested("aboutStats",i,"value",e.target.value)}/>
                                                <Inp label="Label" value={s.label} onChange={e=>updateNested("aboutStats",i,"label",e.target.value)}/>
                                            </div>
                                        ))}
                                        <div style={{fontWeight:700,fontSize:13,color:"#475569"}}>Features</div>
                                        {hp.aboutFeatures?.map((f,i)=>(
                                            <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
                                                <input value={f} onChange={e=>{const arr=[...hp.aboutFeatures];arr[i]=e.target.value;hpUpdate("aboutFeatures",arr);}} style={{flex:1,padding:"8px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc"}}/>
                                                <button onClick={()=>removeItem("aboutFeatures",i)} style={{background:"#fee2e2",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:"#dc2626",fontWeight:700}}>✕</button>
                                            </div>
                                        ))}
                                        <button onClick={()=>addItem("aboutFeatures","New Feature")} style={{background:"#f1f5f9",border:"none",borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:600,color:"#4f46e5",cursor:"pointer",alignSelf:"flex-start"}}>+ Add Feature</button>
                                    </div>
                                )}

                                {/* OFFERS */}
                                {hpTab==="offers"&&(
                                    <div style={{display:"flex",flexDirection:"column",gap:14}}>
                                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                            <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>🎁 Offers & Promotions</div>
                                            <Toggle val={hp.showOffers} onToggle={()=>hpUpdate("showOffers",!hp.showOffers)}/>
                                        </div>
                                        {hp.offers?.map((o,i)=>(
                                            <div key={o.id||i} style={{border:`2px solid ${o.active?"#6366f1":"#e2e8f0"}`,borderRadius:14,padding:16}}>
                                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                                                    <span style={{fontWeight:700,fontSize:13}}>{o.title||"Offer"}</span>
                                                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                                        <Toggle val={o.active} onToggle={()=>updateNested("offers",i,"active",!o.active)}/>
                                                        <button onClick={()=>removeItem("offers",i)} style={{background:"#fee2e2",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#dc2626",fontWeight:700}}>✕</button>
                                                    </div>
                                                </div>
                                                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="two-col-grid">
                                                    <Inp label="Title" value={o.title} onChange={e=>updateNested("offers",i,"title",e.target.value)}/>
                                                    <Inp label="Tag" value={o.tag} onChange={e=>updateNested("offers",i,"tag",e.target.value)} placeholder="Limited / Offer"/>
                                                </div>
                                                <div style={{marginTop:10}}><Txt label="Description" value={o.desc} onChange={e=>updateNested("offers",i,"desc",e.target.value)} rows={2}/></div>
                                            </div>
                                        ))}
                                        <button onClick={()=>addItem("offers",{id:Date.now(),title:"New Offer",desc:"",tag:"Offer",color:"#6366f1",active:false})} style={{background:"linear-gradient(120deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer",alignSelf:"flex-start"}}>+ Add Offer</button>
                                    </div>
                                )}

                                {/* CONTACT */}
                                {hpTab==="contact"&&(
                                    <div style={{display:"flex",flexDirection:"column",gap:14}}>
                                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="two-col-grid">
                                            <Inp label="Main Phone" value={hp.phone} onChange={e=>hpUpdate("phone",e.target.value)}/>
                                            <Inp label="Emergency" value={hp.emergencyPhone} onChange={e=>hpUpdate("emergencyPhone",e.target.value)}/>
                                            <Inp label="Email" value={hp.email} onChange={e=>hpUpdate("email",e.target.value)}/>
                                            <Inp label="Working Hours" value={hp.workingHours} onChange={e=>hpUpdate("workingHours",e.target.value)}/>
                                        </div>
                                        <Inp label="Address" value={hp.address} onChange={e=>hpUpdate("address",e.target.value)}/>
                                        <Txt label="Google Maps Embed URL" value={hp.mapSrc} onChange={e=>hpUpdate("mapSrc",e.target.value)} rows={3}/>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                    {/* ══ DOCTORS ══ */}
                    {active==="doctors"&&(
                        <div>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:20}}>
                                <div><h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Manage Doctors</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>{doctors.length} doctors registered</div></div>
                                <button onClick={openAddDr} style={{background:"linear-gradient(120deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:12,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>➕ Add Doctor</button>
                            </div>
                            <div style={{position:"relative",marginBottom:16}}>
                                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#94a3b8"}}>🔍</span>
                                <input placeholder="Search name, specialty or Doctor ID..." value={drSearch} onChange={e=>setDrSearch(e.target.value)} style={{width:"100%",padding:"10px 12px 10px 38px",borderRadius:12,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"white",boxSizing:"border-box"}}/>
                            </div>
                            <div className="dr-grid">
                                {filtDrs.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#94a3b8",background:"white",borderRadius:16}}>No doctors found.</div>}
                                {filtDrs.map(d=>(
                                    <div key={d.id} style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 1px 8px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",gap:12}}>
                                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                                            <img src={d.avatar?(d.avatar.startsWith("http")?d.avatar:`http://localhost:5000${d.avatar}`):`https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=6366f1&color=fff`} alt={d.name} style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:"2px solid #e2e8f0",flexShrink:0}}/>
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{fontWeight:800,fontSize:14,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.name}</div>
                                                <div style={{fontSize:12,color:"#64748b"}}>{d.specialty}</div>
                                                <div style={{marginTop:4,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                                                    <Badge s={d.status}/>
                                                    <span style={{fontSize:11,fontWeight:700,color:"#4f46e5",background:"#ede9fe",padding:"2px 8px",borderRadius:20}}>ID: {d.doctor_id}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 10px"}}>
                                            {[["Exp",d.experience||"N/A"],["Fee",d.fee?`$${d.fee}`:"N/A"],["Phone",d.phone||"N/A"],["Email",d.email]].map(([l,v])=>(
                                                <div key={l}><div style={{fontSize:10,color:"#94a3b8"}}>{l}</div><div style={{fontSize:11,fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v}</div></div>
                                            ))}
                                        </div>
                                        <div style={{display:"flex",gap:8}}>
                                            <button onClick={()=>openEditDr(d)} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:"#dbeafe",color:"#1d4ed8",fontWeight:700,fontSize:12,cursor:"pointer"}}>✏️ Edit</button>
                                            <button onClick={()=>setDelTarget({type:"doctor",id:d.id,name:d.name})} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑️ Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ══ PATIENTS ══ */}
                    {active==="patients"&&(
                        <div>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:20}}>
                                <div><h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Manage Patients</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>{patients.length} patients registered</div></div>
                            </div>
                            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
                                <div style={{flex:1,minWidth:200,position:"relative"}}>
                                    <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#94a3b8"}}>🔍</span>
                                    <input placeholder="Search patients..." value={ptSearch} onChange={e=>setPtSearch(e.target.value)} style={{width:"100%",padding:"10px 12px 10px 38px",borderRadius:12,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"white",boxSizing:"border-box"}}/>
                                </div>
                                <div style={{display:"flex",gap:6}}>
                                    {["All","Active","Inactive"].map(f=>(
                                        <button key={f} onClick={()=>setPtFilter(f)} style={{padding:"8px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:ptFilter===f?"#0d4f4f":"#f1f5f9",color:ptFilter===f?"white":"#64748b"}}>{f}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                {filtPts.length===0
                                    ? <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No patients found.</div>
                                    : filtPts.map((p,i)=>(
                                        <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:i<filtPts.length-1?"1px solid #f1f5f9":"none"}}>
                                            <img src={p.avatar?(p.avatar.startsWith("http")?p.avatar:`http://localhost:5000${p.avatar}`):`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=14b8a6&color=fff`} alt={p.name} style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                                            <div style={{flex:1,minWidth:0}}>
                                                <div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{p.name}</div>
                                                <div style={{fontSize:11,color:"#94a3b8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.email} · Age {p.age||"N/A"} · {p.condition_||"No condition listed"}</div>
                                            </div>
                                            <Badge s={p.is_active?"Active":"Inactive"}/>
                                            <div style={{display:"flex",gap:6,flexShrink:0}}>
                                                <button onClick={()=>openEditPt(p)} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#dbeafe",color:"#1d4ed8",fontWeight:700,fontSize:12,cursor:"pointer"}}>✏️</button>
                                                <button onClick={()=>setDelTarget({type:"patient",id:p.id,name:p.name})} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑️</button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                    {/* ══ ADMINS ══ */}
                    {active==="admins"&&(
                        <div>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:20}}>
                                <div><h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Manage Admins</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>{admins.length} admins · Super Admin has full control</div></div>
                                {isSuperAdmin&&<button onClick={()=>setAdmModal(true)} style={{background:"linear-gradient(120deg,#dc2626,#991b1b)",color:"white",border:"none",borderRadius:12,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔐 Add Admin</button>}
                            </div>
                            {!isSuperAdmin&&<div style={{background:"#fef9c3",border:"1px solid #fde047",borderRadius:12,padding:"14px 18px",fontSize:13,color:"#713f12",marginBottom:16}}>⚠️ Only Super Admin can add or delete other admins.</div>}
                            <div style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                                {admins.map((a,i)=>(
                                    <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"16px 20px",borderBottom:i<admins.length-1?"1px solid #f1f5f9":"none"}}>
                                        <div style={{width:44,height:44,borderRadius:"50%",background:a.isSuperAdmin?"linear-gradient(135deg,#f59e0b,#fbbf24)":"linear-gradient(135deg,#dc2626,#991b1b)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:18,flexShrink:0}}>{a.name?.charAt(0)}</div>
                                        <div style={{flex:1}}>
                                            <div style={{fontWeight:700,fontSize:14,color:"#0f172a",display:"flex",alignItems:"center",gap:8}}>
                                                {a.name}
                                                {a.isSuperAdmin&&<span style={{fontSize:10,fontWeight:700,background:"linear-gradient(120deg,#f59e0b,#fbbf24)",color:"white",padding:"2px 8px",borderRadius:20}}>⭐ SUPER ADMIN</span>}
                                            </div>
                                            <div style={{fontSize:12,color:"#64748b"}}>{a.email}</div>
                                        </div>
                                        <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:"#fee2e2",color:"#dc2626",flexShrink:0}}>{a.isSuperAdmin?"Super Admin":"Admin"}</span>
                                        {isSuperAdmin&&!a.isSuperAdmin&&(
                                            <button onClick={()=>setDelTarget({type:"admin",id:a.id,name:a.name})} style={{padding:"6px 12px",borderRadius:8,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer",flexShrink:0}}>🗑️</button>
                                        )}
                                        {a.isSuperAdmin&&<span style={{fontSize:11,color:"#94a3b8",flexShrink:0}}>🔒 Protected</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @media(min-width:769px){
                    .adm-sidebar{position:sticky !important;top:0 !important;height:100vh !important;}
                    .hamburger-adm{display:none !important;}
                    .adm-body{padding:22px 28px !important;}
                    .stat4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
                    .dr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
                    .two-col-grid{grid-template-columns:1fr 1fr !important;}
                }
                @media(max-width:1024px) and (min-width:769px){.dr-grid{grid-template-columns:repeat(2,1fr);}}
                @media(max-width:768px){
                    .adm-sidebar{transform:translateX(-100%);transition:transform 0.25s ease;}
                    .stat4{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
                    .dr-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
                    .two-col-grid{grid-template-columns:1fr !important;}
                }
                @media(max-width:480px){.dr-grid{grid-template-columns:1fr;}}
                div::-webkit-scrollbar{width:4px;height:4px;}
                div::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
            `}</style>
        </div>
    );
}