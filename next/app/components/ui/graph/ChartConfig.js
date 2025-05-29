'use client';

import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CustomTooltip from './CustomTooltip';

export function createChartAxisProps({
  xAxisKey,
  hasMultipleYAxis,
  gridLines,
  showLegend,
  tooltipFormatter,
  yAxisDomain
}) {
  return {
    xAxis: (
      <XAxis 
        dataKey={xAxisKey} 
        tick={{ fill: 'var(--secondary-color)' }}
        axisLine={{ stroke: 'var(--hint-color)' }}
        tickLine={{ stroke: 'var(--hint-color)' }}
      />
    ),
    yAxis: hasMultipleYAxis ? [
      <YAxis 
        key="left"
        yAxisId="left"
        tick={{ fill: 'var(--secondary-color)' }}
        axisLine={{ stroke: 'var(--hint-color)' }}
        tickLine={{ stroke: 'var(--hint-color)' }}
      />,
      <YAxis 
        key="right"
        yAxisId="right"
        orientation="right"
        tick={{ fill: 'var(--secondary-color)' }}
        axisLine={{ stroke: 'var(--hint-color)' }}
        tickLine={{ stroke: 'var(--hint-color)' }}
        domain={yAxisDomain && yAxisDomain[0] === 'right' ? yAxisDomain[1] : [-1, 1]}
      />
    ] : (
      <YAxis 
        yAxisId="left"
        tick={{ fill: 'var(--secondary-color)' }}
        axisLine={{ stroke: 'var(--hint-color)' }}
        tickLine={{ stroke: 'var(--hint-color)' }}
      />
    ),
    grid: gridLines && (
      <CartesianGrid 
        strokeDasharray="3 3" 
        stroke="var(--hint-color)" 
        opacity={0.3} 
      />
    ),
    tooltip: <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />,
    legend: showLegend && <Legend />
  };
}
