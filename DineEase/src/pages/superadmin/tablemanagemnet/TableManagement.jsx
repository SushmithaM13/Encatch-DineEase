import { useState, useEffect } from "react";
import {
  Sofa,
  Plus,
  Download,
  X,
  User,
  QrCode,
  Edit,
  Trash2,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TableManagement.css";

export default function AdminTableManagement() {
  const TABLES_KEY = "tables";
  const PROFILE_API = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const API_BASE = "http://localhost:8082/dine-ease/api/v1/staff"; // Define your API base for waiters
  const TOKEN = localStorage.getItem("token");

  const [organizationId, setOrganizationId] = useState("");
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showWaiterPopup, setShowWaiterPopup] = useState(false);

  //const [selectedTable, setSelectedTable] = useState(null);
  const [waiters, setWaiters] = useState([]);

  // =========================
  // FORM STATES
  // =========================
  const initialTableState = {
    tableNumber: "",
    tableStatus: "AVAILABLE",
    capacity: 1,
    section: "",
    locationDescription: "",
    organizationId: "",
    qrCodeUrl: "",
    waiterEmail: "",
  };

  const [newTable, setNewTable] = useState(initialTableState);
  const [editTable, setEditTable] = useState(initialTableState);
  const [qrData, setQrData] = useState({ organizationId: "", tableNumber: "" });
  const [waiterData, setWaiterData] = useState({ waiterEmail: "", tableNumber: "" });

  // =========================
  // FETCH ORGANIZATION ID
  // =========================
 useEffect(() => {
  const fetchProfileOrOrg = async () => {
    const role = localStorage.getItem("role");
    const storedOrgId = localStorage.getItem("organizationId");

    if (!TOKEN) {
      toast.error("Token missing! Please login.", { position: "top-center" });
      return;
    }

    if (role === "SUPER_ADMIN" && storedOrgId) {
      console.log("✅ Using SuperAdmin organization ID:", storedOrgId);
      setOrganizationId(storedOrgId);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(PROFILE_API, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setOrganizationId(data.organizationId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch organization ID", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  fetchProfileOrOrg();
}, [TOKEN]);


  // =========================
  // FETCH WAITERS
  // =========================
  useEffect(() => {
    if (organizationId && TOKEN) {
      const fetchWaiters = async () => {
        try {
          const res = await fetch(`${API_BASE}/all?organizationId=${organizationId}`, {
            headers: { Authorization: `Bearer ${TOKEN}` },
          });
          const data = await res.json();
          const waiterList = (data.content || []).filter(
            (s) => (s.staffRoleName || "").toLowerCase() === "waiter"
          );
          setWaiters(waiterList);
        } catch (err) {
          console.error("Failed to fetch waiters", err);
        }
      };
      fetchWaiters();
    }
  }, [organizationId, TOKEN]);

  // =========================
  // LOAD TABLES FROM LOCAL STORAGE
  // =========================
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(TABLES_KEY) || "[]");
    setTables(stored);
  }, []);

  const saveTables = (data) => {
    setTables(data);
    localStorage.setItem(TABLES_KEY, JSON.stringify(data));
  };

  // =========================
  // ADD NEW TABLE
  // =========================
  const handleAddTable = () => {
    if (!newTable.tableNumber.trim()) {
      toast.error("Please enter Table Number", { position: "top-center" });
      return;
    }

    const tableData = {
      ...newTable,
      id: Date.now(),
      organizationId,
    };

    saveTables([...tables, tableData]);
    setShowAddPopup(false);
    setNewTable({ ...initialTableState, organizationId });
  };

  // =========================
  // EDIT TABLE
  // =========================
  const openEditPopup = (table) => {
    setEditTable(table);
    setShowEditPopup(true);
  };

  const handleEditSave = () => {
    const updated = tables.map((t) =>
      t.id === editTable.id ? { ...editTable, organizationId } : t
    );
    saveTables(updated);
    setShowEditPopup(false);
  };

  const handleDeleteTable = (id) => {
    if (!window.confirm("Delete this table?")) return;
    const updated = tables.filter((t) => t.id !== id);
    saveTables(updated);
  };

  // =========================
  // QR MANAGEMENT
  // =========================
  const handleGenerateQr = () => {
    if (!organizationId) {
      toast.error("Organization ID not found in profile.", { position: "top-center" });
      return;
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Org-${organizationId}-Table-${encodeURIComponent(qrData.tableNumber)}`;

    const updated = tables.map((t) =>
      t.tableNumber === qrData.tableNumber ? { ...t, qrCodeUrl: qrUrl } : t
    );
    saveTables(updated);
    setShowQrPopup(false);
  };

  const handleDeleteQr = (tableNumber) => {
    const updated = tables.map((t) =>
      t.tableNumber === tableNumber ? { ...t, qrCodeUrl: "" } : t
    );
    saveTables(updated);
  };

  const handleDownloadQr = async (url, tableNumber) => {
    if (!url) {
      toast.error("QR not generated for this table yet.", { position: "top-center" });
      return;
    }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${tableNumber}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download QR code", { position: "top-center" });
    }
  };

  // =========================
  // WAITER MANAGEMENT
  // =========================
  const handleAssignWaiter = () => {
    if (!waiterData.waiterEmail.trim()) {
      toast.error("Enter Waiter Email", { position: "top-center" });
      return;
    }

    const updated = tables.map((t) =>
      t.tableNumber === waiterData.tableNumber
        ? { ...t, waiterEmail: waiterData.waiterEmail }
        : t
    );
    saveTables(updated);
    setShowWaiterPopup(false);
  };

  const handleDeleteWaiter = (tableNumber) => {
    const updated = tables.map((t) =>
      t.tableNumber === tableNumber ? { ...t, waiterEmail: "" } : t
    );
    saveTables(updated);
  };

  // =========================
  // RENDER UI
  // =========================
  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div className="admin-tables-page">
      <h2 className="admin-page-title">
        <Sofa size={22} /> Table Management
      </h2>

      {!organizationId && <p style={{ color: "red" }}>⚠ Loading organization ID...</p>}

      <div className="admin-add-table-section admin-right-align">
        <button onClick={() => setShowAddPopup(true)}>
          <Plus size={16} /> Add Table
        </button>
      </div>

      <div className="admin-stats">
        <p>Total: {tables.length}</p>
        <p>Available: {tables.filter((t) => t.tableStatus === "AVAILABLE").length}</p>
        <p>Booked: {tables.filter((t) => t.tableStatus === "BOOKED").length}</p>
        <p>Cleaning: {tables.filter((t) => t.tableStatus === "CLEANING").length}</p>
      </div>

      <div className="admin-tables-grid">
        {tables.map((table) => (
          <div key={table.id} className="admin-table-card">
            <div className="admin-table-card-header">
              <h3>{table.tableNumber}</h3>
              <div className="actions">
                <button onClick={() => openEditPopup(table)}>
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDeleteTable(table.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p>Status: {table.tableStatus}</p>
            <p>Capacity: {table.capacity}</p>
            <p>Section: {table.section || "—"}</p>
            <p>Location: {table.locationDescription || "—"}</p>
            <p><strong>Org ID:</strong> {table.organizationId || "—"}</p>

            {/* QR MANAGEMENT */}
            <div className="qr-section">
              <h4><QrCode size={16} /> QR Management</h4>
              {table.qrCodeUrl ? (
                <>
                  <img src={table.qrCodeUrl} alt="QR" className="qr-image" />
                  <div className="qr-actions">
                    <button onClick={() => handleDownloadQr(table.qrCodeUrl, table.tableNumber)}>
                      <Download size={14} /> Download
                    </button>
                    <button onClick={() => handleDeleteQr(table.tableNumber)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    setQrData({ organizationId, tableNumber: table.tableNumber });
                    setShowQrPopup(true);
                  }}
                >
                  Generate QR
                </button>
              )}
            </div>

            {/* WAITER MANAGEMENT */}
            <div className="waiter-section">
              <h4><User size={16} /> Waiter Assignment</h4>
              {table.waiterEmail ? (
                <div>
                  <p>{table.waiterEmail}</p>
                  <div className="waiter-actions">
                    <button
                      onClick={() => {
                        setWaiterData({ waiterEmail: table.waiterEmail, tableNumber: table.tableNumber });
                        setShowWaiterPopup(true);
                      }}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => handleDeleteWaiter(table.tableNumber)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setWaiterData({ waiterEmail: "", tableNumber: table.tableNumber });
                    setShowWaiterPopup(true);
                  }}
                >
                  Assign Waiter
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* =================== POPUPS =================== */}
      {showAddPopup && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button className="admin-popup-close" onClick={() => setShowAddPopup(false)}>
              <X size={18} />
            </button>
            <h3>Add New Table</h3>

            <label>
              Table Number:
              <input
                type="text"
                value={newTable.tableNumber}
                onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
              />
            </label>
            <label>
              Status:
              <select
                value={newTable.tableStatus}
                onChange={(e) => setNewTable({ ...newTable, tableStatus: e.target.value })}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BOOKED">BOOKED</option>
                <option value="CLEANING">CLEANING</option>
              </select>
            </label>
            <label>
              Capacity:
              <input
                type="number"
                min="1"
                value={newTable.capacity}
                onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
              />
            </label>
            <label>
              Section:
              <input
                type="text"
                value={newTable.section}
                onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
              />
            </label>
            <label>
              Location:
              <textarea
                value={newTable.locationDescription}
                onChange={(e) => setNewTable({ ...newTable, locationDescription: e.target.value })}
              />
            </label>

            <p><strong>Organization ID:</strong> {organizationId || "Not Found"}</p>

            <button onClick={handleAddTable}>Save Table</button>
          </div>
        </div>
      )}

      {showEditPopup && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button className="admin-popup-close" onClick={() => setShowEditPopup(false)}>
              <X size={18} />
            </button>
            <h3>Edit Table {editTable.tableNumber}</h3>

            <label>
              Status:
              <select
                value={editTable.tableStatus}
                onChange={(e) => setEditTable({ ...editTable, tableStatus: e.target.value })}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BOOKED">BOOKED</option>
                <option value="CLEANING">CLEANING</option>
              </select>
            </label>
            <label>
              Capacity:
              <input
                type="number"
                min="1"
                value={editTable.capacity}
                onChange={(e) => setEditTable({ ...editTable, capacity: Number(e.target.value) })}
              />
            </label>
            <label>
              Section:
              <input
                type="text"
                value={editTable.section}
                onChange={(e) => setEditTable({ ...editTable, section: e.target.value })}
              />
            </label>
            <label>
              Location:
              <textarea
                value={editTable.locationDescription}
                onChange={(e) => setEditTable({ ...editTable, locationDescription: e.target.value })}
              />
            </label>

            <p><strong>Organization ID:</strong> {organizationId || "Not Found"}</p>

            <button onClick={handleEditSave}>Save Changes</button>
          </div>
        </div>
      )}

      {showQrPopup && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button className="admin-popup-close" onClick={() => setShowQrPopup(false)}>
              <X size={18} />
            </button>
            <h3>Generate QR for Table {qrData.tableNumber}</h3>
            <p>Organization ID: {organizationId}</p>
            <button onClick={handleGenerateQr}>Generate QR</button>
          </div>
        </div>
      )}

      {showWaiterPopup && (
        <div className="admin-popup-overlay">
          <div className="admin-popup">
            <button className="admin-popup-close" onClick={() => setShowWaiterPopup(false)}>
              <X size={18} />
            </button>
            <h3>Assign Waiter for Table {waiterData.tableNumber}</h3>
            <label>
              Waiter Email:
              <select
                value={waiterData.waiterEmail}
                onChange={(e) => setWaiterData({ ...waiterData, waiterEmail: e.target.value })}
              >
                <option value="">Select Waiter</option>
                {waiters.map((w) => (
                  <option key={w.id} value={w.email}>
                    {w.firstName} {w.lastName} ({w.email})
                  </option>
                ))}
              </select>
            </label>
            <button onClick={handleAssignWaiter}>Save Waiter</button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}