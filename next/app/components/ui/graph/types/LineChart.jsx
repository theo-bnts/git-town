'use client';

import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function renderLineChart({ 
    commonProps, 
    axisProps, 
    normalizedSeries, 
    hasMultipleYAxis 
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart {...commonProps}>
        {axisProps.grid}
        {axisProps.xAxis}
        {hasMultipleYAxis ? axisProps.yAxis : axisProps.yAxis}
        {axisProps.tooltip}
        {axisProps.legend}
        {normalizedSeries.map((s, index) => (
          <Line
            key={`line-${index}`}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            yAxisId={s.yAxisId}
            dot={{
              r: 4,
              fill: 'var(--primary-color)',
              stroke: s.color,
              strokeWidth: 2
            }}
            activeDot={{
              r: 6,
              fill: 'var(--primary-color)',
              stroke: s.color,
              strokeWidth: 2
            }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
