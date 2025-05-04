'use client';

import React from 'react';
import Graph from '@/app/components/ui/Graph';
import { calculateRatio } from '@/app/utils/calculateRatio';

export default function CommitsGraph({ 
  commits, 
  lines, 
  loading, 
  title = "Commits par semaine",
  height = 300,
  showLegend = true,
  hideTitle = false,
  showLinesData = false,
  showTypeSelector = false
}) {
  if (loading || !commits) {
    return (
      <div className="w-full p-4 rounded-lg bg-gray-50">
        <div className="animate-pulse bg-gray-200 h-60 rounded-md"></div>
      </div>
    );
  }
  
  const prepareData = () => {
    if (!commits.Weekly || !commits.Weekly.Counts) return [];
    
    const { Weekly: { FirstDayOfFirstWeek, Counts } } = commits;
    
    const data = Counts.map((count, index) => {
      const date = new Date(FirstDayOfFirstWeek);
      date.setDate(date.getDate() + index * 7);
      
      const weekLabel = `${date.getDate()} ${date.toLocaleDateString(
        'fr-FR', { month: 'short' })
      }`;
      
      const dataPoint = {
        week: weekLabel,
        weekIndex: index,
        commits: count
      };
      
      if (showLinesData && lines && lines.Weekly && 
          lines.Weekly.Counts && lines.Weekly.Counts[index]) {
        
        const additions = lines.Weekly.Counts[index].Additions || 0;
        const deletions = lines.Weekly.Counts[index].Deletions || 0;
        
        dataPoint.ratio = calculateRatio(additions, deletions);
        dataPoint.additions = additions;
        dataPoint.deletions = deletions;
      }
      
      return dataPoint;
    });
    
    return data;
  };
  
  const data = prepareData();
  
  const series = [
    { 
      dataKey: 'commits', 
      color: 'var(--accent-color)',
      name: 'Commits',
      yAxisId: 'left'
    }
  ];

  if (showLinesData && lines) {
    series.push(
      { 
        dataKey: 'ratio', 
        color: 'var(--selected-color)',
        name: 'Ratio',
        yAxisId: 'right',
        strokeWidth: 2,
        dot: {
          r: 4,
          fill: '#fff',
          stroke: 'var(--selected-color)',
          strokeWidth: 2
        }
      }
    );
  }
  
  const tooltipFormatter = (value, name) => {
    if (name === 'Ratio') {
      return [value.toFixed(1), name];
    }
    return [value, name];
  };
  
  return (
    <Graph
      title={hideTitle ? null : title}
      data={data}
      xAxisKey="week"
      series={series}
      type="line"
      height={height}
      showLegend={showLegend}
      multipleYAxis={showLinesData}
      showTypeSelector={showTypeSelector}
      emptyMessage="Aucune donnée de commits disponible"
      tooltipFormatter={tooltipFormatter}
    />
  );
}
