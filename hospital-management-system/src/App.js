import logo from "./logo.svg";
import "./App.css";
import Footer from "./components/Footer";
import NavbarMain from "./components/Navbar/NavbarMain";
import File_Upload from "./components/File_Upload";
import AdminDashboard from "./pages/admin/AdminDashboard";


function App() {
  return (
    <> 
       {/* Admin Dashboard show karna */}
       <AdminDashboard />  
      
    </>
  );
}

export default App;
