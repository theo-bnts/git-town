'use client';

import React, { useMemo } from 'react';
import Graph from '@/app/components/ui/Graph';
import { calculateDelta } from '@/app/utils/calculateDelta';
import { deltaQualifier } from '@/app/utils/deltaQualifier';

/**
 * Graphique affichant l'évolution des commits et des lignes de code
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.commits - Données de commits
 * @param {Object} props.lines - Données de lignes
 * @param {string} props.title - Titre du graphique
 * @param {number} props.height - Hauteur du graphique
 * @param {boolean} props.showLegend - Affichage de la légende
 * @param {boolean} props.hideTitle - Masquer le titre
 */
export default function CommitsGraph({ 
  commits, 
  lines, 
  title = "Commits par semaine", 
  height = 300,
  showLegend = true,
  hideTitle = false
}) {
  const data = useMemo(() => {
    if (!commits?.Weekly?.Counts) {
      return [];
    }

    const firstDay = new Date(commits.Weekly.FirstDayOfFirstWeek);
    const hasLines = lines?.Weekly?.Counts && Array.isArray(lines.Weekly.Counts);

    return commits.Weekly.Counts.map((count, idx) => {
      const week = new Date(firstDay);
      week.setDate(week.getDate() + idx * 7);
      const formattedDate = week.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

      let delta = null;
      if (hasLines && idx < lines.Weekly.Counts.length) {
        const weekData = lines.Weekly.Counts[idx];
        const additions = weekData?.Additions || 0;
        const deletions = weekData?.Deletions || 0;
        delta = calculateDelta(additions, deletions);
      }

      return {
        week: formattedDate,
        commits: count,
        delta
      };
    });
  }, [commits, lines]);

  const series = useMemo(() => {
    const result = [{
      name: "Commits",
      dataKey: "commits",
      yAxisId: "left",
      color: "var(--accent-color)"
    }];

    const lineDataExists = lines && 
                          lines.Weekly && 
                          lines.Weekly.Counts && 
                          lines.Weekly.Counts.length > 0 && 
                          lines.Weekly.Counts.some(week => (week.Additions > 0 || week.Deletions > 0));
    
    if (lineDataExists) {
      result.push({
        name: "Delta",
        dataKey: "delta",
        yAxisId: "right",
        color: "var(--selected-color)"
      });
    }

    return result;
  }, [lines]);

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
