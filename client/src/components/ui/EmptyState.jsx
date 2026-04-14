import React from 'react';

const EmptyState = () => {
    return (
        <div id="empty-state" className="empty-state">
            <div className="empty-icon">
                <i className="fas fa-check-double"></i>
            </div>
            <p>No tasks for this day.</p>
            <span>Enjoy your time!</span>
        </div>
    );
};

export default EmptyState;
