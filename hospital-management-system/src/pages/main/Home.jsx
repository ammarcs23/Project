import React from "react";
import NavbarMain from "../../components/Navbar/NavbarMain"; // path adjust kiya
import Footer from "../../components/Footer";

function Home() {
  return (
    <div className="home">
      <NavbarMain />
      <div className="home-content">
        <h1>Welcome to Home Page</h1>
        <p>This is your main homepage content.</p>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
