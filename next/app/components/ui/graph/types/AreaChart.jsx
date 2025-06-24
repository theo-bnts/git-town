'use client';

import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function renderAreaChart({ 
    commonProps, 
    axisProps, 
    normalizedSeries, 
    hasMultipleYAxis 
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart {...commonProps}>
        {axisProps.grid}
        {axisProps.xAxis}
        {hasMultipleYAxis ? axisProps.yAxis : axisProps.yAxis}
        {axisProps.tooltip}
        {axisProps.legend}
        {normalizedSeries.map((s, index) => (
          <Area
            key={`area-${index}`}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.2}
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
      </AreaChart>
    </ResponsiveContainer>
  );
}
