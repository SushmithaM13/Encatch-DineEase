// src/pages/superadmin/menu/MenuDashboard/MenuDashboard.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./MenuDashboard.css";

export default function MenuDashboard() {
  return (
    <div className="menu-dashboard">
      <h1 className="dashboard-title">🍴 Menu Management Dashboard</h1>
      <div></div>

      <div className="menu-list">
        {/* <NavLink to="../category-form">Category</NavLink>
        <NavLink to="../add-item-type">Add Item Type</NavLink>
        <NavLink to="../food-type">Food Type</NavLink>
        <NavLink to="../cuisine-type">Cuisine Type</NavLink>
        <NavLink to="../variant-form">Variant</NavLink>
        <NavLink to="../addon-form">Addon</NavLink>
        <NavLink to="../customization-group-form">Customization</NavLink> */}
      </div>
    </div>
  );
}
