import { useState, useEffect } from "react";
import { CalendarDays, CheckCircle, XCircle, Brush, Plus, X } from "lucide-react";
import "./WaiterReservation.css";

export default function WaiterTableReservation() {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const [newReservation, setNewReservation] = useState({
    name: "",
    phone: "",
    persons: 1,
    time: "",
  });

  // Load tables and reservations from localStorage
  useEffect(() => {
    const storedTables = JSON.parse(localStorage.getItem("tables") || "[]");
    const storedReservations = JSON.parse(localStorage.getItem("reservations") || "[]");
    setTables(storedTables);
    setReservations(storedReservations);
  }, []);

  // Update table status
  const updateStatus = (id, newStatus) => {
    const updated = tables.map((t) =>
      t.id === id ? { ...t, tableStatus: newStatus } : t
    );
    setTables(updated);
    localStorage.setItem("tables", JSON.stringify(updated));
  };

  // Open popup for reservation
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

  // Save reservation
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

    // Update table status to BOOKED
    updateStatus(selectedTable.id, "BOOKED");
    setShowPopup(false);
  };

  return (
    <div className="waiter-reservations-container">
      <div className="waiter-reservations-header">
        <h2 className="waiter-reservations-title">
          <CalendarDays size={22} style={{ marginRight: "8px" }} /> Table Reservations
        </h2>
      </div>

      {tables.length === 0 ? (
        <p className="waiter-no-tables">No tables added by Admin yet.</p>
      ) : (
        <div className="waiter-reservations-grid">
          {tables.map((table) => {
            const tableReservation = reservations.find(
              (r) => r.tableId === table.id
            );

            return (
              <div key={table.id} className={`waiter-reservation-card ${table.tableStatus.toLowerCase()}`}>
                <span className={`waiter-status ${table.tableStatus.toLowerCase()}`}>
                  {table.tableStatus}
                </span>

                <div>
                  <h3>{table.tableNumber}</h3>
                  <p>Capacity: {table.capacity}</p>
                  <p>Section: {table.section || "—"}</p>
                  <p>Location: {table.locationDescription || "—"}</p>

                  {tableReservation && (
                    <div className="waiter-reservation-details">
                      <hr />
                      <p><b>Guest:</b> {tableReservation.name}</p>
                      <p><b>Time:</b> {tableReservation.time}</p>
                      <p><b>Persons:</b> {tableReservation.persons}</p>
                    </div>
                  )}
                </div>

                <div className="waiter-reservation-actions">
                  <button
                    onClick={() => handleOpenPopup(table)}
                    className="waiter-book-btn"
                    disabled={table.tableStatus === "BOOKED"}
                  >
                    <Plus size={16} /> Create Reservation
                  </button>

                  <button onClick={() => updateStatus(table.id, "AVAILABLE")} className="waiter-confirm">
                    <CheckCircle size={16} /> Available
                  </button>
                  <button onClick={() => updateStatus(table.id, "BOOKED")} className="waiter-cancel">
                    <XCircle size={16} /> Booked
                  </button>
                  <button onClick={() => updateStatus(table.id, "CLEANING")} className="waiter-cleaning">
                    <Brush size={16} /> Cleaning
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reservation Popup */}
      {showPopup && (
        <div className="waiter-popup-overlay">
          <div className="waiter-popup">
            <button className="waiter-popup-close" onClick={() => setShowPopup(false)}>
              <X size={18} />
            </button>
            <h3>Create Reservation - {selectedTable?.tableNumber}</h3>

            <label>
              Guest Name:
              <input
                type="text"
                value={newReservation.name}
                onChange={(e) => setNewReservation({ ...newReservation, name: e.target.value })}
              />
            </label>

            <label>
              Phone:
              <input
                type="text"
                value={newReservation.phone}
                onChange={(e) => setNewReservation({ ...newReservation, phone: e.target.value })}
              />
            </label>

            <label>
              Number of Persons:
              <input
                type="number"
                min="1"
                value={newReservation.persons}
                onChange={(e) =>
                  setNewReservation({ ...newReservation, persons: Number(e.target.value) })
                }
              />
            </label>

            <label>
              Time:
              <input
                type="time"
                value={newReservation.time}
                onChange={(e) => setNewReservation({ ...newReservation, time: e.target.value })}
              />
            </label>

            <div className="waiter-popup-actions">
              <button onClick={handleSaveReservation}>Save Reservation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
