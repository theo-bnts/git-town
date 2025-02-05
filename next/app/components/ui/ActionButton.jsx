"use client";
import React from 'react';

const ActionButton = ({ icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 transition-transform duration-200 hover:scale-110 hover:text-[var(--accent-color)]"
    >
      {icon}
    </button>
  );
};

export default ActionButton;