/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import {
  Sofa,
  Plus,
  X,
  User,
  QrCode,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./tables.css";

export default function AdminTableManagement() {
  const API_BASE = "http://localhost:8082/dine-ease/api/v1";
  const TOKEN = localStorage.getItem("token");
  const PROFILE_API = `${API_BASE}/staff/profile`;
  const WAITER_API = `${API_BASE}/staff/all`;
  const TABLE_GET_ALL_API = `${API_BASE}/restaurant-tables/all`;
  const TABLE_ADD_API = `${API_BASE}/restaurant-tables/add`;
  const TABLE_UPDATE_API = `${API_BASE}/restaurant-tables/update`;
  const TABLE_DELETE_API = `${API_BASE}/restaurant-tables`;
  const ASSIGN_WAITER_API = `${API_BASE}/waiter-table-assignments/assign`;
  const WAITER_UPDATE_API = `${API_BASE}/waiter-table-assignments/update`;
  const WAITER_REMOVE_API = `${API_BASE}/waiter-table-assignments/remove`;
  const QR_GENERATE_API = `${API_BASE}/qr-code/generate-qr-code`;
  const QR_GET_API = `${API_BASE}/qr-code/get-qr-code-image`;
  const QR_DELETE_API = `${API_BASE}/qr-code/delete-qr-code`;
  const [organizationId, setOrganizationId] = useState("");
  const [tables, setTables] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [staffMap, setStaffMap] = useState({});
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showWaiterPopup, setShowWaiterPopup] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [qrLoading, setQrLoading] = useState({});
  const [qrData, setQrData] = useState(null);
  const [qrStatus, setQrStatus] = useState({});
  const [selectedTableForDelete, setSelectedTableForDelete] = useState(null);
  const [showRemoveWaiterPopup, setShowRemoveWaiterPopup] = useState({ visible: false, tableNumber: null, waiters: [] });
  const [selectedWaitersToRemove, setSelectedWaitersToRemove] = useState([]);
  const [editTable, setEditTable] = useState(null);
  const [showTableDeletePopup, setShowTableDeletePopup] = useState(false);
  const [showQRDeletePopup, setShowQRDeletePopup] = useState(false);

  const [newTable, setNewTable] = useState({
    tableNumber: "",
    tableStatus: "AVAILABLE",
    capacity: 1,
    section: "",
    locationDescription: "",
  });

  const [waiterData, setWaiterData] = useState({
    waiterEmail: "",
    tableNumber: "",
  });
  // ---------------- FETCH ORGANIZATION ----------------
  useEffect(() => {
    const fetchProfile = async () => {
      if (!TOKEN) return toast.error("Token missing! Please login.", { position: "top-center" });
      try {
        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        if (!data.organizationId) throw new Error("Organization ID not found");
        setOrganizationId(data.organizationId.trim());
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch organization ID", { position: "top-center" });
      }
    };
    fetchProfile();
  }, [TOKEN]);

  // ---------------- FETCH TABLES ----------------
  const fetchTables = async () => {
    if (!organizationId || !TOKEN) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${TABLE_GET_ALL_API}/${organizationId}?page=0&size=50&sortBy=id&sortDir=desc`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch tables");
      const data = await res.json();
      const tablesList = data.content || data || [];
      setTables(tablesList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tables", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [organizationId, TOKEN]);

  // ---------------- FETCH WAITERS ----------------
  useEffect(() => {
    if (!organizationId || !TOKEN) return;
    const fetchWaiters = async () => {
      try {
        const res = await fetch(`${WAITER_API}?organizationId=${organizationId}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        const data = await res.json();
        const waiterList = (data.content || []).filter(
          (w) => (w.staffRoleName || "").toLowerCase() === "waiter"
        );
        setWaiters(waiterList);
      } catch (err) {
        console.error("Failed to fetch waiters", err);
      }
    };
    fetchWaiters();
  }, [organizationId, TOKEN]);

  useEffect(() => {
    const fetchQrStatus = async () => {
      if (!organizationId || !TOKEN) return;

      const status = {};
      for (const t of tables) {
        try {
          const res = await fetch(
            `${QR_GET_API}?tableNumber=${t.tableNumber}&organizationId=${organizationId}`,
            {
              headers: {
                Authorization: `Bearer ${TOKEN}`,
                Accept: "image/png",
              },
            }
          );

          if (res.status === 403) {
            console.warn(`403 Forbidden for table ${t.tableNumber}`);
            status[t.tableNumber] = false;
            continue;
          }

          status[t.tableNumber] = res.ok;
        } catch (err) {
          console.error(`QR fetch failed for ${t.tableNumber}:`, err);
          status[t.tableNumber] = false;
        }
      }

      setQrStatus(status);
    };

    if (tables.length > 0 && organizationId) fetchQrStatus();
  }, [tables, organizationId, TOKEN]);
  // ---------------- FETCH STAFF MAP ----------------
  const fetchStaff = async () => {
    if (!organizationId || !TOKEN) return;
    try {
      const res = await fetch(`${API_BASE}/staff/all?organizationId=${organizationId}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      const data = await res.json();
      const map = {};
      (data.content || []).forEach(s => {
        map[s.email] = s.firstName + " " + s.lastName;
      });
      setStaffMap(map);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { fetchStaff(); }, [organizationId, TOKEN]);

  // ---------------- FETCH WAITER ASSIGNMENTS ----------------
  const fetchWaiterAssignments = async () => {
    if (!organizationId || !TOKEN) return;
    try {
      const res = await fetch(
        `${API_BASE}/waiter-table-assignments/all?organizationId=${organizationId}&page=0&size=50&sortBy=id&sortDir=desc`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch waiter assignments");
      const data = await res.json();
      setAssignments(data.content || data || []);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchTables();
    fetchWaiterAssignments();
  }, [organizationId, TOKEN]);

  // ---------------- TABLE ACTIONS ----------------
  const handleAddTable = async () => {
    if (!newTable.tableNumber.trim()) return toast.error("Please enter Table Number", { position: "top-center" });
    try {
      const payload = { ...newTable, organizationId };
      const res = await fetch(TABLE_ADD_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add table");
      }
      toast.success("Table added successfully!", { position: "top-center" });
      setShowAddPopup(false);
      setNewTable({ tableNumber: "", tableStatus: "AVAILABLE", capacity: 1, section: "", locationDescription: "" });
      fetchTables();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add table: " + err.message, { position: "top-center" });
    }
  };
  const handleEditSave = async () => {
    if (!editTable?.id) {
      toast.error("Table ID missing!", { position: "top-center" });
      return;
    }

    try {
      const payload = {
        organizationId,
        tableNumber: editTable.tableNumber,
        tableStatus: editTable.tableStatus,
        capacity: editTable.capacity,
        section: editTable.section,
        locationDescription: editTable.locationDescription,
      };

      const res = await fetch(`${TABLE_UPDATE_API}/${editTable.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update table ${editTable.tableNumber}`);
      }

      toast.success(`✅ Table ${editTable.tableNumber} updated successfully!`, {
        position: "top-center",
      });

      setShowEditPopup(false);
      fetchTables();
    } catch (err) {
      console.error("Table update failed:", err);
      toast.error("Failed to update table: " + err.message, { position: "top-center" });
    }
  };
 const handleDeleteTable = async () => {
  if (!selectedTable?.id || !organizationId) {
    toast.error("Missing table or organization info");
    return;
  }

  try {
    const url = `${TABLE_DELETE_API}/${selectedTable.id}?organizationId=${organizationId}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to delete table");
    }

    setTables((prev) => prev.filter((t) => t.id !== selectedTable.id));
    toast.success(`✅ Table ${selectedTable.tablenumber} deleted successfully!`);
  } catch (err) {
    console.error("Error deleting table:", err);
    toast.error(err.message);
  }
};




  // ---------------- QR ACTIONS ----------------
  const handleGenerateQr = async (tableNumber) => {
    if (!tableNumber || !organizationId) return toast.error("Missing Table Number or Org ID", { position: "top-center" });
    setQrLoading((prev) => ({ ...prev, [tableNumber]: true }));
    try {
      const res = await fetch(QR_GENERATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ tableNumber, organizationId }),
      });
      if (!res.ok) throw new Error("QR generation failed");
      toast.success("QR code generated successfully!", { position: "top-center" });
      setQrStatus(prev => ({ ...prev, [tableNumber]: true }));

    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR: " + err.message);
    } finally {
      setQrLoading((prev) => ({ ...prev, [tableNumber]: false }));
    }
  };

  const handleViewQr = async (tableNumber) => {
    if (!tableNumber || !organizationId) return toast.error("Missing Table Number or Org ID", { position: "top-center" });
    setQrLoading((prev) => ({ ...prev, [tableNumber]: true }));
    try {
      const res = await fetch(`${QR_GET_API}?tableNumber=${tableNumber}&organizationId=${organizationId}`, {
        headers: { Authorization: `Bearer ${TOKEN}`, Accept: "image/png" },
      });
      if (!res.ok) {
        if (res.status === 404) return toast.error("QR not found for this table", { position: "top-center" });
        throw new Error("Failed to fetch QR: " + res.status);
      }
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      setQrData({ tableNumber, organizationId, imageUrl });
      setShowQrPopup(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to view QR: " + err.message, { position: "top-center" });
    } finally {
      setQrLoading((prev) => ({ ...prev, [tableNumber]: false }));
    }
  };
  const handleDeleteQr = async (tableNumber) => {
    if (!organizationId || !tableNumber) {
      return toast.error("Missing Organization ID or Table Number", {
        position: "top-center",
      });
    }

    if (!window.confirm(`Are you sure you want to delete QR for Table ${tableNumber}?`))
      return;

    try {
      // ✅ Corrected endpoint — removed extra "delete-qr-code"
      const res = await fetch(
        `${QR_DELETE_API}/${organizationId}/${tableNumber}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${TOKEN}` },
        }
      );

      if (res.status === 404) {
        toast.warn(`QR for Table ${tableNumber} not found!`, { position: "top-center" });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete QR");
      }

      toast.success(`✅ QR for Table ${tableNumber} deleted successfully!`, {
        position: "top-center",
      });

      setShowQrPopup(false);
      setQrStatus((prev) => ({ ...prev, [tableNumber]: false }));
    } catch (err) {
      console.error("QR delete failed:", err);
      toast.error("Failed to delete QR: " + err.message, { position: "top-center" });
    }
  };
  // ---------------- WAITER ACTIONS ----------------
  const handleAssignWaiter = async (waiterEmail, tableNumber, update = false) => {
    if (!waiterEmail || !tableNumber) {
      return toast.error("Incomplete data for assigning waiter", { position: "top-center" });
    }

    try {
      const payload = {
        waiterEmail,
        tableNumber: tableNumber.toString(),
        organizationId, // ✅ include this
      };

      const url = update
        ? `${WAITER_UPDATE_API}?organizationId=${organizationId}`
        : `${ASSIGN_WAITER_API}?organizationId=${organizationId}`;


      const res = await fetch(url, {
        method: update ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to assign/update waiter");
      }

      toast.success(update ? "Waiter updated successfully!" : "Waiter assigned successfully!", { position: "top-center" });
      await fetchWaiterAssignments();
      setShowWaiterPopup(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message, { position: "top-center" });
    }
  };
  const handleRemoveSelectedWaiters = async () => {
    if (!selectedWaitersToRemove.length)
      return toast.error("Select at least one waiter", { position: "top-center" });

    try {
      for (const email of selectedWaitersToRemove) {
        const assignment = assignments.find(
          (a) =>
            a.waiterEmail === email &&
            a.tableNumber === showRemoveWaiterPopup.tableNumber
        );
        if (!assignment) continue;

        const res = await fetch(
          `${WAITER_REMOVE_API}?organizationId=${organizationId}&email=${encodeURIComponent(email)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${TOKEN}` },
          }
        );
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to remove waiter: ${email}`);
        }
      }
      toast.success("Selected waiter(s) removed successfully!", {
        position: "top-center",
      });
      await fetchWaiterAssignments();
      setShowRemoveWaiterPopup({ visible: false, tableNumber: null, waiters: [] });
      setSelectedWaitersToRemove([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove waiter(s): " + err.message, {
        position: "top-center",
      });
    }
  };
  // ---------------- UI ----------------
  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  return (
    <div className="admin-tables-page">
      <h2 className="admin-page-title"><Sofa size={22} /> Table Management</h2>

      <div className="admin-add-table-section admin-right-align">
        <button onClick={() => setShowAddPopup(true)}><Plus size={16} /> Add Table</button>
      </div>
      <div className="admin-stats">
        <p>Total: {tables.length}</p>
        <p>Available: {tables.filter((t) => t.tableStatus === "AVAILABLE").length}</p>
        <p>Booked: {tables.filter((t) => t.tableStatus === "BOOKED").length}</p>
        <p>Cleaning: {tables.filter((t) => t.tableStatus === "CLEANING").length}</p>
      </div>
      <div className="admin-tables-grid">
        {tables.map((table) => (
          <div
            key={table.id || table.tableNumber}
            className={`admin-table-card ${table.tableStatus?.toLowerCase() === "available"
              ? "status-available"
              : table.tableStatus?.toLowerCase() === "booked"
                ? "status-booked"
                : table.tableStatus?.toLowerCase() === "cleaning"
                  ? "status-cleaning"
                  : ""
              }`}
          >

            <div className="admin-table-card-header">
              <h3>Table {table.tableNumber}</h3>
              <div className="admin-actions">
                <button onClick={() => { setEditTable(table); setShowEditPopup(true); }}><Edit size={16} /></button>
                <button
                  onClick={() => {
                    setSelectedTable({ id: table.id, tablenumber: table.tableNumber });
                    setShowTableDeletePopup(true);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p><strong>Status:</strong> {table.tableStatus || "—"}</p>
            <p><strong>Capacity:</strong> {table.capacity || "—"}</p>
            <p><strong>Section:</strong> {table.section?.trim() || "—"}</p>
            <p><strong>Location:</strong> {table.locationDescription || "—"}</p>
            <div className="admin-qr-section">
              <h4><QrCode size={16} /> QR Management</h4>
              {!qrStatus[table.tableNumber] ? (
                <button
                  onClick={() => handleGenerateQr(table.tableNumber)}
                  disabled={qrLoading[table.tableNumber]}
                >
                  {qrLoading[table.tableNumber] ? "Generating..." : "Generate QR"}
                </button>
              ) : (
                <button
                  onClick={() => handleViewQr(table.tableNumber)}
                  disabled={qrLoading[table.tableNumber]}
                >
                  View QR
                </button>
              )}
            </div>
            {/* {showTableDeletePopup && (
              <div className="admin-table-popup-overlay">
                <div className="admin-table-popup-box">
                  <h2>Confirm Delete</h2>
                  <p>Are you sure you want to delete Table {selectedTable.number}?</p>
                  <div className="admin-table-popup-buttons">
                    <button onClick={handleDeleteTable} className="admin-table-popup-btn admin-table-delete">Delete</button>
                    <button onClick={() => setShowTableDeletePopup(false)} className="admin-table-popup-btn admin-table-cancel">Cancel</button>
                  </div>
                </div>
              </div>
            )} */}

            <div className="admin-waiter-section">
              <h4><User size={16} /> Waiter Assignment</h4>
              <p>{assignments.filter(a => a.tableNumber === table.tableNumber).map(a => staffMap[a.waiterEmail] || a.waiterEmail).join(", ") || "—"}</p>

              <button
                onClick={() => {
                  const assignedWaiters = assignments
                    .filter((a) => a.tableNumber === table.tableNumber)
                    .map((a) => a.waiterEmail);


                  setWaiterData({
                    waiterEmail: assignedWaiters[0] || "",
                    tableNumber: table.tableNumber
                  });
                  setShowWaiterPopup(true);
                }}
              >
                {Array.isArray(assignments) &&
                  assignments.filter((a) => a.tableNumber === table.tableNumber).length > 0
                  ? "Update Waiters"
                  : "Assign Waiters"}
              </button>
              {assignments.filter(a => a.tableNumber === table.tableNumber).length > 0 && (
                <button
                  onClick={() => {
                    const assignedWaiters = assignments
                      .filter(a => a.tableNumber === table.tableNumber)
                      .map(a => a.waiterEmail);
                    setShowRemoveWaiterPopup({ visible: true, tableNumber: table.tableNumber, waiters: assignedWaiters });
                    setSelectedWaitersToRemove([]);
                  }}
                  style={{ marginLeft: "8px" }}
                >
                  Remove Waiter
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {showRemoveWaiterPopup.visible && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button
              className="admin-popup-close"
              onClick={() =>
                setShowRemoveWaiterPopup({ visible: false, tableNumber: null, waiters: [] })
              }
            >
              <X size={18} />
            </button>
            <h3>Remove Waiter(s) from Table {showRemoveWaiterPopup.tableNumber}</h3>
            {showRemoveWaiterPopup.waiters?.length > 0 ? (
              <div className="admin-waiter-checkbox-list" style={{ marginTop: "10px" }}>
                {showRemoveWaiterPopup.waiters.map(email => (
                  <label key={email} style={{ display: "block", marginBottom: "6px" }}>
                    <input
                      type="checkbox"
                      value={email}
                      checked={selectedWaitersToRemove.includes(email)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedWaitersToRemove(prev =>
                          checked
                            ? [...prev, email]
                            : prev.filter(w => w !== email)
                        );
                      }}
                    />{" "}
                    {staffMap[email] || email}
                  </label>
                ))}
              </div>
            ) : (
              <p>No waiters assigned to this table.</p>
            )}
            <div className="admin-popup-actions" style={{ marginTop: "12px" }}>
              <button
                onClick={handleRemoveSelectedWaiters}
                disabled={selectedWaitersToRemove.length === 0}
              >
                Remove Selected
              </button>
              <button
                onClick={() =>
                  setShowRemoveWaiterPopup({ visible: false, tableNumber: null, waiters: [] })
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------- Add / Edit Table Popups ---------- */}
      {showAddPopup && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button className="admin-popup-close" onClick={() => setShowAddPopup(false)}><X size={18} /></button>
            <h3>Add New Table</h3>
            <label>Table Number: <input type="text" value={newTable.tableNumber} onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })} /></label>
            <label>Status:
              <select value={newTable.tableStatus} onChange={(e) => setNewTable({ ...newTable, tableStatus: e.target.value })}>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BOOKED">BOOKED</option>
                <option value="CLEANING">CLEANING</option>
              </select>
            </label>
            <label>Capacity: <input type="number" min="1" value={newTable.capacity} onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })} /></label>
            <label>Section: <input type="text" value={newTable.section} onChange={(e) => setNewTable({ ...newTable, section: e.target.value })} /></label>
            <label>Location: <textarea value={newTable.locationDescription} onChange={(e) => setNewTable({ ...newTable, locationDescription: e.target.value })} /></label>
            <button onClick={handleAddTable}>Add Table</button>
          </div>
        </div>
      )}

      {showEditPopup && editTable && (
  <div className="admin-popup-overlay">
    <div className="admin-popup">
      <button className="admin-popup-close" onClick={() => setShowEditPopup(false)}>
        <X size={18} />
      </button>
      <h3>Edit Table</h3>
      
      {/* Table Number (disabled) */}
      <label>
        Table Number: 
        <input 
          type="text" 
          value={editTable.tableNumber} 
          disabled  // ✅ Disable editing
        />
      </label>

      <label>Status:
        <select value={editTable.tableStatus} onChange={(e) => setEditTable({ ...editTable, tableStatus: e.target.value })}>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="BOOKED">BOOKED</option>
          <option value="CLEANING">CLEANING</option>
        </select>
      </label>

      <label>Capacity: 
        <input 
          type="number" 
          min="1" 
          value={editTable.capacity} 
          onChange={(e) => setEditTable({ ...editTable, capacity: Number(e.target.value) })} 
        />
      </label>

      <label>Section: 
        <input 
          type="text" 
          value={editTable.section} 
          onChange={(e) => setEditTable({ ...editTable, section: e.target.value })} 
        />
      </label>

      <label>Location: 
        <textarea 
          value={editTable.locationDescription} 
          onChange={(e) => setEditTable({ ...editTable, locationDescription: e.target.value })} 
        />
      </label>


      <button
        onClick={() => setShowConfirmPopup(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        Save Changes
      </button>
    </div>
  </div>
)}


      {/* ---------- Edit Confirmation Popup ---------- */}
      {showConfirmPopup && (
        <div className="admin-table-popup-overlay">
          <div className="admin-table-popup-box">
            <h2>Confirm Update</h2>
            <p>
              Are you sure you want to save changes for{" "}
              <b>{editTable.tableNumber}</b>?
            </p>
            <div className="admin-table-popup-buttons">
              <button
                className="admin-table-popup-btn admin-table-confirm"
                onClick={() => {
                  setShowConfirmPopup(false);
                  handleEditSave();
                }}
              >
                Yes, Save
              </button>
              <button
                className="admin-table-popup-btn admin-table-cancel"
                onClick={() => setShowConfirmPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="admin-success-overlay">
          <div className="admin-success-box">
            <h2>✅ Table Updated!</h2>
            <p>{editTable.tableNumber} updated successfully.</p>
            <button onClick={() => setShowSuccessPopup(false)}>OK</button>
          </div>
        </div>
      )}

      {/* ---------- Delete Table Confirmation Popup ---------- */}
      {showTableDeletePopup && selectedTable && (
  <div className="delete-popup-overlay">
    <div className="delete-popup-box">
      <h2>Delete Table {selectedTable.tablenumber}?</h2>
      <p>This will also remove its QR and waiter assignments. Are you sure?</p>

      <div className="delete-popup-actions">
        <button
          onClick={() => setShowTableDeletePopup(false)}  // ✅ FIXED
          disabled={isDeleting}
          className="cancel-btn"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            setIsDeleting(true);
            await handleDeleteTable();
            setIsDeleting(false);
            setShowTableDeletePopup(false);  // ✅ CLOSE AFTER DELETE
          }}
          disabled={isDeleting}
          className="delete-btn"
        >
          {isDeleting ? "Deleting..." : "Confirm Delete"}
        </button>
      </div>
    </div>
  </div>
)}

      {/* ---------- Assign / Remove Waiter Popups ---------- */}
      {showWaiterPopup && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button
              className="admin-popup-close"
              onClick={() => setShowWaiterPopup(false)}
            >
              <X size={18} />
            </button>

            <h3>Assign Waiter</h3>
            <p>Table Number: <strong>{waiterData.tableNumber}</strong></p>

            <label>
              Select Waiter:
              <select
                value={waiterData.waiterEmail}
                onChange={(e) =>
                  setWaiterData({ ...waiterData, waiterEmail: e.target.value })
                }
              >
                <option value="">Select Waiter</option>
                {waiters.map((waiter) => (
                  <option key={waiter.email} value={waiter.email}>
                    {waiter.firstName
                      ? `${waiter.firstName} ${waiter.lastName || ""}`
                      : waiter.email}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-popup-actions">
              <button
                onClick={() =>
                  handleAssignWaiter(
                    waiterData.waiterEmail,
                    waiterData.tableNumber,
                    false
                  )
                }
                disabled={!waiterData.waiterEmail}
              >
                Assign
              </button>
              <button onClick={() => setShowWaiterPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}


      {/* ---------- QR POPUP ---------- */}
      {showQrPopup && qrData && (
        <div className="admin-qr-popup-overlay">
          <div className="admin-qr-popup-card">
            {/* Close Button */}
            <button
              className="admin-qr-popup-close"
              onClick={() => setShowQrPopup(false)}
            >
              <X size={20} />
            </button>

            {/* Popup Title */}
            <h5 className="admin-qr-popup-title">
              QR Code for Table {qrData.tableNumber}
            </h5>

            {/* QR Image and Actions */}
            {qrData.imageUrl ? (
              <>
                <img
                  src={qrData.imageUrl}
                  alt={`QR for Table ${qrData.tableNumber}`}
                  className="admin-qr-popup-image"
                />

                <div className="admin-qr-popup-actions">
                  {/* Download QR */}
                  <a
                    href={qrData.imageUrl}
                    download={`Table-${qrData.tableNumber}-QR.png`}
                    className="admin-qr-btn download"
                  >
                    <Download size={16} style={{ marginRight: "6px" }} /> Download QR
                  </a>

                  {/* Delete QR */}
                  <button
                    onClick={() => {
                      setSelectedTableForDelete(qrData.tableNumber);
                      setShowQRDeletePopup(true);
                    }}
                    className="admin-qr-btn delete"
                  >
                    <Trash2 size={16} style={{ marginRight: "6px" }} /> Delete QR
                  </button>

                </div>
              </>
            ) : (
              <p>No QR image found</p>
            )}
          </div>
        </div>
      )}

      {showQRDeletePopup &&  (
        <div className="admin-qr-delete-overlay">
          <div className="admin-qr-delete-card">
            <h4 className="admin-qr-delete-title">
              Confirm Delete
            </h4>
            <p className="admin-qr-delete-text">
              Are you sure you want to delete the QR for Table {selectedTableForDelete}?
            </p>

            <div className="admin-qr-delete-actions">
              <button
                className="admin-qr-btn delete"
                onClick={() => {
                  handleDeleteQr(selectedTableForDelete);
                  setShowQRDeletePopup(false);
                }}
              >
                Yes, Delete
              </button>
              <button
                className="admin-qr-btn cancel"
                onClick={() => setShowQRDeletePopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
