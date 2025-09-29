// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./AddStaffRole.css";

// export default function RoleManagement() {
//   const [roles, setRoles] = useState([]);
//   const [formData, setFormData] = useState({
//     staffRoleName: "",
//     staffRoleDescription: "",
//   });
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     if (!token) {
//       navigate("/login");
//     } else {
//       fetchRoles();
//     }
//   }, [token, navigate]);

//   // Fetch all roles
//   const fetchRoles = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch("", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (!res.ok) throw new Error("Failed to fetch roles");

//       const data = await res.json();
//       setRoles(data || []);
//     } catch (err) {
//       console.error("Error fetching roles:", err);
//       setError("Failed to fetch roles. Check your token or permissions.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Add or Update role
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!formData.staffRoleName.trim() || !formData.staffRoleDescription.trim()) {
//       setError("Role name and description are required");
//       return;
//     }

//     setLoading(true);

//     const url = editingId
//       ? `http://localhost:8082/dine-ease/api/v1/staff-role/update/${editingId}`
//       : `http://localhost:8082/dine-ease/api/v1/staff-role/add`;
//     const method = editingId ? "PUT" : "POST";

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to save role");
//       }

//       const savedRole = await res.json(); // get added/updated role from backend

//       if (editingId) {
//         // Update role in state
//         setRoles((prev) => prev.map((r) => (r.id === editingId ? savedRole : r)));
//         setSuccess("Role updated successfully!");
//       } else {
//         // Add new role to state
//         setRoles((prev) => [...prev, savedRole]);
//         setSuccess("Role added successfully!");
//       }

//       setFormData({ staffRoleName: "", staffRoleDescription: "" });
//       setEditingId(null);
//     } catch (err) {
//       console.error("Error saving role:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete role
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this role?")) return;

//     setError("");
//     setSuccess("");
//     setLoading(true);

//     try {
//       const res = await fetch(`http://localhost:8082/dine-ease/api/v1/staff-role/delete/${id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) throw new Error("Failed to delete role");

//       setRoles((prev) => prev.filter((r) => r.id !== id));
//       if (editingId === id) setEditingId(null);
//       setSuccess("Role deleted successfully!");
//     } catch (err) {
//       console.error("Error deleting role:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Cancel editing
//   const handleCancelEdit = () => {
//     setFormData({ staffRoleName: "", staffRoleDescription: "" });
//     setEditingId(null);
//     setError("");
//     setSuccess("");
//   };

//   return (
//     <div className="role-management">
//       <h2>Role Management</h2>

//       {error && <p className="error">{error}</p>}
//       {success && <p className="success">{success}</p>}

//       {/* Role Form */}
//       <form onSubmit={handleSubmit} className="role-form">
//         <input
//           type="text"
//           placeholder="Role Name"
//           value={formData.staffRoleName}
//           onChange={(e) =>
//             setFormData({ ...formData, staffRoleName: e.target.value })
//           }
//           required
//           disabled={loading}
//         />
//         <input
//           type="text"
//           placeholder="Role Description"
//           value={formData.staffRoleDescription}
//           onChange={(e) =>
//             setFormData({ ...formData, staffRoleDescription: e.target.value })
//           }
//           required
//           disabled={loading}
//         />
//         <div className="form-actions">
//           <button type="submit" disabled={loading}>
//             {loading ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update Role" : "Add Role"}
//           </button>
//           {editingId && (
//             <button type="button" onClick={handleCancelEdit} className="cancel-btn">
//               Cancel
//             </button>
//           )}
//         </div>
//       </form>

//       {/* Roles List */}
//       <h3>Existing Roles ({roles.length})</h3>
//       {loading && roles.length === 0 ? (
//         <p>Loading roles...</p>
//       ) : roles.length === 0 ? (
//         <p>No roles available.</p>
//       ) : (
//         <div className="roles-list">
//           {roles.map((role) => (
//             <div key={role.id} className="role-card">
//               <h4>{role.staffRoleName}</h4>
//               <p>{role.staffRoleDescription}</p>
//               <div className="role-actions">
//                 <button
//                   onClick={() => {
//                     setFormData({
//                       staffRoleName: role.staffRoleName,
//                       staffRoleDescription: role.staffRoleDescription,
//                     });
//                     setEditingId(role.id);
//                   }}
//                 >
//                   Edit
//                 </button>
//                 <button onClick={() => handleDelete(role.id)} className="delete-btn">
//                   Delete
//                 </button>
//               </div>
//               <small>ID: {role.id}</small>
//             </div>
//           ))}
//         </div>
//       )}

//       <button onClick={fetchRoles} className="refresh-btn">Refresh Roles</button>
//     </div>
//   );
// }




import { useEffect, useState } from "react";
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

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchRoles();
    }
  }, [token, navigate]);

  // Fetch all roles
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
      setRoles(data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to fetch roles. Check your token or permissions.");
    } finally {
      setLoading(false);
    }
  };

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

  // Cancel editing
  const handleCancelEdit = () => {
    setFormData({ staffRoleName: "", staffRoleDescription: "" });
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  return (
    <div className="role-management">
      <h2>Role Management</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

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

      {/* Roles List */}
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
                <button onClick={() => {
                  setFormData({
                    staffRoleName: role.staffRoleName,
                    staffRoleDescription: role.staffRoleDescription,
                  });
                  setEditingId(role.id);
                }}>Edit</button>
                <button onClick={() => handleDelete(role.id)} className="delete-btn">
                  Delete
                </button>
              </div>
              <small>ID: {role.id}</small>
            </div>
          ))}
        </div>
      )}

      <button onClick={fetchRoles} className="refresh-btn">Refresh Roles</button>
    </div>
  );
}








