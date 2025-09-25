import { useState, useEffect } from "react";
import { Pencil, Trash2, MoreVertical, User } from "lucide-react";
import "./AdminProfile.css";

export default function AdminProfile() {
  // Profile details
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [contact, setContact] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [restaurantDesc, setRestaurantDesc] = useState("");
  const [role] = useState("Admin");

  // Profile pic
  const [profilePic, setProfilePic] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Load stored values
  useEffect(() => {
    setName(localStorage.getItem("adminName") || "");
    setAdminEmail(localStorage.getItem("adminEmail") || "");
    setContact(localStorage.getItem("adminContact") || "");
    setRestaurantName(localStorage.getItem("restaurantName") || "");
    setRestaurantAddress(localStorage.getItem("restaurantLocation") || "");
    setRestaurantPhone(localStorage.getItem("restaurantPhone") || "");
    setRestaurantDesc(localStorage.getItem("restaurantDescription") || "");
    setProfilePic(localStorage.getItem("adminProfilePic"));
  }, []);

  // Save profile
  const handleSave = () => {
    localStorage.setItem("adminName", name);
    localStorage.setItem("adminEmail", adminEmail);
    localStorage.setItem("adminContact", contact);
    localStorage.setItem("restaurantName", restaurantName);
    localStorage.setItem("restaurantLocation", restaurantAddress);
    localStorage.setItem("restaurantPhone", restaurantPhone);
    localStorage.setItem("restaurantDescription", restaurantDesc);
    if (profilePic) {
      localStorage.setItem("adminProfilePic", profilePic);
    } else {
      localStorage.removeItem("adminProfilePic");
    }
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  // Change profile picture
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target?.result);
        localStorage.setItem("adminProfilePic", event.target?.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    setShowMenu(false);
  };

  const handleRemoveImage = () => {
    setProfilePic(null);
    localStorage.removeItem("adminProfilePic");
    setShowMenu(false);
  };

  // OTP + Password change
  const sendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    alert(`OTP sent to ${adminEmail}: ${code}`);
  };

  const handlePasswordChange = () => {
    const storedPass = localStorage.getItem("adminPassword") || "";
    if (passwordForm.current !== storedPass) {
      alert("Current password is incorrect!");
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      alert("New passwords do not match!");
      return;
    }
    if (otp !== generatedOtp) {
      alert("Invalid OTP!");
      return;
    }
    localStorage.setItem("adminPassword", passwordForm.newPass);
    setPasswordSuccess(true);
    setOtpSent(false);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setOtp("");
    alert("Password updated successfully!");
  };

  return (
    <div className="profile-page">
      {/* Heading with User Icon */}
      <h2 className="profile-heading">
        <User size={28} className="user-icon" /> Admin Profile
      </h2>

      <div className="profile-container">
        {/* Left Side */}
        <div className="profile-details">
          <section>
            <h3>Basic Info</h3>
            <label>
              Name:
              <input
                type="text"
                value={name}
                disabled={!isEditing}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Email / Username:
              <input type="email" value={adminEmail} disabled />
            </label>
            <label>
              Contact Number:
              <input
                type="text"
                value={contact}
                disabled={!isEditing}
                onChange={(e) => setContact(e.target.value)}
              />
            </label>
          </section>

          <section>
            <h3>Restaurant Info</h3>
            <label>
              Name:
              <input
                type="text"
                value={restaurantName}
                disabled={!isEditing}
                onChange={(e) => setRestaurantName(e.target.value)}
              />
            </label>
            <label>
              Address:
              <input
                type="text"
                value={restaurantAddress}
                disabled={!isEditing}
                onChange={(e) => setRestaurantAddress(e.target.value)}
              />
            </label>
            <label>
              Phone:
              <input
                type="text"
                value={restaurantPhone}
                disabled={!isEditing}
                onChange={(e) => setRestaurantPhone(e.target.value)}
              />
            </label>
            <label>
              Description:
              <textarea
                value={restaurantDesc}
                disabled={!isEditing}
                onChange={(e) => setRestaurantDesc(e.target.value)}
              />
            </label>
          </section>

          <section>
            <h3>Account Settings</h3>
            <label>
              Role:
              <input type="text" value={role} disabled />
            </label>

            <div className="password-box">
              <h4>Change Password</h4>
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, current: e.target.value })
                }
                disabled={!isEditing}
              />
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
                placeholder="Confirm New Password"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirm: e.target.value })
                }
                disabled={!isEditing}
              />

              {isEditing && (
                <>
                  {otpSent ? (
                    <>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <button onClick={handlePasswordChange}>
                        Save Password
                      </button>
                      <button onClick={() => setOtpSent(false)}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={sendOtp}>Send OTP</button>
                  )}
                </>
              )}

              {passwordSuccess && (
                <p style={{ color: "green" }}>
                  ✅ Password changed successfully!
                </p>
              )}
            </div>
          </section>

          <div className="action-buttons">
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

        {/* Right Side Profile Picture */}
        <div className="profile-picture">
          <div className="image-wrapper">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="circle-img" />
            ) : (
              <div className="circle-img placeholder">
                {name ? name[0].toUpperCase() : "A"}
              </div>
            )}

            {/* 3 Dots Menu (always visible) */}
            <div className="menu-container">
              <button
                className="menu-button"
                onClick={() => setShowMenu((prev) => !prev)}
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div className="dropdown-menu">
                  <label className="dropdown-item">
                    <Pencil size={16} />
                    Edit Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      hidden
                    />
                  </label>
                  {profilePic && (
                    <button
                      className="dropdown-item"
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