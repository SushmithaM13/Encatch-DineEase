import React, { useEffect, useState } from "react";
import "./OrderQueue.css";
import {
  getOrders,
  moveToPreparing,
  markReady,
} from "../../Api/orders"; // ✅ lowercase api

export default function OrderQueue() {
  const [orders, setOrders] = useState({
    newOrders: [],
    preparing: [],
    ready: [],
  });

  const fetchOrders = async () => {
    const data = await getOrders();
    setOrders({ ...data }); // spread to trigger re-render
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (index) => {
    await moveToPreparing(index);
    fetchOrders();
  };

  const handleMarkReady = async (index) => {
    await markReady(index);
    fetchOrders();
  };

  return (
    <div className="order-management">
      <h3>Order Management</h3>
      <div className="order-sections">
        <div className="orders-block">
          <h4>New Orders ({orders.newOrders.length})</h4>
          {orders.newOrders.map((o, idx) => (
            <div key={`new-${idx}`} className="order-card">
              <strong>Table {o.table}</strong>
              <p>{o.time} ({o.ago})</p>
              <p>{o.items}</p>
              {o.note && <p className="note">{o.note}</p>}
              <button onClick={() => handleAccept(idx)}>✓ Accept</button>
            </div>
          ))}
        </div>

        <div className="orders-block">
          <h4>Preparing ({orders.preparing.length})</h4>
          {orders.preparing.map((o, idx) => (
            <div key={`prep-${idx}`} className="order-card">
              <strong>Table {o.table}</strong>
              <p>{o.time} ({o.ago})</p>
              <p>{o.items}</p>
              {o.note && <p className="note">{o.note}</p>}
              <button onClick={() => handleMarkReady(idx)}>🔔 Mark Ready</button>
            </div>
          ))}
        </div>

        <div className="orders-block">
          <h4>Ready to Serve ({orders.ready.length})</h4>
          {orders.ready.map((o, idx) => (
            <div key={`ready-${idx}`} className="order-card">
              <strong>Table {o.table}</strong>
              <p>{o.time} ({o.ago})</p>
              <p>{o.items}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
