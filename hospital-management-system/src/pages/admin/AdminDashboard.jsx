import React from "react";
import Sidebar from "../../components/Sidebar";  // Sidebar component import
import Footer from "../../components/Footer";

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <Sidebar />  {Sidebar component */}
      <div className="dashboard-content">
        <h1>Admin Dashboard</h1>
        {Yahan admin dashboard ka main content */}
        <Footer />
      </div>
    </div>
  );
}

export default AdminDashboard;
