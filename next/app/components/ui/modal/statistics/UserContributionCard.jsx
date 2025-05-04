'use client';

import React from 'react';

import { CommitsGraph } from '@/app/components/ui/modal/statistics';

/**
 * Carte affichant les contributions d'un utilisateur individuel
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.user - Données de l'utilisateur
 * @param {Function} props.calculateUserTotals - Fonction pour calculer les statistiques
 * @param {number} props.index - Index de l'utilisateur dans la liste
 */
export default function UserContributionCard({ user, calculateUserTotals, index }) {
  const { totalCommits, addedLines, deletedLines, ratio } = calculateUserTotals(user);
  
  return (
    <div className="bg-gray-50 p-3 rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1">
        <p className="text-sm font-medium">
          {user.User?.FullName || `Utilisateur ${index + 1}`}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-0.5 bg-gray-200 rounded-full text-gray-700 font-mono">
            {totalCommits} commits
          </span>
          {addedLines > 0 && (
            <span className="px-2 py-0.5 bg-green-100 rounded-full text-green-700 font-mono">
              {addedLines} ++
            </span>
          )}
          {deletedLines > 0 && (
            <span className="px-2 py-0.5 bg-red-100 rounded-full text-red-700 font-mono">
              {deletedLines} --
            </span>
          )}
          {(addedLines > 0 || deletedLines > 0) && (
            <span className="px-2 py-0.5 bg-blue-100 rounded-full text-blue-700 font-mono">
              {ratio === Infinity ? "∞" : ratio} ratio
            </span>
          )}
        </div>
      </div>
      <CommitsGraph 
        commits={user.Commits} 
        loading={false}
        hideTitle={true}
        height={180}
        showLegend={true}
      />
    </div>
  );
}
