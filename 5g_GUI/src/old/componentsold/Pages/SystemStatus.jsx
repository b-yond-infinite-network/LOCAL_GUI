import React, { useEffect } from 'react';
import LabStatus from '../LabStatus.jsx'; // Adjust the import path as needed
import LaaS_logo from "../../assets/LaaS_logo.gif";
const SystemStatusPage = () => {
    useEffect(() => {
        // You can add any additional logic or API calls here if needed
    }, []);

    return (
        <div className="contents">
            <header>
                <div className="container">
                    <div className="main-header">
                        <img src={LaaS_logo} alt="LaaS Logo" className="laas-logo" />
                        <h1>LaaS GUI</h1>
                        <img src={LaaS_logo} alt="LaaS Logo" className="laas-logo" />
                    </div>
                </div>
            </header>

        <div className="system-status-page">
            <h2>System Status</h2>
            <LabStatus /> {/* Use the LabStatus component here */}
            </div>
        </div>
    );
};

export default SystemStatusPage;
