import React from "react";
import { Routes, Route } from "react-router-dom";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Home from "./pages/main/Home";
import Signup1 from "./pages/signin/Signup1";  // <-- Signup import

function App() {
  return (
    <Routes>
      <Route path="/homepage" element={<Home />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/signin" element={<Signup1 />} />
       {/* Signup route */}
    </Routes>
  );
}

export default App;
