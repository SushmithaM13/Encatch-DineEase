import React, { useEffect, useState } from "react";
import {
  getStaffProfile,
  getChefOrders,
  updateOrderItemStatus,
  markMenuOutOfStock,
} from "./Api/OrderQuery";
import "./OrderQuery.css";

const ChefOrderQuery = () => {
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

  /* ================= PROFILE ================= */
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getStaffProfile();
      setChefId(profile.userId || profile.id);
      setOrgId(
        profile.organizationId || profile.organization?.organizationId
      );
    } catch (err) {
      console.error("Profile load failed", err);
    }
  };

  /* ================= ORDERS ================= */
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
      return await getChefOrders({
        organizationId: orgId,
        chefId,
        status,
      });
    } catch (err) {
      console.error(`Fetch failed: ${status}`, err);
      return [];
    }
  };

  /* ================= STATUS HANDLERS ================= */
  const handleNext = async (itemId, status) => {
    try {
      await updateOrderItemStatus({
        organizationId: orgId,
        orderItemId: itemId,
        itemStatus: status,
      });
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
      await updateOrderItemStatus({
        organizationId: orgId,
        orderItemId: selectedItemId,
        itemStatus: "CANCELLED",
        notes: cancelReason,
      });
      setShowCancelModal(false);
      setTimeout(fetchAllOrders, 300);
    } catch (err) {
      console.error("Cancel failed", err);
    }
  };

  const handleOutOfStock = async (itemId, menuId) => {
    try {
      await updateOrderItemStatus({
        organizationId: orgId,
        orderItemId: itemId,
        itemStatus: "OUT_OF_STOCK",
      });
      await markMenuOutOfStock({ organizationId: orgId, menuId });
      setTimeout(fetchAllOrders, 300);
    } catch (err) {
      console.error("Out of stock failed", err);
    }
  };

  /* ================= UI RENDER ================= */
  const renderOrders = (orders, stage) =>
    orders.length === 0 ? (
      <p className="Chef-OrderQ-empty">No orders</p>
    ) : (
      orders.map((order) =>
        order.orderItems.map((item) => (
          <div key={item.orderItemId} className="Chef-OrderQ-order-card">
            <p className="Chef-OrderQ-field">
              <b>Order Ref:</b> {order.orderReference}
            </p>
            <p className="Chef-OrderQ-field">
              <b>Table:</b> {order.tableNumber}
            </p>
            <p className="Chef-OrderQ-field">
              <b>Item:</b> {item.orderItemName}
            </p>
            <p className="Chef-OrderQ-field">
              <b>Qty:</b> {item.quantity}
            </p>

            <div className="Chef-OrderQ-actions">
              {stage !== "PREPARING" && stage !== "READY_TO_SERVE" && (
                <>
                  <button
                    className="Chef-OrderQ-btn Chef-OrderQ-cancel"
                    onClick={() => openCancelModal(item.orderItemId)}
                  >
                    Cancel
                  </button>

                  <button
                    className="Chef-OrderQ-btn Chef-OrderQ-out"
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
                  className="Chef-OrderQ-btn Chef-OrderQ-accept"
                  onClick={() =>
                    handleNext(item.orderItemId, "ACCEPTED")
                  }
                >
                  Accept
                </button>
              )}

              {stage === "ACCEPTED" && (
                <button
                  className="Chef-OrderQ-btn Chef-OrderQ-ready"
                  onClick={() =>
                    handleNext(item.orderItemId, "PREPARING")
                  }
                >
                  Start Preparing
                </button>
              )}

              {stage === "PREPARING" && (
                <button
                  className="Chef-OrderQ-btn Chef-OrderQ-serve"
                  onClick={() =>
                    handleNext(item.orderItemId, "READY_TO_SERVE")
                  }
                >
                  Ready To Serve
                </button>
              )}
            </div>
          </div>
        ))
      )
    );

  return (
    <div className="Chef-OrderQ-order-queue">
      <div className="Chef-OrderQ-column">
        <h3>New Orders</h3>
        {renderOrders(assigned, "ASSIGNED")}
      </div>

      <div className="Chef-OrderQ-column">
        <h3>Accepted Orders</h3>
        {renderOrders(accepted, "ACCEPTED")}
      </div>

      <div className="Chef-OrderQ-column">
        <h3>Preparing</h3>
        {renderOrders(preparing, "PREPARING")}
      </div>

      <div className="Chef-OrderQ-column">
        <h3>Ready To Serve</h3>
        {renderOrders(readyToServe, "READY_TO_SERVE")}
      </div>

      {showCancelModal && (
        <div className="Chef-OrderQ-modal-overlay">
          <div className="Chef-OrderQ-modal-box">
            <h3>Cancel Order Item</h3>

            <textarea
              placeholder="Enter cancel reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />

            <div className="Chef-OrderQ-modal-actions">
              <button
                className="Chef-OrderQ-btn Chef-OrderQ-cancel"
                onClick={() => setShowCancelModal(false)}
              >
                Close
              </button>
              <button 
                className="Chef-OrderQ-btn Chef-OrderQ-accept" 
                onClick={confirmCancel}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefOrderQuery;