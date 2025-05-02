'use client';

import React, { useMemo } from 'react';
import Graph from '@/app/components/ui/Graph';

/**
 * Affiche un graphique des commits par semaine
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.commits - Données de commits
 * @param {boolean} props.loading - État de chargement
 */
export default function CommitsGraph({ commits, loading }) {
  const weeklyData = useMemo(() => {
    if (!commits?.Weekly?.Counts) return [];
    
    const { Counts, FirstDayOfFirstWeek } = commits.Weekly;
    const firstDate = new Date(FirstDayOfFirstWeek);
    
    return Counts.map((count, i) => ({
      semaine: new Date(firstDate.getTime() + i * 7 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }),
      commits: count,
    }));
  }, [commits]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        <Graph
          title="Nombre de commits par semaine"
          data={weeklyData}
          xAxisKey="semaine"
          series={[
            {
              dataKey: 'commits',
              color: 'var(--accent-color)',
              name: 'Commits',
            },
          ]}
          type="area"
          height={260}
          showLegend={false}
          showTypeSelector={true}
          emptyMessage={loading 
            ? "Chargement des données..." 
            : "Aucune donnée à afficher"
          }
        />
      </div>
    </div>
  );
}
