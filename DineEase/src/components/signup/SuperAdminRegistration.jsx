import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // for redirect
import "./SuperAdminRegistration.css";

const SuperAdminRegistration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    businessType: "",
    customBusinessType: "",
    organizationName: "",
    gstNumber: "",
    organizationAddress: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [businessTypes, setBusinessTypes] = useState([]);

  // Fetch business types from backend
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const response = await fetch(
          "http://localhost:8082/dine-ease/api/v1/admin/business-types"
        );
        if (!response.ok) throw new Error("Failed to load business types");
        const data = await response.json();
        // Extract only keys (business type names)
        const keys = Object.keys(data);
        console.log("busines types", data);
        setBusinessTypes(keys); // assuming backend returns an array of strings
      } catch (err) {
        console.error("Error fetching business types:", err);
      }
    };
    fetchBusinessTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Convert custom business type input to uppercase
    if (name === "customBusinessType") {
      newValue = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError(""); // clear backend error when user types
  };

  const validateForm = () => {
    let formErrors = {};

    if (!formData.fullName.trim()) {
      formErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      formErrors.fullName = "Full name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      formErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      formErrors.email = "Enter a valid email address";
    }

    if (!formData.phoneNumber.trim()) {
      formErrors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9]{10,15}$/.test(formData.phoneNumber)) {
      formErrors.phoneNumber = "Phone number must be 10–15 digits";
    }

    if (!formData.password) {
      formErrors.password = "Password is required";
    } else if (
      !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/.test(
        formData.password
      )
    ) {
      formErrors.password =
        "Password must be ≥8 chars, include uppercase, lowercase, digit, and special char";
    }

    if (!formData.confirmPassword) {
      formErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.organizationName.trim()) {
      formErrors.organizationName = "Organization name is required";
    }

    if (!formData.gstNumber.trim()) {
      formErrors.gstNumber = "GST number is required";
    }

    if (!formData.organizationAddress.trim()) {
      formErrors.organizationAddress = "Organization address is required";
    }

    if (!formData.businessType.trim()) {
      formErrors.businessType = "Business type is required";
    }
    // if "Other" is selected but no input given
    if (
      formData.businessType === "OTHER" &&
      !formData.customBusinessType.trim()
    ) {
      formErrors.customBusinessType = "Please enter your business type";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false);
    setApiError("");

    if (validateForm()) {
      setIsLoading(true);
      try {
        let selectedBusinessType = formData.businessType;
        if (formData.businessType === "OTHER") {
          selectedBusinessType =
            formData.customBusinessType.toUpperCase();
            console.log(selectedBusinessType);

          const payload = {
            businessTypeName: selectedBusinessType,
            description: "No description provided", // default if empty
          };

          // POST new business type to backend
          const postResponse = await fetch(
            "http://localhost:8082/dine-ease/api/v1/admin/add/businessType",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          if (!postResponse.ok) {
            const errorData = await postResponse.json().catch(() => ({}));
            throw new Error(
              errorData?.message || "Failed to add business type"
            );
          }

          // Refresh dropdown so next time user sees the new type too
          const refresh = await fetch(
            "http://localhost:8082/dine-ease/api/v1/admin/business-types"
          );
          const updatedTypes = await refresh.json();
          setBusinessTypes(Object.keys(updatedTypes));
          // Set selected business type for registration
        } else {
          selectedBusinessType = selectedBusinessType.toUpperCase();
        }
        // prepare request body
        const requestBody = {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
          organizationName: formData.organizationName,
          gstNumber: formData.gstNumber,
          organizationAddress: formData.organizationAddress,
          businessType: selectedBusinessType, // always uppercase
        };

        console.log("request:", requestBody)
        const response = await fetch(
          "http://localhost:8082/dine-ease/api/v1/users/sign-up",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Backend validation error:", errorData);
          setApiError(errorData?.message || "Registration failed");
          setIsLoading(false);
          return;
        }

        await response.json();
        setIsLoading(false);
        setIsSuccess(true);

        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
          businessType: "",
          customBusinessType: "",
          organizationName: "",
          gstNumber: "",
          organizationAddress: "",
        });

        // Redirect after 5 seconds
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (err) {
        console.error(err);
        setApiError("Something went wrong. Please try again later.");
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
          <h2 className="title">SIGN-UP</h2>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`form-input ${errors.fullName ? "error" : ""}`}
            />
            {errors.fullName && (
              <span className="error-message">{errors.fullName}</span>
            )}
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
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`form-input ${errors.phoneNumber ? "error" : ""}`}
            />
            {errors.phoneNumber && (
              <span className="error-message">{errors.phoneNumber}</span>
            )}
          </div>
          {/*  Business Type Dropdown */}
          <div className="form-group">
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              className={`form-input ${errors.businessType ? "error" : ""}`}
            >
              <option value="">Select Business Type</option>
              {businessTypes.map((type, idx) => (
                <option key={idx} value={type}>
                  {type}
                </option>
              ))}
              <option value="OTHER">Other</option>
            </select>
            {errors.businessType && (
              <span className="error-message">{errors.businessType}</span>
            )}
          </div>
          {/* Show input only if OTHER is selected */}
          {formData.businessType === "OTHER" && (
            <div className="form-group">
              <input
                type="text"
                name="customBusinessType"
                placeholder="Enter your business type"
                value={formData.customBusinessType}
                onChange={handleInputChange}
                className={`form-input ${
                  errors.customBusinessType ? "error" : ""
                }`}
              />
              {errors.customBusinessType && (
                <span className="error-message">
                  {errors.customBusinessType}
                </span>
              )}
            </div>
          )}

          <div className="form-group">
            <input
              type="text"
              name="organizationName"
              placeholder="Organization Name"
              value={formData.organizationName}
              onChange={handleInputChange}
              className={`form-input ${errors.organizationName ? "error" : ""}`}
            />
            {errors.organizationName && (
              <span className="error-message">{errors.organizationName}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="gstNumber"
              placeholder="GST Number"
              value={formData.gstNumber}
              onChange={handleInputChange}
              className={`form-input ${errors.gstNumber ? "error" : ""}`}
            />
            {errors.gstNumber && (
              <span className="error-message">{errors.gstNumber}</span>
            )}
          </div>

          <div className="form-group">
            <textarea
              name="organizationAddress"
              placeholder="Business Address"
              rows="3"
              value={formData.organizationAddress}
              onChange={handleInputChange}
              className={`form-input ${
                errors.organizationAddress ? "error" : ""
              }`}
            />
            {errors.organizationAddress && (
              <span className="error-message">
                {errors.organizationAddress}
              </span>
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

          {apiError && <p className="error-message">{apiError}</p>}

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
      </div>

      {isSuccess && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-icon">
              <div className="success-checkmark">✓</div>
            </div>
            <h3 className="popup-title">Registration Successful!</h3>
            <p className="popup-message">
              Your account has been created successfully. Redirecting to login…
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminRegistration;
