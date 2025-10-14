import React, { useState, useEffect } from "react";
import "./OrderQueue.css";

export default function OrderQueue() {
  const [orders, setOrders] = useState({
    newOrders: [],
    preparing: [],
    ready: [],
  });

  useEffect(() => {
    const initialData = {
      newOrders: [
        {
          table: "Table 5",
          time: "12:30 PM",
          ago: "2 min ago",
          items: "2x Grilled Salmon, 1x Veg Pasta",
          note: "Extra spicy for both salmon",
          urgent: true,
          timer: 12,
        },
        {
          table: "Table 8",
          time: "12:32 PM",
          ago: "1 min ago",
          items: "1x Burger, 1x Fries, 2x Coke",
          timer: 15,
        },
      ],
      preparing: [
        {
          table: "Table 3",
          time: "12:25 PM",
          ago: "7 min ago",
          items: "2x Chicken Curry, 2x Rice",
          timer: 8,
        },
        {
          table: "Table 7",
          time: "12:28 PM",
          ago: "4 min ago",
          items: "1x Pizza, 1x Salad",
          note: "Gluten-free pizza base",
          urgent: true,
          timer: 5,
        },
      ],
      ready: [
        {
          table: "Table 2",
          time: "12:20 PM",
          ago: "10 min ago",
          items: "1x Salad, 2x Soup",
          timer: 3,
        },
      ],
    };
    setOrders(initialData);
  }, []);

  // Timer logic (updates every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) => {
        const updateTimer = (arr) =>
          arr.map((o) => ({
            ...o,
            timer: o.timer > 0 ? o.timer - 1 : 0,
          }));
        return {
          newOrders: updateTimer(prev.newOrders),
          preparing: updateTimer(prev.preparing),
          ready: updateTimer(prev.ready),
        };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const moveOrder = (from, to, index) => {
    const orderToMove = orders[from][index];
    setOrders((prev) => {
      const updatedFrom = prev[from].filter((_, i) => i !== index);
      const updatedTo = [...prev[to], orderToMove];
      return { ...prev, [from]: updatedFrom, [to]: updatedTo };
    });
  };

  return (
    <div className="order-management">
      <div className="header-row">
        <h2>Order Management</h2>
        <button className="refresh-btn" onClick={() => window.location.reload()}>
          🔄 Refresh
        </button>
      </div>

      <div className="kanban-board">
        {/* New Orders */}
        <div className="kanban-column">
          <div className="column-header">
            <span>New Orders</span>
            <span className="order-count">{orders.newOrders.length}</span>
          </div>
          {orders.newOrders.map((o, i) => (
            <div
              key={`new-${i}`}
              className={`order-item ${o.urgent ? "urgent" : ""}`}
            >
              <div className="order-table">
                <span>{o.table}</span>
                <span className="timer">{o.timer} min</span>
              </div>
              <div className="order-time">
                {o.time} ({o.ago})
              </div>
              <div className="order-items">{o.items}</div>
              {o.note && <div className="order-note">{o.note}</div>}
              <div className="order-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => moveOrder("newOrders", "preparing", i)}
                >
                  ✅ Accept
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preparing */}
        <div className="kanban-column">
          <div className="column-header">
            <span>Preparing</span>
            <span className="order-count">{orders.preparing.length}</span>
          </div>
          {orders.preparing.map((o, i) => (
            <div
              key={`prep-${i}`}
              className={`order-item ${o.urgent ? "urgent" : ""}`}
            >
              <div className="order-table">
                <span>{o.table}</span>
                <span className="timer">{o.timer} min</span>
              </div>
              <div className="order-time">
                {o.time} ({o.ago})
              </div>
              <div className="order-items">{o.items}</div>
              {o.note && <div className="order-note">{o.note}</div>}
              <div className="order-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => moveOrder("preparing", "ready", i)}
                >
                  🔔 Mark Ready
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ready */}
        <div className="kanban-column">
          <div className="column-header">
            <span>Ready to Serve</span>
            <span className="order-count">{orders.ready.length}</span>
          </div>
          {orders.ready.map((o, i) => (
            <div key={`ready-${i}`} className="order-item">
              <div className="order-table">
                <span>{o.table}</span>
                <span className="timer">{o.timer} min</span>
              </div>
              <div className="order-time">
                {o.time} ({o.ago})
              </div>
              <div className="order-items">{o.items}</div>
              <div className="order-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => moveOrder("ready", "preparing", i)}
                >
                  ↩ Reopen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
