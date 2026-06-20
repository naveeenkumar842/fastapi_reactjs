// frontend/src/components/Auth.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = ({ mode }) => {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // ✅ Validate inputs
        if (!formData.username.trim()) {
            setError('Username is required');
            return;
        }

        if (!formData.password.trim()) {
            setError('Password is required');
            return;
        }

        if (mode === 'register' && !formData.email.trim()) {
            setError('Email is required');
            return;
        }

        setLoading(true);

        let result;
        if (mode === 'login') {
            result = await login(formData.username.trim(), formData.password.trim());
        } else {
            result = await register(
                formData.username.trim(),
                formData.email.trim(),
                formData.password.trim()
            );
        }

        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {mode === 'login' ? 'Login' : 'Create Account'}
                </h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm whitespace-pre-wrap">
                        ❌ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={loading}
                            placeholder="Enter your username"
                        />
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={loading}
                                placeholder="Enter your email"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={loading}
                            placeholder="Enter your password"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '⏳ Processing...' : mode === 'login' ? 'Login' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    {mode === 'login' ? (
                        <Link to="/register" className="text-blue-500 hover:underline text-sm">
                            Don't have an account? Register
                        </Link>
                    ) : (
                        <Link to="/login" className="text-blue-500 hover:underline text-sm">
                            Already have an account? Login
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;