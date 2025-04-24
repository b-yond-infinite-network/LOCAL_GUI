import React, { useState } from 'react';
import { apiCall } from './Api.jsx';

const GitClone = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleGitClone = async () => {
        setLoading(true);
        setMessage('');
        try {
            const result = await apiCall('http://localhost:5001/git-clone', 'POST');
            if (result.success) {
                setMessage('Git repository cloned successfully!');
            } else {
                setMessage('Failed to clone repository: ' + (result.message || 'Unknown error.'));
            }
        } catch (error) {
            setMessage('An error occurred: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="git-clone-container">
            
            <button onClick={handleGitClone} disabled={loading}>
                {loading ? 'Cloning...' : 'Clone Git Repository'}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default GitClone;
