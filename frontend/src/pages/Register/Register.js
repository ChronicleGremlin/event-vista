import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    emailAddress: "",
    password: "",
    verifyPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.verifyPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(formData);
      setSuccess(
        "Registration successful! Please check your email to verify your account."
      );
      // Don't navigate away immediately so the user can see the success message
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h2 className="register-title">Create your account</h2>
        </div>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
                  Username <span className="mandatory">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="form-input"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
             <label htmlFor="emailAddress">
                  Email address <span className="mandatory">*</span>
            </label>
            <input
              id="emailAddress"
              name="emailAddress"
              type="email"
              required
              className="form-input"
              placeholder="Email address"
              value={formData.emailAddress}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
             <label htmlFor="password">
                  Password <span className="mandatory">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
             <label htmlFor="password">
                  Verify Password <span className="mandatory">*</span>
            </label>
            <input
              id="verifyPassword"
              name="verifyPassword"
              type="password"
              required
              className="form-input"
              placeholder="Verify Password"
              value={formData.verifyPassword}
              onChange={handleChange}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="submit-button">
            Register
          </button>
        </form>

        <div className="login-prompt">
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
