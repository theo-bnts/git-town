'use client';

import React, { useMemo } from 'react';
import { CommitsGraph } from '@/app/components/ui/modal/statistics';
import Tag from '@/app/components/ui/Tag';

/**
 * Carte affichant les contributions d'un utilisateur ou de l'équipe
 */
export default function ContributionCard({ 
  contributor, 
  isTeam = false, 
  calculateUserTotals, 
  stats 
}) {
  const hasValidData = contributor?.Commits?.Weekly?.Counts && contributor?.Lines?.Weekly?.Counts;

  const contributorStats = useMemo(() => {
    if (!contributor) {
      return { totalCommits: 0, addedLines: 0, deletedLines: 0, delta: 0 };
    }

    const totals = calculateUserTotals(contributor);
    
    if (isTeam) {
      return {
        ...totals,
        membersCount: stats?.Users?.length || 0
      };
    }
    
    return totals;
  }, [contributor, isTeam, calculateUserTotals, stats]);

  const { totalCommits, addedLines, deletedLines, delta, membersCount } = contributorStats;
  
  const displayName = isTeam ? "Équipe complète" : contributor?.User?.FullName || "Utilisateur";
  const subtitle = isTeam 
    ? `${membersCount || stats?.Users?.length || 0} membres` 
    : contributor?.User?.EmailAddress || "";
  
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm
      ${isTeam ? 'border-[var(--selected-color)]' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{displayName}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end">
          <Tag variant="default">{totalCommits} commits</Tag>
          <Tag variant="success">+{addedLines}</Tag>
          <Tag variant="danger">-{deletedLines}</Tag>
          <Tag variant="selected">Δ {delta.toFixed(1)}</Tag>
        </div>
      </div>
      
      <div className="mt-4">
        {hasValidData && (
          <CommitsGraph
            commits={contributor.Commits}
            lines={contributor.Lines}
            height={200}
            showLegend={true}
            hideTitle={true}
          />
        )}
      </div>
    </div>
  );
}
