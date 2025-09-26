import { useState } from "react";
import { CalendarDays } from "lucide-react";
import "./Reservation.css";

const initialReservations = [
  {
    id: 1,
    name: "Jerome Bell",
    phone: "(702) 555-0122",
    email: "jerome@example.com",
    table: "A-4",
    persons: 5,
    time: "17:00",
    status: "Confirmed",
    shape: "round",
  },
  {
    id: 2,
    name: "Brooklyn Simmons",
    phone: "(684) 555-0102",
    email: "brooklyn@example.com",
    table: "A-5",
    persons: 6,
    time: "16:30",
    status: "Completed",
    shape: "rect",
  },
];

function TableIcon({ persons }) {
  const dots = [];
  const centerX = 60;
  const centerY = 40;
  const radius = 35;

  for (let i = 0; i < persons; i++) {
    const angle = (i / persons) * 2 * Math.PI;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    dots.push(<circle key={i} cx={x} cy={y} r="5" />);
  }

  return (
    <svg className="table-icon" viewBox="0 0 120 80" stroke="currentColor" strokeWidth="6">
      <rect x="30" y="20" width="60" height="40" rx="6" fill="none" />
      {dots}
    </svg>
  );
}

export default function Reservation() {
  const [reservations, setReservations] = useState(initialReservations);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    table: "",
    persons: "",
    time: "",
    shape: "rect",
  });
  const [showForm, setShowForm] = useState(false);

  const updateStatus = (id, newStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.table || !formData.time) return;

    const newReservation = {
      ...formData,
      id: Date.now(),
      persons: Number(formData.persons),
      status: "Incoming",
    };

    setReservations((prev) => [newReservation, ...prev]);
    setFormData({
      name: "",
      phone: "",
      email: "",
      table: "",
      persons: "",
      time: "",
      shape: "rect",
    });
    setShowForm(false);
  };

  return (
    <div className="reservations-container">
      {/* Header */}
      <div className="reservations-header">
        <h2 className="reservations-title">
          <CalendarDays size={22} style={{ marginRight: "8px" }} /> Reservations
        </h2>
        <button className="create-res-btn" onClick={() => setShowForm(true)}>
          + Create Reservation
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
                alt="Bell Icon"
                className="modal-icon"
              />
              <h3>Create Reservation</h3>
            </div>

            <form className="reservation-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Guest Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                type="text"
                name="table"
                placeholder="Table No."
                value={formData.table}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="persons"
                placeholder="No. of Persons"
                value={formData.persons}
                onChange={handleChange}
              />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />

              <div className="modal-actions">
                <button type="submit" className="add-btn">Confirm</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservation Cards */}
      <div className="reservations-grid">
        {reservations.map((res) => (
          <div key={res.id} className="reservation-card">
            <span className={`status ${res.status.toLowerCase()}`}>{res.status}</span>

            <div>
              <h3>{res.name}</h3>
              <p>{res.phone}</p>
              <p>{res.email}</p>
            </div>

            <div className="reservation-details">
              <div className="info">
                <span>Table {res.table}</span>
                <p>👥 {res.persons} persons</p>
                <p>🕒 {res.time}</p>
              </div>
              <TableIcon persons={res.persons} />
            </div>

            <div className="reservation-actions">
              {res.status === "Incoming" && (
                <>
                  <button onClick={() => updateStatus(res.id, "Confirmed")} className="confirm">Confirm</button>
                  <button onClick={() => updateStatus(res.id, "Cancelled")} className="cancel">Cancel</button>
                </>
              )}
              {res.status === "Confirmed" && <button className="order">Create Order</button>}
              {res.status === "Completed" && <button className="paid">Paid</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
