import { useEffect, useState } from "react";
import "./WaiterOrders.css";

import {
  fetchWaiterOrders,
  updateOrderItemStatus,
  getWaiterProfile,
} from "../api/WaiterOrderApi";
import { getAssignedTables } from "../api/WaiterTableApi";

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
  const [assignedTables, setAssignedTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("ALL");


  const [orders, setOrders] = useState({
    NEW: [],
    ONGOING: [],
    COMPLETED: [],
    PAYMENT_COMPLETED: [],
  });
  const sortedAssignedTables = [...assignedTables].sort((a, b) => {
    const numA = parseInt(a.tableNumber.replace(/[^0-9]/g, ""));
    const numB = parseInt(b.tableNumber.replace(/[^0-9]/g, ""));
    return numA - numB;
  });

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    try {
      const token = localStorage.getItem("token");
      const profile = await getWaiterProfile(token);

      const waiterEmail = profile?.email;
      const orgId =
        profile?.organization?.organizationId || profile?.organizationId;

      if (!orgId || !waiterEmail) {
        console.error("Missing organizationId or waiter email");
        return;
      }

      setOrganizationId(orgId);

      //  fetch assigned tables
      const tables = await getAssignedTables(waiterEmail);
      setAssignedTables(tables);

      console.log(" Assigned Tables:", tables);

      loadOrders(tables);
    } catch (err) {
      console.error(" Failed to init waiter orders:", err.message);
    }
  };

  const loadOrders = async (tablesList = assignedTables) => {
    try {
      const res = await fetchWaiterOrders(0, 100);

      // Map table → session
      const tableSessionMap = new Map();
      tablesList.forEach((t) => {
        if (t.tableNumber && t.sessionId) {
          tableSessionMap.set(t.tableNumber, t.sessionId);
        }
      });

      const categorized = {
        NEW: [],
        ONGOING: [],
        COMPLETED: [],
        PAYMENT_COMPLETED: [],
      };

      res.content.forEach((waiterOrder) => {
        const table = waiterOrder.tableNumber;
        const session = waiterOrder.sessionId;

        //  keep only matched assigned table/session
        if (!tableSessionMap.has(table)) return;
        if (tableSessionMap.get(table) !== session) return;

        //  filter by selected table
        if (selectedTable !== "ALL" && table !== selectedTable) return;

        waiterOrder.orders.forEach((order) => {
          order.orderItems.forEach((item) => {
            const itemData = {
              orderItemId: item.id,
              itemName: item.itemName,
              itemStatus: item.itemStatus,
              description: STATUS_META[item.itemStatus],
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              addOns: item.addOns || [],
              customizations: item.customizations || [],
              // orderReference: order.orderReference,
              orderTime: order.orderTime,
              table: waiterOrder.tableNumber,
              sessionId: waiterOrder.sessionId,
            };

            const baseOrder = {
              orderId: order.orderId,
              table,
              session,
              time: order.orderTime,
            };

            if (
              [
                "ASSIGNED",
                "ACCEPTED",
                "PREPARING",
                "CANCELLED",
                "OUT_OF_STOCK",
              ].includes(item.itemStatus)
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
              table,
              session,
              time: order.orderTime,
              items: [],
            });
          }
        });
      });

      setOrders(categorized);
    } catch (err) {
      console.error(" Failed to load orders:", err.message);
    }
  };

  // -----------------------
  // Serve Item
  // -----------------------
  const serveItem = async (orderItemId) => {
    try {
      const token = localStorage.getItem("token");

      if (!organizationId) return;

      await updateOrderItemStatus(organizationId, orderItemId, token);
      loadOrders();
    } catch (err) {
      console.error(" Serve failed:", err.message);
    }
  };
  // -----------------------
  // Table Button Click
  // -----------------------
  const handleTableFilter = (tableNumber) => {
    setSelectedTable(tableNumber);
  };

  //  Reload orders when table selection changes
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);


  return (
    <>
      {/*  Table Filter Buttons */}
      <div className="waiter-table-filter-bar">
        <button
          className={selectedTable === "ALL" ? "active-filter" : ""}
          onClick={() => handleTableFilter("ALL")}
        >
          All Tables
        </button>

        {sortedAssignedTables.map((t) => (

          <button
            key={t.tableNumber}
            className={selectedTable === t.tableNumber ? "active-filter" : ""}
            onClick={() => handleTableFilter(t.tableNumber)}
          >
            {t.tableNumber}
          </button>
        ))}
      </div>

      <div className="waiter-orders-new-orders-grid">
        <OrderColumn
          title="New Orders"
          orders={orders.NEW}
        />
        <OrderColumn
          title="Ongoing Orders"
          orders={orders.ONGOING}
          onServe={serveItem}
        />
        <OrderColumn
          title="Completed Orders"
          orders={orders.COMPLETED}
        />
        <OrderColumn
          title="Payments Completed Orders"
          orders={orders.PAYMENT_COMPLETED}
        />
      </div>
    </>
  );
}

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function pushItem(list, baseOrder, item) {
  let existing = list.find(
    (o) =>
      o.orderId === baseOrder.orderId &&
      o.table === baseOrder.table &&
      o.session === baseOrder.session
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

      {orders.length === 0 ? (
        <div className="no-orders-message">No  {title} </div>
      ) : (
        orders.map((order) => (
          <OrderCard
            key={`${title}-${order.orderId}-${order.session}`}
            order={order}
            onServe={onServe}

          />
        ))
      )}
    </div>
  );
}

