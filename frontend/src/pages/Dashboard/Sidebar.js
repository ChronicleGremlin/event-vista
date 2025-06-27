import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import Breadcrumbs from "./Breadcrumbs";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Event Vista</h2>
      <Breadcrumbs />
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">Dashboard</NavLink>
        <NavLink to="/profile" className="sidebar-link">User Profile</NavLink>
        <NavLink to="/vendors" className="sidebar-link">Vendors</NavLink>
        <NavLink to="/venues" className="sidebar-link">Venues</NavLink>
        <NavLink to="/clients" className="sidebar-link">Clients</NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
