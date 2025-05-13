'use client';

import React from 'react';
import Graph from '@/app/components/ui/Graph';
import { useCommitsGraphData } from '@/app/hooks/statistics/statsHooks';
import { deltaQualifier } from '@/app/utils/deltaQualifier';

/**
 * Graphique affichant l'évolution des commits et des lignes de code
 */
export default function CommitsGraph({ 
  commits, 
  lines, 
  title = "Commits par semaine", 
  height = 300,
  showLegend = true,
  hideTitle = false
}) {
  const data = useCommitsGraphData(commits, lines);

  const series = [
    {
      name: "Commits",
      dataKey: "commits",
      yAxisId: "left",
      color: "var(--accent-color)"
    }, 
    {
      name: "Delta",
      dataKey: "delta",
      yAxisId: "right",
      color: "var(--selected-color)"
    }
  ];

  const tooltipFormatter = (value, name) => {
    if (name === 'Delta' && value !== null && value !== undefined) {
      const qualifier = deltaQualifier(value);
      return [
        <>
          {value.toFixed(1)} <span className={qualifier.class}>{qualifier.label}</span>
        </>, 
        name
      ];
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
      multipleYAxis={true}
      showTypeSelector={false}
      emptyMessage="Aucune donnée de commits disponible"
      tooltipFormatter={tooltipFormatter}
      yAxisDomain={['right', [-1, 1]]}
    />
  );
}
