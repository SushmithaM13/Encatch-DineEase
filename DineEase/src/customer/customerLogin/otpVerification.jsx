import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "./otpVerification.css";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(59);

  const inputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const { identifier, tableId, orgId } = location.state || {};
  const BASE_URL = "http://localhost:8082/dine-ease/api/v1/customers";

  useEffect(() => {
    inputRef.current?.focus();

    if (timer === 0) return;
    const countdown = setTimeout(() => setTimer(timer - 1), 1000);

    return () => clearTimeout(countdown);
  }, [timer]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/verify-otp?identifier=${encodeURIComponent(identifier)}&otp=${otp}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();

      if (response.ok) {
    toast.success(data.message || "OTP verified successfully!");
    login(data); // store customer data (no longer need to write to localStorage manually)
    setTimeout(() => {
      navigate(`/customerDashboard?table=${tableId}&organization=${orgId}`);
    }, 1200);
  } else {
        toast.error(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Server error. Please try again later.");
      console.error(err);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response = await fetch(
        `${BASE_URL}/resend-otp?identifier=${encodeURIComponent(identifier)}`,
        { method: "POST" }
      );
      if (response.ok) {
        toast.success("OTP resent! Please check your email or phone.");
        setTimer(59);
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Server error. Please try again later.");
      console.error(err);
    }
    setIsResending(false);
  };

  return (
    <div className="otp-auth-container">
      <form onSubmit={handleVerifyOtp} className="otp-form">
        <h2 className="otp-title">
          OTP Verification
          <span className="title-underline" />
        </h2>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          className={`otp-input ${otp.length === 6 ? "valid" : "invalid"}`}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/, ""))}
          required
          aria-label="6 digit OTP"
        />
        {otp.length > 0 && otp.length < 6 && (
          <p className="otp-validation-msg">OTP must be 6 digits</p>
        )}
        <button type="submit" className="otp-btn" disabled={otp.length !== 6}>
          Verify OTP
        </button>

        <div className="resend-section">
          <p className="timer">
            Resend available in: {timer > 0 ? `${timer}s` : "Now"}
          </p>
          <button
            type="button"
            onClick={handleResendOtp}
            className="resend-btn"
            disabled={timer > 0 || isResending}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerification;
