import React, { useState, useEffect, useRef } from "react";
import { userApi, authApi } from "../../services/api";
import { useNavigate } from "react-router-dom";
import "../User/UserProfile.css";
import pencilIcon from "./pencil-icon.png";
import { useAuth } from "../../context/AuthContext";

const UserProfile = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    emailAddress: "",
    pictureUrl: "",
  });

  const [originalData, setOriginalData] = useState({});
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
  const { setUser } = useAuth();
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    authApi.getCurrentUser()
      .then((response) => {
        const { id, name, emailAddress, pictureUrl } = response.data;
        const profile = {
          id,
          name,
          emailAddress,
          pictureUrl: pictureUrl || "",
        };
        setFormData(profile);
        setOriginalData(profile);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, pictureUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEditMode = (field) => {
    setEditMode((prev) => ({ ...prev, [field]: true }));
  };

  const cancelEditMode = (field) => {
    if (field === "name" || field === "email") {
      setFormData((prev) => ({ ...prev, [field]: originalData[field] }));
    } else if (field === "password") {
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
    setEditMode((prev) => ({ ...prev, [field]: false }));
  };

  const isProfileChanged = () => {
    return (
      formData.name !== originalData.name ||
      formData.emailAddress !== originalData.emailAddress ||
      formData.pictureUrl !== originalData.pictureUrl
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.emailAddress.trim()) {
      setErrorMessage("Name and Email are mandatory fields.");
      return;
    }

    const passwordFieldsFilled = editMode.password &&
      (passwordData.newPassword || passwordData.confirmPassword);

    if (editMode.password && (!passwordData.newPassword || !passwordData.confirmPassword)) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    if (
      editMode.password &&
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!isProfileChanged() && !passwordFieldsFilled) {
      setErrorMessage("No changes detected. Please modify a field before updating.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Profile update
      const updatedData = {
        ...formData,
        pictureUrl: formData.pictureUrl?.trim() === "" ? null : formData.pictureUrl,
      };

      await userApi.updateUser(updatedData);
      setUser(updatedData);

      // Password update (if applicable)
      if (passwordFieldsFilled) {
        await authApi.resetPassword({
          emailAddress: formData.emailAddress,
          newPassword: passwordData.newPassword,
          verifyPassword: passwordData.confirmPassword
        });
        setPasswordData({ newPassword: "", confirmPassword: "" });
      }

      setSuccessMessage("Profile updated successfully!");
      setOriginalData(updatedData);
      setEditMode({ name: false, email: false, password: false });

      navigate("/app/dashboard");

    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
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
          navigate("/login");
        })
        .catch((error) => {
          console.error("Error deleting profile:", error);
          setErrorMessage("Failed to delete profile.");
          setSuccessMessage("");
          setLoading(false);
        });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-profile-container">
      <h1>{formData.name ? `${formData.name}'s Profile` : "User Profile"}</h1>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="profile-header">
        <div className="profile-picture-wrapper">
          {formData.pictureUrl ? (
            <img src={formData.pictureUrl} alt="Profile" className="profile-picture" />
          ) : (
            <div className="profile-picture-placeholder"><span>No Image</span></div>
          )}
          <button className="edit-icon-button" type="button" onClick={() => fileInputRef.current?.click()}>
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

      <div className="profile-details">
        <div className="form-group">
          <label htmlFor="name"><b>Name: </b>{editMode.name && <span className="mandatory">*</span>}</label>
          {editMode.name ? (
            <>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
              <button type="button" className="cancel-button" onClick={() => cancelEditMode("name")}>Cancel</button>
            </>
          ) : (
            <div className="display-field">
              <span>{formData.name}</span>
              <button type="button" className="edit-button" onClick={() => toggleEditMode("name")}>Edit</button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="emailAddress"><b>Email Address: </b>{editMode.email && <span className="mandatory">*</span>}</label>
          {editMode.email ? (
            <>
              <input type="email" id="emailAddress" name="emailAddress" value={formData.emailAddress} onChange={handleChange} required />
              <button type="button" className="cancel-button" onClick={() => cancelEditMode("email")}>Cancel</button>
            </>
          ) : (
            <div className="display-field">
              <span>{formData.emailAddress}</span>
              <button type="button" className="edit-button" onClick={() => toggleEditMode("email")}>Edit</button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-password-reset">
        <div className="form-group">
          <label htmlFor="password"><b>Password: </b>{editMode.password && <span className="mandatory">*</span>}</label>
          {editMode.password ? (
            <>
              <input type="password" id="newPassword" name="newPassword" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} required />
              <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
              <div className="inline-actions">
                <button type="button" className="cancel-button" onClick={() => cancelEditMode("password")}>Cancel</button>
              </div>
            </>
          ) : (
            <div className="display-field">
              <span>{"********"}</span>
              <button type="button" className="edit-button" onClick={() => toggleEditMode("password")}>Edit</button>
            </div>
          )}
        </div>
      </div>

      <div className="user-profile-actions">
        <button type="button" onClick={handleUpdate} className="button button-outline">Update Profile</button>
        <button type="button" onClick={handleDelete} className="button button-secondary">Delete Account</button>
      </div>
    </div>
  );
};

export default UserProfile;
