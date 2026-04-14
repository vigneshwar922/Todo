import React, { useState } from 'react';
import Navbar from './layout/Navbar';
import DateStrip from './ui/DateStrip';
import TaskInput from './tasks/TaskInput';
import TaskList from './tasks/TaskList';
import SearchSortBar from './tasks/SearchSortBar';
import FilterBar from './tasks/FilterBar';
import { useTasks } from '../context/TaskContext';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

const Dashboard = () => {
    const { selectedDate, tasks, clearCompleted, setSelectedDate } = useTasks();
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const activeTasksCount = tasks.filter(t => !t.is_completed).length;
    const completedTasksCount = tasks.filter(t => t.is_completed).length;

    const getDateHeading = () => {
        const date = new Date(selectedDate);
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'EEEE, MMMM do');
    };

    const handleDatePick = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div id="app-screen">
            <Navbar />
            <DateStrip />

            <main className="app-main">
                <div className="selected-date-header">
                    <div>
                        <h2 id="date-display">{getDateHeading()}</h2>
                        <span id="date-sub" className="date-sub">
                            {format(new Date(selectedDate), 'MMMM dd, yyyy')}
                        </span>
                    </div>
                    <div className="date-picker-container">
                        <button className="pick-date-btn" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
                            <i className="fas fa-calendar-alt"></i>
                            <span>Jump to date</span>
                        </button>
                        <input 
                            type="date" 
                            className="date-picker-input" 
                            value={selectedDate}
                            onChange={handleDatePick}
                        />
                    </div>
                </div>

                <TaskInput />
                
                <SearchSortBar />
                
                <FilterBar />

                <TaskList />

                <footer>
                    <span id="tasks-count">{activeTasksCount} items left</span>
                    {completedTasksCount > 0 && (
                        <button id="clear-completed" onClick={clearCompleted}>
                            Clear Completed
                        </button>
                    )}
                </footer>
            </main>
        </div>
    );
};

export default Dashboard;
