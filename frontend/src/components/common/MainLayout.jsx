import React from "react";
import Sidebar from "../../components/common/Sidebar/Sidebar";
import Breadcrumbs from '../../components/common/Breadcrumbs/Breadcrumbs';
import Footer from "../../components/common/Footer/Footer";
import { Outlet } from "react-router-dom";
import "./MainLayout.css";

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <Breadcrumbs />
        <div className="page-body">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
