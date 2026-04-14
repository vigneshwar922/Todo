import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { addDays, format, parseISO } from 'date-fns';

const TaskInput = () => {
    const { addTask, addTasksForPeriod, selectedDate } = useTasks();
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('medium');
    const [tag, setTag] = useState('');
    const [duration, setDuration] = useState('1'); // '1' = single day, '3', '7', 'custom'
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            const taskData = {
                title: title.trim(),
                priority,
                tag: tag.trim() || null
            };

            if (duration === '1') {
                await addTask(taskData);
            } else {
                let dates = [];
                const start = parseISO(selectedDate);
                
                if (duration === 'custom' && endDate) {
                    const end = parseISO(endDate);
                    let curr = start;
                    while (curr <= end && dates.length < 60) {
                        dates.push(format(curr, 'yyyy-MM-dd'));
                        curr = addDays(curr, 1);
                    }
                } else {
                    const days = parseInt(duration);
                    for (let i = 0; i < days; i++) {
                        dates.push(format(addDays(start, i), 'yyyy-MM-dd'));
                    }
                }

                if (dates.length > 0) {
                    await addTasksForPeriod(taskData, dates);
                }
            }

            setTitle('');
            setTag('');
            setPriority('medium');
            setDuration('1');
            setEndDate('');
        } catch (err) {
            console.error('Failed to add task(s)', err);
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
                    
                    <select 
                        id="todo-duration" 
                        aria-label="Task period"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    >
                        <option value="1">⏱️ Single day</option>
                        <option value="3">⏱️ Next 3 days</option>
                        <option value="7">⏱️ Next 7 days</option>
                        <option value="custom">📅 Custom period</option>
                    </select>

                    {duration === 'custom' && (
                        <input 
                            type="date" 
                            id="todo-end-date"
                            min={selectedDate}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    )}

                    <input 
                        type="text" 
                        id="todo-tag" 
                        placeholder="Tag (e.g. Work)" 
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
