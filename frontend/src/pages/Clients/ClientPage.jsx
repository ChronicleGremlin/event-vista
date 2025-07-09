import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clientApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/components.css";
import ClientForm from "./ClientForm";
import ClientSearch from "./ClientSearch";
import ClientSearchResults from "./ClientSearchResults";
import Modal from "../../components/common/Modal/Modal";

const ClientPage = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientForm, setShowClientForm] = useState(false);
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
    fetchClients();
  }, [isAuthenticated, token, navigate]);

  const handleAuthError = async () => {
    await logout();
    navigate("/login");
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientApi.getAllClients();
      setClients(response.data || []);
      setSearchResults(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching clients:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        await handleAuthError();
      } else {
        setError("Unable to load clients. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults(clients);
      return;
    }

    try {
      let response;
      console.log("Searching for:", searchTerm, "by type:", searchType);

      switch (searchType) {
        case "name":
          response = await clientApi.getClientByName(searchTerm);
          console.log("Name search result:", response);
          break;
        case "phone":
          response = await clientApi.getClientByPhoneNumber(searchTerm);
          console.log("Phone search result:", response);
          break;
        case "email":
          response = await clientApi.getClientByEmail(searchTerm);
          console.log("Email search result:", response);
          break;
        default:
          response = { data: [] };
      }

      // Handle the response data
      let searchResults = [];
      if (response && response.data) {
        searchResults = Array.isArray(response.data)
          ? response.data
          : [response.data];
      }

      console.log("Final search results:", searchResults);
      setSearchResults(searchResults.filter((item) => item !== null));
    } catch (err) {
      console.error("Error searching clients:", err);
      setSearchResults([]);
    }
  };

  const handleAddClient = () => {
    if (!token) {
      handleAuthError();
      return;
    }
    setSelectedClient(null);
    setShowClientForm(true);
  };

  const handleEditClient = (client) => {
    if (!token) {
      handleAuthError();
      return;
    }
    setSelectedClient(client);
    setShowClientForm(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (!token) {
      handleAuthError();
      return;
    }

    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await clientApi.deleteClient(clientId);
        setClients(clients.filter((client) => client.id !== clientId));
        setSearchResults(
          searchResults.filter((client) => client.id !== clientId)
        );
        setError(null);
      } catch (err) {
        console.error("Error deleting client:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          await handleAuthError();
        } else {
          setError("Failed to delete client. Please try again later.");
        }
      }
    }
  };

  const handleClientSubmit = async (clientData) => {
    if (!token) {
      handleAuthError();
      return;
    }

    try {
      if (selectedClient) {
        // Update existing client
        const response = await clientApi.updateClient(
          selectedClient.id,
          clientData
        );
        setClients(
          clients.map((client) =>
            client.id === selectedClient.id ? response.data : client
          )
        );
        setSearchResults(
          searchResults.map((client) =>
            client.id === selectedClient.id ? response.data : client
          )
        );
      } else {
        // Create new client
        const response = await clientApi.createClient(clientData);
        setClients([...clients, response.data]);
        setSearchResults([...searchResults, response.data]);
      }
      setShowClientForm(false);
      setSelectedClient(null);
      setError(null);
    } catch (err) {
      console.error("Error saving client:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        await handleAuthError();
      } else {
        setError("Failed to save client. Please try again.");
      }
    }
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
     <div className="client-page-content">
       <div className="dashboard-header">
         <h2 className="dashboard-title">Clients</h2>
         <p className="dashboard-subtitle">Manage your clients</p>

         <ClientSearch
           searchTerm={searchTerm}
           setSearchTerm={setSearchTerm}
           searchType={searchType}
           setSearchType={setSearchType}
           onSearch={handleSearch}
         />

         <div style={{ marginTop: "1rem" }}>
           <button
             className="button button-primary"
             onClick={handleAddClient}
           >
             Add New Client
           </button>
         </div>
       </div>

       {error && (
         <div className="error-message" style={{ marginBottom: "1rem" }}>
           {error}
         </div>
       )}

       <ClientSearchResults
         clients={searchResults}
         onEdit={handleEditClient}
         onDelete={handleDeleteClient}
       />

       {showClientForm && (
         <Modal onClose={() => setShowClientForm(false)}>
           <ClientForm
             initialData={selectedClient}
             onSubmit={handleClientSubmit}
             onCancel={() => setShowClientForm(false)}
           />
         </Modal>
       )}
     </div>
   );
 };

 export default ClientPage;