function OrderCard({ order, onServe }) {
  const [expandedItemIds, setExpandedItemIds] = useState([]);

  const toggleExpand = (id) => {
    setExpandedItemIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="waiter-orders-new-orders-card">
      <div className="waiter-orders-header">
        <h3>Order #{order.orderId}</h3>
        <span>Table {order.table}</span>
      </div>

      <div className="waiter-orders-order-time">{order.time}</div>

      <div className="waiter-orders-items-scroll">
        {order.items.map((item) => {
          const isOpen = expandedItemIds.includes(item.orderItemId);

          return (
            <div key={item.orderItemId} className="waiter-orders-order-item">

              {/* ITEM TITLE */}
              <div
                className="waiter-orders-item-name clickable"
                onClick={() => toggleExpand(item.orderItemId)}
              >
                {item.itemName}
                <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
              </div>

              {/* STATUS */}
              <div className={`waiter-orders-item-status ${item.itemStatus}`}>
                {item.itemStatus}
              </div>

              {/* DESCRIPTION */}
              <div className="waiter-orders-item-desc">
                {item.description}
              </div>

              {/* SERVE BUTTON */}
              {item.itemStatus === "READY_TO_SERVE" && onServe && (
                <button
                  className="waiter-orders-serve-btn"
                  onClick={() => onServe(item.orderItemId)}
                >
                  Serve
                </button>
              )}

              {/*  EXPANDABLE DROPDOWN SECTION */}
              {isOpen && (
                <div className="waiter-order-item-dropdown-details">

                  <p><b>Quantity:</b> {item.quantity}</p>
                  <p><b>Unit Price:</b> ₹{item.unitPrice}</p>
                  <p><b>Total Price:</b> ₹{item.totalPrice}</p>

                  <h4>Addons</h4>
                  {item.addOns.length > 0 ? (
                    item.addOns.map((a, i) => (
                      <p key={i}>{a.name} — ₹{a.price}</p>
                    ))
                  ) : (
                    <p>No Addons</p>
                  )}

                  <h4>Customizations</h4>
                  {item.customizations.length > 0 ? (
                    item.customizations.map((c, i) => (
                      <p key={i}>
                        {c.customizationGroupName}: {c.customizationOption} (₹{c.price})
                      </p>
                    ))
                  ) : (
                    <p>No Customizations</p>
                  )}

                  {/* <p><b>Order Reference:</b> {item.orderReference}</p> */}
                  <p><b>Order Time:</b> {item.orderTime}</p>

                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

