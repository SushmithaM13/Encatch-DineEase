import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import "./customerLogin.css";
import { createCustomer } from "../api/customerLoginAPI";
import { useSession } from "../../context/SessionContext";
import { checkTableStatus, reserveTable } from "../api/customerTableAPI";
import { updateCustomerDetails } from "../api/customerProfileAPI";

const CustomerLogin = () => {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(true);        // checking + reserving table
  const [isLoading, setIsLoading] = useState(false);   // continue button loading

  const effectRan = useRef(false); // prevent double effects from StrictMode

  const navigate = useNavigate();
  const location = useLocation();

  const { login, loginAsGuest } = useContext(AuthContext);
  const { setOrgId, setTableId, setSessionId, sessionId } = useSession();

  // Extract URL params
  const params = new URLSearchParams(location.search);
  const org = params.get("organization");
  const table = params.get("table");

  /* -----------------------------------------------------
     CHECK TABLE STATUS + AUTO RESERVE
  ----------------------------------------------------- */
  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    if (!org || !table) {
      toast.error("Invalid table QR");
      return;
    }

    setOrgId(org);
    setTableId(table);

    const verifyTable = async () => {
      try {
        const isAvailable = await checkTableStatus(org, table);

        if (isAvailable) {
          // Reserve table → backend creates row
          const reserveRes = await reserveTable(org, table);
          setSessionId(reserveRes.sessionId);
        } else {
          // Table already in use → ask for sessionId
          navigate("/enterSessionId", {
            state: { orgId: org, tableId: table }
          });
        }

        setLoading(false);
      } catch (err) {
        toast.error("Server error while checking table", err);
        setLoading(false);
      }
    };

    verifyTable();
  }, []);

  /* -----------------------------------------------------
     PREVENT BACK BUTTON NAVIGATION
  ----------------------------------------------------- */
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);

    const handleBack = () => {
      if (window.location.pathname !== "/customerLogin") {
        window.location.replace("/customerLogin");
      }
    };

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  /* -----------------------------------------------------
     CUSTOMER LOGIN → OTP PAGE
  ----------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name,
      email: identifier.includes("@") ? identifier : null,
      phoneNumber: !identifier.includes("@") ? identifier : null,
      organizationId: org,
      tableNumber: table
    };

    const { ok, data } = await createCustomer(payload);

    if (ok) {
      login(data); // store user in AuthContext

      navigate("/otpVerification", {
        state: { identifier, orgId: org, tableId: table }
      });
    } else {
      toast.error(data?.message || "Failed to create customer");
    }

    setIsLoading(false);
  };

  /* -----------------------------------------------------
     GUEST LOGIN (no OTP)
  ----------------------------------------------------- */
  const handleSkipLogin = async () => {
    loginAsGuest();

    try {
      await updateCustomerDetails({
        sessionId,
        organizationId: org,
        tableNumber: table,
        customerId: null,
        reservedTableSource: "GUEST"
      });

      console.log("Guest details updated");
    } catch (err) {
      console.error("Guest update failed", err);
    }

    navigate("/customerDashboard");
  };

  /* -----------------------------------------------------
     SHOW LOADING WHILE RESERVING TABLE
  ----------------------------------------------------- */
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px", fontSize: "22px" }}>
        Checking table availability...
      </div>
    );
  }

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

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Sending OTP…" : "Continue →" }
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
