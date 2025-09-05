import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword=()=>{
    const {token}=useParams(); //get token from url
    const navigate=useNavigate();

    const [password, setPassword]=useState("");
    const [confirmPassword, setConfirmPassword]=useState("");
    const [message, setMessage]=useState("");

    const handleResetPassword=async(e)=>{
        e.preventDefault();

        if(password !== confirmPassword){
            setMessage("Password do not match!");
            return;
        }

        try {
            const response=await fetch(`url/${token}`,{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({password}),
            });
            const data=await response.json();
            if(response.ok){
                setMessage("Password reset successful! Redirecting to login...");
                setTimeout(()=>navigate("/"), 2000); // redirect to login
            }else{
                setMessage(data.message || "Something went wrong.");
            }
        } catch (err) {
           setMessage("Server error, Please try again.", err) 
        }
    };

    return(
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleResetPassword} className="bg-white p-6 rounded-lg shadow-md w-80">
                <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>
                <input type="password" placeholder="New Password" className="border w-full p-2 mb-3 rounded" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
                <input type="password" placeholder="Confirm New Password" className="border w-full p-2 mb-3 rounded" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required/>
                <button type="submit" className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700">Reset Password</button>
                {message && <p className="text-green-600 mt-3">{message}</p>}
            </form>
        </div>
    )
}
export default ResetPassword;