'use client';

import React, { useState } from 'react';
import { XIcon, InfoIcon } from '@primer/octicons-react';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import { 
  LanguagesSection,
  ContributionsTable,
  ContributionCard
} from '@/app/components/ui/modal/statistics';
import InfoTooltip from '@/app/components/ui/InfoTooltip';
import { STATISTICS_CONFIG } from '@/app/config/config';

/**
 * Carte principale affichant les statistiques globales du dépôt
 */
export default function StatsCard({ formattedStats, onClose }) {
  const [showInfo, setShowInfo] = useState(false);
  
  const { globalStats, teamStats, userStats, languages } = formattedStats || {};
  
  const shouldShowGlobalStats = Boolean(globalStats);
  
  return (
    <Card variant="default" className="p-3 lg:p-4 w-full h-full">
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold leading-none">Statistiques</h3>
            <div className="relative">
              <Button
                variant="action_icon"
                type="button"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
                onFocus={() => setShowInfo(true)}
                onBlur={() => setShowInfo(false)}
                tabIndex={0}
                className="align-middle"
              >
                <InfoIcon size={16} />
              </Button>
              <InfoTooltip 
                show={showInfo} 
                text={STATISTICS_CONFIG.CACHE_INFO_TEXT} 
                position="top-9 left-0" 
                variant="success" 
              />
            </div>
          </div>
          <Button variant="action_icon_warn" onClick={onClose}>
            <XIcon size={24} />
          </Button>
        </div>

        <LanguagesSection languages={languages} />
        
        <div className="w-full overflow-x-hidden">
          {shouldShowGlobalStats ? (
            <ContributionCard
              userData={{
                user: { FullName: "Équipe complète" },
                stats: teamStats,
                rawData: globalStats
              }} 
              isTeam={true}
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              Chargement des statistiques d'équipe...
            </div>
          )}
        </div>
        
        <div className="w-full overflow-x-hidden">
          <ContributionsTable userStats={userStats} teamStats={teamStats} />
        </div>
      </div>
    </Card>
  );
}
