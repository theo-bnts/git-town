'use client';

import React, { useEffect, useState } from 'react';
import { CommitsGraph } from '@/app/components/ui/modal/statistics';
import Tag from '@/app/components/ui/Tag';
import { calculateDelta } from '@/app/utils/calculateDelta';

/**
 * Carte affichant les contributions d'un utilisateur ou de l'équipe
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.contributor - Données de l'utilisateur ou de l'équipe
 * @param {boolean} props.isTeam - Indique s'il s'agit de données d'équipe
 * @param {Function} props.calculateUserTotals - Fonction pour calculer les statistiques
 * @param {Object} props.stats - Toutes les statistiques (nécessaire pour compter les membres)
 */
export default function ContributionCard({ 
  contributor, 
  isTeam = false, 
  calculateUserTotals, 
  stats, 
  index 
}) {
  const [isDataReady, setIsDataReady] = useState(false);

  let totalCommits = 0;
  let addedLines = 0;
  let deletedLines = 0;

  useEffect(() => {
    // Vérifier si nous avons des données valides
    if ((isTeam && contributor && stats?.Users?.length > 0) || 
        (!isTeam && contributor?.User)) {
      setIsDataReady(true);
    }
  }, [contributor, isTeam, stats]);
  
  if (isTeam) {
    // Pour l'équipe, on peut soit utiliser les données globales, soit calculer à partir des utilisateurs
    if (contributor?.Commits?.Weekly?.Counts) {
      const commitsArray = contributor.Commits.Weekly.Counts || [];
      totalCommits = commitsArray.reduce((sum, count) => sum + (Number.isFinite(count) ? count : 0), 0);
    } else if (stats?.Users) {
      // Calculer à partir des utilisateurs si pas de données globales
      totalCommits = stats.Users.reduce((sum, user) => {
        const userCommits = user?.Commits?.Weekly?.Counts || [];
        return sum + userCommits.reduce((userSum, count) => userSum + (Number.isFinite(count) ? count : 0), 0);
      }, 0);
    }
    
    if (contributor?.Lines?.Weekly?.Counts) {
      const linesCounts = contributor.Lines.Weekly.Counts || [];
      addedLines = linesCounts.reduce((sum, week) => sum + (week?.Additions || 0), 0);
      deletedLines = linesCounts.reduce((sum, week) => sum + (week?.Deletions || 0), 0);
    } else if (stats?.Users) {
      // Calculer à partir des utilisateurs si pas de données globales
      stats.Users.forEach(user => {
        const userLines = user?.Lines?.Weekly?.Counts || [];
        addedLines += userLines.reduce((sum, week) => sum + (week?.Additions || 0), 0);
        deletedLines += userLines.reduce((sum, week) => sum + (week?.Deletions || 0), 0);
      });
    }
  } else {
    // Pour un utilisateur individuel
    const userStats = calculateUserTotals(contributor);
    totalCommits = userStats.totalCommits || 0;
    addedLines = userStats.addedLines || 0;
    deletedLines = userStats.deletedLines || 0;
  }
  
  const delta = calculateDelta(addedLines, deletedLines);
  
  const displayName = isTeam 
    ? "Équipe complète" 
    : contributor?.User?.FullName || "Utilisateur";
  
  const subtitle = isTeam
    ? `${stats?.Users?.length || 0} membres` 
    : contributor?.User?.EmailAddress || "";
  
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${isTeam ? 'border-[var(--selected-color)]' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{displayName}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end">
          <Tag variant="default">
            {totalCommits} commits
          </Tag>
          <Tag variant="success">
            +{addedLines}
          </Tag>
          <Tag variant="danger">
            -{deletedLines}
          </Tag>
          <Tag variant="selected">
            Δ {delta.toFixed(1)}
          </Tag>
        </div>
      </div>
      
      <div className="mt-4">
        {isDataReady && (
          <CommitsGraph
            commits={contributor?.Commits || (isTeam && {
              Weekly: {
                FirstDayOfFirstWeek: stats?.Users?.[0]?.Commits?.Weekly?.FirstDayOfFirstWeek,
                Counts: contributor?.Commits?.Weekly?.Counts || []
              }
            })}
            lines={contributor?.Lines || (isTeam && {
              Weekly: {
                FirstDayOfFirstWeek: stats?.Users?.[0]?.Lines?.Weekly?.FirstDayOfFirstWeek,
                Counts: contributor?.Lines?.Weekly?.Counts || []
              }
            })}
            title={`Commits de ${displayName}`}
            height={200}
            showLegend={true}
            hideTitle={true}
          />
        )}
      </div>
    </div>
  );
}
