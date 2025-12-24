import { useEffect, useState } from "react";
import "./WaiterOrders.css";
import { fetchWaiterOrders } from "../api/WaiterOrderApi";
import { updateOrderItemStatus } from "../api/WaiterOrderApi";
import { getWaiterProfile } from "../api/WaiterOrderApi";


const STATUS_META = {
  ASSIGNED: "Chef assigned the item",
  ACCEPTED: "Chef accepted the item",
  PREPARING: "Chef is preparing the item",
  READY_TO_SERVE: "Item is ready to serve",
  SERVED: "Item has been served",
  CANCELLED: "Item was cancelled",
  OUT_OF_STOCK: "Item is out of stock",
};

export default function WaiterOrders() {
  const [organizationId, setOrganizationId] = useState(null);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    try {
      const profile = await getWaiterProfile();

      const orgId = profile?.organization?.organizationId
        || profile?.organizationId;

      if (!orgId) {
        console.error("❌ organizationId not found in profile");
        return;
      }

      setOrganizationId(orgId);
      localStorage.setItem("organizationId", orgId); // optional cache

      loadOrders();
    } catch (err) {
      console.error("❌ Failed to init waiter orders:", err.message);
    }
  };


  const [orders, setOrders] = useState({
    NEW: [],
    ONGOING: [],
    COMPLETED: [],
    PAYMENT_COMPLETED: [],
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetchWaiterOrders(0, 10);

      const categorized = {
        NEW: [],
        ONGOING: [],
        COMPLETED: [],
        PAYMENT_COMPLETED: [],
      };

      res.content.forEach((waiterOrder) => {
        waiterOrder.orders.forEach((order) => {
          order.orderItems.forEach((item) => {
            const itemData = {
              orderItemId: item.id,
              itemName: item.itemName,
              itemStatus: item.itemStatus,
              description: STATUS_META[item.itemStatus],
            };


            const baseOrder = {
              orderId: order.orderId,
              table: waiterOrder.tableNumber,
              time: order.orderTime,
            };

            if (
              ["ASSIGNED", "ACCEPTED", "PREPARING", "CANCELLED", "OUT_OF_STOCK"]
                .includes(item.itemStatus)
            ) {
              pushItem(categorized.NEW, baseOrder, itemData);
            } else if (item.itemStatus === "READY_TO_SERVE") {
              pushItem(categorized.ONGOING, baseOrder, itemData);
            } else if (item.itemStatus === "SERVED") {
              pushItem(categorized.COMPLETED, baseOrder, itemData);
            }
          });

          if (order.isPaymentCompleted) {
            categorized.PAYMENT_COMPLETED.push({
              orderId: order.orderId,
              table: waiterOrder.tableNumber,
              time: order.orderTime,
              items: [],
            });
          }
        });
      });

      setOrders(categorized);
    } catch (err) {
      console.error("❌ Failed to load orders:", err.message);
    }
  };

  const serveItem = async (orderItemId) => {
    try {
      const token = localStorage.getItem("token");

      if (!organizationId) {
        console.error("❌ organizationId not ready yet");
        return;
      }

      await updateOrderItemStatus(
        organizationId,
        orderItemId,
        token
      );

      console.log("✅ Item served:", orderItemId);
      console.log("➡️ Reloading orders...");


      loadOrders();
    } catch (err) {
      console.error("❌ Serve failed:", err.message);
    }
  };



  return (
    <div className="waiter-orders-new-orders-grid">
      <OrderColumn title="New Orders" orders={orders.NEW} />
      <OrderColumn
        title="Ongoing Orders"
        orders={orders.ONGOING}
        onServe={serveItem}
      />
      <OrderColumn title="Completed Orders" orders={orders.COMPLETED} />
      <OrderColumn
        title="Payments Completed"
        orders={orders.PAYMENT_COMPLETED}
      />
    </div>
  );
}

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function pushItem(list, baseOrder, item) {
  let existing = list.find(
    o =>
      o.orderId === baseOrder.orderId &&
      o.table === baseOrder.table
  );

  if (!existing) {
    existing = { ...baseOrder, items: [] };
    list.push(existing);
  }

  existing.items.push(item);
}


/* ---------------------------------- */
/* UI Components */
/* ---------------------------------- */

function OrderColumn({ title, orders, onServe }) {
  return (
    <div className="waiter-orders-new-orders-column">
      <h2>{title}</h2>

      {orders.map((order) => (
        <OrderCard
          key={`${title}-${order.orderId}`}
          order={order}
          onServe={onServe}
        />
      ))}
    </div>
  );
}


function OrderCard({ order, onServe }) {
  return (
    <div className="waiter-orders-new-orders-card">
      {/* Sticky order header */}
      <div className="waiter-orders-header">
        <h3>Order #{order.orderId}</h3>
        <span>Table {order.table}</span>
      </div>

      <div className="waiter-orders-order-time">{order.time}</div>

      {/* Scroll ONLY items */}
      <div className="waiter-orders-items-scroll">
        {order.items.map((item) => (
          <div key={item.orderItemId} className="waiter-orders-order-item">
            <div className="waiter-orders-item-name">{item.itemName}</div>

            <div className={`waiter-orders-item-status ${item.itemStatus}`}>
              {item.itemStatus}
            </div>

            <div className="waiter-orders-item-desc">
              {item.description}
            </div>

            {item.itemStatus === "READY_TO_SERVE" && onServe && (
              <button
                className="waiter-orders-serve-btn"
                onClick={() => onServe(item.orderItemId)}
              >
                Serve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
