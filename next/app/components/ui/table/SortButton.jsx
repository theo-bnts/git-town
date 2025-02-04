import React from 'react';

const SortButton = ({ isActive, direction }) => {
    return (
        <span>
            {isActive ? (direction === 'asc' ? ' 🔼' : ' 🔽') : ' ↕️'}
        </span>
    );
};

export default SortButton;