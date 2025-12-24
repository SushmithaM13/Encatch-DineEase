import { useEffect, useState } from "react";
import "./WaiterNotification.css";
import { getWaiterNotifications } from "../api/WaiterNotificationApi";

export default function WaiterNotification({ smallView = false, onCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 Auth details
  const token = localStorage.getItem("token");
  const waiterId = Number(localStorage.getItem("waiterId"));

  useEffect(() => {
    if (!token || !waiterId) return;

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, waiterId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getWaiterNotifications(waiterId, token);
      console.log("🔔 Notifications API Data:", data);

      const list = Array.isArray(data) ? data : [];

      setNotifications(list);

      // 🔔 Correct notification count (order items count)
      if (onCountChange) {
        const count = list.reduce(
          (total, n) =>
            total +
            (n.orders?.reduce(
              (oTotal, o) => oTotal + (o.orderItems?.length || 0),
              0
            ) || 0),
          0
        );
        onCountChange(count);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        smallView
          ? "waiter-notifications-popup-list"
          : "waiter-notifications-page"
      }
    >
      {!smallView && (
        <h1 className="waiter-notifications-title">Notifications</h1>
      )}

      <div className="waiter-notifications-list">
        {loading && (
          <p className="waiter-notifications-empty">Loading...</p>
        )}

        {!loading && error && (
          <p className="waiter-notifications-empty error">{error}</p>
        )}

        {!loading && !error && notifications.length === 0 && (
          <p className="waiter-notifications-empty">No notifications</p>
        )}

        {!loading &&
          !error &&
          notifications.map((notification, index) => (
            <div key={index} className="waiter-notifications-card">
              <p className="waiter-notifications-message">
                🍽️ Table {notification.tableNumber}
              </p>

              {notification.orders?.map((order, oIndex) => (
                <div
                  key={oIndex}
                  className="waiter-notifications-order"
                >
                  <strong>Order:</strong> {order.orderReference}

                  {order.orderItems?.map((item, iIndex) => (
                    <p
                      key={iIndex}
                      className="waiter-notifications-item"
                    >
                      ✅ {item.itemName} × {item.quantity}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
