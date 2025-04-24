import React, { useState } from 'react';
import { apiCall } from './Api'; // Import the apiCall function
import vmConfig from '../../vmConfig.js';

const ActionButton = ({ ueCode, actionType, isDisabled }) => {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const sshhost = vmConfig.ssh_host;
    const PORT = vmConfig.server_port;

    const handleAction = async () => {
        setIsLoading(true);
        setOutput(''); // Reset previous output
        setError('');  // Reset previous error
        try {
            let endpoint;
            switch (actionType) {
                case 'attach':
                    endpoint = 'attach-ue';
                    break;
                case 'traffic':
                    endpoint = 'traffic-ue';
                    break;
                case 'detach':
                    endpoint = 'detach-ue';
                    break;
                case 'remove':
                    endpoint = 'delete-ue';
                    break;
                default:
                    throw new Error('Unknown action type');
            }

            console.log(`Calling API endpoint: ${endpoint} with ueCode: ${ueCode}`);
            const response = await apiCall(`http://${sshhost}:${PORT}/${endpoint}`, 'POST', { ueCode });

            const scriptOutput = response.output || 'Action completed successfully.';
            setOutput(scriptOutput);
        } catch (err) {
            console.error(`${actionType} request failed: ${err.message}`);
            setError(err.message || 'An error occurred while performing the action.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadText = () => {
        const blob = new Blob([output], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            <button onClick={() => setIsPopupVisible(true)} disabled={isDisabled || isLoading}>
                {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
            </button>

            {isPopupVisible && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>{`Confirm ${actionType}`}</h3>
                        <p>{`Are you sure you want to ${actionType} UE with code ${ueCode}?`}</p>

                        <div>
                            <button onClick={handleAction} disabled={isLoading}>
                                {isLoading ? 'Running...' : 'Confirm'}
                            </button>
                            <button onClick={() => setIsPopupVisible(false)} disabled={isLoading}>
                                Cancel
                            </button>
                        </div>

                        {output && (
                            <div className="output" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '20px' }}>
                                <h4>Output:</h4>
                                <pre>{output}</pre>
                                <button onClick={handleDownloadText}>Download Output as Text File</button>
                            </div>
                        )}

                        {error && (
                            <div className="error-message" style={{ marginTop: '20px', color: 'red' }}>
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

export default ActionButton;
