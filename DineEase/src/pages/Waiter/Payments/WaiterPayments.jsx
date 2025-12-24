
import React, { useState } from "react";
import "./WaiterPayments.css";

export default function WaiterPayments() {
  // -----------------------------
  // 1️⃣ Dummy Order Data
  // -----------------------------
  const order = {
    orderId: 1001,
    tableNumber: "T-3",
    items: [
      { name: "Paneer Butter Masala", qty: 1, price: 240 },
      { name: "Butter Naan", qty: 3, price: 40 },
      { name: "Gulab Jamun", qty: 2, price: 30 },
    ],
    discount: 30,
    taxes: 18,
  };

  // ORDER TOTAL CALCULATION
  const subtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const taxAmount = (subtotal * order.taxes) / 100;
  const total = subtotal + taxAmount - order.discount;

  // -----------------------------
  // 2️⃣ Payment States
  // -----------------------------
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [paymentHistory, setPaymentHistory] = useState([]);

  // -----------------------------
  // 3️⃣ Dummy Razorpay Trigger
  // -----------------------------
  const handleRazorpayPayment = () => {
    alert("Razorpay Payment Window Opened (Dummy)");

    // simulate payment success
    setTimeout(() => {
      handlePaymentSuccess("Online (Razorpay)");
    }, 1500);
  };

  // -----------------------------
  // 4️⃣ Success Handler
  // -----------------------------
  const handlePaymentSuccess = (method) => {
    const newRecord = {
      id: paymentHistory.length + 1,
      orderId: order.orderId,
      amount: total,
      method,
      time: new Date().toLocaleTimeString(),
      status: "SUCCESS",
    };

    setPaymentHistory([newRecord, ...paymentHistory]);
    setPaymentStatus("SUCCESS");
  };

  // -----------------------------
  // 5️⃣ Dummy Payment Submission
  // -----------------------------
  const processPayment = () => {
    if (!paymentMethod) {
      alert("Select payment method");
      return;
    }

    if (paymentMethod === "RAZORPAY") {
      handleRazorpayPayment();
      return;
    }

    // Simulating success for all other payment methods
    handlePaymentSuccess(paymentMethod);
  };

  return (
    <div className="waiter-payments-page">
      <h1 className="title">Order Payment</h1>

      {/* -----------------------------
          ORDER SUMMARY
      ------------------------------- */}
      <div className="order-summary">
        <h2>Order #{order.orderId} (Table {order.tableNumber})</h2>

        <div className="item-list">
          {order.items.map((item) => (
            <p key={item.name}>
              {item.name} × {item.qty} — ₹{item.price * item.qty}
            </p>
          ))}
        </div>

        <hr />

        <p>Subtotal: ₹{subtotal}</p>
        <p>Taxes ({order.taxes}%): ₹{taxAmount}</p>
        <p>Discount: -₹{order.discount}</p>

        <h3 className="total">Total: ₹{total}</h3>
      </div>

      {/* -----------------------------
          SELECT PAYMENT METHOD
      ------------------------------- */}
      <div className="payment-methods">
        <h2>Choose Payment Method</h2>

        <div className="buttons">
          <button onClick={() => setPaymentMethod("CASH")}>Cash</button>
          <button onClick={() => setPaymentMethod("CARD")}>Card</button>
          <button onClick={() => setPaymentMethod("UPI")}>UPI</button>
          <button onClick={() => setPaymentMethod("WALLET")}>Wallet</button>
          <button onClick={() => setPaymentMethod("RAZORPAY")}>
            Razorpay (Online)
          </button>
        </div>

        <p className="selected">
          Selected: <b>{paymentMethod || "None"}</b>
        </p>

        <button className="pay-btn" onClick={processPayment}>
          Pay ₹{total}
        </button>

        {paymentStatus === "SUCCESS" && (
          <p className="success">Payment Successful ✔</p>
        )}
      </div>

      {/* -----------------------------
          PAYMENT HISTORY
      ------------------------------- */}
      <div className="history-section">
        <h2>Payment History</h2>

        {paymentHistory.length === 0 && <p>No payments yet</p>}

        {paymentHistory.map((p) => (
          <div key={p.id} className="payment-card">
            <h3>Payment #{p.id}</h3>
            <p>
              <b>Order:</b> {p.orderId}
            </p>
            <p>
              <b>Amount:</b> ₹{p.amount}
            </p>
            <p>
              <b>Method:</b> {p.method}
            </p>
            <p>
              <b>Status:</b>{" "}
              <span style={{ color: "green", fontWeight: "bold" }}>
                {p.status}
              </span>
            </p>
            <p>
              <b>Time:</b> {p.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
