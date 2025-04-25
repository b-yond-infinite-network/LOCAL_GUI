import pkg from 'pg';
const { Client } = pkg;
import vmConfig from '../vmConfig.js'; // Ensure vmConfig has host, user, password, etc.

const connectDB = async () => {
    const client = new Client({
        host: vmConfig.ssh_host, // Use the correct host from your configuration
        user: 'anthony',      // Your PostgreSQL user
        database: 'laas_gui', // Your database name
        password: 'LaaS_GUI_2024', // Your PostgreSQL password
        port: 5432,
    });

    try {
        await client.connect();
        console.log('PostgreSQL Connected...');
        return client; // Return the client to use in the models
    } catch (err) {
        console.error('PostgreSQL connection error:', err.message);
        process.exit(1);
    }
};

export default connectDB;
