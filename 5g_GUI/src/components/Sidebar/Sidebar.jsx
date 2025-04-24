import React from 'react';
import './Sidebar.css';  // Assuming your CSS file is named Sidebar.css in the same folder
import Reailize_Logo from "../../assets/Reailize_logo.png";
import { NavLink, useNavigate } from 'react-router-dom'; // Import NavLink for active link styling and useNavigate for redirect

const Sidebar = () => {
    const navigate = useNavigate(); // Hook to navigate after logout

    const handleLogout = () => {
        // Remove token or any user data from localStorage
        localStorage.removeItem('token');

        // Redirect to login page after logout
        navigate('/login');
    };

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
            <NavLink to="/users" className="sidebar-link" activeClassName="active">
                Users
                <span className="sidebar-arrow">➔</span>
            </NavLink>

            {/* Logout Tab */}
            <div
                className="sidebar-link logout-link"
                onClick={handleLogout}
                style={{
                    marginTop: 'auto',  // Push the logout link to the bottom
                    cursor: 'pointer',
                    textAlign: 'center'
                }}
            >
                Logout
                <span className="sidebar-arrow">➔</span>
            </div>

        </div>
    );
};

export default Sidebar;
