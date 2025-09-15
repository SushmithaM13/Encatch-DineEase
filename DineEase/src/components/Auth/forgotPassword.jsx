import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSendOtp=async(e)=>{
    e.preventDefault();
    setMessage("");

    try {
        const response=await fetch("url",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body : JSON.stringify({email}),
        });
        const data=await response.json();
        if(response.ok){
            setMessage("OTP sent to your email!");
            // Redirect to reset page with email in state
            navigate("/resetPassword", {state: {email}});
        }else{
            setMessage(data.message || "Invalid email address");
        }
    } catch (err) {
      setMessage("Server error, please try again later.", err)  
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-container-right">
        <form onSubmit={handleSendOtp} className="auth-form">
          <h2>Forgot Password</h2>
          {message && <p>{message}</p>}

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Send OTP</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
