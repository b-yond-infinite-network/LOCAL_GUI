import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import './App.css';
import Home from './components/Pages/Home';
import FolderListPage from './components/Pages/FolderListPage';
import SystemStatusPage from './components/Pages/SystemStatus';
import UEListPage from './components/Pages/UEListPage';
import GitClonePage from './components/Pages/GitClonePage';
import LoginPage from './components/Pages/LoginPage';
import RegisterPage from './components/Pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import UsersPage from './components/Pages/UsersPage';
function App() {
    return (
        <Router>
            <div className="home-container">
                <Sidebar />
                <div className="main">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected Routes */}
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <Home />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/folders"
                            element={
                                <PrivateRoute>
                                    <FolderListPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/git-clone"
                            element={
                                <PrivateRoute>
                                    <GitClonePage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/system-status"
                            element={
                                <PrivateRoute>
                                    <SystemStatusPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/ue-list"
                            element={
                                <PrivateRoute>
                                    <UEListPage />
                                </PrivateRoute>
                            }
                        />

                        {/* Catch-all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                        <Route
                            path="/users"
                            element={
                                <PrivateRoute>
                                    <UsersPage />
                                </PrivateRoute>
                            }
                        />
                    
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;