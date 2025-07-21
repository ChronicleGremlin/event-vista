import React, { useEffect, useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";

const OAuth2RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse the URL query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      localStorage.setItem("token", token);
      setToken(token);

      authApi
        .getCurrentUser()
        .then(response => {
          setUser(response.data);
          setLoading(false);
          navigate("/app/dashboard");
        })
        .catch(err => {
          console.error("Failed to fetch user after OAuth login", err);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setLoading(false);
          navigate("/login");
        });
    } else if (error) {
      console.error("OAuth error:", error);
      setLoading(false);
      navigate("/login", { state: { error } });
    } else {
      // No token or error, redirect to login just in case
      setLoading(false);
      navigate("/login");
    }
    }, [location, navigate, setToken, setUser]);

    if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
        }}
      >
        {/* Simple spinner */}
        <div className="spinner" style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite"
        }} />
        <span style={{ marginLeft: "10px" }}>Redirecting...</span>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}</style>
      </div>
    );
    }

    return null;
};

export default OAuth2RedirectHandler;
