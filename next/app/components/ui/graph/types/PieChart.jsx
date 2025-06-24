'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function renderPieChart({ 
    commonProps, 
    axisProps, 
    normalizedSeries, 
    xAxisKey 
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={commonProps.data}
          nameKey={xAxisKey}
          dataKey={normalizedSeries[0].dataKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {commonProps.data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={normalizedSeries[Math.min(index, normalizedSeries.length - 1)].color} 
            />
          ))}
        </Pie>
        {axisProps.tooltip}
        {axisProps.legend}
      </PieChart>
    </ResponsiveContainer>
  );
}
