import { useEffect, useState } from "react";
import { Users, Newspaper, Sofa, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./AdminHome.css";

export default function AdminHome() {
  const [adminName, setAdminName] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [staff, setStaff] = useState([]);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [revenue, setRevenue] = useState(0);

  const [revenueFilter, setRevenueFilter] = useState("Weekly");
  const [tableFilter, setTableFilter] = useState("Weekly");

  const [customRevenueStart, setCustomRevenueStart] = useState(null);
  const [customRevenueEnd, setCustomRevenueEnd] = useState(null);

  const [customTableStart, setCustomTableStart] = useState(null);
  const [customTableEnd, setCustomTableEnd] = useState(null);

  const navigate = useNavigate();

  // ===== Load localStorage data =====
  useEffect(() => {
    const name = localStorage.getItem("loggedInAdmin") || "Admin";
    const rest = localStorage.getItem("restaurantName") || "My Restaurant";
    const savedStaff = JSON.parse(localStorage.getItem("staffList") || "[]");
    const savedMenu = JSON.parse(localStorage.getItem("menuItems") || "[]");
    const savedTables = JSON.parse(localStorage.getItem("tables") || "[]");
    const savedRevenue = parseFloat(localStorage.getItem("todaysRevenue") || "0");

    setAdminName(name);
    setRestaurant(rest);
    setStaff(savedStaff);
    setMenu(savedMenu);
    setTables(savedTables);
    setRevenue(savedRevenue);
  }, []);

  const occupiedTables = tables.filter((t) => t.status === "booked").length;

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
        if (!customRevenueStart || !customRevenueEnd) return [];
        return revenueDataWeekly.filter((_, i) => i % 2 === 0); // dummy
      default:
        return revenueDataWeekly;
    }
  };

  // ===== Dummy Table Data =====
  const tableDataWeekly = [
    { day: "Mon", booked: 8, available: 12 },
    { day: "Tue", booked: 10, available: 10 },
    { day: "Wed", booked: 6, available: 14 },
    { day: "Thu", booked: 12, available: 8 },
    { day: "Fri", booked: 14, available: 6 },
    { day: "Sat", booked: 15, available: 5 },
    { day: "Sun", booked: 13, available: 7 },
  ];

  const tableDataMonthly = [
    { month: "Jan", booked: 50, available: 30 },
    { month: "Feb", booked: 60, available: 40 },
    { month: "Mar", booked: 55, available: 35 },
    { month: "Apr", booked: 70, available: 30 },
    { month: "May", booked: 65, available: 25 },
    { month: "Jun", booked: 72, available: 28 },
    { month: "Jul", booked: 68, available: 32 },
    { month: "Aug", booked: 75, available: 25 },
    { month: "Sep", booked: 63, available: 37 },
    { month: "Oct", booked: 77, available: 23 },
    { month: "Nov", booked: 69, available: 31 },
    { month: "Dec", booked: 80, available: 20 },
  ];

  const tableDataYearly = [
    { year: "2021", booked: 600, available: 200 },
    { year: "2022", booked: 650, available: 250 },
    { year: "2023", booked: 700, available: 300 },
  ];

  const getTableData = () => {
    switch (tableFilter) {
      case "Weekly":
        return tableDataWeekly;
      case "Monthly":
        return tableDataMonthly;
      case "Yearly":
        return tableDataYearly;
      case "Custom":
        if (!customTableStart || !customTableEnd) return [];
        return tableDataWeekly.filter((_, i) => i % 2 === 0); // dummy
      default:
        return tableDataWeekly;
    }
  };

  return (
    <div className="dashboard-page">
      {/* Welcome */}
      <h2 className="welcome">Welcome, {adminName}</h2>
      <h3 className="restaurant">{restaurant}</h3>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="card bounce-card" onClick={() => navigate("/AdminDashboard/staff")}>
          <Users size={28} className="card-icon" />
          <h4>{staff.length}</h4>
          <p>Staff Members</p>
        </div>
        <div className="card bounce-card" onClick={() => navigate("/AdminDashboard/menu")}>
          <Newspaper size={28} className="card-icon" />
          <h4>{menu.length}</h4>
          <p>Menu Items</p>
        </div>
        <div className="card bounce-card" onClick={() => navigate("/AdminDashboard/table")}>
          <Sofa size={28} className="card-icon" />
          <h4>
            {occupiedTables}/{tables.length}
          </h4>
          <p>Tables Occupied</p>
        </div>
        <div className="card bounce-card" onClick={() => navigate("/AdminDashboard/revenue")}>
          <IndianRupee size={28} className="card-icon" />
          <h4>₹{revenue.toLocaleString()}</h4>
          <p>Today's Revenue</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        {/* Revenue Analysis */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3>Revenue Analysis</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="Custom">Custom</option>
            </select>
            {revenueFilter === "Custom" && (
              <>
                <DatePicker
                  selected={customRevenueStart}
                  onChange={(date) => setCustomRevenueStart(date)}
                  selectsStart
                  startDate={customRevenueStart}
                  endDate={customRevenueEnd}
                  placeholderText="Start Date"
                  dateFormat="dd/MM/yyyy"
                />
                <DatePicker
                  selected={customRevenueEnd}
                  onChange={(date) => setCustomRevenueEnd(date)}
                  selectsEnd
                  startDate={customRevenueStart}
                  endDate={customRevenueEnd}
                  placeholderText="End Date"
                  dateFormat="dd/MM/yyyy"
                  minDate={customRevenueStart || undefined}
                />
              </>
            )}
          </div>
        </div>

        {/* Scrollable Revenue Chart */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <div
            style={{
              minWidth: revenueFilter === "Monthly" ? 900 : "100%",
              height: 250,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getRevenueData()}>
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
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table Occupancy */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "30px",
            marginBottom: "15px",
          }}
        >
          <h3>Table Occupancy</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="Custom">Custom</option>
            </select>
            {tableFilter === "Custom" && (
              <>
                <DatePicker
                  selected={customTableStart}
                  onChange={(date) => setCustomTableStart(date)}
                  selectsStart
                  startDate={customTableStart}
                  endDate={customTableEnd}
                  placeholderText="Start Date"
                  dateFormat="dd/MM/yyyy"
                />
                <DatePicker
                  selected={customTableEnd}
                  onChange={(date) => setCustomTableEnd(date)}
                  selectsEnd
                  startDate={customTableStart}
                  endDate={customTableEnd}
                  placeholderText="End Date"
                  dateFormat="dd/MM/yyyy"
                  minDate={customTableStart || undefined}
                />
              </>
            )}
          </div>
        </div>

        {/* Scrollable Table Chart */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <div
            style={{
              minWidth: tableFilter === "Monthly" ? 900 : "100%",
              height: 250,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getTableData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={
                    tableFilter === "Weekly"
                      ? "day"
                      : tableFilter === "Monthly"
                      ? "month"
                      : "year"
                  }
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="booked" fill="#f44336" />
                <Bar dataKey="available" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Section */}
      <div className="staff-section">
        <div className="section-header">Staff Management</div>
        <table className="staff-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.length > 0 ? (
              staff.slice(0, 3).map((s, i) => (
                <tr key={i}>
                  <td>{s.firstName}</td>
                  <td>{s.role}</td>
                  <td>
                    <span className={`status ${s.status.toLowerCase()}`}>{s.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  No staff added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Show More → only if staff.length > 3 */}
        {staff.length > 3 && (
          <div className="staff-more-card" onClick={() => navigate("/pages/staff")}>
            <h4>More →</h4>
        </div>
        )}
      </div>

      {/* Menu Section */}
<div className="menu-section">
  <div className="section-header">Menu Items</div>
  <div className="menu-grid">
    {menu.length === 0 ? (
      <p>No menu items yet</p>
    ) : (
      <>
        {menu.slice(0, 4).map((item, i) => (
          <div key={i} className="menu-card small-card">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.dishName} className="menu-img" />
            )}
            <h4>{item.dishName}</h4>
            <p>₹ {item.cost}</p>
            <div className={`veg-nonveg-circle ${item.type}`}></div>
          </div>
        ))}
        {menu.length > 4 && (
          <div
            className="menu-card small-card more-card"
            onClick={() => navigate("/pages/items")}
          >
            <h4>More →</h4>
          </div>
        )}
      </>
    )}
  </div>
</div>

      {/* Table Section */}
<div className="table-section">
  <div className="section-header">Table Management</div>
  <div className="table-grid">
    {tables.length > 0 ? (
      <>
        {tables.slice(0, 4).map((t) => (
          <div key={t.id} className={`table-box ${t.status}`}>
            T{t.id} <span>({t.status})</span>
          </div>
        ))}
        {tables.length > 4 && (
          <div
            className="table-box"
            onClick={() => navigate("/pages/table")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h4>More →</h4>
          </div>
        )}
      </>
    ) : (
      <p>No tables defined yet</p>
    )}
  </div>
</div>

      {/* Revenue Management Section */}
      <div className="revenue-section">
        <div className="section-header">Revenue Management</div>
        <div className="revenue-grid">
          {/* Daily Revenue */}
          <div className="revenue-card small-card">
            <h4>₹{(revenue || 0).toLocaleString()}</h4>
            <p>Daily Revenue</p>
          </div>

          {/* Weekly Revenue */}
          <div className="revenue-card small-card">
            <h4>
              ₹
              {revenueDataWeekly
                .reduce((sum, d) => sum + d.revenue, 0)
                .toLocaleString()}
            </h4>
            <p>Weekly Revenue</p>
          </div>

          {/* Monthly Revenue */}
          <div className="revenue-card small-card">
            <h4>
              ₹
              {revenueDataMonthly
                .reduce((sum, d) => sum + d.revenue, 0)
                .toLocaleString()}
            </h4>
            <p>Monthly Revenue</p>
          </div>

          {/* Yearly Revenue */}
          <div className="revenue-card small-card">
            <h4>
              ₹
              {revenueDataYearly
                .reduce((sum, d) => sum + d.revenue, 0)
                .toLocaleString()}
            </h4>
            <p>Yearly Revenue</p>
          </div>

          {/* More → card */}
          <div
            className="revenue-card small-card more-card"
            onClick={() => navigate("/pages/revenue")}
          >
            <h4>More →</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
