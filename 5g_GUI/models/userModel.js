import pkg from 'pg'; // Import the pg package
const { Client } = pkg; // Destructure to get Client from pg

// Function to create the user table
const createUserTable = async (client) => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `;
    try {
        await client.query(query); // Execute the query
        console.log('User table created or already exists');
    } catch (err) {
        console.error('Error creating user table:', err.message);
        throw err;
    }
};

// Function to insert a new user
const insertUser = async (client, userData) => {
    const { name, email, password } = userData;
    const query = `
    INSERT INTO users (name, email, password) 
    VALUES ($1, $2, $3) RETURNING *;
  `;
    try {
        const res = await client.query(query, [name, email, password]);
        return res.rows[0]; // Return the inserted user
    } catch (err) {
        console.error('Error inserting user:', err.message);
        throw err;
    }
};
// Function to find a user by email
const findUserByEmail = async (client, email) => {
    const query = `SELECT * FROM users WHERE email = $1;`;
    try {
        const res = await client.query(query, [email]);
        return res.rows[0]; // Return the user if found
    } catch (err) {
        console.error('Error finding user by email:', err.message);
        throw err;
    }
};

export { createUserTable, insertUser, findUserByEmail }; // Named exports 
