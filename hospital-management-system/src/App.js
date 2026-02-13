import React from "react";
import { Routes, Route } from "react-router-dom";

// Folder structure ke hisaab se imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import Home from "./pages/main/Home";

function App() {
  return (
    <>
      <Routes>
        <Route path="/homepage" element={<Home />} />               {/* Home page */}
        <Route path="/admindashboard" element={<AdminDashboard />} />  {/* Admin page */}
      </Routes>
    </>
  );
}

export default App;
