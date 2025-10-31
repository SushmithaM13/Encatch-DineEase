import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, UserCog } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Usermanagement.css";

export default function AdminStaffManagement() {
  const API_BASE = "http://localhost:8082/dine-ease/api/v1/staff";
  const ROLES_API = "http://localhost:8082/dine-ease/api/v1/staff-role/all";
  const TOKEN = localStorage.getItem("token");
  const ORG_ID = localStorage.getItem("organizationId");

  if (!TOKEN) console.warn("⚠ No token found! Please login first.");
  if (!ORG_ID) console.warn("⚠ No organizationId found! Please login first.");

  const initialForm = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    staffRoleType: "",
    shiftTiming: "",
    salary: 0,
    contractStartDate: "",
    contractEndDate: "",
    password: "",
    status: "Pending",
    organizationId: ORG_ID || "",
  };

  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Staff");

  const [previousActiveIds, setPreviousActiveIds] = useState(() => {
    const stored = localStorage.getItem("activeStaffIds");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("activeStaffIds", JSON.stringify(previousActiveIds));
  }, [previousActiveIds]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    if (typeof dateValue === "string") return dateValue.substring(0, 10);
    if (Array.isArray(dateValue)) {
      const [y, m, d] = dateValue;
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    try {
      const date = new Date(dateValue);
      return date.toISOString().substring(0, 10);
    } catch {
      return "";
    }
  };

  // ===== Fetch All Staff =====
  const fetchStaff = useCallback(async () => {
    if (!TOKEN || !ORG_ID) return;
    try {
      const res = await fetch(`${API_BASE}/all?organizationId=${ORG_ID}&page=0&size=50`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

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
        phoneNumber: s.phoneNumber || s.phone || "",
        staffRoleType: s.staffRoleName,
        shiftTiming: s.shiftTiming,
        salary: s.salary,
        contractStartDate: formatDate(s.contractStartDate),
        contractEndDate: formatDate(s.contractEndDate),
        status: s.staffStatus,
      }));

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
  }, [API_BASE, TOKEN, ORG_ID, previousActiveIds]);

  // ===== Add / Update Staff =====
  const handleAddOrUpdate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phoneNumber) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!ORG_ID) {
      toast.error("Organization ID missing! Please re-login.");
      return;
    }

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phoneNumber,
      staffRoleType: form.staffRoleType,
      shiftTiming: form.shiftTiming,
      salary: Number(form.salary),
      contractStartDate: form.contractStartDate || null,
      contractEndDate: form.contractEndDate || null,
      staffStatus: form.status || "Pending",
      organizationId: ORG_ID,
    };

    if (!editId && form.password) payload.password = form.password;

    try {
      const url = editId
        ? `${API_BASE}/update-staff/${editId}?organizationId=${ORG_ID}`
        : `${API_BASE}/add?organizationId=${ORG_ID}`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to save staff");
      }


