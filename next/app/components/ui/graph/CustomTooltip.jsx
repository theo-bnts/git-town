'use client';

import React from 'react';
import { tooltipStyles } from '@/app/styles/tailwindStyles';

export default function CustomTooltip({ active, payload, label, formatter }) {
  if (active && payload && payload.length) {
    return (
      <div className={tooltipStyles.default}>
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry, index) => {
          const value = formatter 
            ? formatter(entry.value, entry.name, entry)
            : entry.value;
          
          return (
            <p 
              key={`item-${index}`} 
              className="text-sm" 
              style={{ color: entry.color }}
            >
              {entry.name}: {Array.isArray(value) ? value[0] : value}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
}
