'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import ContributionCard from './ContributionCard';

/**
 * Carte regroupant les contributions individuelles des utilisateurs
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.users - Liste des utilisateurs
 * @param {boolean} props.hasUserCommits - Indique si des commits utilisateurs existent
 * @param {Function} props.calculateUserTotals - Fonction pour calculer les statistiques
 */
export default function UserContributionsCard({ users, hasUserCommits, calculateUserTotals, isPartial }) {
  return (
    <Card variant="default" className="p-3 lg:p-4 w-full h-full">
      <div className="space-y-3 lg:space-y-4">
        <h3 className="text-lg font-bold leading-none">Contributions par utilisateur</h3>
        
        {!hasUserCommits ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
            Aucune donnée de commits par utilisateur à afficher
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {users && users.map((user, index) => (
              <ContributionCard 
                key={user.User?.Id || index}
                contributor={user}
                isTeam={false}
                calculateUserTotals={calculateUserTotals}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
