import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from '../config/db.js';
import { insertUser, findUserByEmail } from '../models/userModel.js'; // Import the functions

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variables

// Register Route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields (name, email, password) are required.' });
    }

    const client = await connectDB();

    try {
        const existingUser = await findUserByEmail(client, email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await insertUser(client, { name, email, password: hashedPassword });
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'Registration failed', details: err.message });
    } finally {
        client.end();
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const client = await connectDB();

    try {
        const user = await findUserByEmail(client, email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed', details: err.message });
    } finally {
        client.end();
    }
});

// Fetch Users Route
router.get('/users', async (req, res) => {
    try {
        const client = await connectDB();
        const result = await client.query('SELECT id, name, email FROM users'); // Exclude password
        client.end();
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});


router.post('/users', async (req, res) => {
    console.log(req.body); // Log incoming data
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const client = await connectDB();
        const result = await client.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );
        client.end();
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ error: 'Failed to add user' });
    }
});

router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const client = await connectDB();
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        client.end();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});


export default router;
