import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";


import {
  LayoutDashboard,
  Utensils,
  ShoppingCart,
  Newspaper,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  Sofa,
} from "lucide-react";

import { FaBell, FaBars, FaTimes } from "react-icons/fa";
import { MdCurrencyRupee } from "react-icons/md";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import WaiterNotification from "../Notifications/WaiterNotification";

import "./WaiterDashboard.css";

export default function WaiterDashboard() {
  const [waiterName, setWaiterName] = useState("Waiter");
  const [profilePic, setProfilePic] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ordersExpanded, setOrdersExpanded] = useState(false);

  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [, setOrganizationId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationRef = useRef(null);



  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("sessionId");
  const tableNumber = searchParams.get("tableNumber");

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();



  const TOKEN = localStorage.getItem("token");
  const API_BASE = "http://localhost:8082/dine-ease/api/v1";
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";



  const isActive = (path) => location.pathname === path;


  useEffect(() => {
    if (!TOKEN) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();

        setWaiterName(data.firstName || "Waiter");
        if (data.profileImage) setProfilePic(`data:image/jpeg;base64,${data.profileImage}`);
        setOrganizationId(data.organizationId);
        sessionStorage.setItem("organizationId", data.organizationId);
      } catch (err) {
        console.error("Profile Error:", err);
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, [TOKEN]);



  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8082/dine-ease/api/v1/users/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Logout failed");

      localStorage.removeItem("token");
      sessionStorage.clear();
      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error("Logout Error:", err);
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    const needsTableContext =
      location.pathname.includes("/menu");

    if (needsTableContext) {
      if (!sessionId || !tableNumber) {
        toast.error("Please select a table first");
        navigate("/WaiterDashboard/tables");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, sessionId, tableNumber]);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showNotificationPopup &&
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotificationPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotificationPopup]);


  return (
    <div className="waiter-dashboard-layout-container">
      <nav className="waiter-dashboard-top-navbar">
        {/* LOGO */}
        <div className="waiter-dashboard-topnav-logo">
          <Utensils size={26} />
          <span>Dineease</span>
        </div>

        {/* Desktop Links */}
        {!isMobile && (
          <div className="waiter-dashboard-topnav-links">
            <Link to="/WaiterDashboard" className={`waiter-dashboard-topnav-item ${isActive("/WaiterDashboard") ? "active" : ""}`}>
              <LayoutDashboard size={20} /><span>Dashboard</span>
            </Link>
            <div className="waiter-dashboard-topnav-item" onClick={() => navigate("/WaiterDashboard/tables")}><Sofa size={20} /><span>Tables</span></div>
            <div className="waiter-dashboard-topnav-item" onClick={() => navigate("/WaiterDashboard/menu")}><Newspaper size={20} /><span>Menu</span></div>

            {/* Orders Dropdown */}
            <div className="waiter-dashboard-orders-dropdown" ref={dropdownRef}>
              <div
                className={`waiter-dashboard-topnav-item orders-toggle ${ordersExpanded ? "active" : ""
                  }`}
                onClick={() => setOrdersExpanded((prev) => !prev)}
              >
                <ShoppingCart size={20} />
                <span>Orders</span>
                {ordersExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>

              {ordersExpanded && (
                <div className="waiter-dashboard-topnav-dropdown">
                  <Link
                    to="/WaiterDashboard/orders?type=NEW"
                    className="waiter-dashboard-topnav-dropdown-item"
                    onClick={() => setOrdersExpanded(false)}
                  >
                    New Orders
                  </Link>
                  <Link
                    to="/WaiterDashboard/orders/all"
                    className="waiter-dashboard-topnav-dropdown-item"
                    onClick={() => setOrdersExpanded(false)}
                  >
                    All Orders
                  </Link>
                </div>
              )}
            </div>


            <div className="waiter-dashboard-topnav-item" onClick={() => navigate("/WaiterDashboard/payments")}><MdCurrencyRupee size={20} /><span>Payments</span></div>
          </div>
        )}

        {/* Right Section */}
        <div className="waiter-dashboard-topnav-right">
          <div
  ref={notificationRef}
  className="waiter-dashboard-notification-icon"
  title="Notifications"
  onClick={() => setShowNotificationPopup((prev) => !prev)}
>
  <FaBell size={22} />

  {notificationCount > 0 && (
    <span className="waiter-dashboard-notification-count-badge">
      {notificationCount}
    </span>
  )}

  {showNotificationPopup && (
    <div className="waiter-dashboard-notification-popup">
      <WaiterNotification
        smallView
        onCountChange={setNotificationCount}
      />
    </div>
  )}
</div>





          <div className="waiter-dashboard-header-right" ref={dropdownRef}>
            <div className="waiter-dashboard-profile-circle" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {profilePic ? <img src={profilePic} alt="Profile" className="waiter--dashboard-circle-img" /> : waiterName.charAt(0).toUpperCase()}
            </div>
            {dropdownOpen && (
              <div className="waiter--dashboard-dropdown-menu">
                <button className="waiter-dashboard-dropdown-item" onClick={() => navigate("/WaiterDashboard/profile")}><User size={16} /> Profile</button>
                <button className="waiter-dashboard-dropdown-item" onClick={() => navigate("/WaiterDashboard/settings")}><User size={16} /> Settings</button>
                <button className="waiter-dashboard-dropdown-item" onClick={handleLogout}><LogOut size={16} /> Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        {isMobile && (
          <div className="waiter-dashboard-topnav-mobile-menu">
            <button className="hamburger-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {dropdownOpen ? <FaTimes /> : <FaBars />}
            </button>
            {dropdownOpen && (
              <div className="mobile-dropdown-links">
                <Link to="/WaiterDashboard" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                <Link to="/WaiterDashboard/tables" onClick={() => setDropdownOpen(false)}>Tables</Link>
                <Link to="/WaiterDashboard/menu" onClick={() => setDropdownOpen(false)}>Menu</Link>
                <Link to="/WaiterDashboard/orders?type=NEW" onClick={() => setDropdownOpen(false)}>New Orders</Link>
                <Link to="/WaiterDashboard/orders/all" onClick={() => setDropdownOpen(false)}>All Orders</Link>
                <Link to="/WaiterDashboard/payments" onClick={() => setDropdownOpen(false)}>Payments</Link>
              </div>
            )}
          </div>
        )}
      </nav>




      <main className="waiter-dashboard-content">
        <Outlet />

      </main>
      <ToastContainer position="top-right" autoClose={1000} />

    </div>

  );
}  