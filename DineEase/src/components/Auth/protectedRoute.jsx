import { Navigate } from "react-router-dom";

const ProtectedRoute=({children, allowedRoles})=>{
    const token=localStorage.getItem("token");
    const role=localStorage.getItem("role");

    // Not logged in → go back to login
    if(!token){
        return <Navigate to="/" replace/>;
    }

    // Logged in but role not allowed → go back to login
    if(allowedRoles && !allowedRoles.includes(role)){
        return <Navigate to="/" replace/>;
    }

    // Allowed → show the page
    return children;
}
export default ProtectedRoute;