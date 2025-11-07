import React, { useState, useEffect } from "react";
import "./OrderQueue.css";

export default function OrderQueue() {
  // Initialize with empty arrays and ensure they always exist
  const defaultOrders = {
    newOrders: [],
    accepted: [],
    preparing: [],
    ready: [],
  };
  
  const [orders, setOrders] = useState(defaultOrders);

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
  accepted: [],
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
          (arr || []).map((o) => ({
            ...o,
            timer: o.timer > 0 ? o.timer - 1 : 1, // Keep minimum of 1 minute
          }));
        return {
          newOrders: updateTimer(prev.newOrders),
          accepted: updateTimer(prev.accepted),
          preparing: updateTimer(prev.preparing),
          ready: updateTimer(prev.ready),
        };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const moveOrder = (from, to, index) => {
    // Ensure arrays exist before accessing
    if (!orders[from] || !orders[to]) return;
    
    const orderToMove = orders[from][index];
    if (!orderToMove) return;

    setOrders((prev) => {
      const updatedFrom = (prev[from] || []).filter((_, i) => i !== index);
      const updatedTo = [...(prev[to] || []), orderToMove];
      return { ...prev, [from]: updatedFrom, [to]: updatedTo };
    });
  };

  // Accept an order: split its items into separate accepted entries
  const handleAcceptOrder = (index) => {
    const order = orders.newOrders[index];
    if (!order) return;
    // split items by comma and create individual accepted items
    const itemParts = order.items.split(",").map((s) => s.trim()).filter(Boolean);
    const acceptedItems = itemParts.map((itemText, idx) => ({
      id: `${order.table}-${Date.now()}-${idx}`,
      table: order.table,
      time: order.time,
      ago: order.ago,
      item: itemText,
      note: order.note || "",
      urgent: !!order.urgent,
      timer: order.timer || 15, // Default 15 minutes for new items
    }));

    setOrders((prev) => {
      const updatedNew = prev.newOrders.filter((_, i) => i !== index);
      return { ...prev, newOrders: updatedNew, accepted: [...acceptedItems, ...prev.accepted] };
    });
  };

  // Reject a new order (remove it)
  const handleRejectNewOrder = (index) => {
    setOrders((prev) => {
      const updatedNew = prev.newOrders.filter((_, i) => i !== index);
      return { ...prev, newOrders: updatedNew };
    });
  };

  // Reject an accepted single item (remove it)
  const handleRejectAccepted = (index) => {
    setOrders((prev) => {
      const updatedAccepted = prev.accepted.filter((_, i) => i !== index);
      return { ...prev, accepted: updatedAccepted };
    });
  };

  // Start preparation for a single accepted item
  const handleStartPreparationFromAccepted = (index) => {
    const acceptedItem = orders.accepted[index];
    if (!acceptedItem) return;
    // create a preparing order object from the accepted item
    const prepObj = {
      table: acceptedItem.table,
      time: acceptedItem.time,
      ago: acceptedItem.ago,
      items: acceptedItem.item,
      note: acceptedItem.note,
      urgent: acceptedItem.urgent,
      timer: acceptedItem.timer || 10,
    };
    setOrders((prev) => {
      const updatedAccepted = prev.accepted.filter((_, i) => i !== index);
      return { ...prev, accepted: updatedAccepted, preparing: [...prev.preparing, prepObj] };
    });
  };

  return (
    <div className="order-management container">
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
            <span className="order-count">{orders?.newOrders?.length || 0}</span>
          </div>
          {(orders?.newOrders || []).map((o, i) => (
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
                  onClick={() => handleAcceptOrder(i)}
                >
                  ✅ Accept
                </button>
                <button
                  className="btn btn-reject btn-sm"
                  onClick={() => handleRejectNewOrder(i)}
                >
                  ✖ Reject
                </button>
              </div>
            </div>
          ))}
        </div>

  {/* Accepted (single items) */}
  <div className="kanban-column accepted-column">
          <div className="column-header">
            <span>Accepted</span>
            <span className="order-count">{orders?.accepted?.length || 0}</span>
          </div>
          {(orders?.accepted || []).map((a, ai) => (
            <div key={a.id || `acc-${ai}`} className={`order-item ${a.urgent ? "urgent" : ""}`}>
              <div className="order-table">
                <span>{a.table}</span>
                <span className="timer">{a.timer} min</span>
              </div>
              <div className="order-time">{a.time} ({a.ago})</div>
              <div className="order-items">{a.item}</div>
              {a.note && <div className="order-note">{a.note}</div>}
              <div className="order-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleStartPreparationFromAccepted(ai)}
                >
                  ▶ Start Prep
                </button>
                <button
                  className="btn btn-reject btn-sm"
                  onClick={() => handleRejectAccepted(ai)}
                >
                  ✖ Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Preparing */}
        <div className="kanban-column">
          <div className="column-header">
            <span>Preparing</span>
            <span className="order-count">{orders?.preparing?.length || 0}</span>
          </div>
          {(orders?.preparing || []).map((o, i) => (
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
            <span className="order-count">{orders?.ready?.length || 0}</span>
          </div>
          {(orders?.ready || []).map((o, i) => (
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
