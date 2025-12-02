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
    phoneNumber: "",
    email: "",
    staffRoleName: "",
    shiftTiming: "",
    contractStartDate: "",
    contractEndDate: "",
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

  // FETCH PROFILE
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

        const text = await res.text();
        if (!text) return;

        const data = JSON.parse(text);

        setProfile({
          id: data.id || "",
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          staffRoleName: data.staffRoleName || data.staffRole?.name || "",
          organizationId:
            data.organizationId || data.organization?.id || "",
          organizationName:
            data.organizationName || data.organization?.name || "",
          shiftTiming: data.shiftTiming || "",
          contractStartDate: data.contractStartDate || "",
          contractEndDate: data.contractEndDate || "",
          profileImage: data.profileImage || "",
        });

// ✅ Save dynamic org ID to localStorage
localStorage.setItem(
  "chefOrgId",
  data.organizationId || data.organization?.id || ""
);

      } catch (err) {
        console.error("Chef profile fetch error:", err);
      }
    };

    if (TOKEN) fetchProfile();
  }, [TOKEN]);

  // SAVE PROFILE
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
        alert("Update failed!");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // IMAGE UPLOAD
  const handleImageChange = (e) => {
    if (!e.target.files?.length) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target.result;

      setProfile((prev) => ({ ...prev, profileImage: base64Image }));

      await fetch(`${API_URL}/image`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ profileImage: base64Image }),
      });
    };

    reader.readAsDataURL(e.target.files[0]);
    setShowMenu(false);
  };

  // REMOVE IMAGE
  const handleRemoveImage = async () => {
    setProfile((prev) => ({ ...prev, profileImage: "" }));

    await fetch(`${API_URL}/image`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ profileImage: "" }),
    });

    setShowMenu(false);
  };

  // OTP & PASSWORD CHANGE
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

    await fetch(`${API_URL}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ password: passwordForm.newPass }),
    });

    setPasswordSuccess(true);
    setOtpSent(false);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    setOtp("");
  };

  return (
    <div className="chef-profile-page">
      <h2 className="chef-profile-heading">
        <User size={28} /> Chef Profile
      </h2>

      <div className="chef-profile-container">
        {/* LEFT SIDE */}
        <div className="chef-profile-details">
          <section>
            <h3>Basic Info</h3>

            <label>
              Full Name:
              <input
                type="text"
                value={profile.fullName}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
              />
            </label>

            <label>
              Email:
              <input type="email" value={profile.email} disabled />
            </label>

            <label>
              Phone:
              <input
                type="text"
                value={profile.phoneNumber}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, phoneNumber: e.target.value })
                }
              />
            </label>

            <label>
              Role:
              <input type="text" value={profile.staffRoleName} disabled />
            </label>
          </section>

          <section>
            <h3>Organization Info</h3>

            <label>
              Organization ID:
              <input type="text" value={profile.organizationId} disabled />
            </label>

            <label>
              Organization:
              <input
                type="text"
                value={profile.organizationName}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    organizationName: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Shift Timing:
              <input
                type="text"
                value={profile.shiftTiming}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, shiftTiming: e.target.value })
                }
              />
            </label>

            <label>
              Contract Start:
              <input
                type="date"
                value={profile.contractStartDate?.substring(0, 10)}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contractStartDate: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Contract End:
              <input
                type="date"
                value={profile.contractEndDate?.substring(0, 10)}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contractEndDate: e.target.value,
                  })
                }
              />
            </label>
          </section>

          {/* PASSWORD SECTION */}
          <section>
            <h3>Account Settings</h3>

            <div className="chef-password-box">
              <h4>Change Password</h4>

              <input
                type="password"
                placeholder="New Password"
                disabled={!isEditing}
                value={passwordForm.newPass}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPass: e.target.value,
                  })
                }
              />

              <input
                type="password"
                placeholder="Confirm Password"
                disabled={!isEditing}
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm: e.target.value,
                  })
                }
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

                    <button onClick={handlePasswordChange}>
                      Save Password
                    </button>

                    <button onClick={() => setOtpSent(false)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={sendOtp}>Send OTP</button>
                ))}

              {passwordSuccess && (
                <p style={{ color: "green" }}>
                  ✓ Password updated successfully!
                </p>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="chef-action-buttons">
            {isEditing ? (
              <>
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="chef-profile-picture">
          <div className="chef-image-wrapper">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                className="chef-circle-img"
                alt="profile"
              />
            ) : (
              <div className="chef-circle-img">
                {profile.fullName
                  ? profile.fullName[0].toUpperCase()
                  : "C"}
              </div>
            )}

            <div className="chef-menu-container">
              <button
                className="chef-menu-button"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div className="chef-dropdown-menu">
                  <label className="chef-dropdown-item">
                    <Pencil size={16} /> Edit Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>

                  {profile.profileImage && (
                    <button
                      className="chef-dropdown-item"
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
