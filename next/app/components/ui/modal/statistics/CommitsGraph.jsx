'use client';

import React, { useMemo } from 'react';

import Graph from '@/app/components/ui/Graph';

const MILLISECONDS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Affiche un graphique des commits par semaine
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.commits - Données de commits
 * @param {boolean} props.loading - État de chargement
 * @param {string} props.title - Titre du graphique
 * @param {boolean} props.hideTitle - Si le titre doit être caché
 * @param {number} props.height - Hauteur du graphique
 * @param {boolean} props.showLegend - Si la légende doit être affichée
 */
const CommitsGraph = React.memo(function CommitsGraph({ 
  commits, 
  loading,
  title = "Commits par semaine",
  hideTitle = false,
  height = 260,
  showLegend = true
}) {
  // Formatage des données pour le graphique
  const weeklyData = useMemo(() => {
    if (!commits?.Weekly?.Counts) return [];
    
    const { Counts, FirstDayOfFirstWeek } = commits.Weekly;
    const firstDate = new Date(FirstDayOfFirstWeek);
    
    return Counts.map((count, i) => ({
      semaine: new Date(firstDate.getTime() + i * MILLISECONDS_PER_WEEK)
        .toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }),
      commits: count,
    }));
  }, [commits]);

  // Vérification de l'existence des données
  const hasData = useMemo(() => 
    weeklyData.length > 0 && weeklyData.some(item => item.commits > 0),
    [weeklyData]
  );

  // Configuration du graphique
  const graphConfig = useMemo(() => ({
    title: !hideTitle ? title : "",
    data: weeklyData,
    xAxisKey: "semaine",
    series: [{
      dataKey: 'commits',
      color: 'var(--accent-color)',
      name: 'Commits',
    }],
    type: "area",
    height,
    showLegend,
    showTypeSelector: !hideTitle,
    emptyMessage: loading ? "Chargement des données..." : "Aucune donnée à afficher"
  }), [weeklyData, title, hideTitle, height, loading, showLegend]);

  return (
    <div className="overflow-x-auto w-full">
      <div className={`w-full ${!hasData ? 'h-36 flex items-center justify-center' : ''}`}>
        {!hasData && !loading ? (
          <p className="text-gray-500 text-center">Aucune donnée à afficher</p>
        ) : (
          <Graph {...graphConfig} />
        )}
      </div>
    </div>
  );
});

export default CommitsGraph;
