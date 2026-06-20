// frontend/src/components/TaskList.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tasks/');
            setTasks(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load tasks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (err) {
            alert('Failed to delete task');
        }
    };

    const handleToggleComplete = async (id, currentStatus) => {
        try {
            await api.put(`/tasks/${id}`, { completed: !currentStatus });
            fetchTasks();
        } catch (err) {
            alert('Failed to update task');
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading tasks...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">No tasks yet</p>
                <p className="text-gray-400 text-sm mt-2">Create your first task above!</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow ${task.completed ? 'opacity-75' : ''
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleComplete(task.id, task.completed)}
                                className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex-1">
                                <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {task.title}
                                </h3>
                                {task.description && (
                                    <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {task.description}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    Created: {new Date(task.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(task.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskList;