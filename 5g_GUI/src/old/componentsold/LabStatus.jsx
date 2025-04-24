import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { runScript } from './Api';

const LabStatus = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkServiceStatus = async () => {
        setLoading(true);
        setError('');
        try {
            // Run the command to get service statuses using the runScript function
            const command = 'minikube kubectl -- get pods --all-namespaces';
            const commandPath = 'laas-5gsa-k8s/SCRIPTS/Deploy';
            const response = await runScript(command, commandPath);

            // Assuming response.output contains the table data as plain text
            const output = response.output || '';
            const rows = output.split('\n').slice(1); // Ignore header row

            // Map each row to an object containing the relevant fields
            const servicesData = rows.map(row => {
                const columns = row.trim().split(/\s+/);

                // Check if there are at least 6 columns to capture the necessary fields
                if (columns.length >= 6) {
                    const restartIndex = columns[4].includes('(') ? 5 : 4; // Handle optional restart time column
                    const ageIndex = columns.length - 1;

                    return {
                        namespace: columns[0],         // NAMESPACE
                        name: columns[1],              // NAME
                        ready: columns[2],             // READY
                        status: columns[3],            // STATUS
                        restarts: columns[restartIndex], // RESTARTS
                        age: columns[ageIndex],        // AGE
                        icon: columns[3] === 'Running' ? <FaCheckCircle style={{ color: 'green' }} /> : <FaTimesCircle style={{ color: 'red' }} /> // Status Icon
                    };
                }
                return null; // Return null for incomplete rows
            }).filter(service => service !== null); // Remove null values

            setServices(servicesData);

        } catch (err) {
            setError('Failed to fetch service status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={checkServiceStatus} disabled={loading}>
                {loading ? 'Checking...' : 'Check Service Status'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Table for displaying the services */}
            {services.length > 0 && (
                <div>
                    <h2>Service Status</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Namespace</th>
                                <th>Name</th>
                                <th>Ready</th>
                                <th>Status</th>
                                <th>Restarts</th>
                                <th>Age</th>
                                <th>Status Icon</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service, index) => (
                                <tr key={index}>
                                    <td>{service.namespace}</td>
                                    <td>{service.name}</td>
                                    <td>{service.ready}</td>
                                    <td>{service.status}</td>
                                    <td>{service.restarts}</td>
                                    <td>{service.age}</td>
                                    <td>{service.icon}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LabStatus;
