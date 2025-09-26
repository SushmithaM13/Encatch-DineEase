import { useEffect, useState } from "react";

export default function WaiterHome() {
  const [assignedTables, setAssignedTables] = useState([]);

  useEffect(() => {
    const tables = JSON.parse(localStorage.getItem("assignedTables") || "[]");
    setAssignedTables(
      tables.length
        ? tables
        : [
            { number: 1, status: "Needs Order", items: [] },
            { number: 2, status: "Order Placed", items: [{ name: "Pizza" }] },
            { number: 3, status: "Waiting to Serve", items: [{ name: "Pasta" }, { name: "Coke" }] },
          ]
    );
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Assigned Tables</h2>
      <div className="tables-grid">
        {assignedTables.map((table, idx) => (
          <div key={idx} className="table-card">
            <h3>Table {table.number}</h3>
            <p>Status: {table.status}</p>
            <p>Items: {table.items?.length || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
