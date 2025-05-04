'use client';

import React from 'react';
import { tagStyles } from '@/app/styles/tailwindStyles';

export default function Tag({ variant = 'default', children, className = '' }) {
  const baseClasses = tagStyles[variant] || tagStyles.default;
  
  return (
    <div className={`inline-flex items-center justify-center ${baseClasses} ${className}`}>
      {children}
    </div>
  );
}