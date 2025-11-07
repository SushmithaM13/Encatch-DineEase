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
  const navigate = useNavigate(); // React Router navigation hook

  return (
    <div className="chef-home-container container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Welcome, Chef!</h1>
          <p>
            Track orders in real-time, prioritize urgent tickets, and keep your
            menu & inventory in sync — all in one clean workspace.
          </p>

          <div className="button-group">
            <button
              className="btn btn-green"
              onClick={() => navigate("ChefDashboard")}
            >
              <FontAwesomeIcon icon={faChartLine} className="btn-icon" />
              Go to Dashboard
            </button>
            <button
              className="btn btn-outline-green"
              onClick={() => navigate("OrdersQueue")}
            >
              <FontAwesomeIcon icon={faClipboardList} className="btn-icon" />
              Order Queue
            </button>
            <button
              className="btn btn-outline-orange"
              onClick={() => navigate("menu")}
            >
              <FontAwesomeIcon icon={faUtensils} className="btn-icon" />
              Menu Catalog
            </button>
            <button
              className="btn btn-outline-red"
              onClick={() => navigate("inventory")}
            >
              <FontAwesomeIcon icon={faBoxes} className="btn-icon" />
              Inventory
            </button>
          </div>

          <div className="badges">
            <span className="badge orange">
              <FontAwesomeIcon icon={faHourglassHalf} className="badge-icon" />
              Timers & Overdue alerts
            </span>
            <span className="badge red">
              <FontAwesomeIcon icon={faExclamationTriangle} className="badge-icon" />
              Urgent ticket highlighting
            </span>
            <span className="badge green">
              <FontAwesomeIcon icon={faLeaf} className="badge-icon" />
              Stock-aware menu
            </span>
          </div>
        </div>

        <div className="welcome-image">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
            alt="Chef Illustration"
          />
        </div>
      </div>

      {/* Info Cards Section */}
      <div className="info-cards">
        <div className="card green" onClick={() => navigate("ChefDashboard")}>
          <FontAwesomeIcon icon={faChartLine} className="card-icon" />
          <h3>Dashboard</h3>
          <p>Overview & Kanban board</p>
        </div>
        <div className="card orange" onClick={() => navigate("OrdersQueue")}>
          <FontAwesomeIcon icon={faClipboardList} className="card-icon" />
          <h3>Order Queue</h3>
          <p>Accept, ready, reopen</p>
        </div>
        <div className="card green-light" onClick={() => navigate("menu")}>
          <FontAwesomeIcon icon={faUtensils} className="card-icon" />
          <h3>Menu Catalog</h3>
          <p>Stock-aware menu cards</p>
        </div>
        <div className="card red" onClick={() => navigate("inventory")}>
          <FontAwesomeIcon icon={faBoxes} className="card-icon" />
          <h3>Inventory</h3>
          <p>Low & OOS at a glance</p>
        </div>
      </div>

      {/* Tips & Shortcuts Section */}
      <div className="bottom-section">
        <div className="tips-card">
          <h3>Today’s Tips</h3>
          <ul>
            <li>
              Focus on cards with <span className="text-red">Overdue</span>{" "}
              badges first.
            </li>
            <li>Use drag-and-drop to move tickets between stages.</li>
          </ul>
        </div>

        <div className="shortcuts-card">
          <h3>Shortcuts</h3>
          <div className="shortcut-buttons">
            <button
              className="btn btn-outline"
              onClick={() => navigate("OrdersQueue")}
            >
              <FontAwesomeIcon icon={faClipboardList} className="btn-icon" />
              View Orders
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate("menu")}
            >
              <FontAwesomeIcon icon={faEdit} className="btn-icon" />
              Edit Menu
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate("inventory")}
            >
              <FontAwesomeIcon icon={faWarehouse} className="btn-icon" />
              Check Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
