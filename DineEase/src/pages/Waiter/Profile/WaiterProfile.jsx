import { useState, useEffect } from "react";
import { Pencil, Trash2, MoreVertical, User } from "lucide-react";
import "./WaiterProfile.css";

export default function WaiterProfile() {
  const API_URL = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const TOKEN = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    id: "",
    organizationId: "",
    organizationName: "",
    fullName: "",
    firstName: "",
    lastName: "",
    staffRoleName: "Waiter",
    phoneNumber: "",
    email: "",
    profileImage: "",
    contractStartDate: "",
    contractEndDate: "",
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

  // ===== Fetch Waiter Profile =====
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
          console.error(`Waiter profile fetch failed: ${res.status} ${res.statusText}`);
          return;
        }

        const text = await res.text();
        if (!text) {
          console.warn("Empty waiter profile response");
          return;
        }

        const data = JSON.parse(text);
        setProfile(data);
      } catch (err) {
        console.error("Error fetching waiter profile:", err.message);
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
        alert("✅ Profile updated successfully!");
        setIsEditing(false);
      } else {
        alert(`Failed to update profile (${res.status})`);
      }
    } catch (err) {
      console.error("Profile update error:", err);
    }
  };

  // ===== Handle Profile Picture Upload =====
  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
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
    }
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
      alert("New passwords do not match!");
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
        alert("✅ Password updated successfully!");
      } else {
        alert("Failed to update password!");
      }
    } catch (error) {
      console.error("Password update error:", error);
    }
  };

  return (
    <div className="waiter-profile-page">
      <h2 className="waiter-profile-heading">
        <User size={28} className="waiter-user-icon" /> Waiter Profile
      </h2>

      <div className="waiter-profile-container">
        {/* ===== Left Side ===== */}
        <div className="waiter-profile-details">
          <section>
            <h3>Basic Info</h3>
            <label>
              Full Name:
              <input
                type="text"
                value={profile.fullName || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
              />
            </label>
            <label>
              Email:
              <input type="email" value={profile.email || ""} disabled />
            </label>
            <label>
              Phone:
              <input
                type="text"
                value={profile.phoneNumber || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, phoneNumber: e.target.value })
                }
              />
            </label>
            <label>
              Role:
              <input type="text" value={profile.staffRoleName || "Waiter"} disabled />
            </label>
          </section>

          <section>
            <h3>Organization Info</h3>

            <label>
              Organization ID:
              <input
                type="text"
                value={profile.organizationId || ""}
                disabled
              />
            </label>

            <label>
              Organization Name:
              <input
                type="text"
                value={profile.organizationName || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, organizationName: e.target.value })
                }
              />
            </label>

            <label>
              Contract Start:
              <input
                type="date"
                value={profile.contractStartDate?.substring(0, 10) || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, contractStartDate: e.target.value })
                }
              />
            </label>

            <label>
              Contract End:
              <input
                type="date"
                value={profile.contractEndDate?.substring(0, 10) || ""}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, contractEndDate: e.target.value })
                }
              />
            </label>
          </section>


          {/* ===== Password Change ===== */}
          <section>
            <h3>Account Settings</h3>
            <div className="waiter-password-box">
              <h4>Change Password</h4>
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPass}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPass: e.target.value })
                }
                disabled={!isEditing}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm: e.target.value })
                }
                disabled={!isEditing}
              />

              {isEditing &&
                (otpSent ? (
                  <>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <button onClick={handlePasswordChange}>Save Password</button>
                    <button onClick={() => setOtpSent(false)}>Cancel</button>
                  </>
                ) : (
                  <button onClick={sendOtp}>Send OTP</button>
                ))}

              {passwordSuccess && (
                <p style={{ color: "green" }}>✅ Password changed successfully!</p>
              )}
            </div>
          </section>

          <div className="waiter-action-buttons">
            {isEditing ? (
              <>
                <button onClick={handleSave}>Save Changes</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>
        </div>

        {/* ===== Right Side (Profile Image) ===== */}
        <div className="waiter-profile-picture">
          <div className="waiter-image-wrapper">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Profile"
                className="waiter-circle-img"
              />
            ) : (
              <div className="waiter-circle-img placeholder">
                {profile.fullName ? profile.fullName[0].toUpperCase() : "W"}
              </div>
            )}

            <div className="waiter-menu-container">
              <button
                className="waiter-menu-button"
                onClick={() => setShowMenu((prev) => !prev)}
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div className="waiter-dropdown-menu">
                  <label className="waiter-dropdown-item">
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
                      className="waiter-dropdown-item"
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
