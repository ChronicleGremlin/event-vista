import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { venueApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/components.css";
import VenueForm from "./VenueForm";
import VenueSearch from "./VenueSearch";
import VenueSearchResults from "./VenueSearchResults";
import Modal from "../../components/common/Modal/Modal";
import Sidebar from "../Dashboard/Sidebar";
import Breadcrumbs from '../../pages/Dashboard/Breadcrumbs';

const VenuePage = () => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, token, logout } = useAuth();
  const navigate = useNavigate();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }
    fetchVenues();
  }, [isAuthenticated, token, navigate]);

  const handleAuthError = async () => {
    await logout();
    navigate("/login");
  };

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await venueApi.getAllVenues();
      setVenues(response.data || []);
      setSearchResults(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching venues:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        await handleAuthError();
      } else {
        setError("Unable to load venues. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults(venues);
      return;
    }

    try {
      let result;
      console.log("Searching for:", searchTerm, "by type:", searchType);

      switch (searchType) {
        case "name":
          result = await venueApi.getVenueByName(searchTerm);
          console.log("Name search result:", result);
          break;
        case "location":
          result = await venueApi.getVenueByLocation(searchTerm);
          console.log("Location search result:", result);
          break;
        case "phone":
          result = await venueApi.getVenueByPhoneNumber(searchTerm);
          console.log("Phone search result:", result);
          break;
        case "email":
          result = await venueApi.getVenueByEmail(searchTerm);
          console.log("Email search result:", result);
          break;
        default:
          result = [];
      }

      // Extract data from response if it exists
      if (result && result.data) {
        result = result.data;
      }

      // Ensure result is an array
      const searchResults = Array.isArray(result) ? result : [result];
      console.log("Final search results:", searchResults);

      setSearchResults(searchResults.filter((item) => item !== null));
    } catch (err) {
      console.error("Error searching venues:", err);
      setSearchResults([]);
    }
  };

  const handleAddVenue = () => {
    if (!token) {
      handleAuthError();
      return;
    }
    setSelectedVenue(null);
    setShowVenueForm(true);
  };

  const handleEditVenue = (venue) => {
    if (!token) {
      handleAuthError();
      return;
    }
    setSelectedVenue(venue);
    setShowVenueForm(true);
  };

  const handleDeleteVenue = async (venueId) => {
    if (!token) {
      handleAuthError();
      return;
    }

    if (window.confirm("Are you sure you want to delete this venue?")) {
      try {
        await venueApi.deleteVenue(venueId);
        setVenues(venues.filter((venue) => venue.id !== venueId));
        setSearchResults(searchResults.filter((venue) => venue.id !== venueId));
        setError(null);
      } catch (err) {
        console.error("Error deleting venue:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          await handleAuthError();
        } else {
          setError("Failed to delete venue. Please try again later.");
        }
      }
    }
  };

  const handleVenueSubmit = async (venueData) => {
    if (!token) {
      handleAuthError();
      return;
    }

    try {
      if (selectedVenue) {
        // Update existing venue
        const response = await venueApi.updateVenue(
          selectedVenue.id,
          venueData
        );
        setVenues(
          venues.map((venue) =>
            venue.id === selectedVenue.id ? response.data : venue
          )
        );
        setSearchResults(
          searchResults.map((venue) =>
            venue.id === selectedVenue.id ? response.data : venue
          )
        );
      } else {
        // Create new venue
        const response = await venueApi.createVenue(venueData);
        setVenues([...venues, response.data]);
        setSearchResults([...searchResults, response.data]);
      }
      setShowVenueForm(false);
      setSelectedVenue(null);
      setError(null);
    } catch (err) {
          console.error("Error saving venue:", err);

          if (err.response?.status === 401 || err.response?.status === 403) {
            await handleAuthError();
          } else {
            // Rethrow the error so VenueForm can handle and display it
            throw err;
          }
      }
  };

  const handleViewAll = () => {
      setSearchTerm("");
      setSearchType("name");
      setSearchResults(venues);
  };

  if (!isAuthenticated || !token) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
                <div style={{ display: "flex", minHeight: "100vh" }}>
                  <Sidebar />
    <div className="container" style={{ padding: "2rem", marginLeft: "200px", flex: 1, boxSizing: "border-box" }}>

        <Breadcrumbs />

      <div className="dashboard-header">
        <h2 className="dashboard-title">Venues</h2>
        <p className="dashboard-subtitle">Manage your event venues</p>

        <VenueSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchType={searchType}
          setSearchType={setSearchType}
          onSearch={handleSearch}
        />

        <button
          className="button button-primary"
          onClick={handleAddVenue}
          style={{ marginTop: "1rem" }}
        >
          Add New Venue
        </button>
         <button
            className="button button-secondary"
            onClick={handleViewAll}
            style={{ marginTop: "1rem", marginLeft: "1rem" }}
          >
            View All
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <VenueSearchResults
        venues={searchResults}
        onEdit={handleEditVenue}
        onDelete={handleDeleteVenue}
      />

      {showVenueForm && (
        <Modal onClose={() => setShowVenueForm(false)}>
          <VenueForm
            initialData={selectedVenue}
            onSubmit={handleVenueSubmit}
            onCancel={() => setShowVenueForm(false)}
          />
        </Modal>
      )}
    </div>
    </div>
  );
};

export default VenuePage;
