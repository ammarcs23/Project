import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

const NavbarMain = () => {
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#">AI Hospital</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#">Home</Nav.Link>
            <Nav.Link href="#">Services</Nav.Link>
            <Nav.Link href="#">Doctors</Nav.Link>
            <Nav.Link href="#">Contact Us</Nav.Link>
          </Nav>
          <div>
            <Button variant="light" className="me-2">Login</Button>
            <Button variant="success">Sign Up</Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarMain;