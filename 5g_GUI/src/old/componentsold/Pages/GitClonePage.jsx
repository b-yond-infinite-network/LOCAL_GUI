import React, { useEffect } from 'react';
import GitClone from '../GitClone.jsx'; // Adjust the import path as needed
import LaaS_logo from "../../assets/LaaS_logo.gif";
const GitClonePage = () => {
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
                <h2>Git Clone</h2>
                <GitClone /> {/* Use the LabStatus component here */}
            </div>
        </div>
    );
};

export default GitClonePage;
