import React, { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";
import { useAuth } from "../../context/AuthContext";
import { vendorApi, skillApi } from "../../services/api";
import "../../styles/components.css";
import styles from "./VendorForm.module.css";

const VendorForm = ({ initialData, onSubmit, onCancel }) => {
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        emailAddress: "",
        phoneNumber: {
          phoneNumber: "",
          isValid: false,
        },
        skills: [],
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

    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    const validatePhoneNumber = (phoneNumber) => {
    // Match the backend validation pattern
    const pattern = /^(\(\d{3}\)\s?|\d{3}[-.]?)\d{3}[-.]?\d{4}$/;
    return pattern.test(phoneNumber);
    };

    useEffect(() => {
      if (initialData) {
        const formattedSkills = initialData.skills?.map((skill) => ({
          value: skill.id,
          label: skill.name,
        })) || [];

        setFormData({
          ...initialData,
          notes: initialData.notes || "",
          phoneNumber: typeof initialData.phoneNumber === "string"
            ? { phoneNumber: initialData.phoneNumber, isValid: true }
            : initialData.phoneNumber,
          skills: formattedSkills,
        });
      }
    }, [initialData]);

    useEffect(() => {
      const fetchSkills = async () => {
        try {
          const response = await skillApi.getAllSkills();
          if (response.data) {
            const formattedSkills = response.data.map((skill) => ({
              value: skill.id,
              label: skill.name,
            }));
            setSkills(formattedSkills);
          }
        } catch (error) {
          console.error("Error fetching skills:", error);
          setErrors((prev) => ({
            ...prev,
            fetch: "Failed to load skills. Please try again.",
          }));
        } finally {
          setLoading(false);
        }
      };

      fetchSkills();
    }, []);

    const skillOptions = skills.map((skill) => ({
      value: skill.id,
      label: skill.name,
    }));

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name || formData.name.length < 3) {
          newErrors.name = "Name must be at least 3 characters long";
        }
        if (!formData.location || formData.location.length < 3) {
          newErrors.location = "Location must be at least 3 characters long";
        }
        if (!formData.skills || formData.skills.length === 0) {
          newErrors.skills = "Please select at least one skill";
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


    const handleCreateSkill = async (inputValue) => {
      try {
        const response = await skillApi.createSkill({ name: inputValue });
        const newOption = {
          value: response.data.id,
          label: response.data.name,
        };

        setSkills((prev) => [...prev, newOption]);
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, newOption],
        }));
        } catch (error) {
           console.error("Error saving skill:", error);

           const serverError = error?.response?.data?.error;

           if (typeof serverError === "string") {
             const lowerError = serverError.toLowerCase();
             const fieldErrors = {};

             if (lowerError.includes("skill")) {
               fieldErrors.skill = serverError;
             } else {
               fieldErrors.submit = serverError;
             }
             setErrors(fieldErrors);
           } else {
             // Fallback generic error
             setErrors({ submit: "Failed to save skill. Please try again." });
           }
       }
    };


    const handleSkillChange = (selectedOptions) => {
      setFormData((prev) => ({
        ...prev,
        skills: selectedOptions || [],
      }));

      if (errors.skills) {
        setErrors((prev) => ({ ...prev, skills: undefined }));
      }
    };


      const handleEditSkill = async (id, newName) => {
        try {
          const response = await skillApi.updateSkill(id, { name: newName });
          const updatedSkill = {
            value: id,
            label: response.data.name,
          };

          setSkills((prev) =>
            prev.map((skill) => (skill.value === id ? updatedSkill : skill))
          );

          setFormData((prev) => ({
            ...prev,
            skills: prev.skills.map((s) =>
              s.value === id ? updatedSkill : s
            ),
          }));
        } catch (error) {
          console.error("Error updating skill:", error);
          setErrors((prev) => ({
            ...prev,
            skills: "Failed to update skill.",
          }));
        }
    };

    const handleDeleteSkill = async (id) => {
      try {
        await skillApi.deleteSkill(id);

        setSkills((prev) => prev.filter((skill) => skill.value !== id));

        setFormData((prev) => ({
          ...prev,
          skills: prev.skills.filter((s) => s.value !== id),
        }));
      } catch (error) {
        console.error("Error deleting skill:", error);
        setErrors((prev) => ({
          ...prev,
          skills: "Failed to delete skill. It might be in use by vendors.",
        }));
      }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
          const cleanedVendorData = {
            ...formData,
            id: initialData?.id,
            phoneNumber: {
              phoneNumber: formData.phoneNumber.phoneNumber,
            },
            skills: formData.skills.map((skill) => ({
              id: skill.value,
            })),
            notes: formData.notes,
          };

          try {
            await onSubmit(cleanedVendorData);
          } catch (error) {
              console.error("Error saving vendor:", error);

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
                setErrors({ submit: "Failed to save vendor. Please try again." });
              }
          }
        }
    };

    const CustomSkillOption = (props) => {
    const { data, innerRef, innerProps, isFocused } = props;

    return (
      <div
        ref={innerRef}
        {...innerProps}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: isFocused ? "#f0f0f0" : "#fff",
          padding: "8px 12px",
          borderBottom: "1px solid #eee",
          cursor: "pointer",
        }}
      >
        <span>{data.label}</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const newName = prompt("Edit skill name:", data.label);
              if (newName && newName !== data.label) {
                handleEditSkill(data.value, newName);
              }
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              color: "#007bff",
            }}
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete "${data.label}"?`)) {
                handleDeleteSkill(data.value);
              }
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              color: "red",
            }}
          >
            ❌
          </button>
        </div>
      </div>
    );
    };

  // "Add New Skill" button
  const CustomMenuList = (props) => {
    const { children, onCreateOption } = props;
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
      if (props.selectProps?.inputValue !== undefined) {
        setInputValue(props.selectProps.inputValue);
      }
    }, [props.selectProps?.inputValue]);

    const isDisabled = !inputValue || inputValue.trim() === "";

    const handleCreate = () => {
      if (!isDisabled) {
        onCreateOption(inputValue);

        // Clear the input value of the select
        if (props.selectProps?.onInputChange) {
          props.selectProps.onInputChange("", { action: "input-change" });
        }

        setInputValue("");
      }
    };

    return (
      <components.MenuList {...props}>
        {children}
        <div
          style={{
            padding: "8px 12px",
            borderTop: "1px solid #ddd",
            textAlign: "center",
          }}
        >
        </div>
      </components.MenuList>
    );
  };

    return (
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">
              {initialData ? "Edit Vendor" : "Add New Vendor"}
            </h2>
            <p className="form-subtitle">Enter the vendor details below</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                  Vendor Name <span className={styles.mandatory}>*</span>
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
                  Skills <span className={styles.mandatory}>*</span>
              </label>
              <CreatableSelect
                isMulti
                name="skills"
                options={skills}
                value={formData.skills}
                onChange={handleSkillChange}
                onCreateOption={handleCreateSkill}
                placeholder="Type to enter new skill, search or select existing"
                components={{
                  Option: CustomSkillOption,
                  MenuList: (menuProps) => (
                    <CustomMenuList {...menuProps} onCreateOption={handleCreateSkill} />
                  ),
                }}
                classNamePrefix="react-select"
                filterOption={(option, inputValue) =>
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                }
              />
              {errors.skills && <div className="error-text">{errors.skills}</div>}
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
                {initialData ? "Update Vendor" : "Create Vendor"}
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

export default VendorForm;