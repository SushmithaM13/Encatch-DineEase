import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sofa,
  Plus,
  X,
  User,
  QrCode,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TableManagement.css";

export default function SuperAdminTableManagement() {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:8082/dine-ease/api/v1";
  const TOKEN = localStorage.getItem("token");

  const PROFILE_API = `${API_BASE}/staff/profile`;
  const WAITER_API = `${API_BASE}/staff/all`;
  const TABLE_GET_ALL_API = `${API_BASE}/restaurant-tables/all`;
  const TABLE_ADD_API = `${API_BASE}/restaurant-tables/add`;
  const TABLE_UPDATE_API = `${API_BASE}/restaurant-tables/update`;
  const TABLE_DELETE_API = `${API_BASE}/restaurant-tables/delete`;
  const ASSIGN_WAITER_API = `${API_BASE}/waiter-table-assignments/assign`;
  const WAITER_UPDATE_API = `${API_BASE}/waiter-table-assignments/update`;
  const WAITER_REMOVE_API = `${API_BASE}/waiter-table-assignments/remove`;
  const QR_GENERATE_API = `${API_BASE}/qr-code/generate-qr-code`;
  const QR_GET_API = `${API_BASE}/qr-code/get-qr-code-image`;
  const QR_DELETE_API = `${API_BASE}/qr-code/delete-qr-code`;

  const [organizationId, setOrganizationId] = useState("");
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [staffMap, setStaffMap] = useState({});
  const [_assignedWaiters, setAssignedWaiters] = useState([]);

  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 tables per page

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showWaiterPopup, setShowWaiterPopup] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableForDelete, setSelectedTableForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showRemoveWaiterPopup, setShowRemoveWaiterPopup] = useState({
    visible: false,
    tableNumber: null,
    waiters: [],
  });
  const [selectedWaitersToRemove, setSelectedWaitersToRemove] = useState([]);

  const [qrLoading, setQrLoading] = useState({});
  const [qrData, setQrData] = useState(null);
  const [qrStatus, setQrStatus] = useState({});

  const [newTable, setNewTable] = useState({
    tableNumber: "",
    tableStatus: "AVAILABLE",
    capacity: 1,
    section: "",
    locationDescription: "",
  });

  const [editTable, setEditTable] = useState(null);

  const [waiterData, setWaiterData] = useState({
    waiterEmail: "",
    tableNumber: "",
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTables = tables.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tables.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const orgId = localStorage.getItem("organizationId");
    const role = localStorage.getItem("role");

    if (!TOKEN) {
      toast.error("Unauthorized - please login.", { position: "top-center" });
      navigate("/");
      return;
    }

    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      toast.error("Access denied", { position: "top-center" });
      navigate("/");
      return;
    }

    if (!orgId) {
      toast.warn(
        "Organization ID not found. Please select an organization in SuperAdmin Home.",
        { position: "top-center" }
      );
      setOrganizationId("");
      return;
    }

    setOrganizationId(orgId);
  }, [TOKEN, navigate]);

  const fetchTables = useCallback(
    async (page = 0, size = 100) => {
      if (!organizationId || !TOKEN) return;
      setLoading(true);
      try {
        const res = await fetch(
          `${TABLE_GET_ALL_API}/${organizationId}?page=${page}&size=${size}&sortBy=id&sortDir=desc`,
          {
            headers: { Authorization: `Bearer ${TOKEN}` },
          }
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
    },
    [organizationId, TOKEN, TABLE_GET_ALL_API]
  );

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (!organizationId || !TOKEN) return;
    const fetchWaiters = async () => {
      try {
        const res = await fetch(`${WAITER_API}?organizationId=${organizationId}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        if (!res.ok) throw new Error("Failed to fetch staff");
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
  }, [organizationId, TOKEN, WAITER_API]);

  const fetchStaff = useCallback(async () => {
    if (!organizationId || !TOKEN) return;
    try {
      const res = await fetch(`${API_BASE}/staff/all?organizationId=${organizationId}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();
      const map = {};
      (data.content || []).forEach((s) => {
        map[s.email] = `${s.firstName || ""} ${s.lastName || ""}`.trim();
      });
      setStaffMap(map);
    } catch (err) {
      console.error(err);
    }
  }, [organizationId, TOKEN, API_BASE]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const fetchWaiterAssignments = useCallback(async () => {
    if (!organizationId || !TOKEN) return;
    try {
      const res = await fetch(
        `${API_BASE}/waiter-table-assignments/all?organizationId=${organizationId}&page=0&size=200&sortBy=id&sortDir=desc`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch waiter assignments");
      const data = await res.json();
      setAssignments(data.content || data || []);
    } catch (err) {
      console.error(err);
    }
  }, [organizationId, TOKEN, API_BASE]);

  useEffect(() => {
    fetchWaiterAssignments();
  }, [fetchWaiterAssignments]);

  useEffect(() => {
    const fetchQrStatus = async () => {
      if (!organizationId || !TOKEN || !tables.length) return;
      const status = {};
      await Promise.all(
        tables.map(async (t) => {
          try {
            const res = await fetch(
              `${QR_GET_API}?tableNumber=${t.tableNumber}&organizationId=${organizationId}`,
              {
                headers: { Authorization: `Bearer ${TOKEN}`, Accept: "image/png" },
              }
            );
            status[t.tableNumber] = res.ok;
          } catch (err) {
            console.error("Error checking QR:", err);
            status[t.tableNumber] = false;
          }
        })
      );
      setQrStatus(status);
    };
    fetchQrStatus();
  }, [tables, organizationId, TOKEN, QR_GET_API]);

  const handleAddTable = async () => {
    if (!newTable.tableNumber?.trim()) {
      return toast.error("Please enter Table Number", { position: "top-center" });
    }
    if (!organizationId) {
      return toast.error("Organization ID missing", { position: "top-center" });
    }
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
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to add table");
      }
      toast.success("Table added successfully!", { position: "top-center" });
      setShowAddPopup(false);
      setNewTable({
        tableNumber: "",
        tableStatus: "AVAILABLE",
        capacity: 1,
        section: "",
        locationDescription: "",
      });
      fetchTables();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add table: " + err.message, { position: "top-center" });
    }
  };

  const handleEditSave = async () => {
    if (!editTable?.id) return toast.error("Table ID missing!", { position: "top-center" });

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

      toast.success(`Table ${editTable.tableNumber} updated!`, { position: "top-center" });
      setShowEditPopup(false);
      fetchTables();
    } catch (err) {
      console.error("Table update failed:", err);
      toast.error("Failed to update table: " + err.message, { position: "top-center" });
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable || !organizationId) return;

    setIsDeleting(true);
    try {
      const { id: tableId, number: tableNumber } = selectedTable;

      const res = await fetch(`${TABLE_DELETE_API}/${tableId}/${organizationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      if (res.status === 403) {
        toast.error("Forbidden: you may not have permission to delete this table", {
          position: "top-center",
        });
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to delete table");
      }

      await fetch(`${QR_DELETE_API}/${organizationId}/${tableNumber}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      }).catch(() => {});

      const assignedWaiters = assignments
        .filter((a) => a.tableNumber === tableNumber)
        .map((a) => a.waiterEmail);

      for (const email of assignedWaiters) {
        await fetch(
          `${WAITER_REMOVE_API}?organizationId=${organizationId}&email=${encodeURIComponent(email)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${TOKEN}` },
          }
        ).catch(() => {});
      }

      toast.success(`Table ${tableNumber} deleted successfully!`, { position: "top-center" });
      fetchTables();
      fetchWaiterAssignments();
      setQrStatus((prev) => ({ ...prev, [tableNumber]: false }));
      setShowDeletePopup(false);
      setSelectedTable(null);
    } catch (err) {
      console.error("Table delete failed:", err);
      toast.error("Failed to delete table: " + err.message, { position: "top-center" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateQr = async (tableNumber) => {
    if (!tableNumber || !organizationId) return toast.error("Missing Table Number or Org ID", { position: "top-center" });
    setQrLoading((p) => ({ ...p, [tableNumber]: true }));
    try {
      const res = await fetch(QR_GENERATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ tableNumber, organizationId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "QR generation failed");
      }
      toast.success("QR generated successfully!", { position: "top-center" });
      setQrStatus((p) => ({ ...p, [tableNumber]: true }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR: " + err.message, { position: "top-center" });
    } finally {
      setQrLoading((p) => ({ ...p, [tableNumber]: false }));
    }
  };

  const handleViewQr = async (tableNumber) => {
    if (!tableNumber || !organizationId) return toast.error("Missing Table Number or Org ID", { position: "top-center" });
    setQrLoading((p) => ({ ...p, [tableNumber]: true }));
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
      setQrLoading((p) => ({ ...p, [tableNumber]: false }));
    }
  };

  const handleDeleteQr = async (tableNumber) => {
    if (!organizationId || !tableNumber) {
      return toast.error("Missing Organization ID or Table Number", { position: "top-center" });
    }
    try {
      const res = await fetch(`${QR_DELETE_API}/${organizationId}/${tableNumber}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });

      if (res.status === 404) {
        toast.warn(`QR for Table ${tableNumber} not found!`, { position: "top-center" });
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete QR");
      }

      toast.success(`QR for Table ${tableNumber} deleted!`, { position: "top-center" });
      setShowQrPopup(false);
      setQrStatus((prev) => ({ ...prev, [tableNumber]: false }));
    } catch (err) {
      console.error("QR delete failed:", err);
      toast.error("Failed to delete QR: " + err.message, { position: "top-center" });
    }
  };

  const handleAssignWaiter = async (waiterEmail, tableNumber, update = false) => {
    if (!waiterEmail || !tableNumber) {
      return toast.error("Incomplete data for assigning waiter", { position: "top-center" });
    }

    try {
      const payload = {
        waiterEmail,
        tableNumber: tableNumber.toString(),
        organizationId,
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

      toast.success(update ? "Waiter updated!" : "Waiter assigned!", {
        position: "top-center",
      });
      await fetchWaiterAssignments();
      setShowWaiterPopup(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to assign waiter", { position: "top-center" });
    }
  };

  const handleRemoveSelectedWaiters = async () => {
    if (!selectedWaitersToRemove.length)
      return toast.error("Select at least one waiter", { position: "top-center" });

    try {
      for (const email of selectedWaitersToRemove) {
        const assignment = assignments.find(
          (a) => a.waiterEmail === email && a.tableNumber === showRemoveWaiterPopup.tableNumber
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

      toast.success("Selected waiter(s) removed!", { position: "top-center" });
      await fetchWaiterAssignments();
      setShowRemoveWaiterPopup({ visible: false, tableNumber: null, waiters: [] });
      setSelectedWaitersToRemove([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove waiter(s): " + err.message, { position: "top-center" });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "AVAILABLE":
        return <CheckCircle className="satm-status-icon satm-status-available" />;
      case "BOOKED":
        return <AlertCircle className="satm-status-icon satm-status-booked" />;
      case "CLEANING":
        return <Clock className="satm-status-icon satm-status-cleaning" />;
      default:
        return null;
    }
  };

  if (!organizationId) {
    return (
      <div className="satm-container">
        <div className="satm-header">
          <h1 className="satm-title">
            <Sofa className="satm-title-icon" /> Table Management
          </h1>
        </div>
        <div className="satm-error-message">
          <AlertCircle size={24} />
          <p>Organization ID not found. Please select an organization from SuperAdmin Home.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="satm-loading">Loading tables...</div>;

  return (
    <div className="satm-container">
      <div className="satm-header">
        <h1 className="satm-title">
          <Sofa className="satm-title-icon" /> Table Management
        </h1>
        <button className="satm-add-btn" onClick={() => setShowAddPopup(true)}>
          <Plus size={18} /> Add Table
        </button>
      </div>

      <div className="satm-stats-grid">
        <div className="satm-stat-card satm-stat-total">
          <div className="satm-stat-value">{tables.length}</div>
          <div className="satm-stat-label">Total Tables</div>
        </div>
        <div className="satm-stat-card satm-stat-available">
          <div className="satm-stat-value">{tables.filter((t) => t.tableStatus === "AVAILABLE").length}</div>
          <div className="satm-stat-label">Available</div>
        </div>
        <div className="satm-stat-card satm-stat-booked">
          <div className="satm-stat-value">{tables.filter((t) => t.tableStatus === "BOOKED").length}</div>
          <div className="satm-stat-label">Booked</div>
        </div>
        <div className="satm-stat-card satm-stat-cleaning">
          <div className="satm-stat-value">{tables.filter((t) => t.tableStatus === "CLEANING").length}</div>
          <div className="satm-stat-label">Cleaning</div>
        </div>
      </div>

      <div className="satm-tables-grid">
        {currentTables.map((table) => (
          <div key={table.id || table.tableNumber} className={`satm-table-card satm-card-${table.tableStatus?.toLowerCase()}`}>
            <div className="satm-card-header">
              <div className="satm-card-title-group">
                {getStatusIcon(table.tableStatus)}
                <h3 className="satm-card-title">Table {table.tableNumber}</h3>
              </div>
              <div className="satm-card-actions">
                <button className="satm-icon-btn satm-edit-btn" onClick={() => { setEditTable(table); setShowEditPopup(true); }}>
                  <Edit size={16} />
                </button>
                <button
                  className="satm-icon-btn satm-delete-btn"
                  onClick={() => {
                    setSelectedTable({ id: table.id, number: table.tableNumber });
                    setShowDeletePopup(true);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="satm-card-body">
              <div className="satm-info-row">
                <span className="satm-info-label">Capacity:</span>
                <span className="satm-info-value">{table.capacity || "—"} seats</span>
              </div>
              <div className="satm-info-row">
                <span className="satm-info-label">Section:</span>
                <span className="satm-info-value">{table.section?.trim() || "—"}</span>
              </div>
              {table.locationDescription && (
                <div className="satm-info-row">
                  <span className="satm-info-label">Location:</span>
                  <span className="satm-info-value">{table.locationDescription}</span>
                </div>
              )}

              <div className="satm-section-divider"></div>

              <div className="satm-qr-section">
                <h4 className="satm-section-title">
                  <QrCode size={16} /> QR Code
                </h4>
                {!qrStatus[table.tableNumber] ? (
                  <button
                    className="satm-action-btn satm-btn-primary"
                    onClick={() => handleGenerateQr(table.tableNumber)}
                    disabled={qrLoading[table.tableNumber]}
                  >
                    {qrLoading[table.tableNumber] ? "Generating..." : "Generate QR"}
                  </button>
                ) : (
                  <button
                    className="satm-action-btn satm-btn-secondary"
                    onClick={() => handleViewQr(table.tableNumber)}
                    disabled={qrLoading[table.tableNumber]}
                  >
                    View QR Code
                  </button>
                )}
              </div>

              <div className="satm-section-divider"></div>

              <div className="satm-waiter-section">
                <h4 className="satm-section-title">
                  <User size={16} /> Assigned Waiters
                </h4>
                <div className="satm-waiter-list">
                  {assignments.filter(a => a.tableNumber === table.tableNumber)
                    .map(a => (
                      <span key={a.waiterEmail} className="satm-waiter-badge">
                        {staffMap[a.waiterEmail] || a.waiterEmail}
                      </span>
                    ))}
                  {assignments.filter(a => a.tableNumber === table.tableNumber).length === 0 && (
                    <span className="satm-no-waiter">No waiters assigned</span>
                  )}
                </div>
                <div className="satm-waiter-actions">
                  <button
                    className="satm-action-btn satm-btn-primary"
                    onClick={() => {
                      const assigned = Array.isArray(assignments)
                        ? assignments.filter((a) => a.tableNumber === table.tableNumber).map((a) => a.waiterEmail)
                        : [];
                      setAssignedWaiters(assigned);
                      setWaiterData({ waiterEmail: "", tableNumber: table.tableNumber });
                      setShowWaiterPopup(true);
                    }}
                  >
                    {assignments.filter((a) => a.tableNumber === table.tableNumber).length > 0
                      ? "Update"
                      : "Assign"}
                  </button>
                  {assignments.filter(a => a.tableNumber === table.tableNumber).length > 0 && (
                    <button
                      className="satm-action-btn satm-btn-danger"
                      onClick={() => {
                        const assignedWaiters = assignments
                          .filter(a => a.tableNumber === table.tableNumber)
                          .map(a => a.waiterEmail);
                        setShowRemoveWaiterPopup({ visible: true, tableNumber: table.tableNumber, waiters: assignedWaiters });
                        setSelectedWaitersToRemove([]);
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {tables.length > itemsPerPage && (
        <div className="satm-pagination">
          <button
            className="satm-pagination-btn"
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            className="satm-pagination-btn"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="satm-pagination-numbers">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Show first page, last page, current page, and pages around current
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    className={`satm-pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                    onClick={() => paginate(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return <span key={pageNumber} className="satm-pagination-ellipsis">...</span>;
              }
              return null;
            })}
          </div>

          <button
            className="satm-pagination-btn"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="satm-pagination-btn"
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddPopup && (
        <div className="satm-modal-overlay">
          <div className="satm-modal">
            <button className="satm-modal-close" onClick={() => setShowAddPopup(false)}>
              <X size={20} />
            </button>
            <h2 className="satm-modal-title">Add New Table</h2>
            <div className="satm-form">
              <div className="satm-form-group">
                <label className="satm-form-label">Table Number</label>
                <input
                  type="text"
                  className="satm-form-input"
                  value={newTable.tableNumber}
                  onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                  placeholder="e.g., T1, A5, 101"
                />
              </div>
              <div className="satm-form-group">
                <label className="satm-form-label">Status</label>
                <select
                  className="satm-form-select"
                  value={newTable.tableStatus}
                  onChange={(e) => setNewTable({ ...newTable, tableStatus: e.target.value })}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="CLEANING">Cleaning</option>
                </select>
              </div>
              <div className="satm-form-group">
                <label className="satm-form-label">Capacity</label>
                <input
                  type="number"
                  min="1"
                  className="satm-form-input"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                />
              </div>
              <div className="satm-form-group">
                <label className="satm-form-label">Section</label>
                <input
                  type="text"
                  className="satm-form-input"
                  value={newTable.section}
                  onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
                  placeholder="e.g., Main Hall, Patio, VIP"
                />
              </div>
              <div className="satm-form-group">
                <label className="satm-form-label">Location Description</label>
                <textarea
                  className="satm-form-textarea"
                  value={newTable.locationDescription}
                  onChange={(e) => setNewTable({ ...newTable, locationDescription: e.target.value })}
                  placeholder="Near window, corner, etc."
                  rows="3"
                />
              </div>
              <div className="satm-modal-actions">
                <button className="satm-btn satm-btn-primary" onClick={handleAddTable}>
                  Add Table
                </button>
                <button className="satm-btn satm-btn-secondary" onClick={() => setShowAddPopup(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditPopup && editTable && (
        <div className="satm-modal-overlay">
          <div className="satm-modal">
            <button className="satm-modal-close" onClick={() => setShowEditPopup(false)}>
              <X size={20} />
            </button>
            <h2 className="satm-modal-title">Edit Table {editTable.tableNumber}</h2>
            <div className="satm-form">
              <div className="satm-form-group">
                <label className="satm-form-label">Table Number</label>
                <input
                  type="text"
                  className="satm-form-input"
                  value={editTable.tableNumber}
                  onChange={(e) => setEditTable({ ...editTable, tableNumber: e.target.value })}
                />
              </div>
              <div className="satm-form-group">
                <label className="satm-form-label">Status</label>
                <select
                  className="satm-form-select"
                  value={editTable.tableStatus}
                  onChange={(e) => setEditTable({ ...editTable, tableStatus: e.target.value })}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="BOOKED">Booked</option>
                  <option value="CLEANING">Cleaning</option>
                </select>
              </div>
              <div className="satm-form-group">
                <label className="satm-form-label">Capacity</label>
                <input
                  type="number"
                  min="1"
                  className="satm-form-input"
                  value={editTable.capacity}
                  onChange={(e) => setEditTable({ ...editTable, capacity: Number(e.target.value) })}
                />
              </div>
              <div className="satm-form-group">
                <label className="satm-form-label">Section</label>
                <input
                  type="text"
                  className="satm-form-input"
                  value={editTable.section}
                  onChange={(e) => setEditTable({ ...editTable, section: e.target.value })}
                />
              </div>
              <div className="satm-form-group">
                <label className="satm-form-label">Location Description</label>
                <textarea
                  className="satm-form-textarea"
                  value={editTable.locationDescription}
                  onChange={(e) => setEditTable({ ...editTable, locationDescription: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="satm-modal-actions">
                <button className="satm-btn satm-btn-primary" onClick={handleEditSave}>
                  Save Changes
                </button>
                <button className="satm-btn satm-btn-secondary" onClick={() => setShowEditPopup(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && selectedTable && (
        <div className="satm-modal-overlay">
          <div className="satm-modal satm-modal-danger">
            <button className="satm-modal-close" onClick={() => setShowDeletePopup(false)}>
              <X size={20} />
            </button>
            <div className="satm-danger-icon">
              <AlertCircle size={48} />
            </div>
            <h2 className="satm-modal-title">Delete Table {selectedTable.number}?</h2>
            <p className="satm-modal-text">
              This action will permanently delete the table, its QR code, and all waiter assignments. This cannot be undone.
            </p>
            <div className="satm-modal-actions">
              <button className="satm-btn satm-btn-danger" onClick={handleDeleteTable} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Table"}
              </button>
              <button className="satm-btn satm-btn-secondary" onClick={() => setShowDeletePopup(false)} disabled={isDeleting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showWaiterPopup && (
        <div className="satm-modal-overlay">
          <div className="satm-modal">
            <button className="satm-modal-close" onClick={() => setShowWaiterPopup(false)}>
              <X size={20} />
            </button>
            <h2 className="satm-modal-title">Assign Waiter to Table {waiterData.tableNumber}</h2>
            <div className="satm-form">
              <div className="satm-form-group">
                <label className="satm-form-label">Select Waiter</label>
                <select
                  className="satm-form-select"
                  value={waiterData.waiterEmail}
                  onChange={(e) => setWaiterData({ ...waiterData, waiterEmail: e.target.value })}
                >
                  <option value="">Choose a waiter...</option>
                  {waiters.map((waiter) => (
                    <option key={waiter.email} value={waiter.email}>
                      {waiter.firstName ? `${waiter.firstName} ${waiter.lastName || ""}` : waiter.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="satm-modal-actions">
                <button
                  className="satm-btn satm-btn-primary"
                  onClick={() => handleAssignWaiter(waiterData.waiterEmail, waiterData.tableNumber, false)}
                  disabled={!waiterData.waiterEmail}
                >
                  Assign Waiter
                </button>
                <button className="satm-btn satm-btn-secondary" onClick={() => setShowWaiterPopup(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRemoveWaiterPopup.visible && (
        <div className="satm-modal-overlay">
          <div className="satm-modal">
            <button className="satm-modal-close" onClick={() => setShowRemoveWaiterPopup({ visible: false, tableNumber: null, waiters: [] })}>
              <X size={20} />
            </button>
            <h2 className="satm-modal-title">Remove Waiters from Table {showRemoveWaiterPopup.tableNumber}</h2>
            {showRemoveWaiterPopup.waiters?.length > 0 ? (
              <div className="satm-checkbox-list">
                {showRemoveWaiterPopup.waiters.map(email => (
                  <label key={email} className="satm-checkbox-item">
                    <input
                      type="checkbox"
                      className="satm-checkbox"
                      value={email}
                      checked={selectedWaitersToRemove.includes(email)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedWaitersToRemove(prev =>
                          checked ? [...prev, email] : prev.filter(w => w !== email)
                        );
                      }}
                    />
                    <span className="satm-checkbox-label">{staffMap[email] || email}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="satm-modal-text">No waiters assigned to this table.</p>
            )}
            <div className="satm-modal-actions">
              <button
                className="satm-btn satm-btn-danger"
                onClick={handleRemoveSelectedWaiters}
                disabled={selectedWaitersToRemove.length === 0}
              >
                Remove Selected
              </button>
              <button
                className="satm-btn satm-btn-secondary"
                onClick={() => setShowRemoveWaiterPopup({ visible: false, tableNumber: null, waiters: [] })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showQrPopup && qrData && (
        <div className="satm-modal-overlay">
          <div className="satm-modal satm-qr-modal">
            <button className="satm-modal-close" onClick={() => setShowQrPopup(false)}>
              <X size={20} />
            </button>
            <h2 className="satm-modal-title">QR Code - Table {qrData.tableNumber}</h2>
            {qrData.imageUrl ? (
              <div className="satm-qr-content">
                <div className="satm-qr-image-wrapper">
                  <img src={qrData.imageUrl} alt={`QR for Table ${qrData.tableNumber}`} className="satm-qr-image" />
                </div>
                <div className="satm-modal-actions">
                  <a
                    href={qrData.imageUrl}
                    download={`Table-${qrData.tableNumber}-QR.png`}
                    className="satm-btn satm-btn-primary"
                  >
                    <Download size={16} /> Download QR
                  </a>
                  <button
                    className="satm-btn satm-btn-danger"
                    onClick={() => {
                      setSelectedTableForDelete(qrData.tableNumber);
                    }}
                  >
                    <Trash2 size={16} /> Delete QR
                  </button>
                </div>
              </div>
            ) : (
              <p className="satm-modal-text">No QR image available</p>
            )}
          </div>
        </div>
      )}

      {selectedTableForDelete && (
        <div className="satm-modal-overlay">
          <div className="satm-modal satm-modal-danger satm-modal-small">
            <div className="satm-danger-icon">
              <AlertCircle size={40} />
            </div>
            <h3 className="satm-modal-title">Confirm QR Deletion</h3>
            <p className="satm-modal-text">
              Are you sure you want to delete the QR code for Table {selectedTableForDelete}?
            </p>
            <div className="satm-modal-actions">
              <button
                className="satm-btn satm-btn-danger"
                onClick={() => {
                  handleDeleteQr(selectedTableForDelete);
                  setSelectedTableForDelete(null);
                }}
              >
                Yes, Delete
              </button>
              <button
                className="satm-btn satm-btn-secondary"
                onClick={() => setSelectedTableForDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}