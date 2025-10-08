import { useNavigate } from "react-router-dom";
import Footer from "../components/footer/Footer";

const AdminDashboard=()=>{
    const navigate=useNavigate();

    const handleLogout=()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    }

    return(
        <>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        <Footer/>
        </>
    )
}
export default AdminDashboard;