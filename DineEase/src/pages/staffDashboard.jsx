import { useNavigate } from "react-router-dom";

const StaffDashboard=()=>{
    const navigate=useNavigate();

    const handleLogout=()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    }

    return(
        <>
        <h1>Staff Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </>
    )
}
export default StaffDashboard;