import React, { useState, useEffect } from 'react';
import LaaS_logo from "../../assets/LaaS_logo.gif";
import vmConfig from '../../../vmConfig.js';

const FolderListPage = () => {
    const [files, setFiles] = useState([]);
    const sshhost = vmConfig.ssh_host;
    const PORT = vmConfig.server_port;

    useEffect(() => {
        fetch(`http://${sshhost}:${PORT}/list-tar-gz-files`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    setFiles(data.files);
                } else {
                    console.error('Error fetching files:', data.message);
                }
            })
            .catch(error => console.error('Error fetching files:', error));
    }, []);

    const handleDownload = (fileName) => {
        const fileUrl = `http://${sshhost}:${PORT}/download/${fileName}`;
        window.open(fileUrl, '_blank');
    };

    return (
        <div className="folder-list-page">
            <header>
                <div className="container">
                    <div className="main-header">
                        <img src={LaaS_logo} alt="LaaS Logo" className="laas-logo" />
                        <h1>LaaS GUI</h1>
                        <img src={LaaS_logo} alt="LaaS Logo" className="laas-logo" />
                    </div>
                </div>
            </header>
            <h2>Available .tar.gz Files</h2>
            <table>
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Size (Bytes)</th>
                        <th>Last Modified</th>
                        <th>Download</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, index) => (
                        <tr key={index}>
                            <td>{file.name}</td>
                            <td>{file.size}</td>
                            <td>{file.lastModified}</td>
                            <td>
                                <button onClick={() => handleDownload(file.name)}>
                                    Download
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FolderListPage;
