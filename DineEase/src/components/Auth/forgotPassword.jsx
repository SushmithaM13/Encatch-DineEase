import { useState } from "react";

const ForgotPassword=()=>{
    const [email, setEmail]=useState("");
    const [message, setMessage]=useState("");

    const handleForgotPassword=async(e)=>{
        e.preventDefault();
        try {
            const response=await fetch("url", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            });
            const data=await response.json();
            if(response.ok){
                setMessage("Password reset link has beeen set to your email.");
            }else{
                setMessage(data.message || "Something went wrong");
            }
        } catch (err) {
            setMessage("Server error, Please try agian later.", err)
        }
    };

    return(
        <div>
            <form onSubmit={handleForgotPassword} className="reset-form">
                <h2 className="reset-title">Forgot Password</h2>
                <input type="email" placeholder="Enter your email" className="reset-input" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                <button type="submit" className="reset-btn">Send Reset Link</button>
                {message && <p className="reset-message">{message}</p>}
            </form>
        </div>
    )
}
export default ForgotPassword;