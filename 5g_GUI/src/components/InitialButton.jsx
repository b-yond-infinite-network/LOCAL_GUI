import React, { useState, useEffect } from 'react';
import { runScript } from './Api'; // Import the runScript function
import vmConfig from '../../vmConfig.js';

const InitialButton = ({ buttonName, actionName, command, commandPath, checkStatus, onClick, onActionComplete }) => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [zipFilePath, setZipFilePath] = useState(null); // State for zip file path
    const [intervalId, setIntervalId] = useState(null); // To store interval ID
    const sshhost = vmConfig.ssh_host;
    const PORT = vmConfig.server_port;

    const handleAction = async () => {
        setLoading(true);
        setOutput('');
        setError(''); // Reset error state

        try {
            console.log('Running script:', command, commandPath);
            const response = await runScript(command, commandPath);

            console.log('API response:', response);

            // Display the combined output (both output and error)
            const scriptOutput = response.output || ''; // Capture combined output
            setOutput(scriptOutput); // Display output in the UI

            // Extract the timestamp if available in the output
            if (scriptOutput) {
                const timestampMatch = scriptOutput.match(/(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})/);
                if (timestampMatch) {
                    const timestamp = timestampMatch[1];
                    const zipFileName = `logs_${timestamp}.tar.gz`;
                    const fullZipFilePath = `/home/ubuntu/laas-5gsa-k8s/SCRIPTS/Common/${zipFileName}`;
                    console.log('Zip file path:', fullZipFilePath);
                    setZipFilePath(fullZipFilePath); // Store in state
                } else {
                    console.warn('No timestamp found in output');
                }
            }

            // If script executed successfully
            if (response.success) {
                console.log("Script executed successfully.");
            }

        } catch (err) {
            console.error('Error running script:', err);
            setError(err.message || 'Failed to run script.'); // Set error message
            setOutput(prevOutput => `${prevOutput}\n${err.message || 'Failed to run script.'}`);
            
        } finally {
            if (onActionComplete) {
                await onActionComplete(); // Ensure this is awaited if it returns a promise
            }
            setLoading(false);

        }
    };

    const handleDownload = (fileName) => {
        const fileUrl = `http://${sshhost}:${PORT}/download/${fileName}`;
        window.open(fileUrl, '_blank');
        console.log('Initiating direct download for:', fileName);
    };
    // Download output as text file
    const handleDownloadText = () => {
        const blob = new Blob([output], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.txt'; // Specify filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };


    return (
        <>
            {/* Button to open the popup */}
            <button
                onClick={() => setPopupVisible(true)}
                className="your-button-class" // Use the default CSS class
               
            >
                {buttonName}
            </button>

            {popupVisible && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>{actionName}</h3>

                        {/* Buttons for the action and to close the popup */}
                        <div>
                            <button onClick={handleAction} disabled={loading}>
                                {loading ? 'Running...' : buttonName}
                            </button>
                            <button onClick={() => setPopupVisible(false)} disabled={loading}>
                                {loading ? 'Please wait...' : 'Close'}
                            </button>
                        </div>

                        {/* Display output */}
                        {output && (
                            <div className="output" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <h4>Output:</h4>
                                <pre>{output}</pre>
                                <button onClick={handleDownloadText}>Download Output as Text File</button>
                            </div>
                        )}

                        {/* Display zip file download button if available */}
                        {zipFilePath && (
                            <button onClick={() => handleDownload(zipFilePath.split('/').pop())}>
                                Download Zip Folder
                            </button>
                        )}

                        {/* Display error if there's an error */}
                        {error && (
                            <div className="error-message">
                                <h4>Error:</h4>
                                <pre>{error}</pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default InitialButton;
