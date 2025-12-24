import { useState } from "react";
import { IndianRupee } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import "./AdminRevenue.css";

export default function AdminRevenueManagement() {
  const [revenueFilter, setRevenueFilter] = useState("Weekly");
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);
  const [expandedTable, setExpandedTable] = useState(null);

  // ================= GRAPH DATA =================
  const revenueDataWeekly = [
    { day: "Mon", revenue: 2000 },
    { day: "Tue", revenue: 3000 },
    { day: "Wed", revenue: 2500 },
    { day: "Thu", revenue: 4000 },
    { day: "Fri", revenue: 3500 },
    { day: "Sat", revenue: 5000 },
    { day: "Sun", revenue: 4500 },
  ];

  const revenueDataMonthly = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 13000 },
    { month: "Apr", revenue: 16000 },
    { month: "May", revenue: 14000 },
    { month: "Jun", revenue: 17000 },
    { month: "Jul", revenue: 15500 },
    { month: "Aug", revenue: 16500 },
    { month: "Sep", revenue: 14500 },
    { month: "Oct", revenue: 17500 },
    { month: "Nov", revenue: 16000 },
    { month: "Dec", revenue: 18000 },
  ];

  const revenueDataYearly = [
    { year: "2021", revenue: 150000 },
    { year: "2022", revenue: 180000 },
    { year: "2023", revenue: 200000 },
  ];

  const getRevenueData = () => {
    switch (revenueFilter) {
      case "Weekly":
        return revenueDataWeekly;
      case "Monthly":
        return revenueDataMonthly;
      case "Yearly":
        return revenueDataYearly;
      case "Custom":
        return revenueDataWeekly.filter((_, i) => i % 2 === 0);
      default:
        return revenueDataWeekly;
    }
  };

  const revenueData = getRevenueData();

  // ================= SUMMARY TOTALS =================
  const todayRevenue = 0;
  const weekRevenue = 24500;
  const monthRevenue = 185000;
  const yearRevenue = 530000;

  // ================= TABLE DATA =================
  const tableRevenueData = [
    {
      tableNumber: "T-1",
      totalOrders: 5,
      totalRevenue: 3200,
      paymentStatus: "Paid",
      paymentMode: "UPI",
      orders: [
        { source: "Waiter", amount: 1200, status: "Completed" },
        { source: "Customer", amount: 800, status: "Completed" },
        { source: "Guest", amount: 1200, status: "Completed" },
      ],
    },
    {
      tableNumber: "T-2",
      totalOrders: 3,
      totalRevenue: 2100,
      paymentStatus: "Pending",
      paymentMode: "Cash",
      orders: [
        { source: "Waiter", amount: 700, status: "Preparing" },
        { source: "Customer", amount: 1400, status: "Served" },
      ],
    },
    {
      tableNumber: "T-3",
      totalOrders: 6,
      totalRevenue: 4800,
      paymentStatus: "Paid",
      paymentMode: "Card",
      orders: [
        { source: "Guest", amount: 1800, status: "Completed" },
        { source: "Waiter", amount: 3000, status: "Completed" },
      ],
    },
  ];


  const toggleTable = (tableNo) => {
    setExpandedTable(expandedTable === tableNo ? null : tableNo);
  };

  const minChartWidth =
    revenueFilter === "Weekly" ? 700 : revenueFilter === "Monthly" ? 1200 : 900;

  return (
    <div className="admin-revenue-page">
      <h2 className="admin-page-title">
        <IndianRupee size={24} /> Revenue Management
      </h2>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="admin-revenue-cards">
        <div className="admin-card">
          <h4>₹{todayRevenue}</h4>
          <p>Daily Revenue</p>
        </div>
        <div className="admin-card">
          <h4>₹{weekRevenue}</h4>
          <p>Weekly Revenue</p>
        </div>
        <div className="admin-card">
          <h4>₹{monthRevenue}</h4>
          <p>Monthly Revenue</p>
        </div>
        <div className="admin-card">
          <h4>₹{yearRevenue}</h4>
          <p>Yearly Revenue</p>
        </div>
      </div>

      {/* ================= GRAPH ================= */}
      <div className="admin-revenue-graph-box">
        <div className="admin-revenue-graph-header">
          <h3>Revenue Chart</h3>
          <select
            value={revenueFilter}
            onChange={(e) => setRevenueFilter(e.target.value)}
          >
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
            <option>Custom</option>
          </select>
        </div>

        {revenueFilter === "Custom" && (
          <div className="admin-revenue-custom-dates">
            <DatePicker
              selected={customStart}
              onChange={(date) => setCustomStart(date)}
              placeholderText="Start Date"
            />
            <DatePicker
              selected={customEnd}
              onChange={(date) => setCustomEnd(date)}
              placeholderText="End Date"
            />
          </div>
        )}

        <div style={{ minWidth: minChartWidth }}>
          <LineChart width={minChartWidth} height={300} data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={
                revenueFilter === "Weekly"
                  ? "day"
                  : revenueFilter === "Monthly"
                    ? "month"
                    : "year"
              }
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="revenue" stroke="#4caf50" strokeWidth={2} />
          </LineChart>
        </div>
      </div>

      {/* ================= TABLE ANALYTICS ================= */}
      <div className="admin-revenue-table-section">
        <h3>Table-wise Revenue & Orders</h3>

        <table className="admin-revenue-table">
          <thead>
            <tr>
              <th>Table</th>
              <th>Orders</th>
              <th>Revenue (₹)</th>
              <th>Payment</th>
              <th>Mode</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {tableRevenueData.map((table) => (
              <>
                <tr key={table.tableNumber}>
                  <td>{table.tableNumber}</td>
                  <td>{table.totalOrders}</td>
                  <td>₹{table.totalRevenue}</td>
                  <td>{table.paymentStatus}</td>
                  <td>{table.paymentMode}</td>
                  <td>
                    <button onClick={() => toggleTable(table.tableNumber)}>
                      {expandedTable === table.tableNumber
                        ? "Hide"
                        : "View"}
                    </button>
                  </td>
                </tr>

                {expandedTable === table.tableNumber && (
                  <tr>
                    <td colSpan="6">
                      <table className="nested-orders-table">
                        <thead>
                          <tr>
                            <th>Order Source</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.orders.map((order) => (
                            <tr key={`${order.source}-${order.amount}`}>
                              <td>{order.source}</td>
                              <td>₹{order.amount}</td>
                              <td>{order.status}</td>
                            </tr>

                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
