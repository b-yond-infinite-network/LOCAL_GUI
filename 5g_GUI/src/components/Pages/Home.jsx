import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import LaaS_logo from "../../assets/LaaS_logo.gif";
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import InitialButton from '../InitialButton';
import { runScript } from '../Api';
import '../../App.css'; // Optional, for styling

import vmConfig from '../../../vmConfig.js';

import { apiCall } from '../Api';

function Home() {
    const [error, setError] = useState('');
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [numberOfUsers, setNumberOfUsers] = useState(1);
    const [userCodes, setUserCodes] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [nodeStatus, setNodeStatus] = useState(null);
    const sshhost = vmConfig.ssh_host;
    const PORT = vmConfig.server_port;
    const navigate = useNavigate(); // Initialize useNavigate

    const checkNodeStatus = async () => {
        setNodeStatus(null);
        try {
            const result = await runScript("minikube", "laas-5gsa-k8s/SCRIPTS/Deploy");
            const output = result.output.trim();
            if (output.includes('minikube provisions') || output.includes('Basic Commands')) {
                setNodeStatus('running');
            } else {
                setNodeStatus('not running');
            }
        } catch (err) {
            setNodeStatus('not running');
        }
    };

    const createUsers = async () => {
        setLoadingCreate(true);
        setError('');
        setUserCodes([]);

        try {
            const result = await apiCall(`http://${sshhost}:${PORT}/create-ues`, 'POST', { numberOfUsers });
            const extractedCodes = extractUserCodes(result.output);
            setUserCodes(extractedCodes);
        } catch (err) {
            setError(`Request Failed: ${err.message}`);
        } finally {
            setLoadingCreate(false);
            setIsPopupVisible(false);
        }
    };

    const extractUserCodes = (data) => {
        const lines = data.split('\n');
        return lines
            .map(line => line.trim())
            .filter(line => line.length === 15 && /^\d+$/.test(line))
            .map((line, index) => ({
                number: index + 1,
                code: line.padStart(15, '0')
            }));
    };

    useEffect(() => {
        checkNodeStatus();
    }, []);

    const handleLogout = () => {
        // Clear user session
        localStorage.removeItem('token'); // Adjust based on how you store the token/session
        navigate('/login'); // Redirect to login page
    };


    return (
        <>
            <header>
                <div className="container">
                    <div className="main-header">
                        <img src={LaaS_logo} alt="LaaS Logo" className="laas-logo" />
                        <h1>LaaS GUI</h1>
                        <img src={LaaS_logo} alt="LaaS Logo" className="laas-logo" />
                        
                    </div>
                </div>
            </header>

            <div className="content">
                <h2 className="content-header">
                    Deploy and Validate
                    <span title={nodeStatus === 'running' ? 'Node is running' : 'Node is stopped'}>
                        {nodeStatus === 'running' ? <FaCheckCircle className="status-icon green" /> : <FaTimesCircle className="status-icon red" />}
                    </span>
                </h2>

                {/* Install and Delete Node */}
                <InitialButton
                    buttonName="Install Node"
                    actionName="Install_Node_minikube"
                    command="./INSTALL_NODE_minikube.sh"
                    commandPath="laas-5gsa-k8s/SCRIPTS/Deploy"
                    onActionComplete={checkNodeStatus}
                />
                <InitialButton
                    buttonName="Delete Node"
                    actionName="Delete_Node_minikube"
                    command="./DELETE_NODE_minikube.sh"
                    commandPath="laas-5gsa-k8s/SCRIPTS/Deploy"
                    onActionComplete={checkNodeStatus}

                />
               
            </div>

            <h2 className="content-header">Lab Operations</h2>
            <div className="content">
                <InitialButton
                    buttonName="Start 5GC"
                    actionName="Launching 5GC Environment"
                    command="./START_5gsa.sh"
                    commandPath="laas-5gsa-k8s/SCRIPTS/Deploy"
                />
                <InitialButton
                    buttonName="Stop 5GC"
                    actionName="Stopping 5GC Environment"
                    command="./STOP_5gsa.sh"
                    commandPath="laas-5gsa-k8s/SCRIPTS/Deploy"
                />
            </div>

            <h2 className="content-header">Trace Operations</h2>
            <div className="content">
                <InitialButton
                    buttonName="Trace Start"
                    actionName="TRACE_start"
                    command="./TRACE_start.sh"
                    commandPath="laas-5gsa-k8s/SCRIPTS/Common"
                />
                <InitialButton
                    buttonName="Trace Stop"
                    actionName="TRACE_stop"
                    command="./TRACE_stop.sh"
                    commandPath="laas-5gsa-k8s/SCRIPTS/Common"
                />
            </div>
            {/* UE creation and management */}
            <h2 className="content-header">UE Creation</h2>
            <div className="content">


                <button onClick={() => setIsPopupVisible(true)} disabled={loadingCreate}>
                    {loadingCreate ? 'Creating Users...' : 'Create UEs'}
                </button>

                {isPopupVisible && (
                    <div className="popup">
                        <div className="popup-content">
                            <h3>Create Users</h3>
                            <div>
                                <button onClick={() => setNumberOfUsers((prev) => Math.max(1, prev - 1))}>-</button>
                                <span>{numberOfUsers}</span>
                                <button onClick={() => setNumberOfUsers((prev) => prev + 1)}>+</button>
                            </div>
                            <button onClick={createUsers}>Create</button>
                            <button onClick={() => setIsPopupVisible(false)}>Cancel</button>
                        </div>
                    </div>
                )}



                {error && <div className="error-message">Error: {error}</div>}

                {userCodes.length > 0 && (
                    <>
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>User Number</th>
                                    <th>User Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userCodes.map(({ number, code }) => (
                                    <tr key={number}>
                                        <td>{number}</td>
                                        <td>{code}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>


                        {/* New button after the UEs table */}
                        <InitialButton
                            buttonName="Attach UEs"
                            actionName="Attaching UEs To Node"
                            command="./attach_ue.sh"
                            commandPath="laas-5gsa-k8s/SCRIPTS/Deploy/UE_use_case"
                            statusCheck={false}
                        />
                        <InitialButton
                            buttonName="Traffic UEs"
                            actionName="Running Traffic on UEs"
                            command="./traffic_ue.sh"
                            commandPath="laas-5gsa-k8s/SCRIPTS/Deploy/UE_use_case"
                            statusCheck={false}
                        />
                        <InitialButton
                            buttonName="Dettach UEs"
                            actionName="Dettaching UEs From Node"
                            command="./dettach_ue.sh"
                            commandPath="laas-5gsa-k8s/SCRIPTS/Deploy/UE_use_case"
                            statusCheck={false}
                        />
                        <InitialButton
                            buttonName="Remove UEs"
                            actionName="Removing UEs From Lab"
                            command="./remove_ue.sh"
                            commandPath="laas-5gsa-k8s/SCRIPTS/Deploy/UE_use_case"
                            statusCheck={false}
                        />
                       
                    </>
                )}


            </div>
        </>
    );
}

export default Home;
