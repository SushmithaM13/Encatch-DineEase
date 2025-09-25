import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth/styles/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
        // Save token & role
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // Save waiter name if role is WAITER
        if (data.role === "WAITER" && data.name) {
          localStorage.setItem("waiterName", data.name);
        }

        // Remember email
        if (remember) {
          localStorage.setItem("rememberEmail", username);
        } else {
          localStorage.removeItem("rememberEmail");
        }

        setSuccess("Login successful! Redirecting...");

        setTimeout(() => {
          switch (data.role) {
            case "SUPER_ADMIN":
              navigate("/superAdminDashboard");
              break;
            case "ADMIN":
              navigate("/AdminDashboard");
              break;
            case "WAITER":
              navigate("/WaiterDashboard");
              console.log("login as waiter");
              break;
            default:
              navigate("/");
          }
        }, 1500);

      } else {
        const msg = data.message?.toLowerCase() || "";
        if (msg.includes("not found")) {
          setError("User not found. Please register first.");
        } else if (msg.includes("invalid password")) {
          setError("Please enter the correct password.");
        } else if (msg.includes("verify")) {
          setError("Please verify your email before login.");
        } else {
          setError(data.message || "Invalid credentials. Please try again.");
        }
      }
    } catch (err) {
      setError("Server error. Please try again later.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-container-left"></div>

      <div className="auth-container-right">
        <form onSubmit={handleLogin} className="auth-form">
          <h2 className="login-title">Login</h2>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          <input
            type="text"
            placeholder="Email address"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
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
