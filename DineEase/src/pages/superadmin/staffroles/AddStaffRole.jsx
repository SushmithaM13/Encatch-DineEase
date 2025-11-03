import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./AddStaffRole.css";

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    staffRoleName: "",
    staffRoleDescription: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRoles, setShowRoles] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8082/dine-ease/api/v1/staff-role/all", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch roles");

      const data = await res.json();
      setRoles(data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to fetch roles. Check your token or permissions.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // useEffect with stable fetchRoles
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchRoles();
    }
  }, [token, navigate, fetchRoles]);

  // Add or Update role
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.staffRoleName.trim() || !formData.staffRoleDescription.trim()) {
      setError("Role name and description are required");
      return;
    }

    setLoading(true);

    const url = editingId
      ? `http://localhost:8082/dine-ease/api/v1/staff-role/update/${editingId}`
      : `http://localhost:8082/dine-ease/api/v1/staff-role/add`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save role");
      }

      setSuccess(editingId ? "Role updated successfully!" : "Role added successfully!");
      setFormData({ staffRoleName: "", staffRoleDescription: "" });
      setEditingId(null);
      fetchRoles();
    } catch (err) {
      console.error("Error saving role:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete role
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`http://localhost:8082/dine-ease/api/v1/staff-role/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete role");

      setSuccess("Role deleted successfully!");
      if (editingId === id) setEditingId(null);
      fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err);
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setFormData({ staffRoleName: "", staffRoleDescription: "" });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  return (
    <div className="role-management">
      <div className="role-header">
        <h2>Role Management</h2>
        <div className="role-header-buttons">
          <button
            className="toggle-roles-btn"
            onClick={() => setShowRoles(!showRoles)}
          >
            {showRoles ? "Hide Roles" : "Roles"}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Add / Edit Role Form */}
      <form onSubmit={handleSubmit} className="role-form">
        <input
          type="text"
          placeholder="Role Name"
          value={formData.staffRoleName}
          onChange={(e) =>
            setFormData({ ...formData, staffRoleName: e.target.value })
          }
          required
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Role Description"
          value={formData.staffRoleDescription}
          onChange={(e) =>
            setFormData({ ...formData, staffRoleDescription: e.target.value })
          }
          required
          disabled={loading}
        />
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update Role" : "Add Role"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Roles Section */}
      {showRoles && (
        <>
          <h3>Existing Roles ({roles.length})</h3>
          {loading ? (
            <p>Loading roles...</p>
          ) : roles.length === 0 ? (
            <p>No roles available.</p>
          ) : (
            <div className="roles-list">
              {roles.map((role) => (
                <div key={role.id} className="role-card">
                  <h4>{role.staffRoleName}</h4>
                  <p>{role.staffRoleDescription}</p>
                  <div className="role-actions">
                    <button
                      onClick={() => {
                        setFormData({
                          staffRoleName: role.staffRoleName,
                          staffRoleDescription: role.staffRoleDescription,
                        });
                        setEditingId(role.id);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                  <small>ID: {role.id}</small>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <button onClick={fetchRoles} className="refresh-btn">Refresh Roles</button>
    </div>
  );
}

