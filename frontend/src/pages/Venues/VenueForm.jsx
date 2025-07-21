import React, { useState, useEffect } from "react";
import { venueApi } from "../../services/api";
import "../../styles/components.css";
import styles from "./VenueForm.module.css";

const VenueForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    emailAddress: "",
    phoneNumber: {
      phoneNumber: "",
      isValid: false,
    },
    capacity: "",
    notes: "",
    ...(initialData
      ? {
          ...initialData,
          phoneNumber:
            typeof initialData.phoneNumber === "string"
              ? { phoneNumber: initialData.phoneNumber, isValid: true }
              : initialData.phoneNumber,
        }
      : {}),
  });

  const [errors, setErrors] = useState({});

  const validatePhoneNumber = (phoneNumber) => {
    // Match the backend validation pattern
    const pattern = /^(\(\d{3}\)\s?|\d{3}[-.]?)\d{3}[-.]?\d{4}$/;
    return pattern.test(phoneNumber);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long";
    }
    if (!formData.location || formData.location.length < 3) {
      newErrors.location = "Location must be at least 3 characters long";
    }
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }
    if (
      !formData.emailAddress ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)
    ) {
      newErrors.emailAddress = "Please enter a valid email address";
    }
    if (
      !formData.phoneNumber.phoneNumber ||
      !validatePhoneNumber(formData.phoneNumber.phoneNumber)
    ) {
      newErrors.phoneNumber =
        "Please enter a valid phone number (e.g., (123) 456-7890 or 123-456-7890)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: {
          phoneNumber: value,
          isValid: validatePhoneNumber(value),
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Transform the data to match the backend format
        const venueData = {
          ...formData,
          phoneNumber: formData.phoneNumber.phoneNumber,
        };
        console.log("Submitting venue data:", venueData);
        await onSubmit(venueData); // await and catch
        } catch (error) {
          console.error("Error saving venue:", error);

          const serverError = error?.response?.data?.error;

          if (typeof serverError === "string") {
            const lowerError = serverError.toLowerCase();
            const fieldErrors = {};

            if (lowerError.includes("email")) {
              fieldErrors.emailAddress = serverError;
            } else if (lowerError.includes("phone")) {
              fieldErrors.phoneNumber = serverError;
            } else if (lowerError.includes("name")) {
              fieldErrors.name = serverError;
            } else {
              fieldErrors.submit = serverError;
            }

            setErrors(fieldErrors);
          } else {
            // Fallback generic error
            setErrors({ submit: "Failed to save venue. Please try again." });
          }
        }
      }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">
          {initialData ? "Edit Venue" : "Add New Venue"}
        </h2>
        <p className="form-subtitle">Enter the venue details below</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
              Venue Name <span className={styles.mandatory}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? "error" : ""}`}
            required
          />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
              Location <span className={styles.mandatory}>*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`form-input ${errors.location ? "error" : ""}`}
            required
          />
          {errors.location && (
            <div className="error-text">{errors.location}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
              Email Address <span className={styles.mandatory}>*</span>
          </label>
          <input
            type="email"
            name="emailAddress"
            value={formData.emailAddress}
            onChange={handleChange}
            className={`form-input ${errors.emailAddress ? "error" : ""}`}
            required
          />
          {errors.emailAddress && (
            <div className="error-text">{errors.emailAddress}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
              Phone Number <span className={styles.mandatory}>*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber.phoneNumber}
            onChange={handleChange}
            className={`form-input ${errors.phoneNumber ? "error" : ""}`}
            placeholder="(123) 456-7890"
            required
          />
          {errors.phoneNumber && (
            <div className="error-text">{errors.phoneNumber}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
              Capacity <span className={styles.mandatory}>*</span>
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className={`form-input ${errors.capacity ? "error" : ""}`}
            min="1"
            required
          />
          {errors.capacity && (
            <div className="error-text">{errors.capacity}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-input"
            rows="4"
          />
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <div className="flex" style={{ gap: "1rem", marginTop: "2rem" }}>
          <button type="submit" className="button button-primary">
            {initialData ? "Update Venue" : "Create Venue"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="button button-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default VenueForm;
