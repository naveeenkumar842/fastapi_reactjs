// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('access_token'));

    useEffect(() => {
        if (token) {
            api.get('/users/me')
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    localStorage.removeItem('access_token');
                    setToken(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (username, password) => {
        try {
            // ✅ Use FormData for OAuth2PasswordRequestForm
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            const { access_token } = response.data;

            localStorage.setItem('access_token', access_token);
            setToken(access_token);

            const userResponse = await api.get('/users/me');
            setUser(userResponse.data);

            return { success: true };
        } catch (error) {
            let errorMessage = 'Login failed';
            if (error.response && error.response.data) {
                const data = error.response.data;
                if (data.detail) {
                    errorMessage = typeof data.detail === 'string'
                        ? data.detail
                        : JSON.stringify(data.detail);
                }
            }
            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const register = async (username, email, password) => {
        try {
            await api.post('/auth/register', { username, email, password });
            return { success: true };
        } catch (error) {
            let errorMessage = 'Registration failed';
            if (error.response && error.response.data) {
                const data = error.response.data;
                if (data.detail) {
                    errorMessage = typeof data.detail === 'string'
                        ? data.detail
                        : JSON.stringify(data.detail);
                }
            }
            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);