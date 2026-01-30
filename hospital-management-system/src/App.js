import logo from "./logo.svg";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import File_Upload from "./components/File_Upload";
function App() {
  return (
    <>
      <Navbar />
      <File_Upload/>
      <Footer/>
    </>
  );
}
export default App;
