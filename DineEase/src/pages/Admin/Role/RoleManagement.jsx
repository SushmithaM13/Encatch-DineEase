import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, User } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RoleManagement.css";

export default function AdminRoleManagement() {
  const API_BASE = "http://localhost:8082/dine-ease/api/v1/staff-role";
  const TOKEN = localStorage.getItem("token");

  const initialForm = { staffRoleName: "", staffRoleDescription: "" };
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  if (!TOKEN) console.warn("No token found! Please login first.");

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/all`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error(err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (TOKEN) fetchRoles();
  }, [TOKEN]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddOrUpdate = async () => {
    if (!form.staffRoleName || !form.staffRoleDescription) {
      toast.error("Please fill all fields", { position: "top-center" });
      return;
    }

    const duplicate = roles.some(
      (r) =>
        r.staffRoleName.toLowerCase() === form.staffRoleName.toLowerCase() &&
        r.id !== editId
    );
    if (duplicate) {
      toast.error(`Role "${form.staffRoleName}" already exists!`, {
        position: "top-center",
      });
      return;
    }

    try {
      const url = editId ? `${API_BASE}/update/${editId}` : `${API_BASE}/add`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save role");

      fetchRoles();
      setForm(initialForm);
      setEditId(null);
      setModalOpen(false);

      toast.success(
        editId
          ? `Role "${form.staffRoleName}" updated successfully!`
          : `Role "${form.staffRoleName}" added successfully!`,
        { position: "top-center" }
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to save role", { position: "top-center" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Failed to delete role");
      fetchRoles();
      toast.success("Role deleted successfully!", { position: "top-center" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete role", { position: "top-center" });
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.staffRoleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.staffRoleDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-role-management-page">
      {/* Header */}
      <div className="admin-role-management-header">
        <h2 className="admin-page-title">
          <User size={20} /> Role Management
        </h2>
        <button
          className="admin-add-btn"
          onClick={() => {
            setForm(initialForm);
            setEditId(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Add Role
        </button>
      </div>

      {/* Search */}
      <div className="admin-search-bar">
        <input
          type="search"
          placeholder="Search role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <table className="admin-roles-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Role Name</th>
            <th>Role Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                Loading roles...
              </td>
            </tr>
          ) : filteredRoles.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No roles found.
              </td>
            </tr>
          ) : (
            filteredRoles.map((role) => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.staffRoleName}</td>
                <td>{role.staffRoleDescription}</td>
                <td className="admin-action-icons">
                  <button
                    className="admin-icon-btn admin-edit"
                    onClick={() => {
                      setForm(role);
                      setEditId(role.id);
                      setModalOpen(true);
                    }}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="admin-icon-btn admin-delete"
                    onClick={() => handleDelete(role.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>{editId ? "Edit Role" : "Add Role"}</h3>
              <button
                className="admin-close-btn"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <input
                type="text"
                name="staffRoleName"
                placeholder="Role Name"
                value={form.staffRoleName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="staffRoleDescription"
                placeholder="Role Description"
                value={form.staffRoleDescription}
                onChange={handleChange}
              />
            </div>
            <div className="admin-modal-footer">
              <button className="admin-add-btn" onClick={handleAddOrUpdate}>
                <Plus size={16} /> {editId ? "Update Role" : "Add Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
