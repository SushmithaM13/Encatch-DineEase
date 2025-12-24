import React, { useEffect, useState, useCallback } from "react";
import { checkoutOrder, getOrdersBySession } from "../api/customerOrdersAPI";

import { useSession } from "../../context/SessionContext";
import CustomerDashboardNav from "../customerNavbar/customerDashboardNav";
import "./CustomerOrder.css";

const Orders = () => {
  const { orgId, sessionId, tableId } = useSession();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrdersBySession({ orgId, sessionId });
      setOrders(data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [orgId, sessionId]);

  useEffect(() => {
    if (orgId && sessionId) fetchOrders();
  }, [fetchOrders, orgId, sessionId]);

  /* ================= CREATE ORDER ================= */
  const handleCheckout = async () => {
    try {
      setCreating(true);
      const res = await checkoutOrder({ orgId, sessionId, tableNumber: tableId, orderType: "DINE_IN" });
      alert(res.message || "Order created successfully");
      fetchOrders();
    } catch (err) {
      console.error("Checkout failed:", err.response?.data || err);
      alert("Checkout failed");
    } finally {
      setCreating(false);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="orders-error">{error}</p>;

  return (
    <>
      <CustomerDashboardNav />

      <div className="orders-page">
        <div className="orders-header">
          <h2>My Orders</h2>
          <button className="checkout-btn" onClick={handleCheckout} disabled={creating}>
            {creating ? "Creating Order..." : "Checkout Cart"}
          </button>
        </div>

        {orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-top">
                <div>
                  <strong>{order.orderReference}</strong>
                  <p>Table: {order.tableNumber}</p>
                </div>

                <span className={`status ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span>
              </div>

              <div className="order-meta">
                <span>Total: ₹{order.totalAmount}</span>
                <span>Items: {order.totalItems}</span>
                <span>Payment: {order.paymentStatus}</span>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.orderItemId} className="order-item">
                    <div>
                      <b>{item.menuItemName}</b>
                      <small>
                        {item.variantName} ({item.variantSize})
                      </small>
                    </div>

                    <div>
                      x{item.quantity} · ₹{item.totalPrice}
                    </div>

                    <span className="item-status">{item.itemStatus}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Orders;
