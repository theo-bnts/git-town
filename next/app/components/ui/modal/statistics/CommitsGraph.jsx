'use client';

import React, { useMemo } from 'react';
import Graph from '@/app/components/ui/Graph';
import { calculateDelta } from '@/app/utils/calculateDelta';
import { deltaQualifier } from '@/app/utils/deltaQualifier';

/**
 * Prépare les données pour le graphique de commits
 */
function prepareGraphData(commits, lines) {
  if (!commits?.Weekly?.Counts) return [];

  const firstDay = commits.Weekly.FirstDayOfFirstWeek 
    ? new Date(commits.Weekly.FirstDayOfFirstWeek) 
    : new Date();
    
  const hasLines = lines?.Weekly?.Counts && Array.isArray(lines.Weekly.Counts);

  return commits.Weekly.Counts.map((count, idx) => {
    const week = new Date(firstDay);
    week.setDate(week.getDate() + idx * 7);
    const formattedDate = week.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
    
    let delta = 0;
    if (hasLines && idx < lines.Weekly.Counts.length) {
      const weekData = lines.Weekly.Counts[idx];
      if (weekData) {
        const additions = weekData.Additions || 0;
        const deletions = weekData.Deletions || 0;
        delta = calculateDelta(additions, deletions);
      }
    }

    return {
      week: formattedDate,
      commits: count || 0,
      delta
    };
  });
}

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
  const data = useMemo(() => prepareGraphData(commits, lines), [commits, lines]);

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
          {value.toFixed(1)} <span className={qualifier.class}>({qualifier.label})</span>
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
