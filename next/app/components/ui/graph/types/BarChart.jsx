'use client';

import React from 'react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';

export default function renderBarChart({ 
    commonProps, 
    axisProps, 
    normalizedSeries, 
    hasMultipleYAxis }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart {...commonProps}>
        {axisProps.grid}
        {axisProps.xAxis}
        {hasMultipleYAxis ? axisProps.yAxis : axisProps.yAxis}
        {axisProps.tooltip}
        {axisProps.legend}
        {normalizedSeries.map((s, index) => (
          <Bar
            key={`bar-${index}`}
            dataKey={s.dataKey}
            name={s.name}
            fill={s.color}
            yAxisId={s.yAxisId}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
