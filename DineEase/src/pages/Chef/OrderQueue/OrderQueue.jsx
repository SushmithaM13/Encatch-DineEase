import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderQueue.css";

const BASE_URL = "http://localhost:8082/dine-ease/api/v1";

const ChefOrderQueue = () => {
  const [chefId, setChefId] = useState(null);
  const [orgId, setOrgId] = useState(null);

  const [assigned, setAssigned] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [preparing, setPreparing] = useState([]);
  const [readyToServe, setReadyToServe] = useState([]);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // ================= PROFILE =================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/staff/profile`, { headers });
      setChefId(res.data.userId || res.data.id);
      setOrgId(res.data.organizationId || res.data.organization?.organizationId);
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  // ================= ORDERS =================
  useEffect(() => {
    if (chefId && orgId) {
      fetchAllOrders();
    }
  }, [chefId, orgId]);

  const fetchAllOrders = async () => {
    setAssigned(await fetchOrders("ASSIGNED"));
    setAccepted(await fetchOrders("ACCEPTED"));
    setPreparing(await fetchOrders("PREPARING"));
    setReadyToServe(await fetchOrders("READY_TO_SERVE"));
  };

  const fetchOrders = async (status) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/chef-notifications/all/orders`,
        {
          headers,
          params: {
            organizationId: orgId,
            chefId,
            status,
          },
        }
      );
      return res.data || [];
    } catch (err) {
      console.error(`Failed to fetch ${status}`, err);
      return [];
    }
  };

  // ================= ORDER ITEM STATUS =================
  const updateItemStatus = async (orderItemId, status, notes = "") => {
    await axios.put(
      `${BASE_URL}/${orgId}/orders/order-item/status`,
      {
        orderItemId,
        itemStatus: status,
        notes,
      },
      { headers }
    );
  };

  // ================= MENU OUT OF STOCK =================
  const markMenuOutOfStock = async (menuId) => {
    await axios.put(
      `${BASE_URL}/${orgId}/menu/${menuId}/availability`,
      {
        available: false,
        reason: "Out of Stock",
      },
      { headers }
    );
  };

  // ================= ACTION HANDLERS =================
  const handleNext = async (itemId, status) => {
    try {
      await updateItemStatus(itemId, status);
      setTimeout(fetchAllOrders, 300);
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const openCancelModal = (itemId) => {
    setSelectedItemId(itemId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Please enter cancel reason");
      return;
    }

    try {
      await updateItemStatus(selectedItemId, "CANCELLED", cancelReason);
      setShowCancelModal(false);
      setTimeout(fetchAllOrders, 300);
    } catch (err) {
      console.error("Cancel failed", err);
    }
  };

  const handleOutOfStock = async (itemId, menuId) => {
    try {
      await updateItemStatus(itemId, "OUT_OF_STOCK");
      await markMenuOutOfStock(menuId);
      setTimeout(fetchAllOrders, 300);
    } catch (err) {
      console.error("Out of stock failed", err);
    }
  };

  // ================= UI =================
  const renderOrders = (orders, stage) =>
    orders.length === 0 ? (
      <p className="empty">No orders</p>
    ) : (
      orders.map((order) =>
        order.orderItems.map((item) => (
          <div key={item.orderItemId} className="order-card">
            <p><b>Order Ref:</b> {order.orderReference}</p>
            <p><b>Table:</b> {order.tableNumber}</p>
            <p><b>Item:</b> {item.orderItemName}</p>
            <p><b>Qty:</b> {item.quantity}</p>

            <div className="actions">
              {stage !== "PREPARING" && stage !== "READY_TO_SERVE" && (
                <>
                  <button
                    className="btn cancel"
                    onClick={() => openCancelModal(item.orderItemId)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn out"
                    onClick={() =>
                      handleOutOfStock(item.orderItemId, item.menuId)
                    }
                  >
                    Out of Stock
                  </button>
                </>
              )}

              {stage === "ASSIGNED" && (
                <button
                  className="btn accept"
                  onClick={() => handleNext(item.orderItemId, "ACCEPTED")}
                >
                  Accept
                </button>
              )}

              {stage === "ACCEPTED" && (
                <button
                  className="btn ready"
                  onClick={() => handleNext(item.orderItemId, "PREPARING")}
                >
                  Start Preparing
                </button>
              )}

              {stage === "PREPARING" && (
                <button
                  className="btn serve"
                  onClick={() =>
                    handleNext(item.orderItemId, "READY_TO_SERVE")
                  }
                >
                  Ready to Serve
                </button>
              )}
            </div>
          </div>
        ))
      )
    );

  return (
    <div className="order-queue">
      <div className="column">
        <h3>New Orders</h3>
        {renderOrders(assigned, "ASSIGNED")}
      </div>

      <div className="column">
        <h3>Accepted Orders</h3>
        {renderOrders(accepted, "ACCEPTED")}
      </div>

      <div className="column">
        <h3>Preparing</h3>
        {renderOrders(preparing, "PREPARING")}
      </div>

      <div className="column">
        <h3>Ready to Serve</h3>
        {renderOrders(readyToServe, "READY_TO_SERVE")}
      </div>

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Cancel Order Item</h3>

            <textarea
              placeholder="Enter reason for cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn cancel" onClick={() => setShowCancelModal(false)}>
                Close
              </button>

              <button className="btn accept" onClick={confirmCancel}>
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefOrderQueue;
