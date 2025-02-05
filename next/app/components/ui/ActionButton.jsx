"use client";

import React from 'react';

const ActionButton = ({ icon, onClick }) => {
    return (
        <button onClick={onClick} className="p-2">
            {icon}
        </button>
    );
};

export default ActionButton;