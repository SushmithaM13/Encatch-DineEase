import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Auth/styles/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  // Pre-fill username if "remember me" was checked
  useEffect(() => {
    const remembered = localStorage.getItem("rememberEmail");
    if (remembered) setUsername(remembered);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

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

        // Remember email if checkbox is ticked
        if (remember) {
          localStorage.setItem("rememberEmail", username);
        } else {
          localStorage.removeItem("rememberEmail");
        }

        toast.success("Login successful! Redirecting...");

        // Redirect based on role after 1.5s
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
              console.log("Logged in as Waiter");
              break;
            default:
              navigate("/");
          }
        }, 1500);
      } else {
        // Handle backend error messages
        let errorMsg = "Invalid credentials. Please try again.";
        if (data.message?.toLowerCase().includes("not found")) {
          errorMsg = "User not found. Please register first.";
        } else if (data.message?.toLowerCase().includes("invalid password")) {
          errorMsg = "Please enter the correct password.";
        } else if (data.message?.toLowerCase().includes("verify")) {
          errorMsg = "Please verify your email before login.";
        }

        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-container-left"></div>

      <div className="auth-container-right">
        <form onSubmit={handleLogin} className="auth-form">
          <h2 className="login-title">Login</h2>

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

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default Login;
