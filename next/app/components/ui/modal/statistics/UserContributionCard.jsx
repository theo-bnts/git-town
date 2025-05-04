'use client';

import React from 'react';
import { CommitsGraph } from '@/app/components/ui/modal/statistics';
import Tag from '@/app/components/ui/Tag';
import { calculateDelta } from '@/app/utils/calculateDelta';

/**
 * Carte affichant les contributions d'un utilisateur individuel
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.user - Données de l'utilisateur
 * @param {Function} props.calculateUserTotals - Fonction pour calculer les statistiques
 * @param {number} props.index - Index de l'utilisateur dans la liste
 */
export default function UserContributionCard({ user, calculateUserTotals, index }) {
  const { totalCommits, totalPullRequests, addedLines, deletedLines } = calculateUserTotals(user);
  
  const delta = calculateDelta(addedLines, deletedLines);
  
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{user.User.FullName}</h3>
          <p className="text-sm text-gray-500">{user.User.EmailAddress}</p>
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
        <CommitsGraph
          commits={user.Commits}
          lines={user.Lines}
          title={`Commits de ${user.User.FullName}`}
          height={200}
          showLegend={true}
          hideTitle={true}
        />
      </div>
    </div>
  );
}
