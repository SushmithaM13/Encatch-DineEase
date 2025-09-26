import React from "react";
import "./TopBar.css";

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="chef-info">
        <div className="avatar">SC</div>
        <div className="details">
          <span className="name">Chef Suresh</span>
          <span className="role">Head Chef</span>
        </div>
      </div>
    </div>
  );
}
