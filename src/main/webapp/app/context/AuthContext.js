import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import userActivityTracker from '../utils/userActivityTracker';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Initialize authentication state from localStorage or session
    useEffect(() => {
        const checkLoggedInUser = async () => {
            try {
                const storedUser = localStorage.getItem('currentUser');
                
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    setCurrentUser(user);
                    
                    // Update user activity tracker with user data
                    userActivityTracker.setUserData({
                        userId: user.id,
                        username: user.username
                    });
                    
                    // Verify token with backend (optional)
                    // const response = await axios.get('/api/auth/verify', {
                    //     headers: { Authorization: `Bearer ${user.token}` }
                    // });
                }
                
            } catch (err) {
                console.error('Error checking authentication:', err);
                // If token validation fails, log out
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };
        
        checkLoggedInUser();
    }, []);
    
    // Login function
    const login = async (username, password) => {
        try {
            setError(null);
            
            // Replace with your actual login API endpoint
            const response = await axios.post('/api/auth/login', { username, password });
            
            const user = response.data;
            
            // Save user to state and localStorage
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Get the session token from the response
            const sessionToken = user.sessionToken || response.headers['session-token'];
            
            // Store the session token for activity tracking
            if (sessionToken) {
                localStorage.setItem('session_token', sessionToken);
            }
            
            // Update user activity tracker with user data and session token
            userActivityTracker.setUserData({
                userId: user.id,
                username: user.username
            }, sessionToken);
            
            return user;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            throw err;
        }
    };
    
    // Register function
    const register = async (userData) => {
        try {
            setError(null);
            
            // Replace with your actual registration API endpoint
            const response = await axios.post('/api/auth/register', userData);
            
            const user = response.data;
            
            // Auto-login after registration
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Get the session token from the response
            const sessionToken = user.sessionToken || response.headers['session-token'];
            
            // Store the session token for activity tracking
            if (sessionToken) {
                localStorage.setItem('session_token', sessionToken);
            }
            
            // Update user activity tracker with user data and session token
            userActivityTracker.setUserData({
                userId: user.id,
                username: user.username
            }, sessionToken);
            
            return user;
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            throw err;
        }
    };
    
    // Logout function
    const logout = async () => {
        try {
            // Send final activity update before logout
            userActivityTracker.sendActivityData(true);
            
            // Update user activity tracker to clear user data
            userActivityTracker.setUserData({
                userId: null,
                username: null
            }, null); // Pass null to clear the session token
            
            // Optional: notify backend about logout
            // await axios.post('/api/auth/logout');
            
            // Clear local state
            localStorage.removeItem('currentUser');
            
            // Do not remove session_token to maintain tracking across logout
            // Instead, a new session will be associated with the user on next login
            
            setCurrentUser(null);
        } catch (err) {
            console.error('Logout error:', err);
        }
    };
    
    // Password reset request
    const requestPasswordReset = async (email) => {
        try {
            setError(null);
            // Replace with your actual password reset API endpoint
            await axios.post('/api/auth/reset-password-request', { email });
            return true;
        } catch (err) {
            console.error('Password reset request error:', err);
            setError(err.response?.data?.message || 'Password reset request failed.');
            throw err;
        }
    };
    
    // Reset password with token
    const resetPassword = async (token, newPassword) => {
        try {
            setError(null);
            // Replace with your actual password reset confirmation API endpoint
            await axios.post('/api/auth/reset-password-confirm', { token, newPassword });
            return true;
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.response?.data?.message || 'Password reset failed.');
            throw err;
        }
    };
    
    // Update user profile
    const updateProfile = async (userData) => {
        try {
            setError(null);
            
            // Replace with your actual update profile API endpoint
            const response = await axios.put('/api/users/profile', userData, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            
            const updatedUser = {
                ...currentUser,
                ...response.data
            };
            
            setCurrentUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            return updatedUser;
        } catch (err) {
            console.error('Update profile error:', err);
            setError(err.response?.data?.message || 'Profile update failed.');
            throw err;
        }
    };
    
    // Context value
    const value = {
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        updateProfile
    };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 