import { useState, useEffect } from "react";
import { Pencil, Trash2, MoreVertical, User } from "lucide-react";
import "./ChefProfile.css";

export default function ChefProfile() {
  const API_URL = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const TOKEN = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    id: "",
    organizationId: "",
    organizationName: "",
    fullName: "",
    staffRoleName: "",
    phoneNumber: "",
    shiftTiming: "",
    contractStartDate: "",
    contractEndDate: "",
    email: "",
    profileImage: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otp, setOtp] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  // ===== Fetch Chef Profile =====
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          credentials: "include",
        });

        if (!res.ok) {
          console.error(`Profile fetch failed: ${res.status}`);
          return;
        }

        const text = await res.text();
        if (!text) return;

        const data = JSON.parse(text);

        setProfile({
          id: data.id || "",
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          staffRoleName: data.staffRoleName || data.staffRole?.name || "",
          organizationId: data.organizationId || data.organization?.id || "",
          organizationName: data.organizationName || data.organization?.name || "",
          shiftTiming: data.shiftTiming || "",
          contractStartDate: data.contractStartDate || "",
          contractEndDate: data.contractEndDate || "",
          profileImage: data.profileImage || "",
        });

        // ✅ Save generic org ID to localStorage
        localStorage.setItem(
          "orgId",
          data.organizationId || data.organization?.id || ""
        );
      } catch (err) {
        console.error("Chef profile fetch error:", err);
      }
    };

    if (TOKEN) fetchProfile();
    else console.warn("⚠️ No token found — please log in first.");
  }, [TOKEN]);

  // ===== Save Profile =====
  const handleSave = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        setIsEditing(false);
      } else {
        alert(`Failed to update profile (${res.status})`);
      }
    } catch (err) {
      console.error("Profile update error:", err);
    }
  };

  // ===== Handle Image Upload =====
  const handleImageChange = async (e) => {
    if (!e.target.files?.length) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target.result;
      setProfile((prev) => ({ ...prev, profileImage: base64Image }));

      try {
        await fetch(`${API_URL}/image`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ profileImage: base64Image }),
        });
      } catch (err) {
        console.error("Image upload error:", err);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    setShowMenu(false);
  };

  // ===== Remove Profile Image =====
  const handleRemoveImage = async () => {
    try {
      setProfile((prev) => ({ ...prev, profileImage: "" }));
      await fetch(`${API_URL}/image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ profileImage: "" }),
      });
    } catch (err) {
      console.error("Image remove error:", err);
    }
    setShowMenu(false);
  };

  // ===== OTP & Password Change =====
  const sendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    alert(`OTP sent to ${profile.email}: ${code}`);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      alert("Passwords do not match!");
      return;
    }
    if (otp !== generatedOtp) {
      alert("Invalid OTP!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ password: passwordForm.newPass }),
      });

      if (res.ok) {
        setPasswordSuccess(true);
        setOtpSent(false);
        setPasswordForm({ current: "", newPass: "", confirm: "" });
        setOtp("");
        alert("Password updated successfully!");
      } else {
        alert("Failed to update password!");
      }
    } catch (err) {
      console.error("Password change error:", err);
    }
  };

  return (
    <div className="Chef-Profile-page">
      <div className="Chef-Profile-heading">
        <User size={32} />
        <h2>Chef Profile</h2>
      </div>

      <div className="Chef-Profile-container">
        {/* LEFT SIDE */}
        <div className="Chef-Profile-details">
          <section className="Chef-Profile-section">
            <h3 className="Chef-Profile-section-title">Basic Info</h3>
            <label className="Chef-Profile-label">
              <span>Full Name</span>
              <input
                type="text"
                className="Chef-Profile-input"
                value={profile.fullName || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
              />
            </label>

            <label className="Chef-Profile-label">
              <span>Email</span>
              <input 
                type="email" 
                className="Chef-Profile-input Chef-Profile-disabled" 
                value={profile.email || ""} 
                disabled 
              />
            </label>

            <label className="Chef-Profile-label">
              <span>Phone</span>
              <input
                type="text"
                className="Chef-Profile-input"
                value={profile.phoneNumber || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, phoneNumber: e.target.value })
                }
              />
            </label>

            <label className="Chef-Profile-label">
              <span>Role</span>
              <input 
                type="text" 
                className="Chef-Profile-input Chef-Profile-disabled" 
                value={profile.staffRoleName || ""} 
                disabled 
              />
            </label>
          </section>

          <section className="Chef-Profile-section">
            <h3 className="Chef-Profile-section-title">Organization Info</h3>
            <label className="Chef-Profile-label">
              <span>Organization ID</span>
              <input 
                type="text" 
                className="Chef-Profile-input Chef-Profile-disabled" 
                value={profile.organizationId || ""} 
                disabled 
              />
            </label>

            <label className="Chef-Profile-label">
              <span>Organization</span>
              <input
                type="text"
                className="Chef-Profile-input"
                value={profile.organizationName || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, organizationName: e.target.value })
                }
              />
            </label>

            <label className="Chef-Profile-label">
              <span>Shift Timing</span>
              <input
                type="text"
                className="Chef-Profile-input"
                value={profile.shiftTiming || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, shiftTiming: e.target.value })
                }
              />
            </label>

            <label className="Chef-Profile-label">
              <span>Contract Start</span>
              <input
                type="date"
                className="Chef-Profile-input"
                value={profile.contractStartDate?.substring(0, 10) || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, contractStartDate: e.target.value })
                }
              />
            </label>

            <label className="Chef-Profile-label">
              <span>Contract End</span>
              <input
                type="date"
                className="Chef-Profile-input"
                value={profile.contractEndDate?.substring(0, 10) || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, contractEndDate: e.target.value })
                }
              />
            </label>
          </section>

          {/* PASSWORD SECTION */}
          <section className="Chef-Profile-section">
            <h3 className="Chef-Profile-section-title">Account Settings</h3>
            <div className="Chef-Profile-password-box">
              <h4 className="Chef-Profile-password-title">Change Password</h4>

              <input
                type="password"
                className="Chef-Profile-input"
                placeholder="New Password"
                value={passwordForm.newPass}
                disabled={!isEditing}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPass: e.target.value })
                }
              />

              <input
                type="password"
                className="Chef-Profile-input"
                placeholder="Confirm Password"
                value={passwordForm.confirm}
                disabled={!isEditing}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm: e.target.value })
                }
              />

              {isEditing &&
                (otpSent ? (
                  <>
                    <input
                      type="text"
                      className="Chef-Profile-input"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <button 
                      className="Chef-Profile-btn Chef-Profile-btn-primary"
                      onClick={handlePasswordChange}
                    >
                      Save Password
                    </button>
                    <button 
                      className="Chef-Profile-btn Chef-Profile-btn-secondary"
                      onClick={() => setOtpSent(false)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    className="Chef-Profile-btn Chef-Profile-btn-primary"
                    onClick={sendOtp}
                  >
                    Send OTP
                  </button>
                ))}

              {passwordSuccess && (
                <p className="Chef-Profile-success-message">
                  ✅ Password changed successfully!
                </p>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="Chef-Profile-action-buttons">
            {isEditing ? (
              <>
                <button 
                  className="Chef-Profile-btn Chef-Profile-btn-save"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
                <button 
                  className="Chef-Profile-btn Chef-Profile-btn-cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                className="Chef-Profile-btn Chef-Profile-btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="Chef-Profile-picture">
          <div className="Chef-Profile-image-wrapper">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Profile"
                className="Chef-Profile-circle-img"
              />
            ) : (
              <div className="Chef-Profile-circle-img Chef-Profile-placeholder">
                {profile.fullName ? profile.fullName[0].toUpperCase() : "C"}
              </div>
            )}

            <div className="Chef-Profile-menu-container">
              <button
                className="Chef-Profile-menu-button"
                onClick={() => setShowMenu((prev) => !prev)}
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div className="Chef-Profile-dropdown-menu">
                  <label className="Chef-Profile-dropdown-item">
                    <Pencil size={16} /> Edit Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      hidden
                    />
                  </label>
                  {profile.profileImage && (
                    <button
                      className="Chef-Profile-dropdown-item"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 size={16} /> Remove Photo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}