// app/components/ui/Button.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { buttonStyles } from '../../styles/tailwindStyles';

const Button = ({ variant, children, loading, ...props }) => {
  const appliedStyle = loading
    ? `${buttonStyles[variant]} opacity-70 cursor-not-allowed relative`
    : buttonStyles[variant];

  return (
    <button className={appliedStyle} disabled={loading || props.disabled} {...props}>
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <LoadingSpinner />
        </div>
      )}
    </button>
  );
};

export default Button;
