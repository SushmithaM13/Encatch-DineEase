import { useNavigate } from "react-router-dom";

const SuperAdminDashboard=()=>{
    const navigate=useNavigate();

    const handleLogout=()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    }

    return(
        <>
        <h1>Super Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </>
    )
}
export default SuperAdminDashboard;