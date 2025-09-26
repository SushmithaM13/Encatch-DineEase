import React from 'react';
import "./Sidebar.css";
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">🍴 Savory Grill</div>
      <nav>
        <NavLink to="/ChefDashboard" end>Dashboard</NavLink>
        <NavLink to="/orderQueue">Order Queue</NavLink>
        <NavLink to="/ChefMenuCatalog">Menu Catalog</NavLink>
        <NavLink to="/inventory">Inventory</NavLink>
        <NavLink to="/logout">Logout</NavLink>
      </nav>
    </aside>
  );
}
