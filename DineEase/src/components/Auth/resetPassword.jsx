import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/forgotPassword.css";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Verify OTP (Temporary password)
  const handleVerifyOtp=async()=>{
    if(!otp) return toast.error("Please enter OTP");

    setLoading(true);   
    try {
        const response=await fetch("http://localhost:8082/dine-ease/api/v1/users/verify-temp-password",
          {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, tempPassword: otp}),
        });
        const data=await response.json();

        if(response.ok && data.status==="SUCCESS"){
            setOtpVerified(true);
            toast.success(data.message || "OTP verified! You can now reset your password.");
        }else{
            toast.error(data.message || "Invalid OTP");
        }
    } catch (err) {
      console.log(err);
       toast.error("Server error, please try again later.") 
    }finally{
      setLoading(false);
    }
  };

  // API: Reset Password
  const handleResetPassword=async(e)=>{
    e.preventDefault();

    if(newPassword !== confirmPassword){
        toast.error("Password do not match");
        return;
    }

    setLoading(true);
    try {
        const response=await fetch("http://localhost:8082/dine-ease/api/v1/users/reset-password",
          {
            method: "POST",
            headers :{"Content-Type": "application/json"},
            body: JSON.stringify({email, newPassword}),
        });

        const data=await response.json();
        if(response.ok && data.status==="SUCCESS"){
            toast.success(data.message || "Password reset successful!");
            setTimeout(()=>navigate("/"), 1500);
        }else{
            toast.error(data.message || "Failed to reset password");
        }
    } catch (err) {
      console.log(err);
       toast.error("Server error, please try again later.");
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-container-box">
        <form onSubmit={handleResetPassword} className="forgotpassword-form">
          <h2>Reset Password</h2>

           {/* OTP Section */}
          <div className="otp-section">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={otpVerified}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpVerified || loading}
            >
              {loading && !otpVerified
                ? "Verifying..."
                : otpVerified
                ? "Verified"
                : "Verify OTP"}
            </button>
          </div>

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

          <button type="submit" disabled={!otpVerified || loading}>
            {loading && otpVerified ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <ToastContainer position="top-center" autoClose={2000}/>
      </div>
    </div>
  );
};

export default ResetPassword;
