'use client';

import React, { useState } from 'react';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, PieChart, Pie, Cell 
} from 'recharts';
import { cardStyles, textStyles, buttonStyles } from '@/app/styles/tailwindStyles';

export default function Graph({ 
  title, 
  data = [], 
  xAxisKey = 'name',
  series = [{ 
    dataKey: 'value', 
    color: 'var(--accent-color)', 
    name: 'Valeur' 
  }],
  type = 'area', // 'area', 'line', 'bar', 'pie'
  height = 300,
  gridLines = true,
  className = '',
  showLegend = true,
  emptyMessage = 'Aucune donnée disponible',
  showTypeSelector = false
}) {
  const [chartType, setChartType] = useState(type);
  
  // Vérifier si le graphique a des données
  if (!data || data.length === 0) {
    return (
      <div className={`${cardStyles.default} ${className}`}>
        <h3 className={`${textStyles.bold} mb-4`}>{title}</h3>
        <div className="flex items-center justify-center h-[200px]">
          <p className={textStyles.hint}>{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  // Configuration commune pour tous les graphiques
  const commonProps = {
    data,
    margin: { top: 10, right: 30, left: 0, bottom: 5 }
  };
  
  // Style pour le tooltip
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--primary-color)',
      border: '1px solid var(--accent-color)',
      borderRadius: '12.5px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    },
    itemStyle: { color: 'var(--secondary-color)' }
  };
  
  // Configuration des axes
  const axisProps = {
    xAxis: (
      <XAxis 
        dataKey={xAxisKey} 
        tick={{ fill: 'var(--secondary-color)' }}
        axisLine={{ stroke: 'var(--hint-color)' }}
        tickLine={{ stroke: 'var(--hint-color)' }}
      />
    ),
    yAxis: (
      <YAxis 
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
    tooltip: <Tooltip {...tooltipStyle} />,
    legend: showLegend && <Legend />
  };
  
  // Fonction pour rendre le graphique en fonction du type choisi
  const renderChart = () => {
    switch(chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              {axisProps.grid}
              {axisProps.xAxis}
              {axisProps.yAxis}
              {axisProps.tooltip}
              {axisProps.legend}
              {series.map((s, index) => (
                <Area
                  key={`area-${index}`}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.color}
                  fill={s.color}
                  fillOpacity={0.2}
                  strokeWidth={2}
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
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              {axisProps.grid}
              {axisProps.xAxis}
              {axisProps.yAxis}
              {axisProps.tooltip}
              {axisProps.legend}
              {series.map((s, index) => (
                <Line
                  key={`line-${index}`}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
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
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              {axisProps.grid}
              {axisProps.xAxis}
              {axisProps.yAxis}
              {axisProps.tooltip}
              {axisProps.legend}
              {series.map((s, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={s.color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                nameKey={xAxisKey}
                dataKey={series[0].dataKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={series[Math.min(index, series.length - 1)].color} 
                  />
                ))}
              </Pie>
              {axisProps.tooltip}
              {axisProps.legend}
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Type de graphique non supporté</div>;
    }
  };
  
  // Sélecteur de type de graphique
  const typeSelector = showTypeSelector && (
    <div className="flex flex-wrap gap-2 mb-4">
      {['area', 'line', 'bar', 'pie'].map(t => (
        <button
          key={t}
          onClick={() => setChartType(t)}
          className={`${chartType === t ? buttonStyles.default : buttonStyles.outline} text-xs px-2 py-1`}
        >
          <span className={chartType === t ? textStyles.boldWhite : textStyles.default}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className={`${cardStyles.default} ${className}`}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <h3 className={textStyles.bold}>{title}</h3>
        {typeSelector}
      </div>
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
}