import { useState, useEffect } from "react";
import { Pencil, Trash2, MoreVertical, User } from "lucide-react";
import "./WaiterProfile.css";

export default function WaiterProfile() {
  // Profile details
  const [name, setName] = useState("");
  const [waiterEmail, setWaiterEmail] = useState("");
  const [contact, setContact] = useState("");
  const [role] = useState("Waiter"); // Fixed role

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
    setName(localStorage.getItem("waiterName") || "");
    setWaiterEmail(localStorage.getItem("waiterEmail") || "");
    setContact(localStorage.getItem("waiterContact") || "");
    setProfilePic(localStorage.getItem("waiterProfilePic"));
  }, []);

  // Save profile
  const handleSave = () => {
    localStorage.setItem("waiterName", name);
    localStorage.setItem("waiterEmail", waiterEmail);
    localStorage.setItem("waiterContact", contact);
    if (profilePic) {
      localStorage.setItem("waiterProfilePic", profilePic);
    } else {
      localStorage.removeItem("waiterProfilePic");
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
        localStorage.setItem("waiterProfilePic", event.target?.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    setShowMenu(false);
  };

  const handleRemoveImage = () => {
    setProfilePic(null);
    localStorage.removeItem("waiterProfilePic");
    setShowMenu(false);
  };

  // OTP + Password change
  const sendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    alert(`OTP sent to ${waiterEmail}: ${code}`);
  };

  const handlePasswordChange = () => {
    const storedPass = localStorage.getItem("waiterPassword") || "";
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
    localStorage.setItem("waiterPassword", passwordForm.newPass);
    setPasswordSuccess(true);
    setOtpSent(false);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setOtp("");
    alert("Password updated successfully!");
  };

  return (
    <div className="waiter-profile-page">
      {/* Heading with User Icon */}
      <h2 className="waiter-profile-heading">
        <User size={28} className="waiter-user-icon" /> Waiter Profile
      </h2>

      <div className="waiter-profile-container">
        {/* Left Side */}
        <div className="waiter-profile-details">
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
              <input type="email" value={waiterEmail} disabled />
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
            <h3>Account Settings</h3>
            <label>
              Role:
              <input type="text" value={role} disabled />
            </label>

            <div className="waiter-password-box">
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
                      <button
                        className="waiter-save-password-btn"
                        onClick={handlePasswordChange}
                      >
                        Save Password
                      </button>
                      <button
                        className="waiter-cancel-otp-btn"
                        onClick={() => setOtpSent(false)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="waiter-send-otp-btn"
                      onClick={sendOtp}
                    >
                      Send OTP
                    </button>
                  )}
                </>
              )}

              {passwordSuccess && (
                <p className="waiter-password-success">
                   Password changed successfully!
                </p>
              )}
            </div>
          </section>

          <div className="waiter-action-buttons">
            {isEditing ? (
              <>
                <button className="waiter-save-btn" onClick={handleSave}>Save Changes</button>
                <button className="waiter-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="waiter-edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>
        </div>

        {/* Right Side Profile Picture */}
        <div className="waiter-profile-picture">
          <div className="waiter-image-wrapper">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="waiter-circle-img" />
            ) : (
              <div className="waiter-circle-img placeholder">
                {name ? name[0].toUpperCase() : "W"}
              </div>
            )}

            {/* 3 Dots Menu */}
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
