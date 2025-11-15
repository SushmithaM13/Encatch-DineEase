import React, { useState, useEffect } from "react";
import { FaUserCircle, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SuperAdminProfile.css";

export default function SuperAdminProfile() {
  const API_URL = "http://localhost:8082/dine-ease/api/v1/users/super-admin/profile";
  const TOKEN = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {

      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile(data);
        setFormData(data);
      } catch (err) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [TOKEN]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Update profile
  const handleUpdate = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully!");
      setProfile(formData);
      setEditing(false);
      
 localStorage.setItem("superAdminFullName", formData.fullName);

    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  if (loading) {
    return <div className="profile-loader">Loading profile...</div>;
  }

  return (
    <div className="superadmin-profile-container">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2 className="profile-title">Super Admin Profile</h2>

      <div className="profile-card">
        <div className="profile-avatar">
          <FaUserCircle size={80} color="#007bff" />
        </div>

        <div className="profile-details">
          <div className="profile-field">
            <label>User ID:</label>
            <span>{profile.userId}</span>
          </div>

          <div className="profile-field">
            <label>Username:</label>
            {editing ? (
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{profile.username}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Full Name:</label>
            {editing ? (
              <input
                type="text"
                name="fullName"
                value={formData.fullName || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{profile.fullName}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Phone Number:</label>
            {editing ? (
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
              />
            ) : (
              <span>{profile.phoneNumber}</span>
            )}
          </div>

          <div className="profile-field">
            <label>Role:</label>
            <span className="readonly-field">{profile.role}</span>
          </div>

          <div className="profile-field">
            <label>Status:</label>
            <span
              className={`status-tag ${profile.isActive ? "active" : "inactive"}`}
            >
              {profile.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="profile-field">
            <label>Verified:</label>
            <span
              className={`status-tag ${
                profile.isVerified ? "verified" : "unverified"
              }`}
            >
              {profile.isVerified ? "Verified" : "Unverified"}
            </span>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button className="save-btn" onClick={handleUpdate}>
                  <FaSave /> Save
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setEditing(false)}
                >
                  <FaTimes /> Cancel
                </button>
              </>
            ) : (
              <button className="edit-btn" onClick={() => setEditing(true)}>
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
