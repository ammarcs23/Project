import "./Sidebar.css";
import logo from "./logo.svg";

import {
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineTeam,
  AiOutlineSafetyCertificate,
  AiOutlineDown
} from "react-icons/ai";


// LEFT SIDEBAR ICONS
const leftTopItems = [
  { icon: <AiOutlineHome />, label: "Home" },
  { icon: <AiOutlineUser />, label: "Doctor" },
  { icon: <AiOutlineTeam />, label: "Patient" },
  { icon: <AiOutlineSafetyCertificate />, label: "Admin" }
];


// NAVIGATION ITEMS (RIGHT SIDE)
const navItems = [
  { icon: <AiOutlineHome />, label: "Dashboard" },
  { icon: <AiOutlineUser />, label: "Doctors" },
  { icon: <AiOutlineTeam />, label: "Patients" },
  { icon: <AiOutlineSafetyCertificate />, label: "Admin Panel" }
];


// ICON BUTTON
const IconButton = ({ icon, label }) => (
  <button title={label}>
    {icon}
  </button>
);


// LEFT SIDEBAR
const LeftSidebar = () => (
  <div className="left">

    <img src={logo} alt="Logo" />

    {leftTopItems.map((item, index) => (
      <IconButton
        key={index}
        icon={item.icon}
        label={item.label}
      />
    ))}

  </div>
);


// HEADER
const SidebarHeader = () => (
  <div className="header">

    <div>
      <h2>AI-Based Hospital System</h2>
      <h3>Supervised by Mr.Muhammad Waseem</h3>
      <h3>Admin Dashboard</h3>
    </div>

    <AiOutlineDown />

  </div>
);


// NAVIGATION BUTTON
const NavItem = ({ item }) => (
  <button>
    {item.icon}
    <span>{item.label}</span>
  </button>
);


// NAVIGATION
const Navigation = () => (
  <nav>
    {navItems.map((item) => (
      <NavItem key={item.label} item={item} />
    ))}
  </nav>
);


// RIGHT SIDEBAR
const RightSidebar = () => (
  <div className="right">

    <div className="right-inner">

      <SidebarHeader />

      <Navigation />

    </div>

  </div>
);


// MAIN SIDEBAR
export const Sidebar = () => {
  return (
    <section className="page sidebar-page">

      <aside className="sidebar">

        <LeftSidebar />

        <RightSidebar />

      </aside>

    </section>
  );
};

export default Sidebar;