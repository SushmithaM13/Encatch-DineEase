import { useState, useEffect } from "react";
import { Pencil, Trash2, MoreVertical, User } from "lucide-react";
import "./ChefProfile.css";

export default function ChefProfile() {
  const API_URL = "http://localhost:8082/dine-ease/api/v1/staff/profile";
  const TOKEN = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    staffRoleName: "",
    organizationName: "",
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

  const [passwordForm, setPasswordForm] = useState({
    newPass: "",
    confirm: "",
  });

  // ✅ Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
      setLoading(false);
    };

    TOKEN ? fetchProfile() : alert("No token. Please login first.");
  }, [TOKEN]);

  // ✅ Save profile
  const handleSave = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        alert("✅ Profile Updated");
        setIsEditing(false);
      } else alert("❌ Update failed");
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Upload Image
  const handleImageChange = (e) => {
    if (!e.target.files?.length) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imgBase64 = event.target.result;
      setProfile((prev) => ({ ...prev, profileImage: imgBase64 }));

      await fetch(`${API_URL}/image`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ profileImage: imgBase64 }),
      });
    };
    reader.readAsDataURL(e.target.files[0]);
    setShowMenu(false);
  };

  // ✅ Remove image
  const handleRemoveImage = async () => {
    setProfile((p) => ({ ...p, profileImage: "" }));
    await fetch(`${API_URL}/image`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({ profileImage: "" }),
    });
    setShowMenu(false);
  };

  // ✅ OTP + Change password
  const sendOtp = () => {
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtpSent(true);
    alert(`OTP sent: ${randomOtp}`);
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      alert("⚠ Passwords don't match");
      return;
    }
    if (otp !== generatedOtp) {
      alert("❌ Wrong OTP");
      return;
    }

    await fetch(`${API_URL}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({ password: passwordForm.newPass }),
    });

    alert("✅ Password changed");
    setOtp("");
    setOtpSent(false);
    setPasswordForm({ newPass: "", confirm: "" });
  };

  if (loading) return <div className="chef-profile-page">⏳ Loading Profile...</div>;

  return (
    <div className="chef-profile-page">
      <h2 className="chef-profile-heading">
        <User size={26} /> Chef Profile
      </h2>

      <div className="chef-profile-container">

        {/* LEFT PANEL */}
        <div className="chef-profile-details">

          <section>
            <h3>Basic Info</h3>
            <label>Full Name:
              <input value={profile.fullName || ""} 
                onChange={(e)=>setProfile({...profile, fullName:e.target.value})}
                disabled={!isEditing}/>
            </label>
            <label>Email:
              <input value={profile.email || ""} disabled />
            </label>
            <label>Phone:
              <input value={profile.phoneNumber || ""} 
                onChange={(e)=>setProfile({...profile, phoneNumber:e.target.value})}
                disabled={!isEditing}/>
            </label>
            <label>Role:
              <input value={profile.staffRoleName || ""} disabled />
            </label>
          </section>

          <section>
            <h3>Work Details</h3>

            <label>Organization:
              <input value={profile.organizationName || ""} 
                onChange={(e)=>setProfile({...profile, organizationName:e.target.value})}
                disabled={!isEditing}/>
            </label>

            <label>Shift Timing:
              <input value={profile.shiftTiming || ""} 
                onChange={(e)=>setProfile({...profile, shiftTiming:e.target.value})}
                disabled={!isEditing}/>
            </label>

            <label>Contract Start:
              <input type="date"
                value={profile.contractStartDate?.substring(0,10) || ""}
                onChange={(e)=>setProfile({...profile, contractStartDate:e.target.value})}
                disabled={!isEditing}/>
            </label>

            <label>Contract End:
              <input type="date"
                value={profile.contractEndDate?.substring(0,10) || ""}
                onChange={(e)=>setProfile({...profile, contractEndDate:e.target.value})}
                disabled={!isEditing}/>
            </label>
          </section>

          <section>
            <h3>Password</h3>
            <div className="chef-password-box">
              <input type="password" placeholder="New Password"
                disabled={!isEditing}
                value={passwordForm.newPass}
                onChange={(e)=>setPasswordForm({...passwordForm,newPass:e.target.value})}/>
              <input type="password" placeholder="Confirm Password"
                disabled={!isEditing}
                value={passwordForm.confirm}
                onChange={(e)=>setPasswordForm({...passwordForm,confirm:e.target.value})}/>

              {isEditing && (
                otpSent ? (
                  <>
                    <input placeholder="Enter OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} />
                    <button onClick={handlePasswordChange}>Save Password</button>
                    <button onClick={()=>setOtpSent(false)}>Cancel</button>
                  </>
                ) : (
                  <button onClick={sendOtp}>Send OTP</button>
                )
              )}
            </div>
          </section>

          <div className="chef-action-buttons">
            {isEditing ? (
              <>
                <button onClick={handleSave}>Save</button>
                <button onClick={()=>setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <button onClick={()=>setIsEditing(true)}>Edit Profile</button>
            )}
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="chef-profile-picture">
          <div className="chef-image-wrapper">
            {profile.profileImage ? (
              <img src={profile.profileImage} className="chef-circle-img" alt="chef" />
            ) : (
              <div className="chef-circle-img placeholder">
                {profile.fullName?.[0] || "C"}
              </div>
            )}

            {/* Menu Button */}
            <div className="chef-menu-container">
              <button className="chef-menu-button" onClick={()=>setShowMenu(!showMenu)}>
                <MoreVertical size={18}/>
              </button>

              {showMenu && (
                <div className="chef-dropdown-menu">
                  <label className="chef-dropdown-item">
                    <Pencil size={14}/> Change Photo
                    <input type="file" accept="image/*" hidden onChange={handleImageChange}/>
                  </label>

                  {profile.profileImage && (
                    <button className="chef-dropdown-item" onClick={handleRemoveImage}>
                      <Trash2 size={14}/> Remove Photo
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
