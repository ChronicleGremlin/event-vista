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
          to="/dashboard"
          className="sidebar-link"
          state={{ from: location.pathname }}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/profile"
          className="sidebar-link"
          state={{ from: location.pathname }}
        >
          User Profile
        </NavLink>
        <NavLink
          to="/vendors"
          className="sidebar-link"
          state={{ from: location.pathname }}
        >
          Vendors
        </NavLink>
        <NavLink
          to="/venues"
          className="sidebar-link"
          state={{ from: location.pathname }}
        >
          Venues
        </NavLink>
        <NavLink
          to="/clients"
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
