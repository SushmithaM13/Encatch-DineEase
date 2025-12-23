import React, { useEffect, useState, useCallback } from "react";
import { getCart, addItemToCart } from "../api/customerCartAPI";
import { useSession } from "../../context/SessionContext";
import CustomerDashboardNav from "../customerNavbar/customerDashboardNav";
import "./CustomerCart.css";

const CustomerCart = () => {
  const { orgId, sessionId, tableId } = useSession();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      console.error(err);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, [orgId, sessionId, tableId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const increaseQty = async (item) => {
    await addItemToCart({
      orgId,
      menuItemVariantId: item.variantId,
      quantity: 1,
      sessionId,
      tableNumber: tableId,
    });

    fetchCart();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="cart-error">{error}</p>;
  if (!cart?.items?.length) return <p>Your cart is empty</p>;

  return (
    <>
      <CustomerDashboardNav />

      <div className="cart-page">
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
                <button disabled>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQty(item)}>+</button>
              </span>

              <span>₹{item.totalPrice}</span>
            </div>
          ))}
        </div>

        <div className="cart-right">
          <h3>Order Value: ₹{cart.grandTotal}</h3>
          <button className="submit-btn">Submit Order</button>
        </div>
      </div>
    </>
  );
};

export default CustomerCart;
