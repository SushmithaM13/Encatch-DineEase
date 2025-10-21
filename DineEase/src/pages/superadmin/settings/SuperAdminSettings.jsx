import React, { useState } from "react";
import "./SuperAdminSettings.css";

export default function SuperAdminSettings() {
  const [theme, setTheme] = useState("light");
  const [font, setFont] = useState("sans-serif");
  const [color, setColor] = useState("#007bff");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = () => {
    if (password !== confirmPassword) return alert("Passwords do not match!");
    alert("Password reset successfully!");
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Theme</h3>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="settings-section">
        <h3>Font Style</h3>
        <select value={font} onChange={(e) => setFont(e.target.value)}>
          <option value="sans-serif">Sans Serif</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
        </select>
      </div>

      <div className="settings-section">
        <h3>Primary Color</h3>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      <div className="settings-section">
        <h3>Reset Password</h3>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button onClick={handleResetPassword}>Reset Password</button>
      </div>

      <div className="settings-section">
        <h3>Preview</h3>
        <div
          className="preview-box"
          style={{
            background: theme === "dark" ? "#222" : "#f8f8f8",
            color: theme === "dark" ? "#fff" : "#000",
            fontFamily: font,
            borderColor: color,
          }}
        >
          <p>Theme: {theme}</p>
          <p>Font: {font}</p>
          <p>Color: {color}</p>
        </div>
      </div>
    </div>
  );
}
