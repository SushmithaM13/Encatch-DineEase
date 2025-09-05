import React from "react";
import { FaBars, FaBell, FaUserCircle, FaSearch } from "react-icons/fa";
import "./Navbar.css";

const Navbar = ({ onToggleSidebar }) => {
  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="navbar-left">
          <FaBars className="menu-icon" onClick={onToggleSidebar} />
          <h2 className="logo">DINEEASE</h2>
        </div>
        <div className="navbar-center">
          <div className="search-box">
            <input type="text" placeholder="Search food, orders..." />
            <FaSearch className="search-icon" />
          </div>
        </div>
        <div className="navbar-right">
          <FaBell className="icon" />
          <FaUserCircle className="icon profile" />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
