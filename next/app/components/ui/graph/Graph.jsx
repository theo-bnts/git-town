'use client';

import React, { useState } from 'react';
import { textStyles } from '@/app/styles/tailwindStyles';
import TypeSelector from './TypeSelector';
import { createChartAxisProps } from './ChartConfig';
import { renderAreaChart, renderLineChart, renderBarChart, renderPieChart } from './types';

export default function Graph({ 
  title, 
  data = [], 
  xAxisKey = 'name',
  series = [{ 
    dataKey: 'value', 
    color: 'var(--accent-color)', 
    name: 'Valeur' 
  }],
  type = 'area',
  height = 300,
  gridLines = true,
  className = '',
  showLegend = true,
  emptyMessage = 'Aucune donnée disponible',
  showTypeSelector = false,
  tooltipFormatter = null,
  multipleYAxis = false,
  yAxisDomain = null
}) {
  const [chartType, setChartType] = useState(type);
  
  if (!data || data.length === 0) {
    return (
      <div className={className}>
        {title && <h3 className={`${textStyles.bold} mb-4`}>{title}</h3>}
        <div className="flex items-center justify-center h-[200px]">
          <p className={textStyles.hint}>{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  const commonProps = {
    data,
    margin: { top: 10, right: 30, left: 0, bottom: 5 }
  };

  const hasMultipleYAxis = multipleYAxis && series.some(s => s.yAxisId === 'right');

  const normalizedSeries = series.map(s => ({
    ...s,
    yAxisId: s.yAxisId || 'left'
  }));
  
  const axisProps = createChartAxisProps({
    xAxisKey,
    hasMultipleYAxis,
    gridLines,
    showLegend,
    tooltipFormatter,
    yAxisDomain
  });
  
  const renderChart = () => {
    const chartProps = {
      commonProps,
      axisProps,
      normalizedSeries,
      hasMultipleYAxis,
      xAxisKey
    };

    switch(chartType) {
      case 'area':
        return renderAreaChart(chartProps);
      case 'line':
        return renderLineChart(chartProps);
      case 'bar':
        return renderBarChart(chartProps);
      case 'pie':
        return renderPieChart(chartProps);
      default:
        return <div>Type de graphique non supporté</div>;
    }
  };

  return (
    <div className={className}>
      {(title || showTypeSelector) && (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
          {title && <h3 className={textStyles.bold}>{title}</h3>}
          {showTypeSelector && (
            <TypeSelector
              chartType={chartType}
              setChartType={setChartType}
            />
          )}
        </div>
      )}
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
}
