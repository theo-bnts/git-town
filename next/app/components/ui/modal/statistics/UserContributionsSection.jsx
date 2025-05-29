'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import Button from '@/app/components/ui/Button';
import { SyncIcon } from '@primer/octicons-react';
import { ContributionCard } from '@/app/components/ui/modal/statistics';
import { textStyles } from '@/app/styles/tailwindStyles';

export default function UserContributionsSection({ formattedStats, isPartialData, onRetry }) {
  const { hasUserCommits, userStats = [] } = formattedStats || {};

  return (
    <Card variant="default" className="p-3 lg:p-4 w-full h-full">
      <div className="space-y-3 lg:space-y-4">
        <div className="flex justify-between items-center">
          <h3 className={textStyles.sectionTitle}>Contributions par utilisateur</h3>
          {isPartialData && (
            <Button 
              onClick={onRetry}
              variant="action_sq"
            >
              <SyncIcon size={16} />
            </Button>
          )}
        </div>
        
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