// import React, { useState, useEffect, useCallback } from "react";
// import "./AddStaffRole.css";
// import { } from "react-router-dom";

// const AddStaffRole = () => {
//   const [roleName, setRoleName] = useState("");
//   const [roleDescription, setRoleDescription] = useState("");
//   const [roles, setRoles] = useState(null);
//    const [message, setMessage] = useState("");
//    const [loading, setLoading] = useState(false);
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [userRole, setUserRole] = useState(localStorage.getItem("role"));

//   // Keep token & role updated dynamically
//   useEffect(() => {
//     const handleStorageChange = () => {
//       setToken(localStorage.getItem("token"));
//       setUserRole(localStorage.getItem("role"));
//     };

//     // Update when localStorage changes (e.g. login/logout)
//     window.addEventListener("storage", handleStorageChange);

//     // Cleanup
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   // Fetch all staff roles
//   const fetchRoles = useCallback(async () => {
//     if (!token) {
//       setMessage("Please login to view roles");
//       return;
//     }

//     try {
//       const response = await fetch(
//         "http://localhost:8082/dine-ease/api/v1/staff-role/all",
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         setRoles(data);
//       } else if (response.status === 401) {
//         setMessage("Session expired. Please login again.");
//       } else if (response.status === 403) {
//         setMessage("Access denied. Only Super Admin can view roles.");
//       } else {
//         setMessage("Failed to fetch roles");
//       }
//     } catch (error) {
//       console.error("Error fetching roles:", error);
//       setMessage("Error connecting to server");
//     }
//   }, [token]);

//   // Add new staff role
//   const addRole = async (e) => {
//     e.preventDefault();

//     if (!roleName.trim()) {
//       setMessage("Role name is required");
//       return;
//     }

//     if (!roleDescription.trim()) {
//       setMessage("Role description is required");
//       return;
//     }

//     if (!token) {
//       setMessage("Please login to add roles");
//       return;
//     }

//     if (userRole !== "SUPER_ADMIN") {
//       setMessage("Only Super Admin can add roles");
//       return;
//     }

//     setLoading(true);
//     setMessage("");

//     try {
//      const payload = {
//   staffRoleName: roleName.toUpperCase().trim(),
//   staffDescription: roleDescription.trim(),
// };

// const response = await fetch("http://localhost:8082/dine-ease/api/v1/staff-role/add", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   },
//   body: JSON.stringify(payload),
// });

// if (response.ok) {
//   setMessage("Role added successfully!");
//   setRoleName("");
//   setRoleDescription("");
//   fetchRoles(); // refresh
// } else if (response.status === 409) {
//   setMessage("Role already exists!");
// } else {
//   const errorData = await response.text();
//   console.error("Server error:", errorData);
//   setMessage("Failed to add role");
// }
//       setMessage("Error connecting to server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load roles on mount & whenever token changes
//   useEffect(() => {
//     fetchRoles();
//   }, [fetchRoles]);

//   return (
//     <div className="staff-role-container">
//       <h2>Staff Role Management</h2>

//       {/* Add Role Form */}
//       <div className="add-role-section">
//         <h3>Add New Role</h3>
//         <form onSubmit={addRole} className="staff-role-form">
//           <div className="form-group">
//             <input
//               type="text"
//               placeholder="Enter Role Name"
//               value={roleName}
//               onChange={(e) => setRoleName(e.target.value)}
//               disabled={loading}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <textarea
//               placeholder="Enter Role Description"
//               value={roleDescription}
//               onChange={(e) => setRoleDescription(e.target.value)}
//               disabled={loading}
//               rows="3"
//               required
//             />
//           </div>

//           <button type="submit" disabled={loading} className="add-btn">
//             {loading ? "Adding..." : "Add Role"}
//           </button>
//         </form>
//       </div>

//       {/* Message Display */}
//       {message && (
//         <div
//           className={`message ${
//             message.toLowerCase().includes("success") ? "success" : "error"
//           }`}
//         >
//           {message}
//         </div>
//       )}

//       {/* Roles List */}
//       <div className="roles-list-section">
//         <h3>Existing Roles ({roles ? roles.length : 0})</h3>
//         {roles && roles.length > 0 ? (
//           <div className="roles-grid">
//             {roles.map((role) => (
//               <div key={role.id} className="role-card">
//                 <h4>{role.staffRoleName || role.roleName}</h4>
//                 <p>
//                   {role.staffDescription ||
//                     role.roleDescription ||
//                     role.description}
//                 </p>
//                 <small>ID: {role.id}</small>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="no-roles">No roles available</p>
//         )}
//       </div>

//       {/* Refresh Button */}
//       <div className="actions">
//         <button onClick={fetchRoles} className="refresh-btn">
//           Refresh Roles
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AddStaffRole;
