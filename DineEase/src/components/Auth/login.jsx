import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth/styles/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const [typedMessage, setTypedMessage] = useState(""); // for typing animation
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = localStorage.getItem("rememberEmail");
    if (remembered) setUsername(remembered);
  }, []);

  useEffect(() => {
    // typing effect
    if (messageType === "success" && message) {
      setTypedMessage("");
      let i = 0;
      const typing = setInterval(() => {
        if (i < message.length) {
          setTypedMessage((prev) => prev + message[i]);
          i++;
        } else {
          clearInterval(typing);
        }
      }, 50);
      return () => clearInterval(typing);
    } else {
      setTypedMessage(message);
    }
  }, [message, messageType]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setTypedMessage("");

    try {
      const response = await fetch(
        "http://localhost:8082/dine-ease/api/v1/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        if (remember) {
          localStorage.setItem("rememberEmail", username);
        } else {
          localStorage.removeItem("rememberEmail");
        }

        setMessageType("success");
        setMessage("✅ Login successful .....! ...");

        setTimeout(() => {
          if (data.role === "SUPER_ADMIN") navigate("/superAdminDashboard");
          else if (data.role === "ADMIN") navigate("/adminDashboard");
          else if (data.role === "STAFF") navigate("/staffDashboard");
          else navigate("/");
        }, 2000);
      } else {
        let errorMsg = "❌ Invalid credentials. Please try again.";
        if (data.message?.toLowerCase().includes("not found")) {
          errorMsg = "User not found. Please register first.";
        } else if (data.message?.toLowerCase().includes("invalid password")) {
          errorMsg = "Please enter the correct password.";
        } else if (data.message?.toLowerCase().includes("verify")) {
          errorMsg = "Please verify your email before login.";
        }

        setMessageType("error");
        setMessage(errorMsg);
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("❌ Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-container-left"></div>

      <div className="auth-container-right">
        <form onSubmit={handleLogin} className="auth-form">
          {/* ✅ Typing message above heading */}
          {typedMessage && (
            <p
              className={`login-message ${
                messageType === "success" ? "success" : "error"
              }`}
            >
              {typedMessage}
              <span className="cursor">|</span>
            </p>
          )}

          <h2 className="login-title">Login</h2>

          <input
            type="text"
            name="email"
            placeholder="Email address"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="auth-row">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                name="remember"
                className="checkbox-input"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgotPassword" className="forgot-password-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

          <p className="auth-footer">
            Not a member? <Link to="/SuperAdminRegistration">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
