'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import { ContributionCard } from '@/app/components/ui/modal/statistics';
import { textStyles } from '@/app/styles/tailwindStyles';

/**
 * Section affichant les contributions de chaque utilisateur
 */
export default function UserContributionsSection({ formattedStats, isPartialData }) {
  const { hasUserCommits, userStats = [] } = formattedStats || {};

  return (
    <Card variant="default" className="p-3 lg:p-4 w-full h-full">
      <div className="space-y-3 lg:space-y-4">
        <h3 className={textStyles.sectionTitle}>Contributions par utilisateur</h3>
        
        {!hasUserCommits ? (
          <Card variant="empty">
            <div className={textStyles.hint}>
              Aucune donnée de commits par utilisateur à afficher
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {userStats.map((userData, index) => (
              <ContributionCard 
                key={userData.user?.Id || index}
                userData={userData}
                isTeam={false}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
