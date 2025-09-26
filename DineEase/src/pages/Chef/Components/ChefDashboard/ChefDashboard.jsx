import React, { useEffect, useState } from 'react';
import { getOrders } from '../../Api/orders';
import './ChefDashboard.css';
import { FaListUl, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function ChefDashboard() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  if (!orders) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Chef Dashboard</h2>

      <div className="stats">
        <div className="card">
          <div className="icon green"><FaListUl /></div>
          <h3>{orders.activeOrders}</h3>
          <p>Active Orders</p>
        </div>

        <div className="card">
          <div className="icon orange"><FaClock /></div>
          <h3>{orders.pending}</h3>
          <p>Pending Preparation</p>
        </div>

        <div className="card">
          <div className="icon green"><FaCheckCircle /></div>
          <h3>{orders.completed}</h3>
          <p>Completed Today</p>
        </div>

        <div className="card">
          <div className="icon red"><FaTimesCircle /></div>
          <h3>{orders.outOfStock}</h3>
          <p>Out of Stock Items</p>
        </div>
      </div>
    </div>
  );
}
