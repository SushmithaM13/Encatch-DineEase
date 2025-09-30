import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, UserCog } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Usermanagement.css";

export default function AdminStaffManagement() {
  const API_BASE = "http://localhost:8082/dine-ease/api/v1/staff";
  const ROLES_API = "http://localhost:8082/dine-ease/api/v1/staff-role/all";
  const TOKEN = localStorage.getItem("token");

  if (!TOKEN) console.warn("No token found! Please login first.");

  const initialForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    staffRoleType: "",
    shiftTiming: "",
    salary: 0,
    contractStartDate: "",
    contractEndDate: "",
    password: "",
    status: "Pending",
  };

  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Staff");

  // Persist active IDs
  const [previousActiveIds, setPreviousActiveIds] = useState(() => {
    const stored = localStorage.getItem("activeStaffIds");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("activeStaffIds", JSON.stringify(previousActiveIds));
  }, [previousActiveIds]);

  // Fetch staff
  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/all`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();

      const staffData = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
          ? data.content
          : [];

      const mappedStaff = staffData.map((s) => ({
        id: s.id,
        staffId: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phoneNumber,
        staffRoleType: s.staffRoleName,
        shiftTiming: s.shiftTiming,
        salary: s.salary,
        contractStartDate: s.contractStartDate,
        contractEndDate: s.contractEndDate,
        status: s.staffStatus,
      }));

      // ✅ Ensure ascending order
      setStaffList(mappedStaff.sort((a, b) => a.staffId - b.staffId));

      const newlyActivated = mappedStaff.filter(
        (s) =>
          s.status?.toLowerCase() === "active" &&
          !previousActiveIds.includes(s.id)
      );

      if (newlyActivated.length > 0) {
        newlyActivated.forEach((s) =>
          toast.success(`Staff ${s.firstName} ${s.lastName} activated!`, {
            position: "top-center",
          })
        );
        setPreviousActiveIds((prev) => [
          ...prev,
          ...newlyActivated.map((s) => s.id),
        ]);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
      setStaffList([]);
    }
  }, [API_BASE, TOKEN, previousActiveIds]);

  // Add or Update
  const handleAddOrUpdate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      alert("Please fill all required fields.");
      return;
    }
    const payload = { ...form, salary: Number(form.salary),staffStatus: form.status || "Pending" };
    try {
      let url = `${API_BASE}/add`;
      let method = "POST";
      if (editId) {
        url = `${API_BASE}/update-staff/${editId}`;
        method = "PUT";
      }
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      await fetchStaff();
      setForm(initialForm);
      setEditId(null);
      setPopupOpen(false);

      if (method === "POST") {
        // ✅ Keep ascending order when adding
        setStaffList((prev) =>
          [...prev, data].sort((a, b) => a.staffId - b.staffId)
        );
        toast.info("Staff added! Check email to activate account.", {
          position: "top-center",
        });
      } else {
        toast.success("Staff updated successfully!", { position: "top-center" });
      }
    } catch (err) {
      console.error("Error saving staff:", err);
      alert("Error saving staff: " + err.message);
    }
  };

  // Fetch staff + roles
  useEffect(() => {
    if (TOKEN) fetchStaff();
  }, [TOKEN, fetchStaff]);

  useEffect(() => {
    if (!TOKEN) return;
    const fetchRoles = async () => {
      try {
        const res = await fetch(ROLES_API, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error("Failed to fetch roles");
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setRoles([]);
      }
    };
    fetchRoles();
  }, [TOKEN]);

  useEffect(() => {
    if (!popupOpen && TOKEN) {
      fetchStaff();
    }
  }, [popupOpen, TOKEN, fetchStaff]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (staff) => {
    setForm({ ...initialForm, ...staff });
    setEditId(staff.id);
    setPopupOpen(true);
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure to delete this staff?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchStaff();
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert("Error deleting staff: " + err.message);
    }
  };

  const filteredStaff =
    activeTab === "All Staff"
      ? staffList
      : staffList.filter((s) =>
        activeTab.toLowerCase() === "chef"
          ? s.staffRoleType?.toLowerCase().includes("chef")
          : activeTab.toLowerCase() === "waiters"
            ? s.staffRoleType?.toLowerCase().includes("waiter")
            : !s.staffRoleType?.toLowerCase().includes("chef") &&
            !s.staffRoleType?.toLowerCase().includes("waiter")
      );

  return (
    <div className="user-management">
      <div className="user-header">
        <h2>
          <UserCog size={26} /> Staff Management
        </h2>
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

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Staff ID</th>
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
            filteredStaff.map((staff) => (
              <tr key={staff.id}>
                <td>{staff.staffId}</td>
                <td>
                  {staff.firstName} {staff.lastName}
                </td>
                <td>{staff.email}</td>
                <td>{staff.phone}</td>
                <td>{staff.staffRoleType}</td>
                <td>{staff.shiftTiming}</td>
                <td>{staff.salary}</td>
                <td>{staff.contractStartDate}</td>
                <td>{staff.contractEndDate}</td>
                <td>
                  <span className={`status ${staff.status?.toLowerCase()}`}>
                    {staff.status || "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(staff)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleRemove(staff.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={11} style={{ textAlign: "center", padding: "20px" }}>
                No staff in {activeTab}.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="mobile-user-cards">
        {filteredStaff.length > 0 ? (
          filteredStaff.map((staff) => (
            <div key={staff.id} className="user-card-mobile">
              <div className="user-row user-name-cell">
                <span className="cell-label">Name</span>
                <span className="cell-value">
                  {staff.firstName} {staff.lastName}
                </span>
              </div>
              <div className="user-row">
                <span className="cell-label">Email</span>
                <span className="cell-value">{staff.email}</span>
              </div>
              <div className="user-row">
                <span className="cell-label">Phone</span>
                <span className="cell-value">{staff.phone}</span>
              </div>
              <div className="user-row">
                <span className="cell-label">Role</span>
                <span className="cell-value">{staff.staffRoleType}</span>
              </div>
              <div className="user-row">
                <span className="cell-label">Shift</span>
                <span className="cell-value">{staff.shiftTiming}</span>
              </div>
              <div className="user-row">
                <span className="cell-label">Status</span>
                <span className={`status ${staff.status?.toLowerCase()}`}>
                  {staff.status || "Inactive"}
                </span>
              </div>
              <div className="user-row actions-cell">
                <div className="user-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(staff)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleRemove(staff.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-users-mobile">
            No staff available in {activeTab}.
          </div>
        )}
      </div>

      {/* Popup */}
      {popupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>{editId ? "Edit Staff" : "Add Staff"}</h3>
            <form>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="staffRoleType"
                  value={form.staffRoleType}
                  onChange={handleChange}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.staffRoleName}>
                      {role.staffRoleName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Shift Timing</label>
                <input
                  type="text"
                  name="shiftTiming"
                  value={form.shiftTiming}
                  onChange={handleChange}
                  placeholder="Shift Timing"
                />
              </div>
              <div className="form-group">
                <label>Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="Salary"
                />
              </div>
              <div className="form-group">
                <label>Contract Start</label>
                <input
                  type="date"
                  name="contractStartDate"
                  value={form.contractStartDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Contract End</label>
                <input
                  type="date"
                  name="contractEndDate"
                  value={form.contractEndDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                />
              </div>
              <div className="form-buttons">
                <button type="button" onClick={() => setPopupOpen(false)}>
                  Cancel
                </button>
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
