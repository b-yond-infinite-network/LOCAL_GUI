import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LaaS_logo from "../../assets/LaaS_logo.gif";
import vmConfig from '../../../vmConfig.js';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
    const [showModal, setShowModal] = useState(false);
    const sshhost = vmConfig.ssh_host;
    const PORT = vmConfig.server_port;
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`http://${sshhost}:${PORT}/api/auth/users`);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://${sshhost}:${PORT}/api/auth/users`, newUser);
            fetchUsers(); // Refresh user list
            setNewUser({ name: '', email: '', password: '' }); // Reset form
            setShowModal(false); // Close modal
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const handleRemoveUser = async (id) => {
        try {
            await axios.delete(`http://${sshhost}:${PORT}/api/auth/users/${id}`);
            fetchUsers(); // Refresh user list after deletion
        } catch (error) {
            console.error('Error deleting user:', error);
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
        <div className="users-page">
            <h2>User List</h2>
            <button
                onClick={() => setShowModal(true)}
                style={{
                    position: 'absolute',
                    top: '150px',
                    right: '20px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    backgroundColor: '#F40085',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '5px 10px'
                }}
            >
                +
            </button>

            <table>
                <thead>
                    <tr>
                        
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <button
                                    onClick={() => handleRemoveUser(user.id)}
                                   
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '17%',
                        height: '30%',
                        backgroundColor: 'white',
                        padding: '20px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                >
                    <h3>Add User</h3>
                    <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button type="submit" style={{ backgroundColor: '#28A745', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px' }}>
                                Add User
                            </button>
                            <button type="button" onClick={() => setShowModal(false)} style={{ backgroundColor: '#6C757D', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999
                    }}
                    onClick={() => setShowModal(false)}
                />
            )}
            </div>
        </div>
            );
        
};

export default UsersPage;
