import { useEffect, useState } from "react";
import "./WaiterHome.css";

export default function WaiterHome() {
  const [assignedTables, setAssignedTables] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    let tables = JSON.parse(localStorage.getItem("assignedTables") || "[]");

    if (!tables.length || !tables[0].name) {
      tables = [
        {
          id: 1,
          name: "Theresa Webb",
          phone: "(808) 555-0111",
          email: "theresa@example.com",
          table: "A-1",
          persons: 4,
          time: "18:30",
          status: "Incoming",
          shape: "rect",
        },
        {
          id: 2,
          name: "Eleanor Pena",
          phone: "(307) 555-0133",
          email: "eleonor@example.com",
          table: "A-2",
          persons: 4,
          time: "18:00",
          status: "Incoming",
          shape: "rect",
        },
        {
          id: 3,
          name: "Annette Black",
          phone: "(205) 555-0100",
          email: "black@example.com",
          table: "A-3",
          persons: 4,
          time: "17:30",
          status: "Incoming",
          shape: "round",
        },
        {
          id: 4,
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
          id: 5,
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
      localStorage.setItem("assignedTables", JSON.stringify(tables));
    }

    setAssignedTables(tables);
  }, []);

  const filteredTables =
    filterStatus === "All"
      ? assignedTables
      : assignedTables.filter((t) => t.status === filterStatus);

  const getStatusClass = (status) => {
    switch (status) {
      case "Incoming":
        return "status incoming";
      case "Confirmed":
        return "status confirmed";
      case "Completed":
        return "status completed";
      default:
        return "status";
    }
  };

  const renderTableShape = (shape) => {
    if (shape === "round") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="table-shape"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="20" stroke="#2c7a7b" strokeWidth="3" fill="none" />
          <circle cx="50" cy="10" r="5" fill="#2c7a7b" />
          <circle cx="90" cy="50" r="5" fill="#2c7a7b" />
          <circle cx="50" cy="90" r="5" fill="#2c7a7b" />
          <circle cx="10" cy="50" r="5" fill="#2c7a7b" />
        </svg>
      );
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="table-shape"
        viewBox="0 0 100 100"
      >
        <rect
          x="25"
          y="30"
          width="50"
          height="40"
          rx="5"
          ry="5"
          stroke="#2c7a7b"
          strokeWidth="3"
          fill="none"
        />
        <circle cx="50" cy="15" r="5" fill="#2c7a7b" />
        <circle cx="50" cy="85" r="5" fill="#2c7a7b" />
        <circle cx="25" cy="50" r="5" fill="#2c7a7b" />
        <circle cx="75" cy="50" r="5" fill="#2c7a7b" />
      </svg>
    );
  };

  return (
    <div className="reservation-container">
      <div className="header">
        <h2>Reservation</h2>
        <div className="sort-dropdown">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">Sort by</option>
            <option value="Incoming">New</option>
            <option value="Confirmed">In progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="create-card">
        <button className="create-btn">Create reservation +</button>
      </div>

      <div className="reservation-grid">
        {filteredTables.map((table) => (
          <div key={table.id} className="reservation-card">
            <div className="top-row">
              <span className={getStatusClass(table.status)}>
                {table.status}
              </span>
              <select className="table-select" defaultValue={table.table}>
                <option>{table.table}</option>
              </select>
            </div>

            <div className="guest-info">
              <div className="avatar">
                {table.name ? table.name.charAt(0) : "?"}
              </div>
              <div>
                <h4>{table.name}</h4>
                <p className="contact">
                  <span>📞 {table.phone}</span>
                  <br />
                  <span>✉️ {table.email}</span>
                </p>
              </div>
            </div>

            <div className="table-grid">
              {renderTableShape(table.shape)}
            </div>

            <div className="details">
              <p>👥 {table.persons} persons</p>
              <p>🕒 {table.time}</p>
            </div>

            <div className="actions">
              {table.status === "Incoming" && (
                <>
                  <button className="confirm-btn">Confirm</button>
                  <button className="cancel-btn">Cancel</button>
                </>
              )}
              {table.status === "Confirmed" && (
                <button className="create-order-btn">Create Order</button>
              )}
              {table.status === "Completed" && (
                <button className="paid-btn">Paid</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
