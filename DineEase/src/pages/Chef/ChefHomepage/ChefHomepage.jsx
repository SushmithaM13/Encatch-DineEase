import React from "react";
import { useNavigate } from "react-router-dom";
import "./ChefHomePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChartLine, 
  faClipboardList, 
  faUtensils, 
  faBoxes,
  faHourglassHalf,
  faExclamationTriangle,
  faLeaf,
  faClock,
  faFire,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";

export default function ChefHomePage() {
  const navigate = useNavigate();

  return (
    <div className="chef-homepage-wrapper">
      {/* Main Welcome Banner */}
      <div className="chef-hero-section">
        <div className="chef-hero-content">
          <h1 className="chef-hero-title">Welcome, Chef!</h1>
          <p className="chef-hero-subtitle">
            Track orders in real-time, prioritize urgent tickets, and keep your menu & inventory in sync — all in one clean workspace.
          </p>

          {/* Action Buttons */}
          <div className="chef-action-buttons">
            <button
              className="chef-action-btn btn-primary"
              onClick={() => navigate("ChefDashboard")}
            >
              <FontAwesomeIcon icon={faChartLine} />
              Go to Dashboard
              <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
            </button>
            <button
              className="chef-action-btn btn-outline"
              onClick={() => navigate("OrdersQueue")}
            >
              <FontAwesomeIcon icon={faClipboardList} />
              Order Queue
            </button>
            <button
              className="chef-action-btn btn-outline-warning"
              onClick={() => navigate("menu")}
            >
              <FontAwesomeIcon icon={faUtensils} />
              Menu Catalog
            </button>
            <button
              className="chef-action-btn btn-outline-danger"
              onClick={() => navigate("inventory")}
            >
              <FontAwesomeIcon icon={faBoxes} />
              Inventory
            </button>
          </div>

          {/* Feature Tags */}
          <div className="chef-feature-tags">
            <span className="feature-tag tag-orange">
              <FontAwesomeIcon icon={faClock} />
              Timers & Overdue alerts
            </span>
            <span className="feature-tag tag-red">
              <FontAwesomeIcon icon={faFire} />
              Urgent ticket highlighting
            </span>
            <span className="feature-tag tag-green">
              <FontAwesomeIcon icon={faLeaf} />
              Stock-aware menu
            </span>
          </div>
        </div>

         {/* Chef Illustration */}
        <div className="chef-hero-image">
          <img
            src="src/Images/chef.png"
            alt="Chef Illustration"
          />
        </div>
      </div>

      {/* Quick Access Cards Grid */}
      <div className="chef-cards-grid">
        <div className="chef-feature-card card-green" onClick={() => navigate("ChefDashboard")}>
          <div className="card-icon-wrapper">
            <FontAwesomeIcon icon={faChartLine} className="card-main-icon" />
          </div>
          <div className="card-text">
            <h3>Dashboard</h3>
            <p>Overview & Kanban board</p>
          </div>
        </div>

        <div className="chef-feature-card card-yellow" onClick={() => navigate("OrdersQueue")}>
          <div className="card-icon-wrapper">
            <FontAwesomeIcon icon={faClipboardList} className="card-main-icon" />
          </div>
          <div className="card-text">
            <h3>Order Queue</h3>
            <p>Accept, ready, reopen</p>
          </div>
        </div>

        <div className="chef-feature-card card-green-light" onClick={() => navigate("menu")}>
          <div className="card-icon-wrapper">
            <FontAwesomeIcon icon={faUtensils} className="card-main-icon" />
          </div>
          <div className="card-text">
            <h3>Menu Catalog</h3>
            <p>Stock-aware menu cards</p>
          </div>
        </div>

        <div className="chef-feature-card card-red" onClick={() => navigate("inventory")}>
          <div className="card-icon-wrapper">
            <FontAwesomeIcon icon={faBoxes} className="card-main-icon" />
          </div>
          <div className="card-text">
            <h3>Inventory</h3>
            <p>Low & OOS at a glance</p>
          </div>
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="chef-bottom-grid">
        <div className="chef-info-card">
          <h3>Today's Tips</h3>
          <ul>
            <li>
              Focus on cards with <span className="text-highlight">Overdue</span> badges first.
            </li>
            <li>Use drag-and-drop to move tickets between stages.</li>
          </ul>
        </div>

        <div className="chef-info-card">
          <h3>Shortcuts</h3>
          <div className="shortcuts-grid">
            <button className="shortcut-item" onClick={() => navigate("OrdersQueue")}>
              <FontAwesomeIcon icon={faClipboardList} />
              View Orders
            </button>
            <button className="shortcut-item" onClick={() => navigate("menu")}>
              <FontAwesomeIcon icon={faUtensils} />
              Edit Menu
            </button>
            <button className="shortcut-item" onClick={() => navigate("inventory")}>
              <FontAwesomeIcon icon={faBoxes} />
              Check Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}