'use client';

import React from 'react';
import { CommitsGraph } from '@/app/components/ui/modal/statistics';
import Tag from '@/app/components/ui/Tag';

/**
 * Carte affichant les contributions d'un utilisateur ou de l'équipe
 */
export default function ContributionCard({ userData, isTeam = false }) {
  const { user, stats, rawData } = userData || {};
  
  const hasValidData = rawData?.Commits?.Weekly?.Counts && 
                       rawData?.Lines?.Weekly?.Counts;
  
  const { totalCommits, addedLines, deletedLines, delta, membersCount } = stats || {};
  
  const displayName = isTeam 
    ? "Équipe complète" 
    : user?.FullName || "Utilisateur";
    
  const subtitle = isTeam 
    ? `${membersCount || 0} membre${membersCount !== 1 ? 's' : ''}` 
    : user?.EmailAddress || "";
  
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
          <Tag variant="selected">Δ {delta?.toFixed(1)}</Tag>
        </div>
      </div>
      
      <div className="mt-4">
        {hasValidData && (
          <CommitsGraph
            commits={rawData.Commits}
            lines={rawData.Lines}
            height={200}
            showLegend={true}
            hideTitle={true}
          />
        )}
      </div>
    </div>
  );
}
