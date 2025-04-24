// LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import LaaS_logo from "../../assets/LaaS_logo.gif";
import vmConfig from '../../../vmConfig.js';

const LoginPage = () => {
    const sshhost = vmConfig.ssh_host;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const PORT = vmConfig.server_port;

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://${sshhost}:${PORT}/api/auth/login`, { email, password });
            localStorage.setItem('token', res.data.token); // Save token
            navigate('/home');
        } catch (err) {
            setMessage(err.response.data.error);
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
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit">Login</button>
            {message && <p>{message}</p>}
            <p>Don't have an account? <a href="/register">Register here</a></p> {/* Link to Register page */}
            </form>
        </div>
    );
};

export default LoginPage;
