'use client';

import React from 'react';
import { textStyles, buttonStyles } from '@/app/styles/tailwindStyles';

export default function TypeSelector({ chartType, setChartType }) {
  const chartTypes = ['area', 'line', 'bar', 'pie'];
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chartTypes.map(type => (
        <button
          key={type}
          onClick={() => setChartType(type)}
          className={`${
            chartType === type 
            ? buttonStyles.default 
            : buttonStyles.outline} text-xs px-2 py-1`
            }
        >
          <span className={chartType === type ? textStyles.boldWhite : textStyles.default}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        </button>
      ))}
    </div>
  );
}
