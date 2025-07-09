import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Calendar from "./Calendar";
import EventForm from "./EventForm";
import UpcomingEvents from "../../components/UpcomingEvents/UpcomingEvents";
import { eventApi } from "../../services/api";
import "../../styles/components.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const redirectToUserProfile = () => {
    navigate("/profile"); // Redirect to user profile page
  };

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventApi.getAllEvents();

      const data = response.data;
      console.log("Fetched events:", data);

      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data?.events && Array.isArray(data.events)) {
        setEvents(data.events); // In case your API wraps it in an object
      } else {
        console.warn("Unexpected response format:", data);
        setEvents([]); // fallback to empty array
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    setShowEventForm(true);
  };

  const handleSaveEvent = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      await fetchEvents();
      setSuccessMessage("Event created successfully!");
      setShowEventForm(false);
    } catch (err) {
      console.error("Error saving event:", err);
      setError("Failed to create event. Please try again.");
    }
  };

  const handleCancelEvent = () => {
    setShowEventForm(false);
  };

  const handleEventUpdated = async () => {
    try {
      await fetchEvents();
      setSuccessMessage("Event updated successfully!");
    } catch (err) {
      console.error("Error updating events:", err);
      setError("Failed to update events. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Events</h3>
          <p>{error}</p>
          <button onClick={fetchEvents} className="button button-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: "1rem" }}>
      <nav className="card">
        <div className="container">
          <div
            className="flex"
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              height: "4rem",
            }}
          >
            <div className="flex" style={{ alignItems: "center" }}>
              <h1 className="card-title">Event Vista</h1>
            </div>
            <div className="flex" style={{ alignItems: "center", gap: "1rem" }}>
              <span className="card-content">
                Welcome, {user?.name || "User"}
              </span>
              <img
                src={user.pictureUrl}
                alt="Profile"
                className="dashboard-profile-pic"
              />
              <button
                onClick={redirectToUserProfile}
                className="button button-primary"
              >
                Profile
              </button>
              <button onClick={handleAddEvent} className="button button-primary">
                Add Event
              </button>
              <button onClick={logout} className="button button-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        {successMessage && (
          <div className="success-message" style={{ margin: "1rem 0" }}>
            {successMessage}
          </div>
        )}
        {error && (
          <div className="error-message" style={{ margin: "1rem 0" }}>
            {error}
          </div>
        )}
        <Calendar events={events} onEventUpdated={handleEventUpdated} />
        <UpcomingEvents events={events} />
      </div>

      {showEventForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <EventForm
              onSubmit={handleSaveEvent}
              onCancel={handleCancelEvent}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;