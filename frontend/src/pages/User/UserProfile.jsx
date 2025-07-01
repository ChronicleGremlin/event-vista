import React, { useState, useEffect, useRef } from "react";
import { userApi, authApi } from "../../services/api";
import { useNavigate } from "react-router-dom";
import "../User/UserProfile.css";
import pencilIcon from "./pencil-icon.png";
import Sidebar from "../Dashboard/Sidebar";
import { useAuth } from "../../context/AuthContext";
import Breadcrumbs from '../../pages/Dashboard/Breadcrumbs';

const UserProfile = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    emailAddress: "",
    pictureUrl: "",
  });

    const [passwordData, setPasswordData] = useState({
      newPassword: "",
      confirmPassword: ""
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [editMode, setEditMode] = useState({
      name: false,
      email: false,
        password: false,
    });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Get user from AuthContext

  const fileInputRef = useRef(null); // Create a ref for file input

  useEffect(() => {
    setLoading(true);
    authApi
      .getCurrentUser()
      .then((response) => {
        setFormData({
          id: response.data.id,
          name: response.data.name,
          emailAddress: response.data.emailAddress,
          pictureUrl: response.data.pictureUrl || "",
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setErrorMessage("Failed to load user data.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

//  const handleFileChange = (e) => {
//    setSelectedFile(e.target.files[0]);
//  };

  // Updated handleFileChange to convert file to Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Set the pictureUrl with the Base64 string
        console.log("Converted image:", reader.result);
        setFormData((prevData) => ({
          ...prevData,
          pictureUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle edit mode
  const toggleEditMode = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: true }));
  };
  const cancelEditMode = (field) => {
    // Optionally, you could reset the value for the field here,
    // for now we simply set editMode for the field back to false.
    setEditMode((prev) => ({ ...prev, [field]: false }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
        // If pictureUrl is an empty string, change it to null before sending.
        const updatedData = {
          ...formData,
          pictureUrl: formData.pictureUrl.trim() === "" ? null : formData.pictureUrl,
        };
    console.log("Data being updated:", updatedData);

    userApi.updateUser(updatedData)
      .then(() => {
        setSuccessMessage("Profile updated successfully!");
        setErrorMessage("");
        setLoading(false);
        setUser(updatedData); // Update user in AuthContext
        // Exit edit mode after update
        setEditMode({
        name: false,
        email: false,})
         // Redirect the user to the dashboard
                navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        setErrorMessage("Failed to update profile.");
        setSuccessMessage("");
        setLoading(false);
      });
  };

  // New handler for resetting password
    const handleResetPassword = (e) => {
      e.preventDefault();
      // Basic validation: Ensure password fields are not empty and match
      if (!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword) {
        setErrorMessage("Passwords do not match or are empty.");
        return;
      }
      setLoading(true);
      authApi.resetPassword({
        emailAddress: formData.emailAddress,
        newPassword: passwordData.newPassword,
        verifyPassword: passwordData.confirmPassword
      })
        .then(() => {
          setSuccessMessage("Password reset successfully!");
          setErrorMessage("");
          setLoading(false);
                // Clear the password fields and exit edit mode for password
                setPasswordData({ newPassword: "", confirmPassword: "" });
                setEditMode((prev) => ({ ...prev, password: false }));
          // Optionally, redirect to login if needed:
          navigate("/login");
        })
        .catch((error) => {
          console.error("Error resetting password:", error);
          setErrorMessage("Failed to reset password.");
          setSuccessMessage("");
          setLoading(false);
        });
    };

    const handlePasswordChange = (e) => {
      const { name, value } = e.target;
      setPasswordData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      setLoading(true);
      userApi
        .deleteUser(formData.id)
        .then(() => {
          setSuccessMessage("Profile deleted successfully!");
          setErrorMessage("");
          setLoading(false);
          //navigate("/login"); // Redirect to login page
        })
        .catch((error) => {
          console.error("Error deleting profile:", error);
          setErrorMessage("Failed to delete profile.");
          setSuccessMessage("");
          setLoading(false);
        });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
      <div className="profile-layout" style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
      <div style={{ flex: 1, marginLeft: "200px", padding: "1rem" }}>
            <Breadcrumbs />
    <div className="user-profile-container">
      <h1>{formData.name ? `${formData.name}'s Profile` : 'User Profile'}</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Profile Header: Picture and Edit Icon */}
      <div className="profile-header">
        <div className="profile-picture-wrapper">
          {formData.pictureUrl ? (
            <img
              src={formData.pictureUrl || "/default-avatar.png" }
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <div className="profile-picture-placeholder">
              <span>No Image</span>
            </div>
          )}
          <button
            className="edit-icon-button"
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <img src={pencilIcon} alt="Edit" />
          </button>
          <input
            type="file"
            id="picture"
            name="picture"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="profile-details">
        <div className="form-group">
          <label htmlFor="name"><b>Name:</b></label>
          {editMode.name ? (
            <>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="cancel-button"
                onClick={() => cancelEditMode("name")}
              >
                Cancel
              </button>
            </>
          ) : (
            <div className="display-field">
              <span>{formData.name}</span>
              <button
                type="button"
                className="edit-button"
                onClick={() => toggleEditMode("name")}
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="emailAddress"><b>Email Address:</b></label>
          {editMode.email ? (
            <>
              <input
                type="email"
                id="emailAddress"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="cancel-button"
                onClick={() => cancelEditMode("email")}
              >
                Cancel
              </button>
            </>
          ) : (
            <div className="display-field">
              <span>{formData.emailAddress}</span>
              <button
                type="button"
                className="edit-button"
                onClick={() => toggleEditMode("email")}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Password Reset Section with Inline Edit */}
      <div className="profile-password-reset">
        <div className="form-group">
          <label htmlFor="password"><b>Password:</b></label>
          {editMode.password ? (
            <>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
              <div className="inline-actions">
                <button type="button" className="save-button" onClick={handleResetPassword}>
                  Update Password
                </button>
                <button type="button" className="cancel-button" onClick={() => cancelEditMode("password")}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="display-field">
              <span>{"********"}</span>
              <button type="button" className="edit-button" onClick={() => toggleEditMode("password")}>
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Actions Section: Update Profile, Delete Account, and Back to Dashboard */}
      <div className="user-profile-actions">
        <button type="button" onClick={handleUpdate} className="button button-outline">
          Update Profile
        </button>
        <button type="button" onClick={handleDelete} className="button button-secondary">
          Delete Account
        </button>
      </div>
    </div>
    </div>
  );

};

export default UserProfile;