/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  UserCog,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./staff.css";

export default function AdminStaffManagement() {
  const API_BASE = "http://localhost:8082/dine-ease/api/v1/staff";
  const ROLES_API = "http://localhost:8082/dine-ease/api/v1/staff-role/all";
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const TOKEN = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

  const initialForm = {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    staffRoleType: "",
    shiftTiming: "",
    salary: "",
    contractStartDate: today, // default to today
    contractEndDate: "",
    password: "",
  };

  const [organizationId, setOrganizationId] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [roleFilter, setRoleFilter] = useState("All");
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  


  // Fetch organizationId
  useEffect(() => {
    const fetchProfile = async () => {
      if (!TOKEN)
        return toast.error("Token missing! Please login.", {
          position: "top-center",
        });
      try {
        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        if (!data.organizationId) throw new Error("Organization ID not found");
        setOrganizationId(data.organizationId);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch organization ID", {
          position: "top-center",
        });
      }
    };
    fetchProfile();
  }, [TOKEN]);

  const formatDate = (arr) => {
    if (!arr || !Array.isArray(arr) || arr.length < 3) return "";
    const [y, m, d] = arr;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  // Fetch staff
  const fetchStaff = async (pageNumber = 0, pageSize = 10) => {
    if (!organizationId || !TOKEN) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/all?organizationId=${organizationId}&pageNumber=${pageNumber}&pageSize=${pageSize}`

        ,
        {
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );
      if (!res.ok) throw new Error(`Failed to fetch staff: ${res.status}`);
      const data = await res.json();

      const staffData = Array.isArray(data.content) ? data.content : [];
      const filteredStaff = staffData.filter(
        (s) => (s.staffRoleName || "").trim().toUpperCase() !== "ADMIN"
      );

      const mappedStaff = filteredStaff.map((s) => ({
        id: s.id,
        firstName: s.firstName || "",
        lastName: s.lastName || "",
        email: s.email || "",
        phoneNumber: s.phoneNumber || "",
        staffRoleType: (s.staffRoleName || "").trim(),
        shiftTiming: s.shiftTiming || "",
        salary: s.salary || 0,
        contractStartDate: Array.isArray(s.contractStartDate)
          ? formatDate(s.contractStartDate)
          : s.contractStartDate || "",
        contractEndDate: Array.isArray(s.contractEndDate)
          ? formatDate(s.contractEndDate)
          : s.contractEndDate || "",
        status: s.staffStatus || "ACTIVE",
      }));

      setStaffList(mappedStaff);
      setPage(data.number || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staff", { position: "top-center" });
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) fetchStaff();
  }, [organizationId]);

// Auto-refresh staff list every 10 seconds to catch activation updates
// useEffect(() => {
//   if (!organizationId) return;
//   const interval = setInterval(() => {
//     fetchStaff(page);
//   }, 10000); // every 10 seconds
//   return () => clearInterval(interval);
// }, [organizationId, page]);

  // Fetch roles
  useEffect(() => {
    if (!organizationId || !TOKEN) return;
    const fetchRoles = async () => {
      try {
        const res = await fetch(
          `${ROLES_API}?organizationId=${organizationId}`,
          {
            headers: { Authorization: `Bearer ${TOKEN}` },
          }
        );
        if (!res.ok) throw new Error(`Failed to fetch roles: ${res.status}`);
        const data = await res.json();
        const filteredRoles = (data || []).filter(
          (r) => (r.staffRoleName || "").trim().toUpperCase() !== "ADMIN"
        );
        setRoles(filteredRoles);
      } catch (err) {
        console.error(err);
        setRoles([]);
      }
    };
    fetchRoles();
  }, [organizationId, TOKEN]);

  // Add or update staff
  const handleAddOrUpdate = async () => {
    if (!organizationId || !TOKEN) return;

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "staffRoleType",
      "shiftTiming",
      "salary",
      "contractStartDate",
      "contractEndDate",
    ];
    for (const field of requiredFields) {
      if (!form[field]) {
        toast.error(`Please fill ${field.replace(/([A-Z])/g, " $1")}`, {
          position: "top-center",
        });
        return;
      }
    }

    if (!editId && !form.password) {
      toast.error("Password is required for new staff", {
        position: "top-center",
      });
      return;
    }

    //  If editing, ask for confirmation first
    if (editId) {
      setConfirmMessage("Are you sure you want to update this staff?");
      setConfirmAction(() => async () => {
        await saveStaff(); // call helper
        setConfirmAction(null);
      });
    } else {
      await saveStaff(); // directly save for add
    }
  };

  const saveStaff = async () => {
    const today = new Date();
    const selectedStart = new Date(form.contractStartDate);
    today.setHours(0, 0, 0, 0);
    selectedStart.setHours(0, 0, 0, 0);

    //  Validate start date only for Add mode
    if (!editId && selectedStart < today) {
      toast.error("Contract start date must be today or in the future.", {
        position: "top-center",
      });
      return;
    }

    //  Common payload: rename phoneNumber → phone
    const payload = {
      organizationId,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phoneNumber, //  Backend expects 'phone'
      staffRoleType: form.staffRoleType,
      shiftTiming: form.shiftTiming,
      salary: Number(form.salary),
      contractEndDate: form.contractEndDate,
    };

    //  Only in Add mode → include password + start date
    if (!editId) {
      payload.contractStartDate = form.contractStartDate;
      payload.password = form.password;
    }

    try {
      const url = editId
        ? `${API_BASE}/update-staff/${editId}`
        : `${API_BASE}/add`;
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
        const errorText = await res.text();
        throw new Error(`Failed to save staff: ${res.status} - ${errorText}`);
      }

      toast.success(
        editId ? "Staff updated successfully!" : "Staff added successfully!",
        { position: "top-center" }
      );

      await fetchStaff(page);
      setForm(initialForm);
      setEditId(null);
      setModalOpen(false);
    } catch (err) {
      console.error("Error while saving staff:", err);
      toast.error(err.message || "Failed to save staff", {
        position: "top-center",
      });
    }
  };



  const handleRemove = (id) => {
    setConfirmMessage("Are you sure you want to delete this staff?");
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(`${API_BASE}/delete/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error(`Failed to delete staff: ${res.status}`);
        await fetchStaff(page);
        toast.success("Staff deleted successfully!", { position: "top-center" });
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete staff", { position: "top-center" });
      } finally {
        setConfirmAction(null);
      }
    });
  };
  const handleEdit = (staff) => {
    setForm({
      firstName: staff.firstName || "",
      lastName: staff.lastName || "",
      email: staff.email || "",
      phoneNumber: staff.phoneNumber || "",
      staffRoleType: staff.staffRoleType || "",
      shiftTiming: staff.shiftTiming || "",
      salary: staff.salary || "",
      contractStartDate: staff.contractStartDate || "",
      contractEndDate: staff.contractEndDate || "",
      password: "", // keep empty on edit
    });
    setEditId(staff.id);
    setModalOpen(true);
  };



  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const filteredStaff = staffList.filter((s) => {
    const role = (s.staffRoleType || "").trim().toLowerCase();
    if (roleFilter === "All") return true;
    if (roleFilter === "Waiter") return role.includes("waiter");
    if (roleFilter === "Chef") return role.includes("chef");
    if (roleFilter === "Accountant") return role.includes("accountant");
    if (roleFilter === "Others")
      return (
        !role.includes("waiter") &&
        !role.includes("chef") &&
        !role.includes("accountant")
      );
    return true;
  });

  return (
    <div className="admin-staff-add-page">
      <h2 className="admin-staff-add-title">
        <UserCog size={22} /> Staff Management
      </h2>

      {!organizationId && (
        <p className="admin-staff-add-warning">⚠️ Loading organization ID...</p>
      )}

      {/* ===== Tabs + Add Staff Button Container ===== */}
      <div className="admin-staff-add-tabs-container">
        <div className="admin-staff-add-tabs">
          {/* Add any tabs if required */}
        </div>
        <div className="admin-staff-add-btn-container">
          <button
            className="admin-staff-add-btn"
            onClick={() => {
              setForm(initialForm);
              setEditId(null);
              setModalOpen(true);
            }}
            disabled={!organizationId}
          >
            <Plus size={16} /> Add Staff
          </button>
        </div>
      </div>

      {/* ===== Confirm Modal ===== */}
      {confirmAction && (
        <div className="admin-staff-add-confirm-overlay">
          <div className="admin-staff-add-confirm-modal">
            <p className="admin-staff-add-confirm-message">{confirmMessage}</p>
            <div className="admin-staff-add-confirm-buttons">
              <button
                className="admin-staff-add-confirm-yes"
                onClick={() => {
                  confirmAction();
                  setConfirmAction(null);
                }}
              >
                Yes
              </button>
              <button
                className="admin-staff-add-confirm-no"
                onClick={() => setConfirmAction(null)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Role Filters ===== */}
      <div className="admin-staff-add-role-filters">
        {["All", "Waiter", "Chef", "Accountant", "Others"].map((role) => (
          <button
            key={role}
            className={`admin-staff-add-filter-btn ${roleFilter === role ? "active" : ""
              }`}
            onClick={() => setRoleFilter(role)}
          >
            {role}
          </button>
        ))}
      </div>

      {/* ===== Staff Table ===== */}
      <table className="admin-staff-add-table">
        <thead>
          <tr>
            <th>Sl. No.</th>
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
          {loading ? (
            <tr>
              <td colSpan="11" className="admin-staff-add-loading">
                Loading staff...
              </td>
            </tr>
          ) : filteredStaff.length > 0 ? (
            filteredStaff.map((s, i) => (
              <tr key={s.id}>
                <td>{String(i+1).padStart(2, "0")}</td>
                <td>{s.firstName + " " + s.lastName}</td>
                <td>{s.email}</td>
                <td>{s.phoneNumber}</td>
                <td>{s.staffRoleType}</td>
                <td>{s.shiftTiming}</td>
                <td>{s.salary}</td>
                <td>{s.contractStartDate}</td>
                <td>{s.contractEndDate}</td>
                <td>
                  <span
                    className={`admin-staff-add-status ${s.status?.toLowerCase() === "active" ? "active" : "inactive"
                      }`}
                  >
                    {s.status}
                  </span>
                </td>

                <td className="admin-staff-add-actions">
                  <button
                    className="admin-staff-add-edit"
                    onClick={() => handleEdit(s)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="admin-staff-add-delete"
                    onClick={() => handleRemove(s.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="admin-staff-add-empty">
                No staff found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ===== Pagination ===== */}
      <div className="admin-staff-add-pagination">
        <button
          onClick={() => fetchStaff(page - 1)}
          disabled={page <= 0}
          className="admin-staff-add-prev"
        >
          <ChevronLeft /> Previous
        </button>
        <span className="admin-staff-add-page-info">
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => fetchStaff(page + 1)}
          disabled={page + 1 >= totalPages}
          className="admin-staff-add-next"
        >
          Next <ChevronRight />
        </button>
      </div>

      {/* ===== Modal ===== */}
{modalOpen && (
  <div className="admin-staff-add-modal-overlay">
    <div className="admin-staff-add-modal">
      <div className="admin-staff-add-modal-header">
        <h3>{editId ? "Edit Staff" : "Add Staff"}</h3>
        <button
          className="admin-staff-add-close-btn"
          onClick={() => setModalOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <div className="admin-staff-add-modal-body">
        {/* Top Row: Name & Email */}
        <div className="admin-staff-form-row">
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
        </div>

        {/* Second Row: Phone & Role */}
        <div className="admin-staff-form-row">
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone"
            value={form.phoneNumber}
            onChange={handleChange}
          />
          <select
            name="staffRoleType"
            value={form.staffRoleType}
            onChange={handleChange}
          >
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.staffRoleName}>
                {r.staffRoleName}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="salary"
            placeholder="Salary"
            value={form.salary}
            onChange={handleChange}
          />
        </div>

        {/* Third Row: Shift & Dates */}
        <div className="admin-staff-form-row">
          <input
            type="text"
            name="shiftTiming"
            placeholder="Shift Timing"
            value={form.shiftTiming}
            onChange={handleChange}
          />

          <div className="admin-staff-form-group">
            <label htmlFor="contractStartDate">Start Date</label>
            <input
              type="date"
              id="contractStartDate"
              name="contractStartDate"
              value={form.contractStartDate}
              onChange={handleChange}
              disabled={!!editId}
            />
          </div>

          <div className="admin-staff-form-group">
            <label htmlFor="contractEndDate">End Date</label>
            <input
              type="date"
              id="contractEndDate"
              name="contractEndDate"
              value={form.contractEndDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Password Row */}
        <div className="admin-staff-form-row">
          <div className="admin-staff-add-password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              disabled={!!editId}
            />
            <button
              type="button"
              className="admin-staff-add-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={!!editId}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-staff-add-modal-footer">
        <button className="admin-staff-add-btn" onClick={handleAddOrUpdate}>
          <Plus size={16} /> {editId ? "Update" : "Add"}
        </button>
      </div>
    </div>
  </div>
)}

      <ToastContainer />
    </div>
  );
}
