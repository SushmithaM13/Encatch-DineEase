import React, { useState } from "react";
import "./SuperAdminRegistration.css";

const SuperAdminRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessType: "",
    businessName: "",
    gst: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone.trim())
      newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, "")))
      newErrors.phone = "Phone number must be 10 digits";

    if (!formData.password)
      newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.businessType)
      newErrors.businessType = "Business type is required";
    if (!formData.businessName.trim())
      newErrors.businessName = "Business name is required";
    if (!formData.gst.trim())
      newErrors.gst = "GST number is required";
    if (!formData.address.trim())
      newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false);

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch(
          "http://localhost:8080/api/super-admin/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) throw new Error("Registration failed");
        await response.text(); // or response.json() if backend sends JSON

        setIsLoading(false);
        setIsSuccess(true);

        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          businessType: "",
          businessName: "",
          gst: "",
          address: "",
        });

        setTimeout(() => setIsSuccess(false), 3000);
      } catch (err) {
        console.error(err);
        alert("Registration failed! Check backend connection.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="registration">
      <div className="registration-card">
        <div className="card-header">
          <div className="admin-icon">
            <div className="crown">
              <div className="crown-jewel"></div>
            </div>
          </div>
          <h2 className="title">Registration</h2>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? "error" : ""}`}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? "error" : ""}`}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className={`form-input ${errors.phone ? "error" : ""}`}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              className={`form-input ${errors.businessType ? "error" : ""}`}
            >
              <option value="">Select Business Type</option>
              <option value="Hotel">Hotel</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
            {errors.businessType && (
              <span className="error-message">{errors.businessType}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="businessName"
              placeholder="Business Name"
              value={formData.businessName}
              onChange={handleInputChange}
              className={`form-input ${errors.businessName ? "error" : ""}`}
            />
            {errors.businessName && (
              <span className="error-message">{errors.businessName}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="gst"
              placeholder="GST Number"
              value={formData.gst}
              onChange={handleInputChange}
              className={`form-input ${errors.gst ? "error" : ""}`}
            />
            {errors.gst && <span className="error-message">{errors.gst}</span>}
          </div>

          <div className="form-group">
            <textarea
              name="address"
              placeholder="Business Address"
              rows="3"
              value={formData.address}
              onChange={handleInputChange}
              className={`form-input ${errors.address ? "error" : ""}`}
            />
            {errors.address && (
              <span className="error-message">{errors.address}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? "error" : ""}`}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`form-input ${errors.confirmPassword ? "error" : ""}`}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? "loading" : ""} ${
              isSuccess ? "success" : ""
            }`}
            disabled={isLoading}
          >
            <span className="button-text">
              {isLoading ? "Creating Account..." : "Create Account"}
            </span>
            <div className="button-loader">
              <div className="spinner"></div>
            </div>
            <div className="button-success">
              <div className="checkmark">✓</div>
            </div>
          </button>
        </form>

        <div className="form-footer">
          <p>
            Already have an account?{" "}
            <a href="/login" className="login-link">
              LOGIN HERE
            </a>
          </p>
        </div>
      </div>

      {isSuccess && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-icon">
              <div className="success-checkmark">✓</div>
            </div>
            <h3 className="popup-title">Registration Successful!</h3>
            <p className="popup-message">
              Your account has been created successfully.
            </p>
            <button
              className="popup-button"
              onClick={() => setIsSuccess(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminRegistration;
