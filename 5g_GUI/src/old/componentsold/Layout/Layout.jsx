// components/Layout/Layout.jsx
import React from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css"; // Create a new stylesheet for the layout

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <Sidebar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
