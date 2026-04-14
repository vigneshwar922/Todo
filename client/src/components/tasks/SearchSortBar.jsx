import React from 'react';
import { useTasks } from '../../context/TaskContext';

const SearchSortBar = () => {
    const { search, setSearch, sort, setSort } = useTasks();

    return (
        <div className="search-sort-bar">
            <div className="search-input-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input 
                    type="text" 
                    id="search-input" 
                    placeholder="Search tasks..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off" 
                />
                {search && (
                    <button 
                        id="clear-search-btn" 
                        className="clear-search" 
                        onClick={() => setSearch('')}
                        aria-label="Clear search"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </div>
            <select 
                id="sort-select" 
                aria-label="Sort tasks"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
            >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
            </select>
        </div>
    );
};

export default SearchSortBar;
