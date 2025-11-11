// src/pages/admin/MenuDashboard.jsx
import React from "react";
import MenuList from "../../menu/MenuList/MenuList";
import "./MenuDashboard.css";

export default function MenuDashboard() {
  return (
    <div className="menu-dashboard">
      <h1 className="dashboard-title">🍴 Menu Management Dashboard</h1>
      <div className="tab-content">
        <MenuList />
      </div>
    </div>
  );
}
