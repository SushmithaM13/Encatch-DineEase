import { useEffect, useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";

import {
  getCart,
  // addItemToCart,
  removeCartItem,
  clearCartAPI,
  changeCartQuantity,

  validateCartAPI,
} from "../api/WaiterCartApi";

import { checkoutOrder } from "../api/WaiterOrderApi";
import "./WaiterCart.css";

export default function WaiterCart({
  token,
  organizationId,
  closeCart,
}) {
  const [searchParams] = useSearchParams();

  //  SINGLE SOURCE OF TRUTH (DO NOT MODIFY)
  const sessionId = searchParams.get("sessionId");
  const tableNumber = searchParams.get("tableNumber");

  const [cart, setCart] = useState([]);
  const [summary, setSummary] = useState(null);

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
          variantName: item.variantName,
          addons: item.addons || [],
          customizations: item.customizations || [],
        }))
      );

      // Extract summary directly from GET CART response
      setSummary({
        totalItems: data.totalItems,
        totalQuantity: data.totalQuantity,
        totalDiscount: data.totalDiscount,
        grandTotal: data.grandTotal
      });

    } catch (err) {
      console.error(" Fetch cart failed:", err.message);
    }
  }, [organizationId, sessionId, tableNumber, token]);

  useEffect(() => {
    const handler = () => fetchCart();
    window.addEventListener("cartUpdated", handler);

    return () => window.removeEventListener("cartUpdated", handler);
  }, [fetchCart]);
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);


  // ---------------------------------------------
  // UPDATE QUANTITY
  // ---------------------------------------------
  const updateItemQuantity = async (item, type) => {
    try {
      let newQty = item.qty;

      if (type === "INC") {
        newQty = item.qty + 1;
      }

      if (type === "DEC") {
        newQty = item.qty - 1;

        // If qty becomes 0 → remove item
        if (newQty <= 0) {
          await removeCartItem(organizationId, item.id, sessionId, token);
          await fetchCart();
          return;
        }
      }

      // Use new API
      await changeCartQuantity(item.id, newQty, token);

      await fetchCart();
    } catch (err) {
      console.error(" Quantity update failed:", err.message);
    }
  };
  // ---------------------------------------------
  // REMOVE ITEM
  // ---------------------------------------------
  // const handleRemoveItem = async (cartItemId) => {
  //   try {
  //     await removeCartItem(
  //       organizationId,
  //       cartItemId,
  //       sessionId,
  //       token
  //     );
  //     await fetchCart();
  //   } catch (err) {
  //     console.error(" Remove failed:", err.message);
  //   }
  // };

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
      console.error(" Clear cart failed:", err.message);
    }
  };

  // ---------------------------------------------
  // CHECKOUT
  // ---------------------------------------------
  // ---------------------------------------------
  // CHECKOUT (WITH CART VALIDATION)
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

    console.log(" Starting checkout… VALIDATING CART FIRST");

    try {
      //  Validate cart
      const validation = await validateCartAPI(organizationId, sessionId, token);

      if (!validation.ok) {
        console.error(" Cart validation failed:", validation.message);

        // Show backend error message
        setCheckoutModal({
          open: true,
          type: "error",
          message: validation.message,
        });

        return; //  STOP checkout
      }

      console.log(" Cart validation success!");

      //  Proceed with checkout since cart is valid
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

    } catch (err) {
      console.error(" Checkout error:", err);

      setCheckoutModal({
        open: true,
        type: "error",
        message: "Checkout failed. Please try again.",
      });
    }
  };


  // const subtotal = cart.reduce(
  //   (sum, item) => sum + (item.totalPrice || 0),
  //   0
  // );

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
  <div className="waiter-cart-main">
    {/* Quantity + Name + Price Inline */}
    <div className="waiter-cart-inline">
      <button onClick={() => updateItemQuantity(item, "DEC")}>-</button>
      <span className="cart-qty">{item.qty}</span>
      <button onClick={() => updateItemQuantity(item, "INC")}>+</button>

      <span className="cart-name">{item.name}</span>
      <span className="cart-price">₹{item.totalPrice}</span>
    </div>

    {/* Optional Variant */}
    {item.variantName && (
      <div className="waiter-cart-variant">
        Variant: <span>{item.variantName}</span>
      </div>
    )}

    {/* Optional Addons */}
    {item.addons && item.addons.length > 0 && (
      <div className="waiter-cart-addon-list">
        {item.addons.map((a) => (
          <div key={a.addonId} className="waiter-cart-addon-item">
            {a.addonName} (₹{a.addonPrice})
          </div>
        ))}
      </div>
    )}

    {/* Optional Customizations */}
    {item.customizations && item.customizations.length > 0 && (
      <div className="waiter-cart-custom-list">
        {item.customizations.map((c) => (
          <div key={c.customizationId} className="waiter-cart-custom-item">
            {c.customizationName}: {c.customizationValue} (+₹{c.additionalCharge})
          </div>
        ))}
      </div>
    )}
  </div>
</div>


          ))
        )}
      </div>

      {/* <div className="waiter-cart-summary">
        <span>Subtotal</span>
        <span>₹{subtotal}</span>
      </div> */}

      {summary && (
        <div className="waiter-cart-summary-extra">
          <div>
            <strong>Items:</strong> {summary.totalItems}
          </div>
          <div>
            <strong>Total Qty:</strong> {summary.totalQuantity}
          </div>
          <div>
            <strong>Discount:</strong> ₹{summary.totalDiscount}
          </div>
          <div>
            <strong>Grand Total:</strong> ₹{summary.grandTotal}
          </div>
        </div>
      )}


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