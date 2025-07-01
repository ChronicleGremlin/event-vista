import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vendorApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/components.css";
import VendorForm from "./VendorForm";
import VendorSearch from "./VendorSearch";
import VendorSearchResults from "./VendorSearchResults";
import Modal from "../../components/common/Modal/Modal";
import Sidebar from "../Dashboard/Sidebar";
import Breadcrumbs from '../../pages/Dashboard/Breadcrumbs';


const VendorPage = () => {
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showVendorForm, setShowVendorForm] = useState(false);
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
        fetchVendors();
    }, [isAuthenticated, token, navigate]);

    const handleAuthError = async () => {
        await logout();
        navigate("/login");
    };

    const fetchVendors = async () => {
        try {
          setLoading(true);
          const response = await vendorApi.getAllVendors();
          setVendors(response.data || []);
          setSearchResults(response.data || []);
          setError(null);
        } catch (err) {
          console.error("Error fetching vendors:", err);
          if (err.response?.status === 401 || err.response?.status === 403) {
            await handleAuthError();
          } else {
            setError("Unable to load vendors. Please try again later.");
          }
        } finally {
          setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
          setSearchResults(vendors);
          return;
        }

        try {
          let result;
          console.log("Searching for:", searchTerm, "by type:", searchType);

          switch (searchType) {
            case "name":
              result = await vendorApi.getVendorByName(searchTerm);
              console.log("Name search result:", result);
              break;
            case "location":
              result = await vendorApi.getVendorByLocation(searchTerm);
              console.log("Location search result:", result);
              break;
            case "skills":
                      result = await vendorApi.getVendorBySkillName(searchTerm);
                      console.log("Skill search result:", result);
                      break;
            case "phone":
              result = await vendorApi.getVendorByPhoneNumber(searchTerm);
              console.log("Phone search result:", result);
              break;
            case "email":
              result = await vendorApi.getVendorByEmail(searchTerm);
              console.log("Email search result:", result);
              break;
            default:
              result = [];
          }

          // Extract data from response if it exists
          if (result && result.data) {
            const searchResults = Array.isArray(result.data)
              ? result.data
              : [result.data];
            setSearchResults(searchResults.filter((item) => item !== null));
          } else {
            setSearchResults([]);
          }
        } catch (err) {
          console.error("Error searching vendors:", err);
          setSearchResults([]);
        }
    };

    const handleAddVendor = () => {
        if (!token) {
          handleAuthError();
          return;
        }
        setSelectedVendor(null);
        setShowVendorForm(true);
    };

    const handleEditVendor = (vendor) => {
        if (!token) {
        handleAuthError();
        return;
        }

        // Normalize skill structure for Select component
        const normalizedVendor = {
        ...vendor,
        notes: vendor.notes || "",
          skills: Array.isArray(vendor.skills)
            ? vendor.skills.map((skill) => ({
                id: skill.id,
                name: skill.name,
                value: skill.id,
                label: skill.name,
              }))
            : [],
    };

    setSelectedVendor(normalizedVendor);
    setShowVendorForm(true);
    };

    const handleDeleteVendor = async (vendorId) => {
        if (!token) {
          handleAuthError();
          return;
        }

        if (window.confirm("Are you sure you want to delete this vendor?")) {
          try {
            await vendorApi.deleteVendor(vendorId);
            setVendors(vendors.filter((vendor) => vendor.id !== vendorId));
            setSearchResults(searchResults.filter((vendor) => vendor.id !== vendorId));
            setError(null);
          } catch (err) {
            console.error("Error deleting vendor:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
              await handleAuthError();
            } else {
              setError("Failed to delete vendor. Please try again later.");
            }
          }
        }
    };

    const handleVendorSubmit = async (vendorData) => {
        if (!token) {
        handleAuthError();
        return;
        }

            // Normalize the vendor data to match the Select component structure for skills
            const normalizeVendor = (vendor) => ({
            ...vendor,
              notes: vendor.notes || "",
              skills: Array.isArray(vendor.skills)
                ? vendor.skills.map((skill) => ({
                    id: skill.id,
                    name: skill.name,
                    value: skill.id,
                    label: skill.name,
                  }))
                : [],
            });

        try {
        const payload = {
          name: vendorData.name,
          location: vendorData.location,
          emailAddress: vendorData.emailAddress,
          phoneNumber: vendorData.phoneNumber.phoneNumber,
          notes: vendorData.notes || "",
          skills: Array.isArray(vendorData.skills)
            ? vendorData.skills
                .filter((skill) => skill && (skill.value || skill.id)) // Ensure valid skills
                .map((skill) => ({ id: skill.value ?? skill.id }))
            : [],
        };

            let response;
            let normalizedVendor;

        if (selectedVendor) {
          // Update existing vendor
          response = await vendorApi.updateVendor(selectedVendor.id, payload, token);
          normalizedVendor = normalizeVendor(response.data);

          setVendors(
            vendors.map((vendor) =>
              vendor.id === selectedVendor.id ? normalizedVendor : vendor
            )
          );
          setSearchResults(
            searchResults.map((vendor) =>
              vendor.id === selectedVendor.id ? normalizedVendor : vendor
            )
          );
        } else {
          // Create new vendor
          response = await vendorApi.createVendor(payload, token);
          normalizedVendor = normalizeVendor(response.data);

          setVendors([...vendors, normalizedVendor]);
          setSearchResults([...searchResults, normalizedVendor]);
        }

            setShowVendorForm(false);
            setSelectedVendor(null);
            setError(null);
        } catch (err) {
            console.error("Error saving vendor:", err);

            if (err.response?.status === 401 || err.response?.status === 403) {
              await handleAuthError();
            } else {
              // Rethrow the error so VendorForm can handle and display it
              throw err;
            }
        }
    };

    const handleViewAll = () => {
            setSearchTerm("");
            setSearchType("name");
            setSearchResults(vendors);
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
            <h2 className="dashboard-title">Vendors</h2>
            <p className="dashboard-subtitle">Manage your event vendors</p>

            <VendorSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchType={searchType}
              setSearchType={setSearchType}
              onSearch={handleSearch}
            />

            <button
              className="button button-primary"
              onClick={handleAddVendor}
              style={{ marginTop: "1rem" }}
            >
              Add New Vendor
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

          <VendorSearchResults
            vendors={searchResults}
            onEdit={handleEditVendor}
            onDelete={handleDeleteVendor}
          />

          {showVendorForm && (
            <Modal onClose={() => setShowVendorForm(false)}>
              <VendorForm
                initialData={selectedVendor}
                onSubmit={handleVendorSubmit}
                onCancel={() => {
                          setShowVendorForm(false);
                          setSelectedVendor(null);
              }}
              />
            </Modal>
          )}
        </div>
        </div>
    );
};

export default VendorPage;