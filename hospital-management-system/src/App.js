import React from "react";
import NavbarMain from "./components/Navbar/NavbarMain";

function App() {
  return (
    <div>
      <NavbarMain />
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>Welcome to Hospital Management System</h1>
        <p>Start managing patients, doctors, and appointments easily!</p>
      </div>
    </div>
  );
}

export default App;