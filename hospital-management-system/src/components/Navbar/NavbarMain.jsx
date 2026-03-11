import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import styles from "./NavbarMain.module.css";

const NavbarMain = () => {
  return (
    <Navbar expand="lg" className={styles.navbarCustom} variant="dark">
      <Container>
        <Navbar.Brand href="#">HospitalMS</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#" className={styles.navLink}>Home</Nav.Link>
            <Nav.Link href="#" className={styles.navLink}>Patients</Nav.Link>
            <Nav.Link href="#" className={styles.navLink}>Doctors</Nav.Link>
            <Nav.Link href="#" className={styles.navLink}>Appointments</Nav.Link>
          </Nav>
          <div>
            <Button className={`${styles.btnLogin} me-2`}>Login</Button>
            <Button className={styles.btnSignup}>Sign Up</Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarMain;