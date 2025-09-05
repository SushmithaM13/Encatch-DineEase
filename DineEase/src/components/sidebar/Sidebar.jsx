import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChartPie,
  FaCog,
  FaSignOutAlt,
  FaUsers,
  FaClipboardList,
  FaTimes,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: FaHome, text: "Dashboard", path: "/dashboard" },
    { icon: FaClipboardList, text: "Orders", path: "/orders" },
    { icon: FaUsers, text: "Customers", path: "/customers" },
    { icon: FaChartPie, text: "Analytics", path: "/analytics" },
    { icon: FaCog, text: "Settings", path: "/settings" },
    { icon: FaSignOutAlt, text: "Logout", path: "/" },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    // For mobile, close sidebar after navigation
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Close button for mobile */}
        <button className="sidebar-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h2 className="sidebar-title">DINEEASE</h2>
            <p className="sidebar-subtitle">Admin Panel</p>
          </div>
          
          <ul className="sidebar-menu">
            {menuItems.map((item, index) => (
              <li 
                key={index} 
                className="sidebar-menu-item"
                onClick={() => handleMenuClick(item.path)}
              >
                <item.icon className="menu-icon" />
                <span className="menu-text">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
