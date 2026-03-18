import { useState } from "react";
import { useHomepage } from "../../context/HomepageContext";

/* ── STATIC DATA ── */
const initDoctors = [
  { id:"D001", name:"Dr. Emily Chen",  specialty:"Cardiologist",    exp:"8 yrs",  patients:142, status:"Active",   avatar:"https://randomuser.me/api/portraits/women/44.jpg", email:"emily@hospital.com",  phone:"+1-555-0101", fee:"$120" },
  { id:"D002", name:"Dr. James Liu",   specialty:"Endocrinologist", exp:"12 yrs", patients:98,  status:"Active",   avatar:"https://randomuser.me/api/portraits/men/46.jpg",   email:"james@hospital.com",  phone:"+1-555-0102", fee:"$110" },
  { id:"D003", name:"Dr. Sarah Malik", specialty:"Dermatologist",   exp:"6 yrs",  patients:210, status:"Active",   avatar:"https://randomuser.me/api/portraits/women/65.jpg", email:"sarah@hospital.com",  phone:"+1-555-0103", fee:"$95"  },
  { id:"D004", name:"Dr. Hamid Raza",  specialty:"General",         exp:"15 yrs", patients:320, status:"Active",   avatar:"https://randomuser.me/api/portraits/men/61.jpg",   email:"hamid@hospital.com",  phone:"+1-555-0104", fee:"$80"  },
  { id:"D005", name:"Dr. Ali Nawaz",   specialty:"Neurologist",     exp:"10 yrs", patients:76,  status:"On Leave", avatar:"https://randomuser.me/api/portraits/men/55.jpg",   email:"ali@hospital.com",    phone:"+1-555-0105", fee:"$150" },
  { id:"D006", name:"Dr. Zara Khan",   specialty:"Orthopedic",      exp:"9 yrs",  patients:134, status:"Active",   avatar:"https://randomuser.me/api/portraits/women/11.jpg", email:"zara@hospital.com",   phone:"+1-555-0106", fee:"$130" },
];
const initPatients = [
  { id:"P001", name:"Roger Curtis",     age:36, gender:"Male",   blood:"O+",  condition:"Diabetes",       doctor:"Dr. James Liu",  status:"Active",   lastVisit:"25 Oct 2023", avatar:"https://randomuser.me/api/portraits/men/32.jpg",   email:"roger@email.com",  phone:"+1-555-1001" },
  { id:"P002", name:"Beth Mccoy",       age:25, gender:"Female", blood:"A+",  condition:"Asthma",         doctor:"Dr. Emily Chen", status:"Active",   lastVisit:"02 Jan 2024", avatar:"https://randomuser.me/api/portraits/women/44.jpg", email:"beth@email.com",   phone:"+1-555-1002" },
  { id:"P003", name:"Evan Henry",       age:34, gender:"Male",   blood:"O+",  condition:"Hypertension",   doctor:"Dr. Hamid Raza", status:"Active",   lastVisit:"15 Feb 2024", avatar:"https://randomuser.me/api/portraits/men/32.jpg",   email:"evan@email.com",   phone:"+1-555-1003" },
  { id:"P004", name:"Dwight Murphy",    age:45, gender:"Male",   blood:"B+",  condition:"Heart Disease",  doctor:"Dr. Emily Chen", status:"Critical", lastVisit:"10 Mar 2024", avatar:"https://randomuser.me/api/portraits/men/46.jpg",   email:"dwight@email.com", phone:"+1-555-1004" },
  { id:"P005", name:"Bessie Alexander", age:31, gender:"Female", blood:"AB-", condition:"Diabetes",       doctor:"Dr. James Liu",  status:"Active",   lastVisit:"22 Feb 2024", avatar:"https://randomuser.me/api/portraits/women/65.jpg", email:"bessie@email.com", phone:"+1-555-1005" },
];
const monthlyData=[42,58,74,63,89,95,78,102,88,115,98,124];
const revenueData=[12,18,22,17,28,31,25,35,30,42,38,47];
const appointData=[28,35,45,38,55,60,48,65,55,72,62,78];
const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const navItems=[{id:"dashboard",icon:"⊞",label:"Dashboard"},{id:"homepage",icon:"🌐",label:"Homepage"},{id:"doctors",icon:"👨‍⚕️",label:"Doctors"},{id:"patients",icon:"👥",label:"Patients"}];
const COLORS=["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#14b8a6"];
const SPECIALTIES=["Cardiologist","Endocrinologist","Dermatologist","General","Neurologist","Orthopedic","Pediatrician","Surgeon","Pulmonologist","Ophthalmologist"];

