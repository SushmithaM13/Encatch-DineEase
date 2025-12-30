import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { fetchWaiterOrdersByDate } from "../api/WaiterOrderApi";
import "./WaiterAllOrders.css";

export default function WaiterAllOrders() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [expanded, setExpanded] = useState({}); // track expanded parent rows

  // Format DD/MM/YYYY for API
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Load API data
  const loadOrders = async () => {
    try {
      const res = await fetchWaiterOrdersByDate(
        formatDate(startDate),
        formatDate(endDate),
        page,
        size
      );

      setOrders(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, page]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="waiter-all-orders-page">

      <h1 className="waiter-all-orders-title">All Orders</h1>

      {/* DATE FILTERS */}
      <div className="waiter-all-orders-filters">
        <div>
          <span>Start Date: </span>
          <DatePicker
            selected={startDate}
            onChange={(d) => setStartDate(d)}
            dateFormat="dd-MM-yyyy"  // display matches backend
          />
        </div>

        <div>
          <span>End Date: </span>
          <DatePicker
            selected={endDate}
            onChange={(d) => setEndDate(d)}
            dateFormat="dd-MM-yyyy"  // display matches backend
          />
        </div>

        <button onClick={() => setPage(0)}>Apply</button>
      </div>

      {/* TABLE */}
      <table className="waiter-all-orders-orders-table">
        <thead>
          <tr>
            <th></th>
            <th>Session ID</th>
            <th>Table</th>
            <th>Status</th>
            <th>Total Amount</th>
            <th>Orders Count</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No Orders Found
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <>
                {/* Main Row */}
                <tr key={o.waiterOrderId}>
                  <td>
                    <button
                      onClick={() => toggleExpand(o.waiterOrderId)}
                      className="waiter-all-orders-expand-btn"
                    >
                      {expanded[o.waiterOrderId] ? "▲" : "▼"}
                    </button>

                  </td>
                  <td>{o.sessionId}</td>
                  <td>{o.tableNumber}</td>
                  <td>{o.tableStatus}</td>
                  <td>₹{o.totalAmount}</td>
                  <td>{o.orders?.length}</td>
                </tr>

                {/* Expanded Section */}
                {expanded[o.waiterOrderId] &&
                  o.orders?.map((ord, index) => (
                    <tr key={index} className="waiter-all-orders-expand-row">
                      <td></td>
                      <td colSpan="5">
                        <div className="waiter-all-orders-order-block">
                          <h4>
                            Order Ref: {ord.orderReference} | Time:{" "}
                            {ord.orderTime}
                          </h4>

                          <table className="waiter-all-orders-items-table">
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Status</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                              </tr>
                            </thead>

                            <tbody>
                              {ord.orderItems.map((item) => (
                                <tr key={item.id}>
                                  <td>{item.itemName}</td>
                                  <td>{item.quantity}</td>
                                  <td
                                    className={`waiter-orders-item-status ${item.itemStatus.replaceAll(" ", "_")}`}
                                  >
                                    {item.itemStatus.replaceAll("_", " ")}
                                  </td>
                                  <td>₹{item.unitPrice}</td>
                                  <td>₹{item.totalPrice}</td>
                                </tr>
                              ))}
                            </tbody>

                          </table>
                        </div>
                      </td>
                    </tr>
                  ))}
              </>
            ))
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="waiter-all-orders-pagination">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          ◀ Prev
        </button>

        <span>
          Page {page + 1} of {totalPages}
        </span>

        <button
          disabled={page + 1 === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
