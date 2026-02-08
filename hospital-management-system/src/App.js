import logo from "./logo.svg";
import "./App.css";
import Footer from "./components/Footer";
import NavbarMain from "./components/Navbar/NavbarMain.jsx"
import File_Upload from "./components/File_Upload";
function App() {
  return (
    <>
       <NavbarMain/> 
       <File_Upload/> 
       <Footer/> 
    </>
  );
}
export default App;
