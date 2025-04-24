import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Style file (optional)
import LaaS_logo from "../../assets/LaaS_logo.gif";
import vmConfig from '../../../vmConfig.js';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const sshhost = vmConfig.ssh_host;
    const PORT = vmConfig.server_port;

    // Handle the registration form submission
    const handleRegister = async (e) => {
        e.preventDefault();

        console.log('Form Data:', { name, email, password }); // Log the data to ensure it's correct

        try {
            const res = await axios.post(`http://${sshhost}:${PORT}/api/auth/register`, { name, email, password });
            console.log('Registration successful:', res.data);
            navigate('/home');
        } catch (err) {
            console.error('Registration error:', err);
            setMessage(err.response ? err.response.data.error : 'Registration failed');
        }
    };



    return (
        <div className="contents">
            <header>
                <div className="container">
                    <div className="main-header">
                        <img src={LaaS_logo} alt="LaaS Logo" className="laas-logo" />
                        <h1>LaaS GUI</h1>
                        <img src={LaaS_logo} alt="LaaS Logo" className="laas-logo" />
                    </div>
                </div>
            </header>
        <form onSubmit={handleRegister}>
            <h2>Register</h2>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
            />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <button type="submit">Register</button>
            {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default RegisterPage;
