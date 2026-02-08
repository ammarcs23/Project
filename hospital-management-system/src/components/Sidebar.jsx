import "./Sidebar.css";
import logo from "./logo.svg";
import {
  AiFillHome,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlinePlus,
  AiOutlineSetting,
  AiOutlineLink,
  AiOutlineDashboard,
  AiOutlineShopping,
  AiOutlineUser,
  AiOutlineMail,
  AiOutlinePicture,
  AiOutlineCluster,
  AiOutlineDatabase,
  AiOutlineNumber,
  AiOutlineDown,
} from "react-icons/ai";

// Left sidebar icons
const leftTopItems = [<AiFillHome />, <AiOutlineHeart />, <AiOutlineMessage />, <AiOutlinePlus />];
const leftBottomItems = [<AiOutlineSetting />, <AiOutlineLink />];

// Navigation items
const navItems = [
  { icon: <AiOutlineDashboard />, label: "Dashboard" },
  { icon: <AiOutlineShopping />, label: "Products" },
  { icon: <AiOutlineUser />, label: "Customers" },
  {
    icon: <AiOutlineMail />,
    label: "Messages",
    actionIcon: <AiOutlinePlus />,
    submenu: [
      { label: "Drafts", count: 10 },
      { label: "Scheduled", count: 4 },
      { label: "Published", count: 20 },
    ],
  },
  { icon: <AiOutlinePicture />, label: "Images" },
  { icon: <AiOutlineCluster />, label: "Network" },
  { icon: <AiOutlineDatabase />, label: "Inventory" },
  { icon: <AiOutlineNumber />, label: "Hashtags" },
];

// Icon button component
const IconButton = ({ icon }) => (
  <button style={{ fontSize: "22px" }}>{icon}</button>
);

// Left sidebar
const LeftSidebar = () => (
  <div className="left">
    <img src={logo} alt="Logo" />

    {leftTopItems.map((icon, index) => (
      <IconButton key={index} icon={icon} />
    ))}

    <div>
      {leftBottomItems.map((icon, index) => (
        <IconButton key={index} icon={icon} />
      ))}
    </div>
  </div>
);

// Sidebar header
const SidebarHeader = () => (
  <div className="header">
    <div>
      <h2>AI-Based Hospital Management System</h2>
      <h3>Supervised By Mr. Muhammad Waseem</h3>
    </div>
    <AiOutlineDown />
  </div>
);

// Submenu
const Submenu = ({ items }) => (
  <ul className="submenu">
    {items.map((item) => (
      <li key={item.label}>
        {item.label}
        <span className="badge">{item.count}</span>
      </li>
    ))}
  </ul>
);

// Navigation item
const NavItem = ({ item }) => (
  <>
    <button>
      {item.icon}
      <span>{item.label}</span>
      {item.actionIcon && item.actionIcon}
    </button>

    {item.submenu && <Submenu items={item.submenu} />}
  </>
);

// Navigation menu
const Navigation = () => (
  <nav>
    {navItems.map((item) => (
      <NavItem key={item.label} item={item} />
    ))}
  </nav>
);

// Right sidebar
const RightSidebar = () => (
  <div className="right">
    <div className="right-inner">
      <SidebarHeader />
      <Navigation />
    </div>
  </div>
);

// Main Sidebar component
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
