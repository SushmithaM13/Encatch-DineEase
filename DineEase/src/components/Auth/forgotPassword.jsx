import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/forgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Show instant feedback
    toast.info("Sending OTP...");

    try {
      const response = await fetch(
        `http://localhost:8082/dine-ease/api/v1/users/forgot-password?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: { accept: "application/json" },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP sent to your registered email.");
        // toast.success(data.message || "OTP sent to your registered email.");
        // Navigate after short delay so user can see toast
        setTimeout(() => {
          navigate("/resetPassword", { state: { email } });
        }, 1500);
      } else {
        toast.error(data.message || "Invalid email address");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-container-box">
        <form onSubmit={handleSendOtp} className="forgotpassword-form">
          <h2>Forgot Password</h2>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        {/* Toast container to show popup messages */}
        <ToastContainer position="top-center" autoClose={2000} />
      </div>
    </div>
  );
};

export default ForgotPassword;
