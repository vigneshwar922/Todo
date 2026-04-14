import React, { useRef } from 'react';
import { format, addDays, subDays, isSameDay, startOfDay } from 'date-fns';
import { useTasks } from '../../context/TaskContext';

const DateStrip = () => {
    const { selectedDate, setSelectedDate, tasks } = useTasks();
    const scrollRef = useRef(null);

    // Generate 31 days of dates around the current date
    const today = startOfDay(new Date());
    const dates = Array.from({ length: 31 }, (_, i) => addDays(subDays(today, 7), i));

    const handleDateClick = (date) => {
        setSelectedDate(format(date, 'yyyy-MM-dd'));
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Task count for a specific date
    const getTaskCountForDate = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return tasks.filter(t => t.date === dateStr).length;
    };

    return (
        <div className="date-strip-wrapper">
            <button className="date-strip-scroll-btn" onClick={() => scroll('left')} aria-label="Scroll dates left">
                <i className="fas fa-chevron-left"></i>
            </button>
            <div className="date-strip" ref={scrollRef}>
                {dates.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isActive = selectedDate === dateStr;
                    const isToday = isSameDay(date, today);
                    const taskCount = getTaskCountForDate(date);

                    return (
                        <div 
                            key={dateStr}
                            className={`date-card ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
                            onClick={() => handleDateClick(date)}
                        >
                            <span className="date-card-weekday">{format(date, 'EEE')}</span>
                            <span className="date-card-day">{format(date, 'd')}</span>
                            <span className="date-card-month">{format(date, 'MMM')}</span>
                            {taskCount > 0 && <div className="date-card-dot"></div>}
                        </div>
                    );
                })}
            </div>
            <button className="date-strip-scroll-btn" onClick={() => scroll('right')} aria-label="Scroll dates right">
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
};

export default DateStrip;
