import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("All Users");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "Active",
    joinDate: new Date().toISOString().split("T")[0], // default today
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8082/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
     // const localUsers = JSON.parse(localStorage.getItem("users") || "[]");
      // setUsers(localUsers);
      // setFilteredUsers(localUsers);
    }
  };

  const tabs = ["All Users", "Admins", "Chefs", "Waiters", "Accountants"];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "All Users") {
      setFilteredUsers(users);
    } else {
      const roleMap = {
        Admins: "Admin",
        Chefs: "Chef",
        Waiters: "Waiter",
        Accountants: "Accountant",
      };
      setFilteredUsers(users.filter((u) => u.role === roleMap[tab]));
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? { ...formData, id: editingUser.id } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('userUpdated', {
        detail: { users: updatedUsers }
      }));
      
      setEditingUser(null);
    } else {
      // Add new user
      const newUser = {
        ...formData,
        id: Date.now(),
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('userAdded', {
        detail: { users: updatedUsers, newUser }
      }));
    }
    
    setShowForm(false);
    setFormData({
      name: "",
      email: "",
      role: "",
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleDelete = (id) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    setFilteredUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
    
    // Dispatch custom event to notify other components
   
    window.dispatchEvent(new CustomEvent('userDeleted', {
      detail: { users: updated }
    }));
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      joinDate: user.joinDate,
    });
    setShowForm(true);
  };

  return (
    <div className="user-management">
      <div className="user-header">
        <h2>User Management</h2>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          + Add New User
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Email</th>
            <th>Status</th>
            <th>Join Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status ${(user.status || 'Active').toLowerCase()}`}>
                    {user.status || 'Active'}
                  </span>
                </td>
                <td>{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEdit(user)}>
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(user.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Mobile Card Layout */}
      <div className="mobile-user-cards">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="user-card-mobile">
              <div className="user-row">
                <div className="user-cell user-name-cell">
                  <span className="cell-label">User</span>
                  <span className="cell-value">{user.name}</span>
                </div>
                <div className="user-cell">
                  <span className="cell-label">Role</span>
                  <span className="cell-value">{user.role}</span>
                </div>
              </div>
              <div className="user-row">
                <div className="user-cell">
                  <span className="cell-label">Email</span>
                  <span className="cell-value">{user.email}</span>
                </div>
                <div className="user-cell">
                  <span className="cell-label">Status</span>
                  <span className="cell-value">
                    <span className={`status ${(user.status || 'Active').toLowerCase()}`}>
                      {user.status || 'Active'}
                    </span>
                  </span>
                </div>
              </div>
              <div className="user-row">
                <div className="user-cell">     
                  <span className="cell-label">Join Date</span>
                  <span className="cell-value">
                  {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="user-cell actions-cell">
                  <span className="cell-label">Actions</span>
                  <div className="user-actions">
                    <button className="action-btn edit" onClick={() => handleEdit(user)}>
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(user.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-users-mobile">
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Popup Form */}
      {showForm && (
        <div className="popup">
          <div className="popup-content">
            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Chef">Chef</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Cleaner">Cleaner</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                    <option value="Active">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="form-group">
                <label>Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) =>
                    setFormData({ ...formData, joinDate: e.target.value })
                  }
                />
              </div>
              <div className="form-buttons">
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                  setFormData({
                    name: "",
                    email: "",
                    role: "",
                    status: "Active",
                    joinDate: new Date().toISOString().split("T")[0],
                  });
                }}>
                  Cancel
                </button>
                <button type="submit">{editingUser ? 'Update User' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
