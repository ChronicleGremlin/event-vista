import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";
import "./Login.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    emailAddress: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get return URL from query params
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(returnUrl);
    }
  }, [user, navigate, returnUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(credentials);
      navigate(returnUrl);
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Failed to login. Please try again.");
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    // Store the return URL in localStorage before redirecting
    localStorage.setItem("returnUrl", returnUrl);
    // Redirect to Google OAuth endpoint
    window.location.href = authApi.getOAuthUrl();
  };

  return (
    <div className="login-container flex-center">
      <div className="login-box card">
        <div className="login-header">
          <h2 className="login-title">Sign in to your account</h2>
          <p className="login-subtitle">
            Or{" "}
            <Link to="/register" className="login-link">
              create a new account
            </Link>
          </p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
             <label htmlFor="emailAddress">
                  Email Address <span className="mandatory">*</span>
            </label>
            <input
              id="emailAddress"
              name="emailAddress"
              type="email"
              required
              className="form-input input"
              placeholder="Email address"
              value={credentials.emailAddress}
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
              className="form-input input"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button button button-primary">
            Sign in
          </button>

          <div className="forgot-password">
            <Link to="/reset-password" className="login-link">
              Forgot your password?
            </Link>
          </div>
        </form>

        <div className="divider">
          <span className="divider-text">Or continue with</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="google-button button"
        >
          <img
            className="google-icon"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
          />
          Sign in with Google
        </button>
                <div className="back-to-welcome">
                  <Link to="/" className="login-link">
                    Back to Welcome Page
                    </Link>
                </div>
      </div>
    </div>
  );
};

export default Login;
