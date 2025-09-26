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

  // ===== Dummy Revenue Data =====
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
        return revenueDataWeekly.filter((_, i) => i % 2 === 0); // dummy
      default:
        return revenueDataWeekly;
    }
  };

  const revenueData = getRevenueData();

  // Totals (dummy values)
  const todayRevenue = 0;
  const weekRevenue = 24500;
  const monthRevenue = 185000;
  const yearRevenue = 530000;

  // Dynamic minWidth for scroll
  const minChartWidth =
    revenueFilter === "Weekly" ? 700 : revenueFilter === "Monthly" ? 1200 : 900;

  return (
    <div className="revenue-page">
      <h2 className="page-title">
        <IndianRupee size={25} /> Revenue Management
      </h2>

   {/* Revenue Summary Cards */}
<div className="revenue-cards">
  <div className="card">
    <h4>₹{todayRevenue.toLocaleString()}</h4>
    <p>Daily Revenue</p>
  </div>
  <div className="card">
    <h4>₹{weekRevenue.toLocaleString()}</h4>
    <p>Weekly Revenue</p>
  </div>
  <div className="card">
    <h4>₹{monthRevenue.toLocaleString()}</h4>
    <p>Monthly Revenue</p>
  </div>
  <div className="card">
    <h4>₹{yearRevenue.toLocaleString()}</h4>
    <p>Yearly Revenue</p>
  </div>
</div>

      {/* Graph Box */}
      <div
        style={{
          width: "100%",
          overflowX: "auto", // enables horizontal scroll
          marginTop: 20,
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 10,
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h3 style={{ margin: 0 }}>Revenue Chart</h3>
          <select
            value={revenueFilter}
            onChange={(e) => setRevenueFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          >
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        {revenueFilter === "Custom" && (
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <DatePicker
              selected={customStart}
              onChange={(date) => setCustomStart(date)}
              selectsStart
              startDate={customStart}
              endDate={customEnd}
              placeholderText="Start Date"
              dateFormat="dd/MM/yyyy"
            />
            <DatePicker
              selected={customEnd}
              onChange={(date) => setCustomEnd(date)}
              selectsEnd
              startDate={customStart}
              endDate={customEnd}
              placeholderText="End Date"
              dateFormat="dd/MM/yyyy"
              minDate={customStart || undefined}
            />
          </div>
        )}

        {/* Scrollable Chart */}
        <div style={{ minWidth: minChartWidth, height: 300 }}>
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
            <Line type="monotone" dataKey="revenue" stroke="#4caf50" strokeWidth={2} />
          </LineChart>
        </div>
      </div>
    </div>
  );
}