import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // API: Verify OTP
  const handleVerifyOtp=async()=>{
    setMessage("");
    try {
        const response=await fetch("url",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, otp}),
        });
        const data=await response.json();

        if(response.ok){
            setOtpVerified(true);
            setMessage("OTP verified! You can now reset your password.");
        }else{
            setMessage(data.message || "Invalid OTP");
        }
    } catch (err) {
       setMessage("Server error, please try again later.", err) 
    }
  };

  // API: Reset Password
  const handleResetPassword=async(e)=>{
    e.preventDefault();
    setMessage("");

    if(newPassword !== confirmPassword){
        setMessage("Password do not match");
        return;
    }

    try {
        const response=await fetch("",{
            method: "POST",
            headers :{"Content-Type": "application/json"},
            body: JSON.stringify({email, otp, newPassword}),
        });

        const data=await response.json();
        if(response.ok){
            setMessage("Password reset successful!");
            setTimeout(()=>navigate("/login"), 1500);
        }else{
            setMessage(data.message || "Failed to reset password");
        }
    } catch (err) {
       setMessage("Server error, please try again later.",err) 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-container-right">
        <form onSubmit={handleResetPassword} className="auth-form">
          <h2>Reset Password</h2>
          {message && <p>{message}</p>}

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="button" onClick={handleVerifyOtp}>
            Verify OTP
          </button>

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={!otpVerified}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!otpVerified}
            required
          />

          <button type="submit" disabled={!otpVerified}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
