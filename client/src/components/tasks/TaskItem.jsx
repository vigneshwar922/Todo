import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';

const TaskItem = ({ task }) => {
    const { toggleTask, removeTask } = useTasks();
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            await toggleTask(task.id, !task.is_completed);
        } catch (err) {
            console.error('Failed to toggle task', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        setLoading(true);
        try {
            await removeTask(task.id);
        } catch (err) {
            console.error('Failed to delete task', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <li className={`todo-item prio-${task.priority} ${task.is_completed ? 'completed' : ''} ${loading ? 'syncing' : ''}`}>
            <label className="checkbox-container">
                <input 
                    type="checkbox" 
                    checked={task.is_completed} 
                    onChange={handleToggle}
                    disabled={loading}
                />
                <span className="checkmark"></span>
            </label>
            
            <div className="todo-content">
                <div className="todo-info">
                    <span className="todo-text">{task.title}</span>
                    <div className="todo-meta">
                        <span className={`priority-indicator priority-${task.priority}`}>
                            <i className="fas fa-flag"></i> {task.priority}
                        </span>
                        {task.tag && (
                            <span className="tag-badge">
                                <i className="fas fa-tag"></i> {task.tag}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <button 
                className="delete-btn" 
                onClick={handleDelete} 
                disabled={loading}
                aria-label="Delete task"
            >
                <i className="fas fa-trash-alt"></i>
            </button>
        </li>
    );
};

export default TaskItem;
