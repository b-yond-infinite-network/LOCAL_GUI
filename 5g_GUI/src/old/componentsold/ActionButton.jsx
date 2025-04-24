import React, { useState } from 'react';
import { apiCall } from './Api'; // Import the apiCall function

const ActionButton = ({ ueCode, actionType, onActionComplete, isDisabled }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [output, setOutput] = useState(''); // State to store output
    const [error, setError] = useState(''); // State to store error message

    const handleAction = async () => {
        setIsLoading(true);
        setOutput(''); // Reset output state
        setError(''); // Reset error state
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
            const response = await apiCall(`http://10.194.1.94:5001/${endpoint}`, 'POST', { ueCode });

            // Assuming response contains an output property
            const scriptOutput = response.output || '';
            setOutput(scriptOutput); // Store output in state

            console.log(`${actionType} successful`);
            onActionComplete(); // Optional: You can remove this if you don't want to close the popup after success
        } catch (error) {
            console.error(`${actionType} request failed: ${error.message}`);
            setError(error.message || 'An error occurred while performing the action.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmAction = async () => {
        // Don't close the popup here, just trigger the action and wait for the output
        await handleAction();
    };

    const showConfirmationPopup = () => {
        setIsPopupVisible(true);
    };

    const hideConfirmationPopup = () => {
        setIsPopupVisible(false);
    };

    // Function to download output as a text file
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
            <button onClick={showConfirmationPopup} disabled={isLoading || isDisabled}>
                {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
            </button>

            {isPopupVisible && (
                <div className="popup">
                    <div className="popup-content">
                        <h3>{`Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}</h3>
                        <p>{`Are you sure you want to ${actionType} UE with code ${ueCode}?`}</p>

                        {/* Action buttons */}
                        <button onClick={handleConfirmAction} disabled={isLoading}>
                            {isLoading ? 'Running...' : `Yes, ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
                        </button>
                        <button onClick={hideConfirmationPopup} disabled={isLoading}>
                            {isLoading ? 'Please wait...' : 'Cancel'}
                        </button>

                        {/* Display output after the action is performed */}
                        {output && (
                            <div className="output" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '20px' }}>
                                <h4>Output:</h4>
                                <pre>{output}</pre>

                                {/* Button to download output as a text file */}
                                <button onClick={handleDownloadText}>Download Output as Text File</button>
                            </div>
                        )}

                        {/* Display error if there's an error */}
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
