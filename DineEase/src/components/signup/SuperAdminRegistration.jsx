import React, { useState } from 'react';
import './SuperAdminRegistration.css';

const SuperAdminRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false);

    if (validateForm()) {
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
        console.log('Super Admin Registration:', formData);

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });

        setTimeout(() => setIsSuccess(false), 2000); // hide success after 2s
      }, 2000);
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
          <p className="subtitle">Create your administrative account</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Full Name */}
          <div className="form-group">
            <div className="input-container">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${formData.name ? 'has-value' : ''} ${errors.name ? 'error' : ''}`}
              />
              <label htmlFor="name" className="form-label">Full Name</label>
              <div className="input-highlight"></div>
            </div>
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <div className="input-container">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${formData.email ? 'has-value' : ''} ${errors.email ? 'error' : ''}`}
              />
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-highlight"></div>
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <div className="input-container">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`form-input ${formData.phone ? 'has-value' : ''} ${errors.phone ? 'error' : ''}`}
              />
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <div className="input-highlight"></div>
            </div>
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="input-container">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${formData.password ? 'has-value' : ''} ${errors.password ? 'error' : ''}`}
              />
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-highlight"></div>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <div className="input-container">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${formData.confirmPassword ? 'has-value' : ''} ${errors.confirmPassword ? 'error' : ''}`}
              />
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="input-highlight"></div>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* Button */}
          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
            disabled={isLoading}
          >
            <span className="button-text">
              {isLoading ? 'Creating Account...' : 'Create Account'}
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
          <p>Already have an account? <a href="/login" className="login-link">LOGIN HEAR</a></p>
        </div>
      </div>

      {/* Success Popup */}
      {isSuccess && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-icon">
              <div className="success-checkmark">✓</div>
            </div>
            <h3 className="popup-title">Registration Successful!</h3>
            <p className="popup-message">Your account has been created successfully.</p>
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
