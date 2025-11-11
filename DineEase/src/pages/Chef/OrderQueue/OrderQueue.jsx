import React, { useState, useEffect } from "react";
import "./OrderQueue.css";

export default function ChefOrderQueue() {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) => {
        const updateTimer = (arr) =>
          (arr || []).map((o) => ({ ...o, timer: o.timer > 0 ? o.timer - 1 : 1 }));
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
    if (!orders[from] || !orders[to]) return;
    const orderToMove = orders[from][index];
    if (!orderToMove) return;
    setOrders((prev) => {
      const updatedFrom = (prev[from] || []).filter((_, i) => i !== index);
      const updatedTo = [...(prev[to] || []), orderToMove];
      return { ...prev, [from]: updatedFrom, [to]: updatedTo };
    });
  };

  const handleAcceptOrder = (index) => {
    const order = orders.newOrders[index];
    if (!order) return;
    const itemParts = order.items.split(",").map((s) => s.trim()).filter(Boolean);
    const acceptedItems = itemParts.map((itemText, idx) => ({
      id: `${order.table}-${Date.now()}-${idx}`,
      table: order.table,
      time: order.time,
      ago: order.ago,
      item: itemText,
      note: order.note || "",
      urgent: !!order.urgent,
      timer: order.timer || 15,
    }));

    setOrders((prev) => {
      const updatedNew = prev.newOrders.filter((_, i) => i !== index);
      return { ...prev, newOrders: updatedNew, accepted: [...acceptedItems, ...prev.accepted] };
    });
  };

  const handleRejectNewOrder = (index) => {
    setOrders((prev) => ({
      ...prev,
      newOrders: prev.newOrders.filter((_, i) => i !== index),
    }));
  };

  const handleRejectAccepted = (index) => {
    setOrders((prev) => ({
      ...prev,
      accepted: prev.accepted.filter((_, i) => i !== index),
    }));
  };

  const handleStartPreparationFromAccepted = (index) => {
    const acceptedItem = orders.accepted[index];
    if (!acceptedItem) return;
    const prepObj = {
      table: acceptedItem.table,
      time: acceptedItem.time,
      ago: acceptedItem.ago,
      items: acceptedItem.item,
      note: acceptedItem.note,
      urgent: acceptedItem.urgent,
      timer: acceptedItem.timer || 10,
    };
    setOrders((prev) => ({
      ...prev,
      accepted: prev.accepted.filter((_, i) => i !== index),
      preparing: [...prev.preparing, prepObj],
    }));
  };

  return (
    <div className="chef-order-management container">
      <div className="chef-header-row">
        <h2>Order Management</h2>
        <button className="chef-refresh-btn" onClick={() => window.location.reload()}>
          🔄 Refresh
        </button>
      </div>

      <div className="chef-kanban-board">
        {/* New Orders */}
        <div className="chef-kanban-column">
          <div className="chef-column-header">
            <span>New Orders</span>
            <span className="chef-order-count">{orders?.newOrders?.length || 0}</span>
          </div>
          {(orders?.newOrders || []).map((o, i) => (
            <div key={`new-${i}`} className={`chef-order-item ${o.urgent ? "chef-urgent" : ""}`}>
              <div className="chef-order-table">
                <span>{o.table}</span>
                <span className="chef-timer">{o.timer} min</span>
              </div>
              <div className="chef-order-time">{o.time} ({o.ago})</div>
              <div className="chef-order-items">{o.items}</div>
              {o.note && <div className="chef-order-note">{o.note}</div>}
              <div className="chef-order-actions">
                <button className="chef-btn chef-btn-primary chef-btn-sm" onClick={() => handleAcceptOrder(i)}>✅ Accept</button>
                <button className="chef-btn chef-btn-reject chef-btn-sm" onClick={() => handleRejectNewOrder(i)}>✖ Reject</button>
              </div>
            </div>
          ))}
        </div>

        {/* Accepted */}
        <div className="chef-kanban-column chef-accepted-column">
          <div className="chef-column-header">
            <span>Accepted</span>
            <span className="chef-order-count">{orders?.accepted?.length || 0}</span>
          </div>
          {(orders?.accepted || []).map((a, ai) => (
            <div key={a.id || `acc-${ai}`} className={`chef-order-item ${a.urgent ? "chef-urgent" : ""}`}>
              <div className="chef-order-table">
                <span>{a.table}</span>
                <span className="chef-timer">{a.timer} min</span>
              </div>
              <div className="chef-order-time">{a.time} ({a.ago})</div>
              <div className="chef-order-items">{a.item}</div>
              {a.note && <div className="chef-order-note">{a.note}</div>}
              <div className="chef-order-actions">
                <button className="chef-btn chef-btn-secondary chef-btn-sm" onClick={() => handleStartPreparationFromAccepted(ai)}>▶ Start Prep</button>
                <button className="chef-btn chef-btn-reject chef-btn-sm" onClick={() => handleRejectAccepted(ai)}>✖ Reject</button>
              </div>
            </div>
          ))}
        </div>

        {/* Preparing */}
        <div className="chef-kanban-column">
          <div className="chef-column-header">
            <span>Preparing</span>
            <span className="chef-order-count">{orders?.preparing?.length || 0}</span>
          </div>
          {(orders?.preparing || []).map((o, i) => (
            <div key={`prep-${i}`} className={`chef-order-item ${o.urgent ? "chef-urgent" : ""}`}>
              <div className="chef-order-table">
                <span>{o.table}</span>
                <span className="chef-timer">{o.timer} min</span>
              </div>
              <div className="chef-order-time">{o.time} ({o.ago})</div>
              <div className="chef-order-items">{o.items}</div>
              {o.note && <div className="chef-order-note">{o.note}</div>}
              <div className="chef-order-actions">
                <button className="chef-btn chef-btn-secondary chef-btn-sm" onClick={() => moveOrder("preparing", "ready", i)}>🔔 Mark Ready</button>
              </div>
            </div>
          ))}
        </div>

        {/* Ready */}
        <div className="chef-kanban-column">
          <div className="chef-column-header">
            <span>Ready to Serve</span>
            <span className="chef-order-count">{orders?.ready?.length || 0}</span>
          </div>
          {(orders?.ready || []).map((o, i) => (
            <div key={`ready-${i}`} className="chef-order-item">
              <div className="chef-order-table">
                <span>{o.table}</span>
                <span className="chef-timer">{o.timer} min</span>
              </div>
              <div className="chef-order-time">{o.time} ({o.ago})</div>
              <div className="chef-order-items">{o.items}</div>
              <div className="chef-order-actions">
                <button className="chef-btn chef-btn-outline chef-btn-sm" onClick={() => moveOrder("ready", "preparing", i)}>↩ Reopen</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
