import React from 'react';
import { useTasks } from '../../context/TaskContext';
import TaskItem from './TaskItem';
import EmptyState from '../ui/EmptyState';

const TaskList = () => {
    const { tasks, loading } = useTasks();

    if (loading && tasks.length === 0) {
        return (
            <div id="tasks-loading" className="tasks-loading">
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
                <div className="skeleton-item"></div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="list-container">
            <ul id="todo-list">
                {tasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </ul>
        </div>
    );
};

export default TaskList;
