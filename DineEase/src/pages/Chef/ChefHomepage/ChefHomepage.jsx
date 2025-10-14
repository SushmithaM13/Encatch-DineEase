import React from "react";
import { useNavigate } from "react-router-dom";
import "./ChefHomePage.css";

export default function ChefHomePage() {
  const navigate = useNavigate(); // React Router navigation hook

  return (
    <div className="chef-home-container">
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
              Go to Dashboard
            </button>
            <button
              className="btn btn-outline-green"
              onClick={() => navigate("OrdersQueue")}
            >
              Order Queue
            </button>
            <button
              className="btn btn-outline-orange"
              onClick={() => navigate("menu")}
            >
              Menu Catalog
            </button>
            <button
              className="btn btn-outline-red"
              onClick={() => navigate("inventory")}
            >
              Inventory
            </button>
          </div>

          <div className="badges">
            <span className="badge orange">⏱ Timers & Overdue alerts</span>
            <span className="badge red">⚠️ Urgent ticket highlighting</span>
            <span className="badge green">🥗 Stock-aware menu</span>
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
          <h3>Dashboard</h3>
          <p>Overview & Kanban board</p>
        </div>
        <div className="card orange" onClick={() => navigate("OrdersQueue")}>
          <h3>Order Queue</h3>
          <p>Accept, ready, reopen</p>
        </div>
        <div className="card green-light" onClick={() => navigate("menu")}>
          <h3>Menu Catalog</h3>
          <p>Stock-aware menu cards</p>
        </div>
        <div className="card red" onClick={() => navigate("inventory")}>
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
              View Orders
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate("menu")}
            >
              Edit Menu
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate("inventory")}
            >
              Check Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
