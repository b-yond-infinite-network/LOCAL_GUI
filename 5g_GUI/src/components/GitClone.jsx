import React, { useState } from 'react';
import { apiCall } from './Api.jsx';
import vmConfig from '../../vmConfig.js';
const sshhost = vmConfig.ssh_host;

const GitClone = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');
    const PORT = vmConfig.server_port;

    const handleGitClone = async () => {
        if (!token) {
            setMessage('Please enter your GitHub token.');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const result = await apiCall(`http://${sshhost}:${PORT}/git-clone`, 'POST', { token });
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
            <input
                type="password"
                placeholder="Enter GitHub Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
            />
            <button onClick={handleGitClone} disabled={loading}>
                {loading ? 'Cloning...' : 'Clone Git Repository'}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default GitClone;
