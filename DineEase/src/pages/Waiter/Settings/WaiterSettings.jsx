import { useState } from "react";
import "./WaiterSettings.css";

export default function WaiterSettings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="waiter-settings-page">
      <h2 className="waiter-settings-heading">Waiter Settings</h2>

      {/* Tabs */}
      <div className="waiter-settings-tabs">
        <button
          className={activeTab === "profile" ? "waiter-active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={activeTab === "security" ? "waiter-active" : ""}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
        <button
          className={activeTab === "notifications" ? "waiter-active" : ""}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
        <button
          className={activeTab === "theme" ? "waiter-active" : ""}
          onClick={() => setActiveTab("theme")}
        >
          Theme
        </button>
      </div>

      {/* Tab Content */}
      <div className="waiter-settings-content">
        {activeTab === "profile" && (
          <div className="waiter-tab-content">
            <h3>Profile</h3>
            <label>
              Name:
              <input type="text" placeholder="Waiter Name" />
            </label>
            <label>
              Email:
              <input type="email" placeholder="waiter@example.com" />
            </label>
            <label>
              Contact:
              <input type="text" placeholder="Phone Number" />
            </label>
            <label>
              Change Password:
              <input type="password" placeholder="New Password" />
            </label>
            <button className="waiter-save-btn">Save Profile</button>
          </div>
        )}

        {activeTab === "security" && (
          <div className="waiter-tab-content">
            <h3>Security</h3>
            <label>
              Two-Factor Authentication:
              <select>
                <option>Disabled</option>
                <option>Enabled</option>
              </select>
            </label>
            <label>
              Logout from other devices:
              <button className="waiter-logout-btn">Logout All</button>
            </label>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="waiter-tab-content">
            <h3>Notifications</h3>
            <label>
              New Orders
              <input type="checkbox" defaultChecked />
            </label>
            <label>
              Table Reservations
              <input type="checkbox" defaultChecked />
            </label>
            <label>
              Staff Updates
              <input type="checkbox" />
            </label>
          </div>
        )}

        {activeTab === "theme" && (
          <div className="waiter-tab-content">
            <h3>Theme</h3>
            <label>
              Dark Mode
              <input type="checkbox" />
            </label>
            <label>
              Font Size
              <select>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
