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
  faEdit,
  faWarehouse
} from "@fortawesome/free-solid-svg-icons";

export default function ChefHomePage() {
  const navigate = useNavigate();

  return (
    <div className="chef-home-container chef-container">
      {/* Welcome Section */}
      <div className="chef-welcome-section">
        <div className="chef-welcome-text">
          <h1>Welcome, Chef!</h1>
          <p>
            Track orders in real-time, prioritize urgent tickets, and keep your
            menu & inventory in sync — all in one clean workspace.
          </p>

          <div className="chef-button-group">
            <button
              className="chef-btn chef-btn-green"
              onClick={() => navigate("ChefDashboard")}
            >
              <FontAwesomeIcon icon={faChartLine} className="chef-btn-icon" />
              Go to Dashboard
            </button>
            <button
              className="chef-btn chef-btn-outline-green"
              onClick={() => navigate("OrdersQueue")}
            >
              <FontAwesomeIcon icon={faClipboardList} className="chef-btn-icon" />
              Order Queue
            </button>
            <button
              className="chef-btn chef-btn-outline-orange"
              onClick={() => navigate("menu")}
            >
              <FontAwesomeIcon icon={faUtensils} className="chef-btn-icon" />
              Menu Catalog
            </button>
            <button
              className="chef-btn chef-btn-outline-red"
              onClick={() => navigate("inventory")}
            >
              <FontAwesomeIcon icon={faBoxes} className="chef-btn-icon" />
              Inventory
            </button>
          </div>

          <div className="chef-badges">
            <span className="chef-badge chef-orange">
              <FontAwesomeIcon icon={faHourglassHalf} className="chef-badge-icon" />
              Timers & Overdue alerts
            </span>
            <span className="chef-badge chef-red">
              <FontAwesomeIcon icon={faExclamationTriangle} className="chef-badge-icon" />
              Urgent ticket highlighting
            </span>
            <span className="chef-badge chef-green">
              <FontAwesomeIcon icon={faLeaf} className="chef-badge-icon" />
              Stock-aware menu
            </span>
          </div>
        </div>

        <div className="chef-welcome-image">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
            alt="Chef Illustration"
          />
        </div>
      </div>

      {/* Info Cards Section */}
      <div className="chef-info-cards">
        <div className="chef-card chef-green" onClick={() => navigate("ChefDashboard")}>
          <FontAwesomeIcon icon={faChartLine} className="chef-card-icon" />
          <h3>Dashboard</h3>
          <p>Overview & Kanban board</p>
        </div>
        <div className="chef-card chef-orange" onClick={() => navigate("OrdersQueue")}>
          <FontAwesomeIcon icon={faClipboardList} className="chef-card-icon" />
          <h3>Order Queue</h3>
          <p>Accept, ready, reopen</p>
        </div>
        <div className="chef-card chef-green-light" onClick={() => navigate("menu")}>
          <FontAwesomeIcon icon={faUtensils} className="chef-card-icon" />
          <h3>Menu Catalog</h3>
          <p>Stock-aware menu cards</p>
        </div>
        <div className="chef-card chef-red" onClick={() => navigate("inventory")}>
          <FontAwesomeIcon icon={faBoxes} className="chef-card-icon" />
          <h3>Inventory</h3>
          <p>Low & OOS at a glance</p>
        </div>
      </div>

      {/* Tips & Shortcuts Section */}
      <div className="chef-bottom-section">
        <div className="chef-tips-card">
          <h3>Today’s Tips</h3>
          <ul>
            <li>
              Focus on cards with <span className="chef-text-red">Overdue</span>{" "}
              badges first.
            </li>
            <li>Use drag-and-drop to move tickets between stages.</li>
          </ul>
        </div>

        <div className="chef-shortcuts-card">
          <h3>Shortcuts</h3>
          <div className="chef-shortcut-buttons">
            <button
              className="chef-btn chef-btn-outline"
              onClick={() => navigate("OrdersQueue")}
            >
              <FontAwesomeIcon icon={faClipboardList} className="chef-btn-icon" />
              View Orders
            </button>
            <button
              className="chef-btn chef-btn-outline"
              onClick={() => navigate("menu")}
            >
              <FontAwesomeIcon icon={faEdit} className="chef-btn-icon" />
              Edit Menu
            </button>
            <button
              className="chef-btn chef-btn-outline"
              onClick={() => navigate("inventory")}
            >
              <FontAwesomeIcon icon={faWarehouse} className="chef-btn-icon" />
              Check Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
