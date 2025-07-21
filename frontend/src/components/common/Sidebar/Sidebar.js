import React from "react";
import { NavLink, useLocation} from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
 const location = useLocation(); // Get current location to pass as "from"

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Event Vista</h2>
      <nav className="sidebar-nav">
        <NavLink
          to="/app/dashboard"
          className="sidebar-link"
          state={{ from: location.pathname }}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/app/profile"
          className="sidebar-link"
          state={{ from: location.pathname }}
        >
          User Profile
        </NavLink>
        <NavLink
          to="/app/vendors"
          className="sidebar-link"
          state={{ from: location.pathname }}
        >
          Vendors
        </NavLink>
        <NavLink
          to="/app/venues"
          className="sidebar-link"
          state={{ from: location.pathname }}
        >
          Venues
        </NavLink>
        <NavLink
          to="/app/clients"
          className="sidebar-link"
          state={{ from: location.pathname }}
        >
          Clients
        </NavLink>
      </nav>
    </div>
  );
};
export default Sidebar;
