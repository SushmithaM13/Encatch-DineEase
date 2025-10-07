import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, UserCog } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Usermanagement.css";

export default function AdminStaffManagement() {
  const API_BASE = "http://localhost:8082/dine-ease/api/v1/staff";
  const ROLES_API = "http://localhost:8082/dine-ease/api/v1/staff-role/all";
  const TOKEN = localStorage.getItem("token");

  const initialForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    staffRoleType: "",
    shiftTiming: "",
    salary: "",
    contractStartDate: "",
    contractEndDate: "",
    password: "",
    // status removed from popup, but will still be used internally
    status: "Pending",
  };

  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Staff");

  /** 🧠 Fetch all staff */
  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/all`, {
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();

      const staffData = Array.isArray(data) ? data : Array.isArray(data.content) ? data.content : [];

      const mapped = staffData.map((s) => ({
        id: s.id,
        staffId: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phoneNumber || s.phone,
        staffRoleType: s.staffRoleName || s.staffRoleType,
        shiftTiming: s.shiftTiming,
        salary: s.salary,
        contractStartDate: s.contractStartDate,
        contractEndDate: s.contractEndDate,
        status: s.staffStatus
      }));

      setStaffList(mapped.sort((a, b) => a.staffId - b.staffId));
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  }, [API_BASE, TOKEN]);

  /** 🧠 Fetch all roles */
  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(ROLES_API, { headers: { Authorization: `Bearer ${TOKEN}` } });
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  }, [ROLES_API, TOKEN]);

  useEffect(() => {
    if (TOKEN) {
      fetchStaff();
      fetchRoles();
    }
  }, [TOKEN, fetchStaff, fetchRoles]);

  /** 🧩 Handle Input Change */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** 🧩 Handle Edit */
  const handleEdit = (staff) => {
    setForm({
      ...initialForm,
      ...staff,
      phone: staff.phone || staff.phoneNumber || "",
      staffRoleType: staff.staffRoleType || "",
    });
    setEditId(staff.id);
    setPopupOpen(true);
  };

  /** 🧩 Handle Delete */
  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure to delete this staff?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      toast.success("Staff deleted successfully!", { position: "top-center" });
    } catch (err) {
      console.error("Error deleting staff:", err);
      toast.error("Error deleting staff: " + err.message);
    }
  };

  /** 🧩 Add or Update */
  const handleAddOrUpdate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      ...form,
      salary: Number(form.salary) || 0,
      status: form.status || "Pending", // ensure backend gets this field
    };

    try {
      const url = editId ? `${API_BASE}/update-staff/${editId}` : `${API_BASE}/add`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      /** ✅ Update the UI instantly */
      if (editId) {
        setStaffList((prev) =>
          prev.map((item) => (item.id === editId ? { ...item, ...payload } : item))
        );
      } else {
        await fetchStaff();
      }

      toast.success(editId ? "Staff updated successfully!" : "Staff added successfully!", {
        position: "top-center",
      });

      setForm(initialForm);
      setEditId(null);
      setPopupOpen(false);
    } catch (err) {
      console.error("Error saving staff:", err);
      toast.error("Error saving staff: " + err.message);
    }
  };

  const filteredStaff =
    activeTab === "All Staff"
      ? staffList
      : staffList.filter((s) =>
          activeTab === "Chef"
            ? s.staffRoleType?.toLowerCase().includes("chef")
            : activeTab === "Waiters"
            ? s.staffRoleType?.toLowerCase().includes("waiter")
            : !["chef", "waiter"].some((r) => s.staffRoleType?.toLowerCase().includes(r))
        );

  return (
    <div className="user-management">
      <div className="user-header">
        <h2><UserCog size={26} /> Staff Management</h2>
        <button
          className="add-btn"
          onClick={() => {
            setForm(initialForm);
            setEditId(null);
            setPopupOpen(true);
          }}
        >
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <div className="tab-navigation">
        {["All Staff", "Chef", "Waiters", "Other"].map((tab) => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            <th>SL.NO</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Shift</th>
            <th>Salary</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStaff.length > 0 ? (
            filteredStaff.map((staff, index) => (
              <tr key={staff.id}>
                <td>{index + 1}</td>
                <td>{staff.firstName} {staff.lastName}</td>
                <td>{staff.email}</td>
                <td>{staff.phone}</td>
                <td>{staff.staffRoleType}</td>
                <td>{staff.shiftTiming}</td>
                <td>{staff.salary}</td>
                <td>{staff.contractStartDate ? new Date(staff.contractStartDate).toLocaleDateString() : "-"}</td>
                <td>{staff.contractEndDate ? new Date(staff.contractEndDate).toLocaleDateString() : "-"}</td>
                <td>
                  <span className={`status ${staff.status?.toLowerCase()}`}>{staff.status}</span>
                </td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEdit(staff)}>
                    <Edit size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleRemove(staff.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={11} style={{ textAlign: "center", padding: "20px" }}>No staff found.</td></tr>
          )}
        </tbody>
      </table>

      {popupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>{editId ? "Edit Staff" : "Add Staff"}</h3>
            <form>
              {Object.keys(initialForm)
                .filter((key) => key !== "status") // ✅ removes status field
                .map((key) => {
                  if (key === "staffRoleType") {
                    return (
                      <div className="form-group" key={key}>
                        <label>Role</label>
                        <select name={key} value={form[key]} onChange={handleChange}>
                          <option value="">Select Role</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.staffRoleName}>
                              {role.staffRoleName}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div className="form-group" key={key}>
                      <label>{key.replace(/([A-Z])/g, " $1")}</label>
                      <input
                        type={key.includes("Date") ? "date" : key === "salary" ? "number" : "text"}
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                      />
                    </div>
                  );
                })}
              <div className="form-buttons">
                <button type="button" onClick={() => setPopupOpen(false)}>Cancel</button>
                <button type="button" onClick={handleAddOrUpdate}>
                  {editId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
