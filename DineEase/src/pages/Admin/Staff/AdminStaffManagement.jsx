import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, UserCog, X, Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./staff.css";

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
  };

  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Staff");
  const [showPassword, setShowPassword] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).replace(/ /g, "-");
  };

  // ✅ Persist previousActiveIds in localStorage
  const [previousActiveIds, setPreviousActiveIds] = useState(() => {
    const stored = localStorage.getItem("activeStaffIds");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("activeStaffIds", JSON.stringify(previousActiveIds));
  }, [previousActiveIds]);

  // ✅ Fetch Staff
  const fetchStaff = async () => {
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

      const mappedStaff = staffData
  .map((s) => ({
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
  }))
  // 🚫 exclude Admins
  .filter((s) => s.staffRoleType?.toUpperCase() !== "ADMIN")
  // ✅ sort by staffId ascending
  .sort((a, b) => a.staffId - b.staffId);

      





      // ✅ Save in state + localStorage
      setStaffList(mappedStaff);
      localStorage.setItem("staffList", JSON.stringify(mappedStaff));

      // 🔔 Detect newly activated staff only once
      const newlyActivated = mappedStaff.filter(
        (s) =>
          s.status?.toLowerCase() === "active" &&
          !previousActiveIds.includes(s.id)
      );

      if (newlyActivated.length > 0) {
        newlyActivated.forEach((s) => {
          toast.success(
            `Staff ${s.firstName} ${s.lastName} successfully activated!`,
            { position: "top-center" }
          );
        });

        setPreviousActiveIds((prev) => [
          ...prev,
          ...newlyActivated.map((s) => s.id),
        ]);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
      setStaffList([]);
      localStorage.removeItem("staffList"); // clear broken cache
    }
  };

  // ✅ Add or Update Staff
  const handleAddOrUpdate = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = { ...form, salary: Number(form.salary) };

    try {
      let url = `${API_BASE}/add`;
      let method = "POST"; // default for adding

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

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save staff");
      }

      await res.json();
      await fetchStaff(); // refresh list + localStorage

      setForm(initialForm);
      setEditId(null);
      setModalOpen(false);

      if (method === "POST") {
        toast.info("Staff added! Check email to activate account.", {
          position: "top-center",
        });
      } else {
        toast.success("Staff updated successfully!", {
          position: "top-center",
        });
      }
    } catch (err) {
      console.error("Error saving staff:", err);
      alert("Error saving staff: " + err.message);
    }
  };

  // ✅ Fetch Staff + Roles on load
  useEffect(() => {
    if (TOKEN) fetchStaff();
  }, [TOKEN]);

  useEffect(() => {
    if (!TOKEN) return;
    const fetchRoles = async () => {
      try {
        const res = await fetch(ROLES_API, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEdit = (staff) => {
    setForm({ ...initialForm, ...staff });
    setEditId(staff.id);
    setModalOpen(true);
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete staff");
      }

      await fetchStaff(); // refresh list + localStorage
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert("Error deleting staff: " + err.message);
    }
  };

  const filteredStaff =
    activeTab === "All Staff"
      ? staffList
      : staffList.filter((s) => {
        const role = s.staffRoleType?.toLowerCase() || "";

        if (activeTab.toLowerCase() === "chef") return role.includes("chef");
        if (activeTab.toLowerCase() === "waiters") return role.includes("waiter");
        if (activeTab.toLowerCase() === "accountant") return role.includes("accountant");

        // "Other" tab: anything that is not chef, waiter, accountant
        return !role.includes("chef") && !role.includes("waiter") && !role.includes("accountant");
      });


  return (
    <div className="staff-page">
      <h2 className="page-title">
        <UserCog size={22} /> Staff Management
      </h2>

      <div className="tabs-add-container">
        <div className="staff-tabs">
          {["All Staff", "Chef", "Waiters", "Accountant", "Other"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          className="add-btn"
          onClick={() => {
            setForm(initialForm);
            setEditId(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Staff Table */}
      <table className="staff-table">
        <thead>
          <tr>
            <th>Sl. No.</th> 
            <th>Staff ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Shift</th>
            <th>Salary</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStaff.length > 0 ? (
            filteredStaff.map((staff, index) => (
              <tr key={staff.id || index}>
                <td>{index + 1}</td>
                <td>{staff.staffId}</td>
                <td>
                  {staff.firstName} {staff.lastName}
                </td>
                <td>{staff.email}</td>
                <td>{staff.phone}</td>
                <td>{staff.staffRoleType}</td>
                <td>{staff.shiftTiming}</td>
                <td>{staff.salary}</td>
                <td>{formatDate(staff.contractStartDate)}</td>
                <td>{formatDate(staff.contractEndDate)}</td>

                <td>
                  <span
                    className={`status ${staff.status?.toLowerCase() || ""}`}
                  >
                    {staff.status || "Inactive"}
                  </span>
                </td>
                <td className="action-icons">
  <button
    className="icon-btn edit"
    onClick={() => handleEdit(staff)}
    title="Edit"
  >
    <Edit size={16} />
  </button>
  <button
    className="icon-btn delete"
    onClick={() => handleRemove(staff.id)}
    title="Remove"
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

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editId ? "Edit Staff" : "Add Staff"}</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
              />
              <select
                name="staffRoleType"
                value={form.staffRoleType}
                onChange={handleChange}
              >
                <option value="">Select Role</option>
                {roles.map((role, index) => (
                  <option key={role.id || index} value={role.staffRoleName}>
                    {role.staffRoleName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="shiftTiming"
                placeholder="Shift Timing"
                value={form.shiftTiming}
                onChange={handleChange}
              />
              <input
                type="number"
                name="salary"
                placeholder="Salary"
                value={form.salary}
                onChange={handleChange}
              />
              <input
                type="date"
                name="contractStartDate"
                value={form.contractStartDate}
                onChange={handleChange}
              />
              <input
                type="date"
                name="contractEndDate"
                value={form.contractEndDate}
                onChange={handleChange}
              />
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div> {/* <-- This was missing! modal-body closing */}
            <div className="modal-footer">
              <button className="add-btn" onClick={handleAddOrUpdate}>
                <Plus size={16} /> {editId ? "Update Staff" : "Add Staff"}
              </button>
            </div>

          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
