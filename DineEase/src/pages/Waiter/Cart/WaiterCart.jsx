import { useEffect, useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";

import {
  getCart,
  addItemToCart,
  removeCartItem,
  clearCartAPI,
} from "../api/WaiterCartApi";

import { checkoutOrder } from "../api/WaiterOrderApi";
import "./WaiterCart.css";

export default function WaiterCart({
  token,
  organizationId,
  closeCart,
}) {
  const [searchParams] = useSearchParams();

  // ✅ SINGLE SOURCE OF TRUTH (DO NOT MODIFY)
  const sessionId = searchParams.get("sessionId");
  const tableNumber = searchParams.get("tableNumber");

  const [cart, setCart] = useState([]);
  const [clearCartModal, setClearCartModal] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState({
    open: false,
    type: "",
    message: "",
  });

  // ---------------------------------------------
  // FETCH CART
  // ---------------------------------------------
  const fetchCart = useCallback(async () => {
    if (!organizationId || !sessionId || !tableNumber || !token) return;

    try {
      const data = await getCart(
        organizationId,
        sessionId,
        tableNumber,
        token
      );

      setCart(
        (data.items || []).map((item) => ({
          id: item.cartItemId,
          name: item.menuItemName,
          qty: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          variantId: item.variantId,
          addons: item.addons || [],
          customizations: item.customizations || [],
        }))
      );
    } catch (err) {
      console.error("❌ Fetch cart failed:", err.message);
    }
  }, [organizationId, sessionId, tableNumber, token]);

  useEffect(() => {
    fetchCart();
    window.addEventListener("openCart", fetchCart);
    return () => window.removeEventListener("openCart", fetchCart);
  }, [fetchCart]);

  // ---------------------------------------------
  // UPDATE QUANTITY
  // ---------------------------------------------
  const updateItemQuantity = async (item, type) => {
    try {
      if (type === "INC") {
        await addItemToCart(
          organizationId,
          {
            menuItemVariantId: item.variantId,
            quantity: 1,

            // ✅ IDs ONLY (derived from cart item)
            addonIds: item.addons.map(a => a.addonId),
            customizationOptionIds: item.customizations.map(
              c => c.customizationOptionId
            ),


            sessionId,   // from URL
            tableNumber,
          },
          token
        );
      }




      if (type === "DEC") {
        await removeCartItem(organizationId, item.id, sessionId, token);
      }

      await fetchCart();
    } catch (err) {
      console.error("❌ Quantity update failed:", err.message);
    }
  };


  // ---------------------------------------------
  // REMOVE ITEM
  // ---------------------------------------------
  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeCartItem(
        organizationId,
        cartItemId,
        sessionId,
        token
      );
      await fetchCart();
    } catch (err) {
      console.error("❌ Remove failed:", err.message);
    }
  };

  // ---------------------------------------------
  // CLEAR CART
  // ---------------------------------------------
  const handleClearCart = async () => {
    try {
      await clearCartAPI(
        organizationId,
        sessionId,
        token
      );
      setCart([]);
      setClearCartModal(false);
    } catch (err) {
      console.error("❌ Clear cart failed:", err.message);
    }
  };

  // ---------------------------------------------
  // CHECKOUT
  // ---------------------------------------------
  const handleCheckout = async () => {
    if (!sessionId || !tableNumber) {
      setCheckoutModal({
        open: true,
        type: "error",
        message: "Invalid session or table number",
      });
      return;
    }
    console.log("✅ Initiating checkout...", { organizationId, sessionId, tableNumber });

    try {
      await checkoutOrder(
        organizationId,
        {
          sessionId,
          tableNumber,
          orderType: "DINE_IN",
        },
        token
      );

      setCheckoutModal({
        open: true,
        type: "success",
        message: "Order placed successfully!",
      });

      setCart([]);
    } catch {
      setCheckoutModal({
        open: true,
        type: "error",
        message: "Checkout failed. Please try again.",
      });
      
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.totalPrice || 0),
    0
  );

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="waiter-cart-wrapper">
      <div className="waiter-cart-header">
        <h3>Your Cart</h3>
        <button onClick={closeCart}>
          <X size={20} />
        </button>
      </div>

      <div className="waiter-cart-items">
        {cart.length === 0 ? (
          <div className="waiter-cart-empty-cart">Cart is empty</div>
        ) : (
          cart.map((item) => (
            <div className="waiter-cart-item" key={item.id}>
              <strong>{item.name}</strong>

              <div className="waiter-cart-controls">
                <button onClick={() => updateItemQuantity(item, "DEC")}>
                  <Minus size={14} />
                </button>

                <span>{item.qty}</span>

                <button onClick={() => updateItemQuantity(item, "INC")}>
                  <Plus size={14} />
                </button>

                <span>₹{item.totalPrice}</span>

                <button onClick={() => handleRemoveItem(item.id)}>
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="waiter-cart-summary">
        <span>Subtotal</span>
        <span>₹{subtotal}</span>
      </div>

      <div className="waiter-cart-actions">
        <button onClick={handleCheckout} disabled={!cart.length}>
          Checkout
        </button>

        <button
          onClick={() => setClearCartModal(true)}
          disabled={!cart.length}
        >
          Clear Cart
        </button>
      </div>

      {clearCartModal && (
        <div className="waiter-cart-checkout-modal-backdrop">
          <div className="waiter-cart-checkout-modal error">
            <h3>Clear Cart</h3>
            <p>Are you sure?</p>
            <button onClick={handleClearCart}>Yes</button>
            <button onClick={() => setClearCartModal(false)}>No</button>
          </div>
        </div>
      )}

      {checkoutModal.open && (
        <div className="waiter-cart-checkout-modal-backdrop">
          <div className={`waiter-cart-checkout-modal ${checkoutModal.type}`}>
            <h3>{checkoutModal.type === "success" ? "Success" : "Error"}</h3>
            <p>{checkoutModal.message}</p>
            <button onClick={() => setCheckoutModal({ open: false })}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
