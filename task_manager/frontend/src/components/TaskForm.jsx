// frontend/src/components/TaskForm.jsx

import React, { useState } from 'react';
import api from '../api/axios';

const TaskForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await api.post('/tasks/', formData);
            setFormData({ title: '', description: '' });
            onSuccess();
        } catch (err) {
            setError('Failed to create task');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
            {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded-lg mb-3 text-sm">
                    ❌ {error}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Task title *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loading}
                />

                <input
                    type="text"
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading || !formData.title.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating...' : 'Create Task'}
                </button>
            </div>
        </form>
    );
};

export default TaskForm;