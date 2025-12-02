import { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { verifyOtp, resendOtp } from "../api/customerLoginAPI";
import { updateCustomerDetails } from "../api/customerProfileAPI";
import { toast } from "react-toastify";
import "./otpVerification.css";
import { useSession } from "../../context/SessionContext";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(59);

  const inputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);
  const { sessionId, tableId } = useSession();

  const { identifier, orgId} = location.state || {};

  // Auto focus + countdown timer
  useEffect(() => {
    inputRef.current?.focus();

    if (timer === 0) return;
    const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(countdown);
  }, [timer]);

  // OTP Verification Handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
     try {
      const { ok, data } = await verifyOtp(identifier, otp);

      if (ok) {
        toast.success(data.message || "OTP verified successfully!");

        login(data); // Save customer data in AuthContext
        console.log("Customer logged in:", data);
        console.log("OTP Response = ", data);
console.log("Customer ID = ", data?.id);


        // UPDATE CUSTOMER DETAILS
        await updateCustomerDetails({
  sessionId,
  organizationId: orgId,
  tableNumber: tableId,    // clean fix
  customerId: data?.id,
  reservedTableSource: "CUSTOMER"
});
        console.log("Customer details updated");
        setTimeout(() => {
          navigate("/customerDashboard");
        }, 1200);
      } else {
        toast.error(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Server error. Please try again later.");
      console.error(err);
    }
  };

  //  RESEND OTP Handler
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const { ok } = await resendOtp(identifier);

      if (ok) {
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
