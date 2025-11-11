import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, User } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RoleManagement.css";

export default function AdminRoleManagement() {
  const API_BASE = "http://localhost:8082/dine-ease/api/v1/staff-role";
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const TOKEN = localStorage.getItem("token");

  const initialForm = { staffRoleName: "", staffDescription: "" };
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [organizationId, setOrganizationId] = useState("");

  // ✅ Fetch organization ID
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setOrganizationId(data.organizationId);
      } catch (err) {
        console.error("Profile Fetch Error:", err);
        toast.error("Failed to fetch organization ID", { position: "top-center" });
      }
    };
    if (TOKEN) fetchProfile();
  }, [TOKEN]);

  // ✅ Fetch roles
  const fetchRoles = async () => {
    if (!TOKEN || !organizationId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/all?organizationId=${organizationId}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();

      // 🧠 Normalize key name if backend uses staffDescription
      const normalized = data.map((r) => ({
        ...r,
        staffDescription: r.staffDescription || r.staffRoleDescription || "",
      }));

      setRoles(normalized.sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error("Fetch Roles Error:", err);
      toast.error("Failed to load roles", { position: "top-center" });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) fetchRoles();
  }, [organizationId]);

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ✅ Add / Update role
  const handleAddOrUpdate = async () => {
    if (!form.staffRoleName || !form.staffDescription) {
      toast.error("Please fill all fields", { position: "top-center" });
      return;
    }

    const duplicate = roles.some(
      (r) =>
        r.staffRoleName.toLowerCase() === form.staffRoleName.toLowerCase() &&
        r.id !== editId
    );
    if (duplicate) {
      toast.error(`Role "${form.staffRoleName}" already exists!`, { position: "top-center" });
      return;
    }

    try {
      const url = editId
        ? `${API_BASE}/update/${editId}?organizationId=${organizationId}`
        : `${API_BASE}/add?organizationId=${organizationId}`;
      const method = editId ? "PUT" : "POST";

      const payload = {
        staffRoleName: form.staffRoleName,
        staffRoleDescription: form.staffDescription, // ✅ backend expects this
      };

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save role");

      await fetchRoles();
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
      console.error("Add/Update Role Error:", err);
      toast.error("Failed to save role", { position: "top-center" });
    }
  };

  // ✅ Delete role
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchRoles();
      toast.success("Role deleted successfully!", { position: "top-center" });
    } catch (err) {
      console.error("Delete Role Error:", err);
      toast.error("Failed to delete role", { position: "top-center" });
    }
  };

  // ✅ Search
  const filteredRoles = roles.filter(
    (r) =>
      r.staffRoleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.staffDescription || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-role-add-page">
      {/* ===== Header ===== */}
      <div className="admin-role-add-header">
        <h2 className="admin-role-add-title">
          <User size={20} /> Role Management
        </h2>
        <button
          className="admin-role-add-btn"
          onClick={() => {
            setForm(initialForm);
            setEditId(null);
            setModalOpen(true);
          }}
          disabled={!organizationId}
        >
          <Plus size={16} /> Add Role
        </button>
      </div>

      {!organizationId && (
        <p className="admin-role-add-warning">
          ⚠️ Organization ID not loaded yet. Please wait...
        </p>
      )}

      {/* ===== Search Bar ===== */}
      <div className="admin-role-add-search">
        <input
          type="search"
          placeholder="Search role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ===== Table ===== */}
      <table className="admin-role-add-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Role Name</th>
            <th>Role Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="admin-role-add-loading">
                Loading roles...
              </td>
            </tr>
          ) : filteredRoles.length === 0 ? (
            <tr>
              <td colSpan={4} className="admin-role-add-empty">
                No roles found.
              </td>
            </tr>
          ) : (
            filteredRoles.map((role, index) => (
              <tr key={role.id}>
                <td>{index + 1}</td>
                <td>{role.staffRoleName}</td>
                <td className="admin-role-add-description">
                  {role.staffDescription || "—"}
                </td>
                <td className="admin-role-add-actions">
                  <button
                    className="admin-role-add-icon admin-role-add-edit"
                    onClick={() => {
                      setForm({
                        staffRoleName: role.staffRoleName,
                        staffDescription: role.staffDescription,
                      });
                      setEditId(role.id);
                      setModalOpen(true);
                    }}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="admin-role-add-icon admin-role-add-delete"
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

      {/* ===== Modal ===== */}
      {modalOpen && (
        <div className="admin-role-add-modal-overlay">
          <div className="admin-role-add-modal">
            <div className="admin-role-add-modal-header">
              <h3>{editId ? "Edit Role" : "Add Role"}</h3>
              <button
                className="admin-role-add-close-btn"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-role-add-modal-body">
              <input
                type="text"
                name="staffRoleName"
                placeholder="Role Name"
                value={form.staffRoleName}
                onChange={handleChange}
              />
              <textarea
                name="staffDescription"
                placeholder="Role Description"
                value={form.staffDescription}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="admin-role-add-modal-footer">
              <button className="admin-role-add-btn" onClick={handleAddOrUpdate}>
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