import React, { useState, useEffect } from "react";
import "./OrderQueue.css";

export default function ChefOrderQueue() {

  const ORG_ID = "5a812c7d-c96f-4929-823f-86b4a62be304";

  const FETCH_API = `http://localhost:8082/dine-ease/api/v1/chef-notifications/all/${ORG_ID}/1`;
  const STATUS_API = `http://localhost:8082/dine-ease/api/v1/${ORG_ID}/orders/order-item/status`;

  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState({
    newOrders: [],
    accepted: [],
    preparing: [],
    ready: [],
  });

  // ---------- DATE FIX ----------
  const parseDateArray = (arr) =>
    arr
      ? new Date(
          arr[0], arr[1] - 1, arr[2],
          arr[3], arr[4], arr[5],
          Math.floor(arr[6] / 1000000)
        )
      : new Date();

  // ---------- FETCH ORDERS ----------
  const fetchOrders = async () => {
    try {
      const res = await fetch(FETCH_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const bucket = {
        newOrders: [],
        accepted: [],
        preparing: [],
        ready: [],
      };

      // ✅ EVERY item goes to NEW ORDERS
      data.forEach((n) => {

        bucket.newOrders.push({
          id: n.orderItemId || n.chefNotificationId,
          table: `Table ${n.tableNumber || "X"}`,
          time: parseDateArray(n.sentAt).toLocaleTimeString(),
          ago: `${Math.floor(
            (Date.now() - parseDateArray(n.sentAt)) / 60000
          )} min ago`,
          items: (n.orderItemDetails || [])
            .map(i => `${i.itemQuantity} x ${i.orderItemName}`)
            .join(", "),
          note: n.orderReference,
          timer: 15
        });
      });

      setOrders(bucket);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // ---------- UPDATE STATUS ----------
  const updateStatus = async (id, status, column) => {
    try {
      await fetch(STATUS_API, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderItemId: id,
          itemStatus: status,
          notes: "Updated from UI",
        }),
      });

      moveToColumn(id, column);
    } catch (err) {
      alert("Status update failed");
    }
  };

  // ---------- MOVE UI ----------
  const moveToColumn = (id, column) => {
    let moved;

    const removeFrom = (list) => list.filter(o => {
      if (o.id === id) moved = o;
      return o.id !== id;
    });

    setOrders(prev => ({
      newOrders: removeFrom(prev.newOrders),
      accepted: column === "accepted" ? [...prev.accepted, moved] : prev.accepted,
      preparing: column === "preparing" ? [...prev.preparing, moved] : prev.preparing,
      ready: column === "ready" ? [...prev.ready, moved] : prev.ready,
    }));
  };

  // ---------- HANDLERS ----------
  const accept = o => updateStatus(o.id, "ACCEPTED", "accepted");
  const reject = o => updateStatus(o.id, "REJECTED", "newOrders");
  const preparing = o => updateStatus(o.id, "PREPARING", "preparing");
  const ready = o => updateStatus(o.id, "READY", "ready");

  // ---------- UI ----------
  return (
    <div className="chef-order-management container">

      <div className="chef-header-row">
        <h2>Order Queue</h2>
        <button onClick={fetchOrders} className="chef-refresh-btn">🔄 Refresh</button>
      </div>

      <div className="chef-kanban-board">

        {/* NEW */}
        <Column title="New Orders" count={orders.newOrders.length}>
          {orders.newOrders.map(o => (
            <OrderCard key={o.id} order={o}>
              <button className="chef-btn chef-btn-success" onClick={() => accept(o)}>✅ Accept</button>
              <button className="chef-btn chef-btn-danger" onClick={() => reject(o)}>❌ Reject</button>
            </OrderCard>
          ))}
        </Column>

        {/* ACCEPTED */}
        <Column title="Accepted" count={orders.accepted.length}>
          {orders.accepted.map(o => (
            <OrderCard key={o.id} order={o}>
              <button className="chef-btn chef-btn-secondary" onClick={() => preparing(o)}>▶ Start Prep</button>
            </OrderCard>
          ))}
        </Column>

        {/* PREPARING */}
        <Column title="Preparing" count={orders.preparing.length}>
          {orders.preparing.map(o => (
            <OrderCard key={o.id} order={o}>
              <button className="chef-btn chef-btn-primary" onClick={() => ready(o)}>🔔 Mark Ready</button>
            </OrderCard>
          ))}
        </Column>

        {/* READY */}
        <Column title="Ready to Serve" count={orders.ready.length}>
          {orders.ready.map(o => (
            <OrderCard key={o.id} order={o} />
          ))}
        </Column>

      </div>
    </div>
  );
}

// ---------- COMPONENTS ----------

const Column = ({ title, count, children }) => (
  <div className="chef-kanban-column">
    <div className="chef-column-header">
      <span>{title}</span>
      <span className="chef-order-count">{count}</span>
    </div>
    {children}
  </div>
);

const OrderCard = ({ order, children }) => (
  <div className="chef-order-item">

    <div className="chef-order-table">
      <span>{order.table}</span>
      <span className="chef-timer">{order.timer} min</span>
    </div>

    <div className="chef-order-time">
      {order.time} ({order.ago})
    </div>

    <div className="chef-order-items">{order.items}</div>
    <div className="chef-order-note">Ref: {order.note}</div>

    {children && (
      <div className="chef-order-actions">{children}</div>
    )}

  </div>
);
