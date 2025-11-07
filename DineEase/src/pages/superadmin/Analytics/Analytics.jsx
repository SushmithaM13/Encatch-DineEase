import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaShoppingCart,
  FaSearch,
} from "react-icons/fa";
import "./Analytics.css";

const Analytics = () => {
  const salesData = [
    { month: "Jan", revenue: 12000, orders: 300 },
    { month: "Feb", revenue: 15000, orders: 340 },
    { month: "Mar", revenue: 18000, orders: 400 },
    { month: "Apr", revenue: 13000, orders: 310 },
    { month: "May", revenue: 21000, orders: 450 },
    { month: "Jun", revenue: 25000, orders: 480 },
  ];

  const stats = [
    { title: "Total Revenue", value: "$85,000", icon: <FaDollarSign />, color: "blue" },
    { title: "Total Orders", value: "2,280", icon: <FaShoppingCart />, color: "purple" },
    { title: "Active Staff", value: "48", icon: <FaUsers />, color: "green" },
    { title: "Growth", value: "+24%", icon: <FaChartLine />, color: "orange" },
  ];

  const trending = [
    { id: 1, name: "Tuna Soup Spinach with Himalaya Salt", category: "Pizza", sales: 524, price: "$12.56", trend: "up", img: "https://i.ibb.co/vB5k9gV/food1.jpg" },
    { id: 2, name: "Chicken Curry Special with Cucumber", category: "Juice", sales: 215, price: "$8.40", trend: "down", img: "https://i.ibb.co/p1xqH7M/food2.jpg" },
    { id: 3, name: "Medium Spicy Pizza with Kemangi Leaf", category: "Burger", sales: 324, price: "$11.21", trend: "up", img: "https://i.ibb.co/tY7fPzK/food3.jpg" },
  ];

  return (
    <div className="analytics-container">
      {/* ====== Top Bar ====== */}
      <div className="analytics-topbar">
        <h2>Analytics Dashboard</h2>
        <div className="search-bar">
          <FaSearch className="search-bar-icon" />
          <input type="text" placeholder="Search here..." />
        </div>
        <div className="user-box">Hello, Samuel 👋</div>
      </div>

      {/* ====== Stat Cards ====== */}
      <div className="analytics-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className={`analytics-card ${stat.color}`}>
            <div className="icon">{stat.icon}</div>
            <div className="content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ====== Charts Section ====== */}
      <div className="analytics-charts">
        <div className="chart-card">
          <h3>Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Orders Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====== Trending Section ====== */}
      <div className="trending-section">
        <h3>Trending Items</h3>
        <div className="trending-list">
          {trending.map((item) => (
            <div key={item.id} className="trending-item">
              <img src={item.img} alt={item.name} />
              <div className="item-info">
                <h4>{item.name}</h4>
                <p>{item.category}</p>
              </div>
              <div className="item-sales">
                <strong>{item.sales}</strong>
                <span>Sales</span>
              </div>
              <div className={`trend-icon ${item.trend}`}>
                {item.trend === "up" ? "📈" : "📉"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
