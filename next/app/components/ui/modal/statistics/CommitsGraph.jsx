'use client';

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Graph from '@/app/components/ui/Graph';

const MS_PER_DAY = 86400000;
const MS_PER_WEEK = MS_PER_DAY * 7;

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
  const weeklyData = useMemo(() => {
    if (!commits?.Weekly?.Counts || !Array.isArray(commits.Weekly.Counts)) {
      return [];
    }
    
    const { Counts, FirstDayOfFirstWeek } = commits.Weekly;
    
    let firstDate;
    try {
      firstDate = new Date(FirstDayOfFirstWeek);
      if (isNaN(firstDate.getTime())) {
        firstDate = new Date();
        firstDate.setDate(firstDate.getDate() - (Counts.length * 7));
      }
    } catch (e) {
      firstDate = new Date();
      firstDate.setDate(firstDate.getDate() - (Counts.length * 7));
    }
    
    return Counts.map((count, i) => ({
      semaine: new Date(firstDate.getTime() + i * MS_PER_WEEK)
        .toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }),
      commits: typeof count === 'number' ? count : 0,
    }));
  }, [commits]);

  const hasData = useMemo(() => 
    weeklyData.length > 0 && weeklyData.some(item => item.commits > 0),
    [weeklyData]
  );

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

CommitsGraph.propTypes = {
  commits: PropTypes.shape({
    Weekly: PropTypes.shape({
      Counts: PropTypes.arrayOf(PropTypes.number),
      FirstDayOfFirstWeek: PropTypes.string
    })
  }),
  loading: PropTypes.bool,
  title: PropTypes.string,
  hideTitle: PropTypes.bool,
  height: PropTypes.number,
  showLegend: PropTypes.bool
};

export default CommitsGraph;
