import React, { useState, useEffect, useCallback } from "react";
import "./AddStaffRole.css";

const AddStaffRole = () => {
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Fetch all staff roles
  const fetchRoles = useCallback(async () => {
    if (!token) {
      setMessage("Please login to view roles");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8082/dine-ease/api/v1/staff-role/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else if (response.status === 401) {
        setMessage("Session expired. Please login again.");
      } else if (response.status === 403) {
        setMessage("Access denied. Only Super Admin can view roles.");
      } else {
        setMessage("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setMessage("Error connecting to server");
    }
  }, [token]);

  // Add new staff role
  const addRole = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      setMessage("Role name is required");
      return;
    }

    if (!roleDescription.trim()) {
      setMessage("Role description is required");
      return;
    }

    if (!token) {
      setMessage("Please login to add roles");
      return;
    }

    if (userRole !== "SUPER_ADMIN") {
      setMessage("Only Super Admin can add roles");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        staff_role_name: roleName.trim(),
        staff_description: roleDescription.trim(),
      };

      const response = await fetch(
        "http://localhost:8082/dine-ease/api/v1/staff-role/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setMessage("Role added successfully!");
        setRoleName("");
        setRoleDescription("");
        fetchRoles(); // refresh list
      } else if (response.status === 401) {
        setMessage("Session expired. Please login again.");
      } else if (response.status === 403) {
        setMessage("Access denied. Only Super Admin can add roles.");
      } else if (response.status === 409) {
        setMessage("Role name already exists. Please choose a different name.");
      } else {
        const errorData = await response.text();
        console.error("Server error:", errorData);
        setMessage("Failed to add role. Please try again.");
      }
    } catch (error) {
      console.error("Error adding role:", error);
      setMessage("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // Load roles on mount
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <div className="staff-role-container">
      <h2>Staff Role Management</h2>

      {/* Add Role Form */}
      <div className="add-role-section">
        <h3>Add New Role</h3>
        <form onSubmit={addRole} className="staff-role-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter Role Name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <textarea
              placeholder="Enter Role Description"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              disabled={loading}
              rows="3"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="add-btn">
            {loading ? "Adding..." : "Add Role"}
          </button>
        </form>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`message ${
            message.toLowerCase().includes("success") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}

      {/* Roles List */}
      <div className="roles-list-section">
        <h3>Existing Roles ({roles ? roles.length : 0})</h3>
        {roles && roles.length > 0 ? (
          <div className="roles-grid">
            {roles.map((role) => (
              <div key={role.id} className="role-card">
                <h4>{role.staffRoleName || role.roleName}</h4>
                <p>
                  {role.staffDescription ||
                    role.roleDescription ||
                    role.description}
                </p>
                <small>ID: {role.id}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-roles">No roles available</p>
        )}
      </div>

      {/* Refresh Button */}
      <div className="actions">
        <button onClick={fetchRoles} className="refresh-btn">
          Refresh Roles
        </button>
      </div>
    </div>
  );
};

export default AddStaffRole;
