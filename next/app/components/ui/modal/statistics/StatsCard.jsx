'use client';

import React, { useState, useMemo } from 'react';
import { XIcon, InfoIcon } from '@primer/octicons-react';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import { 
  LanguagesSection,
  ContributionsTable,
  ContributionCard
} from '@/app/components/ui/modal/statistics';
import InfoTooltip from '@/app/components/ui/InfoTooltip';
import { useRepositoryStats } from '@/app/hooks/useRepositoryStats';
import { generateGlobalStatsFromUsers } from '@/app/utils/statisticsUtils';

const CACHE_INFO_TEXT = 
  "Ces données peuvent venir du cache pour que votre expérience ne soit pas ralentie. " +
  "Les données peuvent présenter un retard jusqu'à une heure.";

/**
 * Carte principale affichant les statistiques globales du dépôt
 */
export default function StatsCard({ stats, onClose, isPartial }) {
  const [showInfo, setShowInfo] = useState(false);
  const { calculateUserTotals } = useRepositoryStats(stats);
  
  const hasGlobalData = stats?.Global && 
                        stats?.Global.Commits && 
                        stats?.Global.Lines;
  
  const globalStats = useMemo(() => {
    if (hasGlobalData) return stats.Global;
    return generateGlobalStatsFromUsers(stats?.Users);
  }, [stats, hasGlobalData]);
  
  const shouldShowGlobalStats = globalStats || (stats?.Users?.length > 0);
  
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
                text={CACHE_INFO_TEXT} 
                position="top-9 left-0" 
                variant="success" 
              />
            </div>
          </div>
          <Button variant="action_icon_warn" onClick={onClose}>
            <XIcon size={24} />
          </Button>
        </div>

        <LanguagesSection languages={stats.Global?.Languages} />
        
        <div className="w-full overflow-x-hidden">
          {shouldShowGlobalStats ? (
            <ContributionCard
              contributor={globalStats} 
              isTeam={true}
              calculateUserTotals={calculateUserTotals}
              stats={stats}
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              Chargement des statistiques d'équipe...
            </div>
          )}
        </div>
        
        <div className="w-full overflow-x-hidden">
          <ContributionsTable users={stats.Users} stats={stats} />
        </div>
      </div>
    </Card>
  );
}
