import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth/styles/login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");  // Success message
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
                // Save token & role in localstorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);

                // handle remember password
                if (remember) {
                    localStorage.setItem("rememberEmail", username);
                } else {
                    localStorage.removeItem("rememberEmail");
                }

                // Show success message
                setSuccess("Login successful! Redirecting...");

                // Redirect based on role after 1.5s
                setTimeout(() => {
                    if (data.role === "SUPER_ADMIN") {
                        navigate("/superAdminDashboard");
                    } else if (data.role === "ADMIN") {
                        navigate("/adminDashboard");
                    } else if (data.role === "STAFF") {
                        navigate("/staffDashboard");
                    } else {
                        navigate("/"); // fallback
                    }
                }, 1500);

            } else {
                // Handle backend error messages
                if (data.message?.toLowerCase().includes("not found")) {
                    setError("User not found. Please register first.");
                } else if (data.message?.toLowerCase().includes("invalid password")) {
                    setError("Please enter the correct password.");
                } else if (data.message?.toLowerCase().includes("verify")) {
                    setError("Please verify your email before login.");
                } else {
                    setError(data.message || "Invalid credentials. Please try again.");
                }
            }
        } catch (err) {
            setError("Server error, Please try again later",err);
        }
    };

    return (
        <div className="auth-container">
            {/* Left Section */}
            <div className="auth-container-left"></div>

            {/* Right Section */}
            <div className="auth-container-right">
                <form onSubmit={handleLogin} className="auth-form">
                    <h2 className="login-title">Login</h2>

                    {/* Show error & success messages outside inputs */}
                    {error && <p className="error-text">{error}</p>}
                    {success && <p className="success-text">{success}</p>}

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
