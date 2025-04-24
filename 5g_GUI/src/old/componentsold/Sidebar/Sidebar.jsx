import React from 'react';
import './Sidebar.css';  // Assuming your CSS file is named Sidebar.css in the same folder
import Reailize_Logo from "../../assets/Reailize_Logo.png";
import { NavLink } from 'react-router-dom'; // Import NavLink for active link styling

const Sidebar = () => {
    return (
        <div className="sidenav">
            <div className="logo-container">
                <img src={Reailize_Logo} alt="Logo" className="logo" />
            </div>

            {/* Sidebar Links */}
            <NavLink exact to="/" className="sidebar-link" activeClassName="active">
                Home
                <span className="sidebar-arrow">➔</span>
            </NavLink>

            <NavLink to="/Git-Clone" className="sidebar-link" activeClassName="active">
                 Git Clone
                 <span className="sidebar-arrow">➔</span>
            </NavLink>

            <NavLink to="/system-status" className="sidebar-link" activeClassName="active">
                System Status
                <span className="sidebar-arrow">➔</span>
            </NavLink>

            <NavLink to="/ue-list" className="sidebar-link" activeClassName="active">
                UE List
                <span className="sidebar-arrow">➔</span>
            </NavLink>

            <NavLink to="/folders" className="sidebar-link" activeClassName="active">
                ZIP Folders
                <span className="sidebar-arrow">➔</span>
            </NavLink>


           
        </div>
    );
};

export default Sidebar;