// ✅ Parse backend response for instant UI update
      const newStaff = await res.json();

      // ✅ Add new staff to frontend immediately
      setStaffList((prev) => [
        ...prev,
        {
          id: newStaff.id,
          staffId: newStaff.id,
          firstName: newStaff.firstName,
          lastName: newStaff.lastName,
          email: newStaff.email,
          phoneNumber: newStaff.phoneNumber || newStaff.phone || "",
          staffRoleType: newStaff.staffRoleName || form.staffRoleType,
          shiftTiming: newStaff.shiftTiming,
          salary: newStaff.salary,
          contractStartDate: formatDate(newStaff.contractStartDate),
          contractEndDate: formatDate(newStaff.contractEndDate),
          status: newStaff.staffStatus || "Pending",
        },
      ]);




      await fetchStaff();
      
      setForm(initialForm);
      setEditId(null);
      setPopupOpen(false);

      // ✅ Dispatch event so dashboards/components can refresh automatically
      window.dispatchEvent(new Event("staffUpdated"));

      toast.success(
        method === "POST"
          ? "✅ Staff added successfully!"
          : "✅ Staff updated successfully!",
        { position: "top-center" }
      );
    } catch (err) {
      console.error("Error saving staff:", err);
      toast.error("Error saving staff: " + err.message);
    }
  };

  // ===== Fetch Roles =====
  const fetchRoles = useCallback(async () => {
    if (!TOKEN || !ORG_ID) return;
    try {
      const res = await fetch(`${ROLES_API}?organizationId=${ORG_ID}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Failed to fetch roles");
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setRoles([]);
    }
  }, [ROLES_API, TOKEN, ORG_ID]);

  useEffect(() => {
    if (TOKEN) {
      fetchStaff();
      fetchRoles();
    }
  }, [TOKEN, fetchStaff, fetchRoles]);

  useEffect(() => {
    if (!popupOpen && TOKEN) fetchStaff();
  }, [popupOpen, TOKEN, fetchStaff]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (staff) => {
    setForm({
      ...initialForm,
      ...staff,
      phoneNumber: staff.phoneNumber || staff.phone || "",
    });
    setEditId(staff.id);
    setPopupOpen(true);
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchStaff();
      toast.info("Staff deleted successfully.", { position: "top-center" });
    } catch (err) {
      console.error("Error deleting staff:", err);
      toast.error("Error deleting staff: " + err.message);
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
      {/* Header and Add Button */}
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

      {/* Tabs */}
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
      <div className="table-container">
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
                  <td>{staff.phoneNumber}</td>
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
              <tr>
                <td colSpan={11} style={{ textAlign: "center", padding: "20px" }}>
                  No staff found in {activeTab}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-user-cards">
        {filteredStaff.length > 0 ? (
          filteredStaff.map((staff) => (
            <div key={staff.id} className="user-card-mobile">
              <div className="user-row user-name-cell">
                <span className="cell-label">Name</span>
                <span className="cell-value">{staff.firstName} {staff.lastName}</span>
              </div>
              <div className="user-row"><span className="cell-label">Email</span><span className="cell-value">{staff.email}</span></div>
              <div className="user-row"><span className="cell-label">Phone</span><span className="cell-value">{staff.phone}</span></div>
              <div className="user-row"><span className="cell-label">Role</span><span className="cell-value">{staff.staffRoleType}</span></div>
              <div className="user-row"><span className="cell-label">Shift</span><span className="cell-value">{staff.shiftTiming}</span></div>
              <div className="user-row"><span className="cell-label">Status</span><span className={`status ${staff.status?.toLowerCase()}`}>{staff.status || "Inactive"}</span></div>
              <div className="user-row actions-cell">
                <div className="user-actions">
                  <button className="action-btn edit" onClick={() => handleEdit(staff)}><Edit size={16} /></button>
                  <button className="action-btn delete" onClick={() => handleRemove(staff.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-users-mobile">No staff available in {activeTab}.</div>
        )}
      </div>

      {/* Popup Form */}
      {popupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>{editId ? "Edit Staff" : "Add Staff"}</h3>
            <form>
              {["firstName","lastName","email","phoneNumber"].map((name) => (
                <div className="form-group" key={name}>
                  <label>{name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                  <input type={name==="email"?"email":"text"} name={name} value={form[name]} onChange={handleChange} placeholder={name} />
                </div>
              ))}

              <div className="form-group">
                <label>Role</label>
                <select name="staffRoleType" value={form.staffRoleType} onChange={handleChange}>
                  <option value="">Select Role</option>
                  {roles.map((role) => <option key={role.id} value={role.staffRoleName}>{role.staffRoleName}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Shift Timing</label>
                <input type="text" name="shiftTiming" value={form.shiftTiming} onChange={handleChange} placeholder="Shift Timing" />
              </div>

              <div className="form-group">
                <label>Salary</label>
                <input type="number" name="salary" value={form.salary} onChange={handleChange} placeholder="Salary" />
              </div>

              <div className="form-group">
                <label>Contract Start</label>
                <input type="date" name="contractStartDate" value={form.contractStartDate} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Contract End</label>
                <input type="date" name="contractEndDate" value={form.contractEndDate} onChange={handleChange} />
              </div>

              {!editId && (
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" />
                </div>
              )}

              <div className="form-buttons">
                <button type="button" onClick={() => setPopupOpen(false)}>Cancel</button>
                <button type="button" onClick={handleAddOrUpdate}>{editId ? "Update" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
