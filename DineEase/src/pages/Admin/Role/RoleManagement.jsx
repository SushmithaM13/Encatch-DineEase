import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RoleManagement.css";

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    staffRoleName: "",
    staffRoleDescription: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) console.warn("No token found! You must login first.");

  // Fetch roles on mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchRoles();
    }
  }, [token, navigate]);

  const fetchRoles = async () => {
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
      setRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to fetch roles. Check your token or permissions (403).");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffRoleName || !formData.staffRoleDescription) return;

    setError("");
    try {
      const url = editingId
        ? `http://localhost:8082/dine-ease/api/v1/staff-role/update/${editingId}`
        : `http://localhost:8082/dine-ease/api/v1/staff-role/add`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save role");

      setFormData({ staffRoleName: "", staffRoleDescription: "" });
      setEditingId(null);
      fetchRoles();
    } catch (err) {
      console.error("Error saving role:", err);
      setError("Failed to save role. Check token/permissions.");
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      const res = await fetch(`http://localhost:8082/dine-ease/api/v1/staff-role/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete role");

      if (editingId === id) setEditingId(null);
      fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err);
      setError("Failed to delete role. Check token/permissions.");
    }
  };

  const handleCancelEdit = () => {
    setFormData({ staffRoleName: "", staffRoleDescription: "" });
    setEditingId(null);
  };

  return (
    <div className="role-management">
      <h2>Role Management</h2>
      {error && <p className="error">{error}</p>}

      {/* Role Form */}
      <form onSubmit={handleSubmit} className="role-form">
        <input
          type="text"
          placeholder="Role Name"
          value={formData.staffRoleName}
          onChange={(e) =>
            setFormData({ ...formData, staffRoleName: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Role Description"
          value={formData.staffRoleDescription}
          onChange={(e) =>
            setFormData({ ...formData, staffRoleDescription: e.target.value })
          }
          required
        />
        <div className="form-actions">
          <button type="submit">{editingId ? "Update Role" : "Add Role"}</button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="cancel-btn"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Roles List */}
      <div className="roles-list">
        {loading ? (
          <p>Loading roles...</p>
        ) : roles.length === 0 ? (
          <p>No roles available.</p>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="role-card">
              <h4>{role.staffRoleName}</h4>
              <p>{role.staffRoleDescription}</p>
              <div className="actions">
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
                <button onClick={() => handleDelete(role.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
