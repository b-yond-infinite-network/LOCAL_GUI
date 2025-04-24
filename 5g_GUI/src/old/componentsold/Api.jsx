import axios from 'axios';
import vmConfig from '../../vmConfig.js';
const sshhost = vmConfig.ssh_host;
// Function to perform generic API calls (GET, POST, etc.)
export const apiCall = async (url, method = 'GET', body = null) => {
    try {
        console.log(`Calling API: ${url} with method: ${method} and body:`, body);

        const config = {
            method: method,
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            config.data = JSON.stringify(body); // Only include body if not null
        }

        const response = await axios(config);

        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('API call error:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const runScript = async (scriptName, scriptLocation) => {
    try {
       
        const response = await axios.post(`http://${sshhost}:5001/run-script`, {
            scriptName,
            scriptLocation,
        });

        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling API:', error.response ? error.response.data : error.message);
        throw error;
    }
};
export const getServerAddress = async () => {
    try {
        const response = await axios.get('/server-address');
        return response.data.address;
    } catch (err) {
        console.error('Failed to fetch server address:', err);
        throw err;
    }
};