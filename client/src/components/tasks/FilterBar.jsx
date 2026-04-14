import React from 'react';
import { useTasks } from '../../context/TaskContext';

const FilterBar = () => {
    const { filter, setFilter } = useTasks();

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'completed', label: 'Completed' }
    ];

    return (
        <div className="filters">
            {filters.map(f => (
                <button 
                    key={f.id}
                    className={`filter-btn ${filter === f.id ? 'active' : ''}`}
                    onClick={() => setFilter(f.id)}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;