/* ── HELPERS ── */
const Badge=({s})=>{const m={Active:["#dcfce7","#16a34a"],"On Leave":["#fef9c3","#ca8a04"],Critical:["#fee2e2","#dc2626"],Inactive:["#f1f5f9","#64748b"],New:["#dbeafe","#1d4ed8"]};const[bg,tc]=m[s]||["#f1f5f9","#64748b"];return<span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:bg,color:tc}}>{s}</span>;};
const Inp=({label,value,onChange,type="text",placeholder=""})=>(<div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label><input type={type} value={value||""} onChange={onChange} placeholder={placeholder} style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/></div>);
const Sel=({label,value,onChange,options})=>(<div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label><select value={value||""} onChange={onChange} style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",fontFamily:"inherit",cursor:"pointer",width:"100%"}}>{options.map(o=><option key={o}>{o}</option>)}</select></div>);
const Txt=({label,value,onChange,rows=3})=>(<div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{fontSize:12,fontWeight:700,color:"#475569"}}>{label}</label><textarea value={value||""} onChange={onChange} rows={rows} style={{padding:"9px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc",color:"#1e293b",fontFamily:"inherit",resize:"vertical",width:"100%",boxSizing:"border-box"}}/></div>);
const Toggle=({val,onToggle})=>(<div onClick={onToggle} style={{width:46,height:26,borderRadius:20,cursor:"pointer",transition:"all 0.2s",background:val?"#6366f1":"#e2e8f0",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:3,width:20,height:20,borderRadius:"50%",background:"white",transition:"all 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",left:val?23:3}}/></div>);
function Modal({title,onClose,children,maxWidth=520}){return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div style={{background:"white",borderRadius:20,width:"100%",maxWidth,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.3)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"white",zIndex:1}}><div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>{title}</div><button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div><div style={{padding:"20px 22px"}}>{children}</div></div></div>);}
function BarChart({data,color,height=110}){const max=Math.max(...data);const bw=100/data.length;return(<div><svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{width:"100%",height}} xmlns="http://www.w3.org/2000/svg">{data.map((v,i)=>{const bh=(v/max)*(height-10);const x=i*bw+bw*0.15;return(<rect key={i} x={x} y={height-bh-4} width={bw*0.7} height={bh} fill={color} rx="2" opacity="0.85"/>);})}</svg><div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>{months.map(m=><div key={m} style={{flex:1,textAlign:"center",fontSize:8,color:"#94a3b8",fontWeight:600}}>{m}</div>)}</div></div>);}
function PieChart({data,size=130}){const total=data.reduce((s,d)=>s+d.count,0);let cum=-90;const cx=size/2,cy=size/2,r=size*0.38,ir=size*0.22;const polar=(a,rad)=>{const r2=(a*Math.PI)/180;return[cx+rad*Math.cos(r2),cy+rad*Math.sin(r2)];};return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{data.map((d,i)=>{const angle=(d.count/total)*360;const sa=cum;cum+=angle;const[x1,y1]=polar(sa,r),[x2,y2]=polar(cum,r),[ix1,iy1]=polar(sa,ir),[ix2,iy2]=polar(cum,ir);const lg=(cum-sa)>180?1:0;return<path key={i} d={`M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${lg} 0 ${ix1} ${iy1} Z`} fill={d.color} stroke="white" strokeWidth={2}/>;})}<circle cx={cx} cy={cy} r={ir-2} fill="white"/><text x={cx} y={cy-5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1e293b">{total}</text><text x={cx} y={cy+9} textAnchor="middle" fontSize="8" fill="#94a3b8">Total</text></svg>);}

/* ══════════════════════════════════════════════ MAIN ══════════════════════════════════════════════ */
export default function AdminPanel() {
  const { state:hp, update:hpUpdate, updateNested, addItem, removeItem } = useHomepage();

  const emptyDr={name:"",specialty:"Cardiologist",exp:"",patients:0,status:"Active",email:"",phone:"",fee:"",avatar:"https://randomuser.me/api/portraits/men/10.jpg"};
  const emptyPt={name:"",age:"",gender:"Male",blood:"O+",condition:"",doctor:"Dr. Hamid Raza",status:"Active",lastVisit:"",email:"",phone:"",avatar:"https://randomuser.me/api/portraits/men/10.jpg"};
  const [active,setActive]=useState("dashboard");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [doctors,setDoctors]=useState(initDoctors);
  const [patients,setPatients]=useState(initPatients);
  const [drModal,setDrModal]=useState(null);
  const [drForm,setDrForm]=useState({});
  const [drSearch,setDrSearch]=useState("");
  const [drView,setDrView]=useState(null);
  const [ptModal,setPtModal]=useState(null);
  const [ptForm,setPtForm]=useState({});
  const [ptSearch,setPtSearch]=useState("");
  const [ptView,setPtView]=useState(null);
  const [ptFilter,setPtFilter]=useState("All");
  const [deleteConfirm,setDeleteConfirm]=useState(null);
  const [hpTab,setHpTab]=useState("banner");
  const [hpSaved,setHpSaved]=useState(false);

  const goto=id=>{setActive(id);setSidebarOpen(false);};
  const saveHp=()=>{setHpSaved(true);setTimeout(()=>setHpSaved(false),2500);};

  /* Doctors CRUD */
  const emptyDr={name:"",specialty:"Cardiologist",exp:"",patients:0,status:"Active",email:"",phone:"",fee:"",avatar:"https://randomuser.me/api/portraits/men/10.jpg"};
  const saveDr=()=>{if(!drForm.name||!drForm.email){alert("Name and email required.");return;}if(drModal==="add")setDoctors(p=>[...p,{...drForm,id:"D00"+(p.length+1),patients:0}]);else setDoctors(p=>p.map(d=>d.id===drForm.id?drForm:d));setDrModal(null);};
  const deleteDr=id=>{setDoctors(p=>p.filter(d=>d.id!==id));setDeleteConfirm(null);};

  /* Patients CRUD */
  const emptyPt={name:"",age:"",gender:"Male",blood:"O+",condition:"",doctor:doctors[0]?.name||"",status:"Active",lastVisit:"",email:"",phone:"",avatar:"https://randomuser.me/api/portraits/men/10.jpg"};
  const savePt=()=>{if(!ptForm.name||!ptForm.email){alert("Name and email required.");return;}if(ptModal==="add")setPatients(p=>[...p,{...ptForm,id:"P00"+(p.length+1)}]);else setPatients(p=>p.map(pt=>pt.id===ptForm.id?ptForm:pt));setPtModal(null);};
  const deletePt=id=>{setPatients(p=>p.filter(pt=>pt.id!==id));setDeleteConfirm(null);};

  const filtDrs=doctors.filter(d=>d.name.toLowerCase().includes(drSearch.toLowerCase())||d.specialty.toLowerCase().includes(drSearch.toLowerCase()));
  const filtPts=patients.filter(p=>{const ms=p.name.toLowerCase().includes(ptSearch.toLowerCase())||p.condition.toLowerCase().includes(ptSearch.toLowerCase());const mf=ptFilter==="All"||p.status===ptFilter;return ms&&mf;});

  const userPie=[{label:"Doctors",count:doctors.length,color:"#6366f1"},{label:"Patients",count:patients.length,color:"#14b8a6"},{label:"Admins",count:3,color:"#f59e0b"}];
  const drPie=[{label:"Active",count:doctors.filter(d=>d.status==="Active").length,color:"#10b981"},{label:"On Leave",count:doctors.filter(d=>d.status==="On Leave").length,color:"#f59e0b"},{label:"Inactive",count:1,color:"#ef4444"}];
  const ptPie=[{label:"Active",count:patients.filter(p=>p.status==="Active").length,color:"#10b981"},{label:"Critical",count:patients.filter(p=>p.status==="Critical").length,color:"#ef4444"},{label:"New",count:patients.filter(p=>p.status==="New").length,color:"#3b82f6"}];

  /* Homepage tabs */
  const hpTabs=[["banner","📢 Banner"],["popup","🎉 Popup"],["hero","🖼️ Hero"],["services","⚕️ Services"],["homepage_doctors","👨‍⚕️ Doctors"],["about","ℹ️ About"],["offers","🎁 Offers"],["contact","📞 Contact"]];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#f0f4ff",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>

      {/* Delete confirm */}
      {deleteConfirm&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div style={{background:"white",borderRadius:20,padding:28,maxWidth:380,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",textAlign:"center"}}><div style={{fontSize:44,marginBottom:10}}>⚠️</div><div style={{fontWeight:800,fontSize:17,color:"#0f172a",marginBottom:8}}>Confirm Delete</div><div style={{fontSize:13,color:"#64748b",marginBottom:20}}>Delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</div><div style={{display:"flex",gap:10}}><button onClick={()=>setDeleteConfirm(null)} style={{flex:1,padding:"11px",borderRadius:10,border:"2px solid #e2e8f0",background:"white",fontWeight:700,fontSize:13,cursor:"pointer",color:"#64748b"}}>Cancel</button><button onClick={()=>deleteConfirm.type==="doctor"?deleteDr(deleteConfirm.id):deletePt(deleteConfirm.id)} style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"#ef4444",fontWeight:700,fontSize:13,cursor:"pointer",color:"white"}}>Delete</button></div></div></div>)}

      {/* Doctor modal */}
      {drModal&&(<Modal title={drModal==="add"?"Add Doctor":"Edit Doctor"} onClose={()=>setDrModal(null)}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><Inp label="Full Name *" value={drForm.name} onChange={e=>setDrForm(p=>({...p,name:e.target.value}))} placeholder="Dr. John Smith"/><Sel label="Specialty" value={drForm.specialty} onChange={e=>setDrForm(p=>({...p,specialty:e.target.value}))} options={SPECIALTIES}/><Inp label="Email *" value={drForm.email} onChange={e=>setDrForm(p=>({...p,email:e.target.value}))} placeholder="doctor@hospital.com"/><Inp label="Phone" value={drForm.phone} onChange={e=>setDrForm(p=>({...p,phone:e.target.value}))} placeholder="+1-555-0000"/><Inp label="Experience" value={drForm.exp} onChange={e=>setDrForm(p=>({...p,exp:e.target.value}))} placeholder="5 yrs"/><Inp label="Fee" value={drForm.fee} onChange={e=>setDrForm(p=>({...p,fee:e.target.value}))} placeholder="$100"/><Sel label="Status" value={drForm.status} onChange={e=>setDrForm(p=>({...p,status:e.target.value}))} options={["Active","On Leave","Inactive"]}/><Inp label="Avatar URL" value={drForm.avatar} onChange={e=>setDrForm(p=>({...p,avatar:e.target.value}))} placeholder="https://..."/></div><div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>setDrModal(null)} style={{flex:1,padding:"11px",borderRadius:10,border:"2px solid #e2e8f0",background:"white",fontWeight:700,fontSize:13,cursor:"pointer",color:"#64748b"}}>Cancel</button><button onClick={saveDr} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#4f46e5,#7c3aed)",fontWeight:700,fontSize:13,cursor:"pointer",color:"white"}}>{drModal==="add"?"✅ Add Doctor":"💾 Save"}</button></div></Modal>)}

      {/* Patient modal */}
      {ptModal&&(<Modal title={ptModal==="add"?"Add Patient":"Edit Patient"} onClose={()=>setPtModal(null)}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><Inp label="Full Name *" value={ptForm.name} onChange={e=>setPtForm(p=>({...p,name:e.target.value}))} placeholder="John Doe"/><Inp label="Age" value={ptForm.age} onChange={e=>setPtForm(p=>({...p,age:e.target.value}))} placeholder="35" type="number"/><Sel label="Gender" value={ptForm.gender} onChange={e=>setPtForm(p=>({...p,gender:e.target.value}))} options={["Male","Female","Other"]}/><Sel label="Blood Type" value={ptForm.blood} onChange={e=>setPtForm(p=>({...p,blood:e.target.value}))} options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]}/><Inp label="Email *" value={ptForm.email} onChange={e=>setPtForm(p=>({...p,email:e.target.value}))} placeholder="patient@email.com"/><Inp label="Phone" value={ptForm.phone} onChange={e=>setPtForm(p=>({...p,phone:e.target.value}))} placeholder="+1-555-0000"/><Inp label="Condition" value={ptForm.condition} onChange={e=>setPtForm(p=>({...p,condition:e.target.value}))} placeholder="Diabetes..."/><Sel label="Assigned Doctor" value={ptForm.doctor} onChange={e=>setPtForm(p=>({...p,doctor:e.target.value}))} options={doctors.map(d=>d.name)}/><Sel label="Status" value={ptForm.status} onChange={e=>setPtForm(p=>({...p,status:e.target.value}))} options={["Active","Critical","New","Inactive"]}/><Inp label="Last Visit" value={ptForm.lastVisit} onChange={e=>setPtForm(p=>({...p,lastVisit:e.target.value}))} placeholder="01 Jan 2024"/></div><div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>setPtModal(null)} style={{flex:1,padding:"11px",borderRadius:10,border:"2px solid #e2e8f0",background:"white",fontWeight:700,fontSize:13,cursor:"pointer",color:"#64748b"}}>Cancel</button><button onClick={savePt} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",fontWeight:700,fontSize:13,cursor:"pointer",color:"white"}}>{ptModal==="add"?"✅ Add Patient":"💾 Save"}</button></div></Modal>)}

      {/* Mobile overlay */}
      {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:40}}/>}

      {/* ── SIDEBAR ── */}
      <div style={{width:220,flexShrink:0,background:"linear-gradient(180deg,#1e1b4b 0%,#312e81 60%,#1e1b4b 100%)",display:"flex",flexDirection:"column",padding:"24px 0 20px",position:"fixed",top:0,left:0,bottom:0,zIndex:50,transform:sidebarOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s ease"}} className="adm-sidebar">
        <button onClick={()=>setSidebarOpen(false)} className="sidebar-close" style={{position:"absolute",top:12,right:12,background:"none",border:"none",color:"rgba(255,255,255,0.6)",fontSize:20,cursor:"pointer"}}>✕</button>
        <div style={{padding:"0 20px 24px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🏥</div>
            <div><div style={{color:"white",fontWeight:800,fontSize:15}}>MediAdmin</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:10}}>Hospital Management</div></div>
          </div>
        </div>
        <div style={{margin:"14px 12px",background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>👤</div>
          <div><div style={{color:"white",fontWeight:700,fontSize:13}}>Super Admin</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>admin@hospital.com</div></div>
        </div>
        <div style={{padding:"0 12px",display:"flex",flexDirection:"column",gap:4,flex:1}}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>goto(item.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:"none",cursor:"pointer",background:active===item.id?"rgba(99,102,241,0.3)":"transparent",borderLeft:active===item.id?"3px solid #6366f1":"3px solid transparent",color:active===item.id?"white":"rgba(255,255,255,0.6)",fontSize:13,fontWeight:600,transition:"all 0.2s",textAlign:"left"}}>
              <span style={{fontSize:17}}>{item.icon}</span>{item.label}
              {item.id==="doctors"&&<span style={{marginLeft:"auto",background:"rgba(99,102,241,0.4)",borderRadius:20,padding:"1px 8px",fontSize:10,color:"#a5b4fc"}}>{doctors.length}</span>}
              {item.id==="patients"&&<span style={{marginLeft:"auto",background:"rgba(20,184,166,0.3)",borderRadius:20,padding:"1px 8px",fontSize:10,color:"#5eead4"}}>{patients.length}</span>}
            </button>
          ))}
        </div>
        <button style={{margin:"0 12px",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,cursor:"pointer",borderRadius:12}}>↩ Logout</button>
      </div>

      {/* ── MAIN ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}} className="adm-main">
        {/* Topbar */}
        <div style={{height:60,background:"white",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #e8ecf4",position:"sticky",top:0,zIndex:30,boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setSidebarOpen(true)} className="hamburger-adm" style={{background:"none",border:"none",fontSize:22,color:"#4f46e5",cursor:"pointer",lineHeight:1}}>☰</button>
            <div><div style={{fontWeight:800,fontSize:16,color:"#0f172a"}}>{navItems.find(n=>n.id===active)?.icon} {navItems.find(n=>n.id===active)?.label}</div><div style={{fontSize:11,color:"#94a3b8"}}>Hospital Management System</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{position:"relative"}}><span style={{fontSize:20,cursor:"pointer"}}>🔔</span><span style={{position:"absolute",top:-2,right:-2,width:14,height:14,background:"#ef4444",borderRadius:"50%",fontSize:8,color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>5</span></div>
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer"}}>👤</div>
          </div>
        </div>

        <div style={{flex:1,overflow:"auto",padding:"20px 16px"}} className="adm-body">

          {/* ════ DASHBOARD ════ */}
          {active==="dashboard"&&(
            <div>
              <div className="stat4" style={{marginBottom:20}}>
                {[["Doctors",doctors.length,"👨‍⚕️","linear-gradient(135deg,#6366f1,#8b5cf6)"],["Patients",patients.length,"👥","linear-gradient(135deg,#0d4f4f,#14b8a6)"],["Appointments",211,"📅","linear-gradient(135deg,#0ea5e9,#38bdf8)"],["Revenue","$42.8K","💰","linear-gradient(135deg,#f59e0b,#fbbf24)"]].map(([label,val,icon,bg])=>(
                  <div key={label} style={{background:bg,borderRadius:16,padding:"20px 22px",boxShadow:"0 4px 16px rgba(0,0,0,0.12)",color:"white"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontSize:11,opacity:0.8,marginBottom:6}}>{label}</div><div style={{fontSize:28,fontWeight:800}}>{val}</div></div><div style={{fontSize:28,opacity:0.8}}>{icon}</div></div>
                  </div>
                ))}
              </div>
              <div className="chart3" style={{marginBottom:20}}>
                {[["📈 Monthly Patients",monthlyData,"#6366f1"],["💰 Revenue (K$)",revenueData,"#14b8a6"],["📅 Appointments",appointData,"#f59e0b"]].map(([title,data,color])=>(
                  <div key={title} style={{background:"white",borderRadius:16,padding:18,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}><div style={{fontWeight:800,fontSize:13,color:"#0f172a",marginBottom:12}}>{title}</div><BarChart data={data} color={color}/></div>
                ))}
              </div>
              <div className="pie3" style={{marginBottom:20}}>
                {[["👥 User Distribution",userPie],["👨‍⚕️ Doctor Status",drPie],["🩺 Patient Status",ptPie]].map(([title,data])=>(
                  <div key={title} style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}><div style={{fontWeight:800,fontSize:13,color:"#0f172a",marginBottom:14}}>{title}</div><div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}><PieChart data={data} size={120}/><div style={{display:"flex",flexDirection:"column",gap:8}}>{data.map(d=>(<div key={d.label} style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:3,background:d.color,flexShrink:0}}/><span style={{fontSize:12,color:"#64748b"}}>{d.label}</span><span style={{fontSize:12,fontWeight:800,color:"#0f172a",marginLeft:"auto",paddingLeft:10}}>{d.count}</span></div>))}</div></div></div>
                ))}
              </div>
              <div className="two-col">
                {[["Recent Doctors",doctors.slice(0,4),d=><><img src={d.avatar} alt="" style={{width:34,height:34,borderRadius:"50%",objectFit:"cover"}}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{d.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{d.specialty}</div></div><Badge s={d.status}/></>],["Recent Patients",patients.slice(0,4),p=><><img src={p.avatar} alt="" style={{width:34,height:34,borderRadius:"50%",objectFit:"cover"}}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{p.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{p.condition}</div></div><Badge s={p.status}/></>]].map(([title,arr,renderRow])=>(
                  <div key={title} style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}><div style={{fontWeight:800,fontSize:14,color:"#0f172a",marginBottom:14}}>{title}</div>{arr.map((item,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #f1f5f9"}}>{renderRow(item)}</div>))}</div>
                ))}
              </div>
            </div>
          )}

          {/* ════ HOMEPAGE EDITOR ════ */}
          {active==="homepage"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:20}}>
                <div><h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Homepage Editor</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>Changes apply to the live website instantly ✅</div></div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  {hpSaved&&<span style={{fontSize:13,color:"#16a34a",fontWeight:700,background:"#dcfce7",padding:"6px 14px",borderRadius:20}}>✅ Saved!</span>}
                  <button onClick={saveHp} style={{background:"linear-gradient(120deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:12,padding:"10px 22px",fontWeight:700,fontSize:13,cursor:"pointer"}}>💾 Save</button>
                </div>
              </div>

              {/* Section tabs — scrollable */}
              <div style={{display:"flex",gap:6,marginBottom:18,overflowX:"auto",paddingBottom:6}}>
                {hpTabs.map(([id,label])=>(
                  <button key={id} onClick={()=>setHpTab(id)} style={{flexShrink:0,padding:"8px 16px",borderRadius:20,border:"none",cursor:"pointer",background:hpTab===id?"#4f46e5":"white",color:hpTab===id?"white":"#64748b",fontWeight:700,fontSize:13,transition:"all 0.2s"}}>{label}</button>
                ))}
              </div>

              <div style={{background:"white",borderRadius:16,padding:22,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>

                {/* ── BANNER ── */}
                {hpTab==="banner"&&(<div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"#f8fafc",borderRadius:12,border:"1px solid #e2e8f0"}}>
                    <div><div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>📢 Announcement Banner</div><div style={{fontSize:12,color:"#64748b",marginTop:2}}>Shows at the top of the homepage</div></div>
                    <Toggle val={hp.showBanner} onToggle={()=>hpUpdate("showBanner",!hp.showBanner)}/>
                  </div>
                  {hp.showBanner&&(<>
                    <Inp label="Banner Text" value={hp.bannerText} onChange={e=>hpUpdate("bannerText",e.target.value)}/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="contact-grid">
                      <Inp label="Link URL" value={hp.bannerLink} onChange={e=>hpUpdate("bannerLink",e.target.value)} placeholder="/book-appointment"/>
                      <div><label style={{fontSize:12,fontWeight:700,color:"#475569",marginBottom:5,display:"block"}}>Background Color</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["#1e40af","#065f46","#7c2d12","#581c87","#991b1b","#0d4f4f"].map(c=>(<div key={c} onClick={()=>hpUpdate("bannerBg",c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:hp.bannerBg===c?"3px solid #0f172a":"3px solid transparent",transition:"all 0.15s"}}/>))}</div></div>
                    </div>
                    <div style={{background:hp.bannerBg,color:"white",padding:"10px 20px",borderRadius:10,textAlign:"center",fontSize:14,fontWeight:600}}>{hp.bannerText}</div>
                  </>)}
                </div>)}

                {/* ── POPUP ── */}
                {hpTab==="popup"&&(<div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"#f8fafc",borderRadius:12,border:"1px solid #e2e8f0"}}>
                    <div><div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>🎉 Welcome Popup</div><div style={{fontSize:12,color:"#64748b",marginTop:2}}>Shows on page load — once per session</div></div>
                    <Toggle val={hp.showPopup} onToggle={()=>hpUpdate("showPopup",!hp.showPopup)}/>
                  </div>
                  {hp.showPopup&&(<>
                    <Inp label="Popup Title" value={hp.popupTitle} onChange={e=>hpUpdate("popupTitle",e.target.value)}/>
                    <Txt label="Popup Message" value={hp.popupText} onChange={e=>hpUpdate("popupText",e.target.value)} rows={3}/>
                    <Inp label="Button Text" value={hp.popupBtn} onChange={e=>hpUpdate("popupBtn",e.target.value)} placeholder="Book Now"/>
                    <div><label style={{fontSize:12,fontWeight:700,color:"#475569",marginBottom:5,display:"block"}}>Header Color</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["#0d4f4f","#1e40af","#581c87","#7c2d12","#1a3fce"].map(c=>(<div key={c} onClick={()=>hpUpdate("popupBg",c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:hp.popupBg===c?"3px solid #0f172a":"3px solid transparent",transition:"all 0.15s"}}/>))}</div></div>
                    {/* Preview */}
                    <div style={{border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden",maxWidth:360}}>
                      <div style={{background:hp.popupBg,padding:"20px",textAlign:"center"}}><div style={{fontSize:28,marginBottom:6}}>🏥</div><div style={{color:"white",fontWeight:800,fontSize:15}}>{hp.popupTitle}</div></div>
                      <div style={{padding:"16px 20px"}}><p style={{fontSize:13,color:"#475569",lineHeight:1.6,marginBottom:14}}>{hp.popupText}</p><div style={{background:`linear-gradient(120deg,${hp.popupBg},#14b8a6)`,color:"white",borderRadius:10,padding:"10px",textAlign:"center",fontWeight:700,fontSize:13}}>{hp.popupBtn}</div></div>
                    </div>
                  </>)}
                </div>)}

                {/* ── HERO ── */}
                {hpTab==="hero"&&(<div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>🖼️ Hero Slides</div>
                  {hp.heroSlides.map((slide,i)=>(
                    <div key={i} style={{border:"1px solid #e2e8f0",borderRadius:14,padding:16}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                        <div style={{fontWeight:700,fontSize:13,color:"#4f46e5"}}>Slide {i+1}</div>
                        {hp.heroSlides.length>1&&<button onClick={()=>removeItem("heroSlides",i)} style={{background:"#fee2e2",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#dc2626",fontWeight:700}}>✕</button>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:10}}>
                        <Inp label="Title" value={slide.title} onChange={e=>updateNested("heroSlides",i,"title",e.target.value)}/>
                        <Txt label="Description" value={slide.description} onChange={e=>updateNested("heroSlides",i,"description",e.target.value)} rows={2}/>
                        <Inp label="Button Text" value={slide.btnText} onChange={e=>updateNested("heroSlides",i,"btnText",e.target.value)}/>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>addItem("heroSlides",{title:"New Slide",description:"Description here...",badge:"Section",stats:["Stat 1","Stat 2","Stat 3"],btnText:"Book Appointment"})} style={{background:"#f1f5f9",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,color:"#4f46e5",cursor:"pointer"}}>+ Add Slide</button>
                </div>)}

                {/* ── SERVICES ── */}
                {hpTab==="services"&&(<div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>⚕️ Services</div>
                    <button onClick={()=>addItem("services",{id:Date.now(),title:"New Service",description:"Service description",features:["Feature 1","Feature 2","Feature 3"],color:COLORS[hp.services.length%COLORS.length],active:true})} style={{background:"linear-gradient(120deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Add Service</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="contact-grid">
                    <Inp label="Section Title" value={hp.servicesTitle} onChange={e=>hpUpdate("servicesTitle",e.target.value)}/>
                    <Inp label="Subtitle" value={hp.servicesSubtitle} onChange={e=>hpUpdate("servicesSubtitle",e.target.value)}/>
                  </div>
                  {hp.services.map((s,i)=>(
                    <div key={s.id||i} style={{border:`2px solid ${s.active?"#6366f1":"#e2e8f0"}`,borderRadius:14,padding:16}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:20,height:20,borderRadius:"50%",background:s.color}}/>
                          <span style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{s.title}</span>
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:11,color:"#64748b"}}>Show</span>
                          <Toggle val={s.active} onToggle={()=>updateNested("services",i,"active",!s.active)}/>
                          <button onClick={()=>removeItem("services",i)} style={{background:"#fee2e2",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#dc2626",fontWeight:700,fontSize:14}}>✕</button>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="contact-grid">
                        <Inp label="Title" value={s.title} onChange={e=>updateNested("services",i,"title",e.target.value)}/>
                        <div>
                          <label style={{fontSize:12,fontWeight:700,color:"#475569",marginBottom:5,display:"block"}}>Color</label>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{COLORS.map(c=>(<div key={c} onClick={()=>updateNested("services",i,"color",c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:s.color===c?"3px solid #0f172a":"2px solid transparent",transition:"all 0.15s"}}/>))}</div>
                        </div>
                      </div>
                      <div style={{marginTop:10}}><Inp label="Description" value={s.description} onChange={e=>updateNested("services",i,"description",e.target.value)}/></div>
                    </div>
                  ))}
                </div>)}

                {/* ── HOMEPAGE DOCTORS ── */}
                {hpTab==="homepage_doctors"&&(<div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>👨‍⚕️ Doctors on Homepage</div>
                    <button onClick={()=>addItem("doctors",{id:Date.now(),name:"Dr. New Doctor",specialty:"General Physician",avatar:"https://randomuser.me/api/portraits/men/10.jpg",active:true})} style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Add Doctor</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="contact-grid">
                    <Inp label="Section Title" value={hp.doctorsTitle} onChange={e=>hpUpdate("doctorsTitle",e.target.value)}/>
                    <Inp label="Subtitle" value={hp.doctorsSubtitle} onChange={e=>hpUpdate("doctorsSubtitle",e.target.value)}/>
                  </div>
                  {hp.doctors.map((doc,i)=>(
                    <div key={doc.id||i} style={{border:`2px solid ${doc.active?"#14b8a6":"#e2e8f0"}`,borderRadius:14,padding:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                        <img src={doc.avatar} alt={doc.name} style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",border:"2px solid #e2e8f0",flexShrink:0}}/>
                        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{doc.name}</div><div style={{fontSize:11,color:"#64748b"}}>{doc.specialty}</div></div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <span style={{fontSize:11,color:"#64748b"}}>Show</span>
                          <Toggle val={doc.active} onToggle={()=>updateNested("doctors",i,"active",!doc.active)}/>
                          <button onClick={()=>removeItem("doctors",i)} style={{background:"#fee2e2",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#dc2626",fontWeight:700,fontSize:14}}>✕</button>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}} className="contact-grid">
                        <Inp label="Name" value={doc.name} onChange={e=>updateNested("doctors",i,"name",e.target.value)}/>
                        <Inp label="Specialty" value={doc.specialty} onChange={e=>updateNested("doctors",i,"specialty",e.target.value)}/>
                      </div>
                      <div style={{marginTop:10}}><Inp label="Avatar URL" value={doc.avatar} onChange={e=>updateNested("doctors",i,"avatar",e.target.value)} placeholder="https://..."/></div>
                    </div>
                  ))}
                </div>)}

                {/* ── ABOUT ── */}
                {hpTab==="about"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>ℹ️ About Section</div>
                  <Inp label="Main Title" value={hp.aboutTitle} onChange={e=>hpUpdate("aboutTitle",e.target.value)}/>
                  <Inp label="Subtitle" value={hp.aboutSubtitle} onChange={e=>hpUpdate("aboutSubtitle",e.target.value)}/>
                  <Txt label="Description" value={hp.aboutDescription} onChange={e=>hpUpdate("aboutDescription",e.target.value)} rows={2}/>
                  <div style={{fontWeight:700,fontSize:13,color:"#475569",marginTop:4}}>Stats</div>
                  {hp.aboutStats.map((s,i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label={`Stat ${i+1} Value`} value={s.value} onChange={e=>updateNested("aboutStats",i,"value",e.target.value)}/><Inp label="Label" value={s.label} onChange={e=>updateNested("aboutStats",i,"label",e.target.value)}/></div>))}
                  <div style={{fontWeight:700,fontSize:13,color:"#475569",marginTop:4}}>Features</div>
                  {hp.aboutFeatures.map((f,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"center"}}><input value={f} onChange={e=>{const arr=[...hp.aboutFeatures];arr[i]=e.target.value;hpUpdate("aboutFeatures",arr);}} style={{flex:1,padding:"8px 12px",borderRadius:9,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"#f8fafc"}}/><button onClick={()=>removeItem("aboutFeatures",i)} style={{background:"#fee2e2",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:"#dc2626",fontWeight:700,fontSize:14}}>✕</button></div>))}
                  <button onClick={()=>addItem("aboutFeatures","New Feature")} style={{background:"#f1f5f9",border:"none",borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:600,color:"#4f46e5",cursor:"pointer",alignSelf:"flex-start"}}>+ Add Feature</button>
                </div>)}

                {/* ── OFFERS ── */}
                {hpTab==="offers"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>🎁 Offers & Promotions</div>
                    <Toggle val={hp.showOffers} onToggle={()=>hpUpdate("showOffers",!hp.showOffers)}/>
                  </div>
                  {hp.offers.map((o,i)=>(<div key={o.id||i} style={{border:`2px solid ${o.active?"#6366f1":"#e2e8f0"}`,borderRadius:14,padding:16}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                      <span style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{o.title||"Offer"}</span>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,color:"#64748b"}}>Active</span><Toggle val={o.active} onToggle={()=>updateNested("offers",i,"active",!o.active)}/><button onClick={()=>removeItem("offers",i)} style={{background:"#fee2e2",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#dc2626",fontWeight:700}}>✕</button></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Title" value={o.title} onChange={e=>updateNested("offers",i,"title",e.target.value)}/><Inp label="Tag" value={o.tag} onChange={e=>updateNested("offers",i,"tag",e.target.value)} placeholder="Limited / Offer"/></div>
                    <div style={{marginTop:10}}><Txt label="Description" value={o.desc} onChange={e=>updateNested("offers",i,"desc",e.target.value)} rows={2}/></div>
                  </div>))}
                  <button onClick={()=>addItem("offers",{id:Date.now(),title:"New Offer",desc:"",tag:"Offer",color:"#6366f1",active:false})} style={{background:"linear-gradient(120deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:10,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer",alignSelf:"flex-start"}}>+ Add Offer</button>
                </div>)}

                {/* ── CONTACT ── */}
                {hpTab==="contact"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#0f172a"}}>📞 Contact Info</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="contact-grid">
                    <Inp label="Main Phone" value={hp.phone} onChange={e=>hpUpdate("phone",e.target.value)}/>
                    <Inp label="Emergency Hotline" value={hp.emergencyPhone} onChange={e=>hpUpdate("emergencyPhone",e.target.value)}/>
                    <Inp label="Email" value={hp.email} onChange={e=>hpUpdate("email",e.target.value)}/>
                    <Inp label="Working Hours" value={hp.workingHours} onChange={e=>hpUpdate("workingHours",e.target.value)}/>
                  </div>
                  <Inp label="Address" value={hp.address} onChange={e=>hpUpdate("address",e.target.value)}/>
                  <Txt label="Google Maps Embed URL" value={hp.mapSrc} onChange={e=>hpUpdate("mapSrc",e.target.value)} rows={3}/>
                </div>)}

              </div>
            </div>
          )}

          {/* ════ DOCTORS ════ */}
          {active==="doctors"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:20}}>
                <div><h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Manage Doctors</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>{doctors.length} doctors registered</div></div>
                <button onClick={()=>{setDrForm({...emptyDr,id:"D00"+(doctors.length+1)});setDrModal("add");}} style={{background:"linear-gradient(120deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:12,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Add Doctor</button>
              </div>
              <div style={{position:"relative",marginBottom:16}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#94a3b8"}}>🔍</span><input placeholder="Search..." value={drSearch} onChange={e=>setDrSearch(e.target.value)} style={{width:"100%",padding:"10px 12px 10px 38px",borderRadius:12,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"white",boxSizing:"border-box"}}/></div>
              <div className="dr-grid">
                {filtDrs.map(d=>(
                  <div key={d.id} style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 1px 8px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}><img src={d.avatar} alt={d.name} style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:"2px solid #e2e8f0",flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontWeight:800,fontSize:14,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.name}</div><div style={{fontSize:12,color:"#64748b"}}>{d.specialty}</div><div style={{marginTop:4}}><Badge s={d.status}/></div></div></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 10px",background:"#f8fafc",borderRadius:10,padding:"10px 12px"}}>{[["Exp",d.exp],["Patients",d.patients],["Fee",d.fee],["ID",d.id]].map(([l,v])=>(<div key={l}><div style={{fontSize:10,color:"#94a3b8"}}>{l}</div><div style={{fontSize:12,fontWeight:700,color:"#0f172a"}}>{v}</div></div>))}</div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>setDrView(d)} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:"#ede9fe",color:"#7c3aed",fontWeight:700,fontSize:12,cursor:"pointer"}}>👁 View</button>
                      <button onClick={()=>{setDrForm({...d});setDrModal("edit");}} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:"#dbeafe",color:"#1d4ed8",fontWeight:700,fontSize:12,cursor:"pointer"}}>✏️ Edit</button>
                      <button onClick={()=>setDeleteConfirm({type:"doctor",id:d.id,name:d.name})} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑️ Del</button>
                    </div>
                  </div>
                ))}
              </div>
              {drView&&(<Modal title="Doctor Profile" onClose={()=>setDrView(null)} maxWidth={420}><div style={{textAlign:"center",marginBottom:20}}><img src={drView.avatar} alt={drView.name} style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"3px solid #e2e8f0",marginBottom:10}}/><div style={{fontWeight:800,fontSize:17,color:"#0f172a"}}>{drView.name}</div><div style={{fontSize:13,color:"#64748b",marginBottom:8}}>{drView.specialty}</div><Badge s={drView.status}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 20px"}}>{[["ID",drView.id],["Exp",drView.exp],["Patients",drView.patients],["Fee",drView.fee],["Email",drView.email],["Phone",drView.phone]].map(([l,v])=>(<div key={l} style={{borderBottom:"1px solid #f1f5f9",paddingBottom:8}}><div style={{fontSize:10,color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{v}</div></div>))}</div><div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>{setDrView(null);setDrForm({...drView});setDrModal("edit");}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#4f46e5",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>✏️ Edit</button><button onClick={()=>{setDrView(null);setDeleteConfirm({type:"doctor",id:drView.id,name:drView.name});}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:13,cursor:"pointer"}}>🗑️ Delete</button></div></Modal>)}
            </div>
          )}

          {/* ════ PATIENTS ════ */}
          {active==="patients"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:20}}>
                <div><h2 style={{fontSize:18,fontWeight:800,color:"#0f172a",margin:0}}>Manage Patients</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>{patients.length} patients registered</div></div>
                <button onClick={()=>{setPtForm({...emptyPt,id:"P00"+(patients.length+1)});setPtModal("add");}} style={{background:"linear-gradient(120deg,#0d4f4f,#14b8a6)",color:"white",border:"none",borderRadius:12,padding:"10px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ Add Patient</button>
              </div>
              <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:200,position:"relative"}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#94a3b8"}}>🔍</span><input placeholder="Search..." value={ptSearch} onChange={e=>setPtSearch(e.target.value)} style={{width:"100%",padding:"10px 12px 10px 38px",borderRadius:12,border:"1.5px solid #e2e8f0",fontSize:13,outline:"none",background:"white",boxSizing:"border-box"}}/></div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["All","Active","Critical","New"].map(s=>(<button key={s} onClick={()=>setPtFilter(s)} style={{padding:"8px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:ptFilter===s?"#0d4f4f":"#f1f5f9",color:ptFilter===s?"white":"#64748b",transition:"all 0.2s"}}>{s}</button>))}</div>
              </div>
              <div style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                <div className="pt-hdr" style={{display:"grid",background:"#f1f5f9",padding:"12px 20px",fontSize:11,fontWeight:800,color:"#64748b",textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid #e2e8f0"}}><span>Patient</span><span>Age</span><span>Blood</span><span>Condition</span><span>Doctor</span><span>Status</span><span>Actions</span></div>
                {filtPts.length===0&&<div style={{padding:40,textAlign:"center",color:"#94a3b8",fontSize:14}}>No patients found.</div>}
                {filtPts.map((p,i)=>(<div key={p.id} className="pt-row" style={{display:"grid",padding:"12px 20px",alignItems:"center",borderBottom:i<filtPts.length-1?"1px solid #f1f5f9":"none"}}><div style={{display:"flex",alignItems:"center",gap:10}}><img src={p.avatar} alt={p.name} style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/><div><div style={{fontWeight:700,fontSize:13,color:"#0f172a"}}>{p.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>#{p.id}</div></div></div><div style={{fontSize:13,color:"#475569"}}>{p.age}</div><div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{p.blood}</div><div style={{fontSize:12,color:"#475569"}}>{p.condition}</div><div style={{fontSize:12,color:"#64748b"}}>{p.doctor}</div><div><Badge s={p.status}/></div><div style={{display:"flex",gap:5}}><button onClick={()=>setPtView(p)} style={{padding:"5px 9px",borderRadius:7,border:"none",background:"#f0fdfb",color:"#0d4f4f",fontWeight:700,fontSize:11,cursor:"pointer"}}>👁</button><button onClick={()=>{setPtForm({...p});setPtModal("edit");}} style={{padding:"5px 9px",borderRadius:7,border:"none",background:"#dbeafe",color:"#1d4ed8",fontWeight:700,fontSize:11,cursor:"pointer"}}>✏️</button><button onClick={()=>setDeleteConfirm({type:"patient",id:p.id,name:p.name})} style={{padding:"5px 9px",borderRadius:7,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:11,cursor:"pointer"}}>🗑️</button></div></div>))}
              </div>
              {ptView&&(<Modal title="Patient Profile" onClose={()=>setPtView(null)} maxWidth={420}><div style={{textAlign:"center",marginBottom:20}}><img src={ptView.avatar} alt={ptView.name} style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"3px solid #e2e8f0",marginBottom:10}}/><div style={{fontWeight:800,fontSize:17,color:"#0f172a"}}>{ptView.name}</div><div style={{fontSize:13,color:"#64748b",marginBottom:8}}>ID: {ptView.id}</div><Badge s={ptView.status}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 20px"}}>{[["Age",ptView.age+" yrs"],["Gender",ptView.gender],["Blood",ptView.blood],["Condition",ptView.condition],["Doctor",ptView.doctor],["Last Visit",ptView.lastVisit],["Email",ptView.email],["Phone",ptView.phone]].map(([l,v])=>(<div key={l} style={{borderBottom:"1px solid #f1f5f9",paddingBottom:8}}><div style={{fontSize:10,color:"#94a3b8",marginBottom:2}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{v}</div></div>))}</div><div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>{setPtView(null);setPtForm({...ptView});setPtModal("edit");}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#0d4f4f",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>✏️ Edit</button><button onClick={()=>{setPtView(null);setDeleteConfirm({type:"patient",id:ptView.id,name:ptView.name});}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#fee2e2",color:"#dc2626",fontWeight:700,fontSize:13,cursor:"pointer"}}>🗑️ Delete</button></div></Modal>)}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media(min-width:769px){.adm-sidebar{position:sticky !important;top:0 !important;height:100vh !important;transform:translateX(0) !important;}.hamburger-adm{display:none !important;}.sidebar-close{display:none !important;}.adm-body{padding:22px 28px !important;}.stat4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}.chart3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}.pie3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;}.dr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}.pt-hdr,.pt-row{grid-template-columns:2fr 50px 60px 1fr 1fr 100px 110px !important;}.contact-grid{grid-template-columns:1fr 1fr !important;}}
        @media(max-width:1024px) and (min-width:769px){.chart3{grid-template-columns:1fr 1fr;}.pie3{grid-template-columns:1fr 1fr;}.dr-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:768px){.hamburger-adm{display:block !important;}.adm-main{width:100vw;}.stat4{display:grid;grid-template-columns:1fr 1fr;gap:12px;}.chart3,.pie3,.two-col{display:flex;flex-direction:column;gap:14px;}.dr-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}.pt-hdr{display:none !important;}.pt-row{grid-template-columns:1fr auto !important;}.pt-row>:nth-child(2),.pt-row>:nth-child(3),.pt-row>:nth-child(4),.pt-row>:nth-child(5){display:none;}.contact-grid{grid-template-columns:1fr !important;}}
        @media(max-width:480px){.dr-grid{grid-template-columns:1fr;}}
        div::-webkit-scrollbar{width:4px;height:4px;}div::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}select,input,textarea{font-family:inherit;}
      `}</style>
    </div>
  );
}