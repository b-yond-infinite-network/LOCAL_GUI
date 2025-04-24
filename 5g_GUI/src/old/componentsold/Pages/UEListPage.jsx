// UEListPage.js
import React, { useState, useEffect } from 'react';
import ActionButton from '../ActionButton';
import { apiCall } from '../Api';
import LaaS_logo from "../../assets/LaaS_logo.gif";
const UEListPage = () => {
    const [loadingListFolders, setLoadingListFolders] = useState(false);
    const [folderList, setFolderList] = useState([]);
    const [error, setError] = useState('');

    // Function to list folders
    const listFolders = async () => {
        setLoadingListFolders(true);
        setError('');

        try {
            const result = await apiCall('http://10.194.1.94:5001/list-folders', 'GET');
            const extractedFolders = result.folders
                .map((folder, index) => {
                    const folderName = folder.split('/').filter(Boolean).pop();
                    if (/^ue\d{15}$/.test(folderName)) {
                        return {
                            number: index + 1,
                            id: folderName.slice(2),
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            setFolderList(extractedFolders);
        } catch (err) {
            setError(`Request Failed: ${err.message}`);
        } finally {
            setLoadingListFolders(false);
        }
    };

    useEffect(() => {
        listFolders();
    }, []);

    return (
        <div className="ue-list-page">
            <header>
                <div className="container">
                    <div className="main-header">
                        <img src={LaaS_logo} alt="LaaS Logo" className="laas-logo" />
                        <h1>LaaS GUI</h1>
                        <img src={LaaS_logo} alt="LaaS Logo" className="laas-logo" />
                    </div>
                </div>
            </header>
            <h2>UE List</h2>
            {error && <div className="error-message">Error: {error}</div>}
            {loadingListFolders ? (
                <p>Loading UEs...</p>
            ) : (
                <table border="1">
                    <thead>
                        <tr>
                            <th>UE Number</th>
                            <th>UE ID</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {folderList.map(({ number, id }) => (
                            <tr key={number}>
                                <td>{number}</td>
                                <td>{id}</td>
                                <td>
                                    <ActionButton ueCode={id} actionType="attach" onActionComplete={listFolders} />
                                    <ActionButton ueCode={id} actionType="traffic" onActionComplete={listFolders} />
                                    <ActionButton ueCode={id} actionType="detach" onActionComplete={listFolders} />
                                    <ActionButton ueCode={id} actionType="remove" onActionComplete={listFolders} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UEListPage;
