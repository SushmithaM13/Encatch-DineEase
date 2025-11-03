import { useState, useEffect } from "react";
import {
  CalendarDays,
  Plus,
  User,
  Clock,
  Phone,
  X,
  ChevronDown,
} from "lucide-react";
import "./WaiterReservation.css";

export default function WaiterTableReservation() {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [filterStatus, setFilterStatus] = useState("New");

  const [newReservation, setNewReservation] = useState({
    name: "",
    phone: "",
    persons: 1,
    time: "",
  });

  useEffect(() => {
    const storedTables = JSON.parse(localStorage.getItem("tables") || "[]");
    const storedReservations = JSON.parse(localStorage.getItem("reservations") || "[]");

    // 👇 Add some mock tables if none exist (for testing)
    if (storedTables.length === 0) {
      const sampleTables = [
        { id: 1, tableNumber: "T1", tableStatus: "AVAILABLE" },
        { id: 2, tableNumber: "T2", tableStatus: "BOOKED" },
        { id: 3, tableNumber: "T3", tableStatus: "COMPLETED" },
      ];
      localStorage.setItem("tables", JSON.stringify(sampleTables));
      setTables(sampleTables);
    } else {
      setTables(storedTables);
    }

    setReservations(storedReservations);
  }, []);

  const updateStatus = (id, newStatus) => {
    const updated = tables.map((t) =>
      t.id === id ? { ...t, tableStatus: newStatus } : t
    );
    setTables(updated);
    localStorage.setItem("tables", JSON.stringify(updated));
  };

  const handleOpenPopup = (table) => {
    setSelectedTable(table);
    setShowPopup(true);
    setNewReservation({
      name: "",
      phone: "",
      persons: 1,
      time: "",
    });
  };

  const handleSaveReservation = () => {
    if (!newReservation.name.trim() || !newReservation.phone.trim() || !newReservation.time) {
      alert("Please fill all required fields.");
      return;
    }

    const reservation = {
      id: reservations.length ? reservations[reservations.length - 1].id + 1 : 1,
      tableId: selectedTable.id,
      tableNumber: selectedTable.tableNumber,
      ...newReservation,
      status: "BOOKED",
    };

    const updatedReservations = [...reservations, reservation];
    setReservations(updatedReservations);
    localStorage.setItem("reservations", JSON.stringify(updatedReservations));

    updateStatus(selectedTable.id, "BOOKED");
    setShowPopup(false);
  };

  return (
    <div className="reservation-container">
      {/* Header */}
      <div className="reservation-header">
        <h2>
          <CalendarDays size={22} /> Reservation
        </h2>

        {/* ✅ Filter Dropdown */}
        <div className="reservation-filter">
          <select
            className="filter-btn"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="New">All</option>
            <option value="BOOKED">Incoming</option>
            <option value="AVAILABLE">Confirmed</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <ChevronDown size={16} />
        </div>
      </div>

      {/* Grid */}
      <div className="reservation-grid">
        {/* Create Reservation Card */}
        <div className="reservation-card create-card" onClick={() => setShowPopup(true)}>
          <div className="create-icon">
            <img src="https://cdn-icons-png.flaticon.com/512/2920/2920244.png" alt="bell" />
          </div>
          <button className="create-btn">Create reservation +</button>
        </div>

        {/* ✅ Filtered Table Cards */}
        {tables
          .filter((table) => {
            if (filterStatus === "New") return true; // show all
            return table.tableStatus.toUpperCase() === filterStatus.toUpperCase();
          })
          .map((table) => {
            const tableReservation = reservations.find((r) => r.tableId === table.id);
            const status = table.tableStatus;

            const statusLabel =
              status === "BOOKED"
                ? "Incoming"
                : status === "AVAILABLE"
                ? "Confirmed"
                : "Completed";

            return (
              <div key={table.id} className="reservation-card">
                <div className="reservation-status">
                  <span className={`status-badge ${status.toLowerCase()}`}>
                    {statusLabel}
                  </span>
                  <select className="table-select" defaultValue={table.tableNumber}>
                    <option>{table.tableNumber}</option>
                  </select>
                </div>

                <div className="reservation-details">
                  {tableReservation ? (
                    <>
                      <div className="guest-info">
                        <div className="guest-avatar">
                          {tableReservation.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3>{tableReservation.name}</h3>
                          <p className="contact-line">
                            <Phone size={14} /> {tableReservation.phone}
                          </p>
                        </div>
                      </div>

                      <div className="table-info">
                        <p>
                          <User size={14} /> {tableReservation.persons} persons
                        </p>
                        <p>
                          <Clock size={14} /> {tableReservation.time}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="no-reservation">No reservation yet</p>
                  )}
                </div>

                <div className="reservation-actions">
                  {status === "BOOKED" ? (
                    <>
                      <button
                        className="confirm-btn"
                        onClick={() => updateStatus(table.id, "AVAILABLE")}
                      >
                        Confirm
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => updateStatus(table.id, "AVAILABLE")}
                      >
                        Cancel
                      </button>
                    </>
                  ) : status === "AVAILABLE" ? (
                    <button
                      className="create-order-btn"
                      onClick={() => handleOpenPopup(table)}
                    >
                      Create order
                    </button>
                  ) : (
                    <button className="paid-btn" disabled>
                      Paid
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Popup Form */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              <X size={18} />
            </button>
            <h3>Create Reservation</h3>

            <label>
              Guest Name:
              <input
                type="text"
                value={newReservation.name}
                onChange={(e) =>
                  setNewReservation({ ...newReservation, name: e.target.value })
                }
              />
            </label>

            <label>
              Phone:
              <input
                type="text"
                value={newReservation.phone}
                onChange={(e) =>
                  setNewReservation({ ...newReservation, phone: e.target.value })
                }
              />
            </label>

            <label>
              Number of Persons:
              <input
                type="number"
                min="1"
                value={newReservation.persons}
                onChange={(e) =>
                  setNewReservation({
                    ...newReservation,
                    persons: Number(e.target.value),
                  })
                }
              />
            </label>

            <label>
              Time:
              <input
                type="time"
                value={newReservation.time}
                onChange={(e) =>
                  setNewReservation({ ...newReservation, time: e.target.value })
                }
              />
            </label>

            <button className="popup-save" onClick={handleSaveReservation}>
              Save Reservation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
