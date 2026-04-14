import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';

const TaskInput = () => {
    const { addTask } = useTasks();
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('medium');
    const [tag, setTag] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            await addTask({
                title: title.trim(),
                priority,
                tag: tag.trim() || null
            });
            setTitle('');
            setTag('');
            setPriority('medium');
        } catch (err) {
            console.error('Failed to add task', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-task-card">
            <form id="todo-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <input 
                        type="text" 
                        id="todo-input" 
                        placeholder="What needs to be done today?" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoComplete="off" 
                        required 
                        maxLength="500" 
                    />
                    <button type="submit" id="add-btn" aria-label="Add task" disabled={loading || !title.trim()}>
                        {loading ? (
                            <span className="btn-spinner-sm"><i className="fas fa-circle-notch fa-spin"></i></span>
                        ) : (
                            <i className="fas fa-plus btn-icon"></i>
                        )}
                    </button>
                </div>
                <div className="task-meta-inputs">
                    <select 
                        id="todo-priority" 
                        aria-label="Task priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="low">🟢 Low</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="high">🔴 High</option>
                    </select>
                    <input 
                        type="text" 
                        id="todo-tag" 
                        placeholder="Tag (e.g. Work, Home)" 
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        autoComplete="off" 
                        maxLength="50" 
                    />
                </div>
            </form>
        </div>
    );
};

export default TaskInput;
