import { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import "./customerLogin.css";
import { useCustomer } from "../../context/CustomerContext";

const CustomerLogin = () => {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { setOrgId, setTableId }= useCustomer();
  const { login, loginAsGuest } = useContext(AuthContext);

  // 🧠 Extract params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const org = params.get("organization");
    const table = params.get("table");

    if (org && table) {
      setOrgId(org);
      setTableId(table);
      console.log("✅ Stored in Context:", { org, table });
    } else {
      console.warn("⚠️ Missing organization or table info in URL");
    }
  }, [location.search, setOrgId, setTableId]);

  // 🚫 Prevent forward navigation from login page
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    const handlePop = () => {
      if (window.location.pathname !== "/customerLogin") {
        window.location.replace("/customerLogin");
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const BASE_URL = "http://localhost:8082/dine-ease/api/v1/customers";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !identifier.trim()) {
      toast.error("Please enter your name and contact.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: identifier.includes("@") ? identifier : null,
          phoneNumber: identifier.includes("@") ? null : identifier,
          tableNumber: localStorage.getItem("tableId"),
          organizationId: localStorage.getItem("orgId"),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("OTP sent! Please verify.");
        login({
          name,
          email: identifier.includes("@") ? identifier : "",
          phone: !identifier.includes("@") ? identifier : "",
        });

        // ✅ Navigate with query params
        // navigate(`/otpVerification?table=${tableId}&organization=${orgId}`, {
        //   state: { identifier, tableId, orgId },
        // });
        navigate("/otpVerification");
      } else {
        toast.error(data.message || "Login failed. Try again.");
      }
    } catch {
      toast.error("Server error. Please try later.");
    }
  };

  const handleSkipLogin = () => {
    loginAsGuest();
    navigate("/customerDashboard");
    // navigate(`/customerDashboard?table=${tableId}&organization=${orgId}`);
  };

  return (
    <div className="restaurant-auth-bg">
      <div className="restaurant-auth-main">
        <div className="restaurant-auth-left">
          <div className="restaurant-welcome-card">
            <img
              src="https://img.icons8.com/color/96/000000/restaurant-table.png"
              alt="Table Icon"
              className="welcome-icon"
            />
            <h1 className="welcome-heading">Welcome to DineEase!</h1>
            <p className="welcome-desc">
              Scan, order, and relax.
              <br />
              Your table experience begins here.
              <br />
              To order, please login or continue as guest.
            </p>
          </div>
        </div>

        <div className="restaurant-auth-right">
          <form onSubmit={handleSubmit} className="login-card" autoComplete="off">
            <h2 className="login-title">🍽️ Table Login</h2>

            <div className="input-wrap">
              <span className="input-icon">👤</span>
              <input
                type="text"
                className="login-input"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-wrap">
              <span className="input-icon">📱</span>
              <input
                type="text"
                className="login-input"
                placeholder="Email or Phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn">
              Continue →
            </button>

            <div className="alt-login">
              <div className="divider">
                <span>or</span>
              </div>
              <button type="button" className="skip-btn" onClick={handleSkipLogin}>
                🥗 Continue as Guest
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
