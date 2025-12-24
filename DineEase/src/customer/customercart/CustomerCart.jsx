import React, { useEffect, useState, useCallback } from "react";
import { getCart, addItemToCart } from "../api/customerCartAPI";
import { checkoutOrder } from "../api/customerOrdersAPI"; // checkout API
import { useSession } from "../../context/SessionContext";
import { useNavigate } from "react-router-dom"; // redirect
import CustomerDashboardNav from "../customerNavbar/customerDashboardNav";
import "./CustomerCart.css";

const CustomerCart = () => {
  const { orgId, sessionId, tableId } = useSession();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ================= FETCH CART =================
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getCart({
        organizationId: orgId,
        sessionId,
        tableNumber: tableId,
      });

      setCart(data);
      setError("");
    } catch (err) {
      console.error("Fetch cart failed:", err);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [orgId, sessionId, tableId]);

  useEffect(() => {
    if (orgId && sessionId && tableId) {
      fetchCart();
    }
  }, [fetchCart, orgId, sessionId, tableId]);

  // ================= INCREASE QTY =================
  const increaseQty = async (item) => {
    try {
      await addItemToCart({
        orgId,
        menuItemVariantId: item.variantId,
        quantity: item.quantity + 1,
        addons: item.addons || [],
        customizations: item.customizations || [],
        sessionId,
        tableNumber: tableId,
        specialInstructions: item.specialInstructions || "",
      });

      fetchCart();
    } catch (err) {
      console.error("Increase qty failed:", err.response?.data || err);
    }
  };

  // ================= DECREASE QTY =================
  const decreaseQty = async (item) => {
    if (item.quantity <= 1) return;

    try {
      await addItemToCart({
        orgId,
        menuItemVariantId: item.variantId,
        quantity: item.quantity - 1,
        addons: item.addons || [],
        customizations: item.customizations || [],
        sessionId,
        tableNumber: tableId,
        specialInstructions: item.specialInstructions || "",
      });

      fetchCart();
    } catch (err) {
      console.error("Decrease qty failed:", err.response?.data || err);
    }
  };

  // ================= SUBMIT ORDER =================
  const handleSubmitOrder = async () => {
    if (!cart?.items?.length) return alert("Cart is empty");

    try {
      setSubmitting(true);

      const res = await checkoutOrder({
        orgId, // ✅ use orgId
        sessionId,
        tableNumber: tableId,
        orderType: "DINE_IN",
      });

      alert(res.message || "Order created successfully");

      // Clear cart and redirect to Orders page
      setCart(null);
      navigate("/orders");
    } catch (err) {
      console.error("Checkout failed:", err.response?.data || err);
      alert("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UI STATES =================
  if (loading) return <p>Loading cart...</p>;
  if (error) return <p className="cart-error">{error}</p>;
  if (!cart?.items?.length) return <p>Your cart is empty</p>;

  // ================= JSX =================
  return (
    <>
      <CustomerDashboardNav />

      <div className="cart-page">
        {/* LEFT SIDE */}
        <div className="cart-left">
          <div className="cart-header">
            <span>Item</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          {cart.items.map((item) => (
            <div key={item.cartItemId} className="cart-row">
              <span>{item.menuItemName}</span>
              <span>₹{item.unitPrice}</span>

              <span className="qty-controls">
                <button
                  onClick={() => decreaseQty(item)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button onClick={() => increaseQty(item)}>+</button>
              </span>

              <span>₹{item.totalPrice}</span>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="cart-right">
          <h3>Order Value: ₹{cart.grandTotal}</h3>
          <button
            className="submit-btn"
            onClick={handleSubmitOrder}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Order"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CustomerCart;
