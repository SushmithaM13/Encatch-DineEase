import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth/styles/login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                "https://dineease-9ad58-default-rtdb.asia-southeast1.firebasedatabase.app/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                }
            );
            const data = await response.json();

            if (response.ok) {
                // Save token & role in localstorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);

                // handel remember password
                if (remember) {
                    localStorage.setItem("rememberEmail", email);
                } else {
                    localStorage.removeItem("rememberEmail");
                }

                // Redirect based on role
                if (data.role === "superadmin") {
                    navigate("/superAdminDashboard");
                } else if (data.role === "admin") {
                    navigate("/adminDashboard");
                } else if (data.role === "staff") {
                    navigate("/staffDashboard");
                }
            } else {
                setEmail(data.message || "Invalid credentials");
            }
        } catch (err) {
            setError("Server error, Please try again later", err);
        }
    };

    return (
        <div className="auth-container">
            {/* Left Section */}
            <div className="auth-container-left">
  <div className="auth-overlay-text">
    <h2>Welcome Back to Flavorful Moments</h2>
    <p>Where every login takes you closer to great food and great service.</p>
  </div>
</div>

            {/* Right Section */}
            <div className="auth-container-right">
                <form onSubmit={handleLogin} className="auth-form">
                    <h2 className="login-title">Login</h2>
                    {error && <p className="error-text">{error}</p>}

                    <input 
                        type="text"
                        name="email"
                        placeholder="Email address"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        <Link to="/forgotPassword" className="forgot-password-link">Forgot password?</Link>
                    </div>

                    <button type="submit" className="login-btn">Login</button>

                    <p className="auth-footer">
                        Not a member? <Link to="/signUp">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};
export default Login;
